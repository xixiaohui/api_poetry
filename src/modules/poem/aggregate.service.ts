import { cache } from "@/shared/cache";
import { poemClient } from "./client";
import { chinesePoetryClient, type UpstreamDynasty, type UpstreamType } from "@/clients";
import { toPoemDTO } from "./mapper";
import type { PoemDTO } from "./types";
import { toAuthorDTO } from "@/modules/author/mapper";
import type { AuthorDTO } from "@/modules/author";

export interface HomeDTO {
  readonly featuredPoem: PoemDTO;
  readonly featuredAuthor: AuthorDTO | null;
  readonly totalPoems: number;
  readonly totalAuthors: number;
}

export interface DiscoverDTO {
  readonly recentPoems: readonly PoemDTO[];
  readonly dynasties: readonly UpstreamDynasty[];
  readonly types: readonly UpstreamType[];
}

export interface CategoriesDTO {
  readonly dynasties: readonly UpstreamDynasty[];
  readonly types: readonly UpstreamType[];
}

export interface RecommendDTO {
  readonly poems: readonly PoemDTO[];
  readonly reason: string;
}

export interface QuoteDTO {
  readonly content: string;
  readonly author: string;
  readonly source: string;
}

export interface ConfigDTO {
  readonly version: string;
  readonly bannerUrl: string | null;
  readonly features: Record<string, boolean>;
}

export const aggregateService = {
  async home(): Promise<HomeDTO> {
    const cacheKey = "poetry:home";
    const cached = await cache.get<HomeDTO>(cacheKey);
    if (cached) return cached;

    const [featuredPoem, stats, authors] = await Promise.all([
      poemClient.getRandomPoem(),
      poemClient.getStats(),
      chinesePoetryClient.getAuthors({ page: 1, pageSize: 1 }),
    ]);

    const dto: HomeDTO = {
      featuredPoem: toPoemDTO(featuredPoem),
      featuredAuthor: authors.data[0] ? toAuthorDTO(authors.data[0]) : null,
      totalPoems: stats.totalPoems,
      totalAuthors: stats.totalAuthors,
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async discover(): Promise<DiscoverDTO> {
    const cacheKey = "poetry:discover";
    const cached = await cache.get<DiscoverDTO>(cacheKey);
    if (cached) return cached;

    const [poems, dynasties, types] = await Promise.all([
      poemClient.getPoems({ page: 1, pageSize: 10 }),
      chinesePoetryClient.getDynasties(),
      chinesePoetryClient.getTypes(),
    ]);

    const dto: DiscoverDTO = {
      recentPoems: poems.data.map(toPoemDTO),
      dynasties,
      types,
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async categories(): Promise<CategoriesDTO> {
    const cacheKey = "poetry:categories";
    const cached = await cache.get<CategoriesDTO>(cacheKey);
    if (cached) return cached;

    const [dynasties, types] = await Promise.all([
      chinesePoetryClient.getDynasties(),
      chinesePoetryClient.getTypes(),
    ]);

    const dto: CategoriesDTO = { dynasties, types };
    await cache.set(cacheKey, dto, 3600);
    return dto;
  },

  async recommend(): Promise<RecommendDTO> {
    const cacheKey = "poetry:recommend";
    const cached = await cache.get<RecommendDTO>(cacheKey);
    if (cached) return cached;

    const poems = await poemClient.getPoems({ page: 1, pageSize: 5 });

    const dto: RecommendDTO = {
      poems: poems.data.map(toPoemDTO),
      reason: "为你精选",
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async quote(): Promise<QuoteDTO> {
    const poem = await poemClient.getRandomPoem();

    const lines = poem.content.split(/[，。！？\n]/).filter(Boolean);
    const quoteContent = lines.slice(0, 2).join("，");

    return {
      content: quoteContent || poem.content.slice(0, 50),
      author: poem.author ?? "未知",
      source: poem.title,
    };
  },

  async config(): Promise<ConfigDTO> {
    const cacheKey = "poetry:config";
    const cached = await cache.get<ConfigDTO>(cacheKey);
    if (cached) return cached;

    const dto: ConfigDTO = {
      version: "1.0.0",
      bannerUrl: null,
      features: {
        aiAnalysis: true,
        aiAsk: true,
        aiTranslate: true,
        favorites: true,
        readingHistory: true,
        recommendations: true,
      },
    };
    await cache.set(cacheKey, dto, 3600);
    return dto;
  },
};
