import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { poemController } from "@/modules/poem";

export const GET = withErrorHandler(
  async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const data = await poemController.getById(Number(id));
    return successResponse(data);
  }
);
