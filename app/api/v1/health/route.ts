import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { config } from "@/shared/config";

interface ServiceStatus {
  readonly name: string;
  readonly status: "ok" | "error";
  readonly latency?: number;
  readonly error?: string;
}

export async function GET(_request: NextRequest) {
  const results: ServiceStatus[] = [];

  // Check Chinese Poetry API
  try {
    const start = Date.now();
    const res = await fetch(`${config.chinesePoetryApiUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    results.push({
      name: "chinese-poetry-api",
      status: res.ok ? "ok" : "error",
      latency: Date.now() - start,
    });
  } catch (e) {
    results.push({
      name: "chinese-poetry-api",
      status: "error",
      error: (e as Error).message,
    });
  }

  // Aggregate result
  const allOk = results.every((r) => r.status === "ok");
  return successResponse(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: results,
    },
    allOk ? 200 : 503
  );
}
