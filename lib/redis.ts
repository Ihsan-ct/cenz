import IORedis from 'ioredis';
const g = globalThis as unknown as { redis?: IORedis };
export const redis = g.redis ?? new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null, enableReadyCheck: false });
if (process.env.NODE_ENV !== 'production') g.redis = redis;
