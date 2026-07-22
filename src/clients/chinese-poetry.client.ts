import { config } from "@/shared/config";
import { UpstreamError } from "@/shared/errors";
import { logger } from "@/shared/logger";

function getBaseUrl(): string {
  return config.chinesePoetryApiUrl;
}

async function get<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${getBaseUrl()}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    });
  }
  logger.info({ url: url.toString() }, "Chinese Poetry API request");
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new UpstreamError(`Chinese Poetry API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface UpstreamPoem {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author?: string;
  readonly dynasty?: string;
  readonly type?: string;
}

export interface UpstreamAuthor {
  readonly id: number;
  readonly name: string;
  readonly dynasty?: string;
  readonly description?: string;
  readonly poemCount?: number;
}

export interface UpstreamDynasty {
  readonly id: number;
  readonly name: string;
}

export interface UpstreamType {
  readonly id: number;
  readonly name: string;
}

export interface UpstreamStats {
  readonly totalPoems: number;
  readonly totalAuthors: number;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export const chinesePoetryClient = {
  getPoems(params: { page?: number; pageSize?: number; dynasty?: string; type?: string; author?: string }): Promise<PaginatedResponse<UpstreamPoem>> {
    return get<PaginatedResponse<UpstreamPoem>>("/poems", {
      page: params.page?.toString(),
      page_size: params.pageSize?.toString(),
      dynasty: params.dynasty,
      type: params.type,
      author: params.author,
    });
  },

  getPoemById(id: number): Promise<UpstreamPoem> {
    return get<UpstreamPoem>(`/poems/${id}`);
  },

  getRandomPoem(params?: { author?: string; type?: string; dynasty?: string; char?: string }): Promise<UpstreamPoem> {
    return get<UpstreamPoem>("/poems/random", {
      author: params?.author,
      type: params?.type,
      dynasty: params?.dynasty,
      char: params?.char,
    });
  },

  searchPoems(params: { q: string; type?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamPoem>> {
    return get<PaginatedResponse<UpstreamPoem>>("/poems/search", {
      q: params.q,
      type: params.type,
      page: params.page?.toString(),
      page_size: params.pageSize?.toString(),
    });
  },

  getAuthors(params: { page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamAuthor>> {
    return get<PaginatedResponse<UpstreamAuthor>>("/authors", {
      page: params.page?.toString(),
      page_size: params.pageSize?.toString(),
    });
  },

  getAuthorById(id: number): Promise<UpstreamAuthor> {
    return get<UpstreamAuthor>(`/authors/${id}`);
  },

  getDynasties(): Promise<UpstreamDynasty[]> {
    return get<UpstreamDynasty[]>("/dynasties");
  },

  getTypes(): Promise<UpstreamType[]> {
    return get<UpstreamType[]>("/types");
  },

  getStats(): Promise<UpstreamStats> {
    return get<UpstreamStats>("/stats");
  },
};
