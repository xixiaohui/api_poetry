import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { authorController } from "@/modules/author";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await authorController.getById(Number(id));
  return successResponse(data);
}
