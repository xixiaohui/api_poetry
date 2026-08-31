import { cache } from "@/shared/cache";
import { ValidationError } from "@/shared/errors";
import { searchClient } from "./client";
import { toSearchResultDTO } from "./mapper";
import type { SearchResultDTO } from "./types";

export const searchService = {
  async search(q: string, type = "all", page = 1, pageSize = 20): Promise<SearchResultDTO> {
    if (!q.trim()) throw new ValidationError("搜索词不能为空");

    const cacheKey = `poetry:search:v2:${q}:${type}:${page}:${pageSize}`;
    const cached = await cache.get<SearchResultDTO>(cacheKey);
    if (cached) return cached;

    const result = await searchClient.search({ q, type, page, pageSize });
    const dto = toSearchResultDTO(result, q);
    await cache.set(cacheKey, dto, 60);
    return dto;
  },
};
