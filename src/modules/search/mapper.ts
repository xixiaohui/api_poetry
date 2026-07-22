import { toPoemDTO } from "@/modules/poem/mapper";
import type { UpstreamPoem, PaginatedResponse } from "@/clients";
import type { SearchResultDTO } from "./types";

export function toSearchResultDTO(
  result: PaginatedResponse<UpstreamPoem>,
  query: string
): SearchResultDTO {
  return {
    poems: result.data.map(toPoemDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    query,
  };
}
