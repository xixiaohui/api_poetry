import { chinesePoetryClient } from "@/clients";
import type { UpstreamPoem, UpstreamStats, PaginatedResponse } from "@/clients";

export const poemClient = {
  getPoems(params: { page?: number; pageSize?: number; dynasty?: string; type?: string; author?: string }): Promise<PaginatedResponse<UpstreamPoem>> {
    return chinesePoetryClient.getPoems(params);
  },

  getPoemById(id: number): Promise<UpstreamPoem> {
    return chinesePoetryClient.getPoemById(id);
  },

  getRandomPoem(params?: { author?: string; type?: string; dynasty?: string; char?: string }): Promise<UpstreamPoem> {
    return chinesePoetryClient.getRandomPoem(params);
  },

  getStats(): Promise<UpstreamStats> {
    return chinesePoetryClient.getStats();
  },
};
