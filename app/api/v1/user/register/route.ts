import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { userController } from "@/modules/user";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const data = await userController.register(body);
  return successResponse(data, 201);
});
