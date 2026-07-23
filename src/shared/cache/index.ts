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

  async getRaw(key: string): Promise<string | null> {
    try {
      return await getRedis().get(key);
    } catch {
      return null;
    }
  },

  async incr(key: string, ttlSeconds: number): Promise<number> {
    try {
      const r = getRedis();
      const val = await r.incr(key);
      // Set expiry on first increment only (INCR creates the key)
      if (val === 1) {
        await r.expire(key, ttlSeconds);
      }
      return val;
    } catch (err) {
      console.error("Redis incr error:", (err as Error).message);
      return 0;
    }
  },
};
