import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { searchController } from "@/modules/search";

export async function GET(request: NextRequest) {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const data = await searchController.search(params);
  return successResponse(data);
}
