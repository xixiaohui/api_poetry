import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aiController } from "@/modules/ai";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const POST = withErrorHandler(async (request: NextRequest) => {
  await getAuthPayload(request);
  const body = await request.json();
  const data = await aiController.analyse(body);
  return successResponse(data);
});
