import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { historyService } from "@/modules/history";

export async function GET(_request: NextRequest) {
  const data = await historyService.stats();
  return successResponse(data);
}
