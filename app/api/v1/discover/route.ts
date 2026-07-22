import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aggregateService } from "@/modules/poem/aggregate.service";

export async function GET(_request: NextRequest) {
  const data = await aggregateService.discover();
  return successResponse(data);
}
