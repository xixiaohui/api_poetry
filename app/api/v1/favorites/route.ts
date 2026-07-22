import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { favoriteController } from "@/modules/favorite";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const data = await favoriteController.list(sub);
  return successResponse(data);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const body = await request.json();
  const data = await favoriteController.add(sub, body);
  return successResponse(data, 201);
});
