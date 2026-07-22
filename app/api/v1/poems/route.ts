import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { poemController } from "@/modules/poem";

export async function GET(request: NextRequest) {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const data = await poemController.list(params);
  return successResponse(data);
}
