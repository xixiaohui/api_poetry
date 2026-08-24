import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { posterController } from "@/modules/poster";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { rateLimit, RateLimitPresets } from "@/shared/middleware/rate-limit";

/**
 * POST /api/v1/poster
 * 生成诗词海报。请求体:
 *   { poemId?: number, title?, content?, author?, dynasty?, theme?: "ink"|"sunset"|"night", format?: "svg"|"png"|"both" }
 * 返回: { svg, pngBase64?, width, height, theme, filename }
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  await rateLimit(request, RateLimitPresets.poster);
  const body = await request.json();
  const data = await posterController.generate(body);
  return successResponse(data);
});
