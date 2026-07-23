import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { favoriteService } from "@/modules/favorite";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const data = await favoriteService.sync(sub);
  return successResponse(data);
});
