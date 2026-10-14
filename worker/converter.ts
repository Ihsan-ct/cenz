import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { prisma } from '../lib/db';
import { uploadFile } from '../lib/r2';
import { uploadAudioToRoblox } from '../lib/roblox';
import { decrypt } from '../lib/crypto';

interface JobData {
  jobId: string;
  userId: string;
  sourceUrl?: string;
  r2Key?: string;
  speed: number;
  amplify: number;
  maxDuration: number;
}

function run(cmd: string, args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d.toString()));
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} exit ${code}: ${err.slice(-500)}`))));
  });
}

export async function processConvert(data: JobData) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'cenz-'));
  const rawPath = path.join(tmp, 'raw');
  const outPath = path.join(tmp, 'out.mp3');

  try {
    await prisma.job.update({ where: { id: data.jobId }, data: { status: 'DOWNLOADING' } });

    // download
    let audioInput: string;
    if (data.sourceUrl) {
      await run('yt-dlp', ['-x', '--audio-format', 'mp3', '-o', `${rawPath}.%(ext)s`, data.sourceUrl], tmp);
      const files = await fs.readdir(tmp);
      const found = files.find((f) => f.startsWith('raw.'));
      if (!found) throw new Error('download failed');
      audioInput = path.join(tmp, found);
    } else if (data.r2Key) {
      // already uploaded — download from R2? skip for now
      throw new Error('r2Key input not implemented yet');
    } else throw new Error('no source');

    await prisma.job.update({ where: { id: data.jobId }, data: { status: 'PROCESSING' } });

    // ffmpeg convert
    const filters: string[] = [];
    if (data.speed !== 1.0) filters.push(`atempo=${Math.max(0.5, Math.min(2.0, data.speed))}`);
    if (data.amplify !== 0) filters.push(`volume=${data.amplify}dB`);

    const args = ['-i', audioInput, '-t', String(data.maxDuration), '-b:a', '128k'];
    if (filters.length) args.push('-af', filters.join(','));
    args.push(outPath);
    await run('ffmpeg', ['-y', ...args]);

    const audioBuf = await fs.readFile(outPath);
    const r2Key = `jobs/${data.jobId}/out.mp3`;
    await uploadFile(r2Key, audioBuf, 'audio/mpeg');
    await prisma.job.update({ where: { id: data.jobId }, data: { r2Key } });

    // upload to Roblox
    const robloxAcc = await prisma.robloxAccount.findUnique({ where: { userId: data.userId } });
    if (robloxAcc?.verified) {
      await prisma.job.update({ where: { id: data.jobId }, data: { status: 'UPLOADING' } });
      try {
        const apiKey = decrypt(robloxAcc.apiKeyEnc, robloxAcc.apiKeyIv, robloxAcc.apiKeyTag);
        const res = await uploadAudioToRoblox(apiKey, robloxAcc.robloxUserId, audioBuf, `job-${data.jobId}.mp3`);
        await prisma.job.update({ where: { id: data.jobId }, data: { status: 'UPLOADED', assetId: res.assetId, moderation: 'PENDING' } });
      } catch (e: any) {
        await prisma.job.update({ where: { id: data.jobId }, data: { status: 'UPLOAD_FAILED', errorMessage: e.message } });
      }
    } else {
      await prisma.job.update({ where: { id: data.jobId }, data: { status: 'COMPLETED', completedAt: new Date() } });
    }
  } catch (err: any) {
    await prisma.job.update({ where: { id: data.jobId }, data: { status: 'FAILED', errorMessage: err.message } });
    throw err;
  } finally {
    await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}
