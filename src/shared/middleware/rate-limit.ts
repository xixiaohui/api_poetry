import { NextRequest } from "next/server";
import { cache } from "@/shared/cache";
import { RateLimitError } from "@/shared/errors";

interface RateLimitOptions {
  /** Max requests allowed in the window */
  readonly maxRequests: number;
  /** Time window in seconds */
  readonly windowSeconds: number;
  /** Optional key prefix for Redis */
  readonly prefix?: string;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

export async function rateLimit(
  request: NextRequest,
  options: RateLimitOptions
): Promise<void> {
  const { maxRequests, windowSeconds, prefix = "ratelimit" } = options;
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  const key = `${prefix}:${ip}:${path}`;

  try {
    // Use Redis INCR with TTL for sliding-window counter
    // We approximate with a simple counter + expire
    const currentStr = await cache.getRaw(key);
    const current = currentStr ? parseInt(currentStr, 10) : 0;

    if (current >= maxRequests) {
      throw new RateLimitError(`请求过于频繁，请${windowSeconds}秒后再试`);
    }

    await cache.incr(key, windowSeconds);
  } catch (error) {
    if (error instanceof RateLimitError) throw error;
    // If Redis is down, allow the request (fail open)
    console.error("Rate limit check failed:", (error as Error).message);
  }
}

/** Convenience presets */
export const RateLimitPresets = {
  /** 60 req/min for general API */
  api: { maxRequests: 60, windowSeconds: 60, prefix: "ratelimit:api" },
  /** 5 req/min for AI endpoints (expensive) */
  ai: { maxRequests: 5, windowSeconds: 60, prefix: "ratelimit:ai" },
  /** 10 req/min for auth endpoints */
  auth: { maxRequests: 10, windowSeconds: 60, prefix: "ratelimit:auth" },
} as const satisfies Record<string, RateLimitOptions>;
