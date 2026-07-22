import { chinesePoetryClient } from "@/clients";
import type { UpstreamAuthor, PaginatedResponse } from "@/clients";

export const authorClient = {
  getAuthors(params: { page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamAuthor>> {
    return chinesePoetryClient.getAuthors(params);
  },
  getAuthorById(id: number): Promise<UpstreamAuthor> {
    return chinesePoetryClient.getAuthorById(id);
  },
};
