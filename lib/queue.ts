import { Queue } from "bullmq";

function redisOptions() {
  const u = new URL((process.env.REDIS_URL ?? "").trim());
  return {
    host: u.hostname,
    port: Number(u.port || 6379),
    username: decodeURIComponent(u.username) || undefined,
    password: decodeURIComponent(u.password) || undefined,
    tls: u.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null as null,
  };
}

let q: Queue | null = null;

// Lazy: tidak konek ke Redis saat build.
export function getQueue() {
  if (!q) {
    q = new Queue("convert", {
      connection: redisOptions(),
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: true,
        removeOnFail: { count: 50 },
      },
    });
  }
  return q;
}
