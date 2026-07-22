import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { authorController } from "@/modules/author";

export async function GET(request: NextRequest) {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const data = await authorController.list(params);
  return successResponse(data);
}
