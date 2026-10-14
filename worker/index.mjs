import { Worker } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const run = promisify(execFile);
const prisma = new PrismaClient();
const BUCKET = (process.env.SUPABASE_BUCKET ?? "audio").trim();
const supabase = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false, autoRefreshToken: false } }
);

class UserError extends Error {}

function redisOptions() {
  const u = new URL(process.env.REDIS_URL.trim());
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: decodeURIComponent(u.username) || undefined,
    password: decodeURIComponent(u.password) || undefined,
    tls: u.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
  };
}

async function cookieArgs(dir) {
  const b64 = (process.env.YTDLP_COOKIES_B64 ?? "").trim();
  if (!b64) return [];
  const f = path.join(dir, "cookies.txt");
  await writeFile(f, Buffer.from(b64, "base64"), { mode: 0o600 });
  return ["--cookies", f];
}

async function processJob(jobId) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "QUEUED") return;
  await prisma.job.update({ where: { id: jobId }, data: { status: "PROCESSING" } });

  const dir = await mkdtemp(path.join(tmpdir(), "cenz-"));
  try {
    if (!job.sourceUrl) throw new UserError("Sumber audio tidak ada.");
    const extra = (process.env.YTDLP_EXTRA_ARGS ?? "").split(" ").filter(Boolean);

    // 1. Unduh. URL setelah "--" dan tanpa shell, jadi tidak bisa jadi argumen.
    await run("yt-dlp", [
      "--no-playlist", "--no-progress",
      "-f", "bestaudio/best",
      "--max-filesize", "100M",
      "--match-filters", `duration<=${job.maxDuration}`,
      ...(await cookieArgs(dir)), ...extra,
      "-o", path.join(dir, "in.%(ext)s"),
      "--", job.sourceUrl,
    ], { timeout: 300_000, maxBuffer: 10 * 1024 * 1024 });

    const input = (await readdir(dir)).find((f) => f.startsWith("in."));
    if (!input) throw new UserError("Audio tidak terunduh. Durasi mungkin melebihi batas atau sumber tidak tersedia.");

    // 2. Konversi: speed (atempo) dan amplify (dB)
    const speed = Math.min(3, Math.max(0.5, Number(job.speed) || 1));
    const amp = Math.min(10, Math.max(-10, Number(job.amplify) || 0));
    const filters = [];
    if (speed !== 1) filters.push(`atempo=${speed.toFixed(3)}`);
    if (amp !== 0) filters.push(`volume=${amp.toFixed(1)}dB`);

    const out = path.join(dir, "out.mp3");
    await run("ffmpeg", [
      "-y", "-i", path.join(dir, input), "-vn",
      "-t", String(job.maxDuration),
      ...(filters.length ? ["-af", filters.join(",")] : []),
      "-c:a", "libmp3lame", "-b:a", "192k", out,
    ], { timeout: 300_000, maxBuffer: 10 * 1024 * 1024 });

    // 3. Upload ke Supabase Storage
    const key = `users/${job.userId}/${job.id}.mp3`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, await readFile(out), { contentType: "audio/mpeg", upsert: true });
    if (error) throw new Error(`upload: ${error.message}`);

    await prisma.job.update({
      where: { id: jobId },
      data: { status: "READY", r2Key: key, errorMessage: null, completedAt: new Date() },
    });
  } catch (err) {
    console.error(`[job ${jobId}] gagal:`, err?.stderr ?? err);
    const msg = err instanceof UserError ? err.message : "Gagal memproses audio. Coba lagi nanti.";
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "FAILED", errorMessage: msg.slice(0, 300) },
    });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// Setelan hemat command Redis (paket Upstash gratis dibatasi per bulan)
const worker = new Worker("convert", (j) => processJob(j.data.jobId), {
  connection: redisOptions(),
  concurrency: 1,
  drainDelay: 30,
  stalledInterval: 120_000,
  lockDuration: 120_000,
});
worker.on("error", (e) => console.error("[worker] error:", e));
console.log("[worker] siap");

process.on("SIGTERM", async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
