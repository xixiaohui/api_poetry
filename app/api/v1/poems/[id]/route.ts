import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { poemController } from "@/modules/poem";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await poemController.getById(Number(id));
  return successResponse(data);
}
