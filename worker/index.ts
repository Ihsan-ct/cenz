import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { processConvert } from './converter';

const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });

const worker = new Worker(
  'convert',
  async (job) => {
    console.log(`[worker] processing job ${job.data.jobId}`);
    await processConvert(job.data);
  },
  { connection: connection as any, concurrency: 2 }
);

worker.on('completed', (job) => console.log(`[worker] completed ${job.data.jobId}`));
worker.on('failed', (job, err) => console.error(`[worker] failed ${job?.data.jobId}`, err));

console.log('[worker] started');
process.on('SIGTERM', async () => { await worker.close(); process.exit(0); });
