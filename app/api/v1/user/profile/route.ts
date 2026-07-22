import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { userController } from "@/modules/user";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const data = await userController.getProfile(sub);
  return successResponse(data);
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const body = await request.json();
  const data = await userController.updateProfile(sub, body);
  return successResponse(data);
});
