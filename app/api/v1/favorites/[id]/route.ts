import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { favoriteController } from "@/modules/favorite";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { sub } = await getAuthPayload(request);
  const { id } = await params;
  await favoriteController.remove(sub, id);
  return successResponse(null);
});
