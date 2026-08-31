import { config } from "@/shared/config";
import { NotFoundError, UpstreamError } from "@/shared/errors";
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

/** 上游分页响应：数据在 data，分页信息在 pagination */
interface UpstreamPagination {
  readonly page: number;
  readonly page_size: number;
  readonly total: number;
  readonly total_pages: number;
}

interface UpstreamPaginatedResponse<T> {
  readonly data: T[];
  readonly pagination?: UpstreamPagination;
}

/** 请求上游分页接口并将 { data, pagination } 规范化为 PaginatedResponse */
async function getPaginated<T>(
  path: string,
  params?: Record<string, string | undefined>
): Promise<PaginatedResponse<T>> {
  const raw = await get<UpstreamPaginatedResponse<T>>(path, params);
  const items = Array.isArray(raw?.data) ? raw.data : [];
  const pagination = raw?.pagination;
  return {
    data: items,
    total: pagination?.total ?? items.length,
    page: pagination?.page ?? 1,
    pageSize: pagination?.page_size ?? items.length,
  };
}

export const chinesePoetryClient = {
  getPoems(params: { page?: number; pageSize?: number; dynasty?: string; type?: string; author?: string }): Promise<PaginatedResponse<UpstreamPoem>> {
    return getPaginated<UpstreamPoem>("/poems", {
      page: params.page?.toString(),
      page_size: params.pageSize?.toString(),
      dynasty: params.dynasty,
      type: params.type,
      author: params.author,
    });
  },

  /**
   * 上游服务没有提供按 ID 查询详情或 /poems/:id 的路由（返回 404），
   * 但列表接口 /poems 按 id 升序返回且 ID 大体连续（存在少量删除空洞）。
   * 这里用"猜页 + 按首尾 ID 偏差跳页"的方式定位目标 ID，通常 1~2 次请求命中。
   */
  async getPoemById(id: number): Promise<UpstreamPoem> {
    const PAGE_SIZE = 100;
    let page = Math.max(1, Math.ceil(id / PAGE_SIZE));

    for (let attempt = 0; attempt < 6; attempt++) {
      const result = await getPaginated<UpstreamPoem>("/poems", {
        page: page.toString(),
        page_size: PAGE_SIZE.toString(),
      });
      const poems = result?.data ?? [];
      const first = poems[0]?.id;
      const last = poems[poems.length - 1]?.id;

      if (first === undefined || last === undefined) break;

      if (first <= id && id <= last) {
        const poem = poems.find((p) => p.id === id);
        if (poem) return poem;
        break; // 页内没有该 ID（空洞），按不存在处理
      }

      if (id < first) {
        page = Math.max(1, page - Math.ceil((first - id) / PAGE_SIZE));
      } else {
        page += Math.ceil((id - last) / PAGE_SIZE);
      }
    }

    throw new NotFoundError(`诗词不存在 (id: ${id})`);
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
    return getPaginated<UpstreamPoem>("/poems/search", {
      q: params.q,
      type: params.type,
      page: params.page?.toString(),
      page_size: params.pageSize?.toString(),
    });
  },

  getAuthors(params: { page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamAuthor>> {
    return getPaginated<UpstreamAuthor>("/authors", {
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
