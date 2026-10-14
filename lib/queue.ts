import { Queue } from 'bullmq';
import { redis } from './redis';

export const convertQueue = new Queue('convert', { connection: redis as any });

export type ConvertJobData = {
  jobId: string;
  userId: string;
  sourceUrl?: string;
  r2Key?: string;
  speed: number;
  amplify: number;
  maxDuration: number;
};

export async function enqueueConvert(data: ConvertJobData) {
  await convertQueue.add('process', data, {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  });
}
