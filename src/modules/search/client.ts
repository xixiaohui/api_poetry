import { chinesePoetryClient } from "@/clients";
import type { UpstreamPoem, PaginatedResponse } from "@/clients";

export const searchClient = {
  search(params: { q: string; type?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamPoem>> {
    return chinesePoetryClient.searchPoems(params);
  },
};
