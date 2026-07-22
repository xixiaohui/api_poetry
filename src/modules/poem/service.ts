import { cache } from "@/shared/cache";
import { NotFoundError } from "@/shared/errors";
import { poemClient } from "./client";
import { toPoemDTO, toPoemListDTO } from "./mapper";
import type { PoemDTO, PoemListDTO, RandomPoemDTO, PoemListParams, RandomPoemParams } from "./types";

const CACHE_POEM_PREFIX = "poetry:poem:";
const CACHE_POEM_TTL = 600;
const CACHE_POEM_LIST_TTL = 120;

export const poemService = {
  async list(params: PoemListParams): Promise<PoemListDTO> {
    const { page = 1, pageSize = 20 } = params;
    const cacheKey = `poetry:poems:${page}:${pageSize}:${params.dynasty ?? ""}:${params.type ?? ""}:${params.author ?? ""}`;
    const cached = await cache.get<PoemListDTO>(cacheKey);
    if (cached) return cached;

    const result = await poemClient.getPoems(params);
    const dto = toPoemListDTO(result.data, result.total, result.page, result.pageSize);
    await cache.set(cacheKey, dto, CACHE_POEM_LIST_TTL);
    return dto;
  },

  async getById(id: number): Promise<PoemDTO> {
    const cacheKey = `${CACHE_POEM_PREFIX}${id}`;
    const cached = await cache.get<PoemDTO>(cacheKey);
    if (cached) return cached;

    const poem = await poemClient.getPoemById(id);
    const dto = toPoemDTO(poem);
    await cache.set(cacheKey, dto, CACHE_POEM_TTL);
    return dto;
  },

  async random(params?: RandomPoemParams): Promise<RandomPoemDTO> {
    const poem = await poemClient.getRandomPoem(params);
    if (!poem) throw new NotFoundError("暂无随机诗词");
    return toPoemDTO(poem);
  },
};
