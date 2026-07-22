import { cache } from "@/shared/cache";
import { NotFoundError } from "@/shared/errors";
import { authorClient } from "./client";
import { toAuthorDTO, toAuthorListDTO } from "./mapper";
import type { AuthorDTO, AuthorListDTO } from "./types";

const CACHE_AUTHOR_PREFIX = "poetry:author:";
const CACHE_TTL = 600;

export const authorService = {
  async list(page = 1, pageSize = 20): Promise<AuthorListDTO> {
    const cacheKey = `poetry:authors:${page}:${pageSize}`;
    const cached = await cache.get<AuthorListDTO>(cacheKey);
    if (cached) return cached;

    const result = await authorClient.getAuthors({ page, pageSize });
    const dto = toAuthorListDTO(result.data, result.total, result.page, result.pageSize);
    await cache.set(cacheKey, dto, CACHE_TTL);
    return dto;
  },

  async getById(id: number): Promise<AuthorDTO> {
    const cacheKey = `${CACHE_AUTHOR_PREFIX}${id}`;
    const cached = await cache.get<AuthorDTO>(cacheKey);
    if (cached) return cached;

    const author = await authorClient.getAuthorById(id);
    if (!author) throw new NotFoundError("作者不存在");

    const dto = toAuthorDTO(author);
    await cache.set(cacheKey, dto, CACHE_TTL);
    return dto;
  },
};
