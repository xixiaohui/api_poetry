import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { historyController } from "@/modules/history";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const data = await historyController.list(sub);
  return successResponse(data);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const body = await request.json();
  const data = await historyController.record(sub, body);
  return successResponse(data, 201);
});
