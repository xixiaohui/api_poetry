import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aiController } from "@/modules/ai";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

import { rateLimit, RateLimitPresets } from "@/shared/middleware/rate-limit";

export const POST = withErrorHandler(async (request: NextRequest) => {
  await rateLimit(request, RateLimitPresets.ai);
  await getAuthPayload(request);
  const body = await request.json();
  const data = await aiController.ask(body);
  return successResponse(data);
});
