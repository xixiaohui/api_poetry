import { Redis } from "ioredis";
import { config } from "../config";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    redis.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });
  }
  return redis;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await getRedis().get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await getRedis().setex(key, ttlSeconds, serialized);
    } catch (err) {
      console.error("Redis set error:", (err as Error).message);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await getRedis().del(key);
    } catch (err) {
      console.error("Redis del error:", (err as Error).message);
    }
  },
};
