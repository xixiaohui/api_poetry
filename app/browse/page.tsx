"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination";

interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

const DYNASTIES = ["唐", "宋", "元", "明", "清", "先秦", "南北朝", "五代"];
const TYPES = ["五言绝句", "七言绝句", "五言律诗", "七言律诗", "乐府诗", "宋词", "元曲"];
const PAGE_SIZES = [10, 15, 30, 50];
const DEFAULT_PAGE_SIZE = 15;

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const dynasty = searchParams.get("dynasty") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE)
  );

  const [poems, setPoems] = useState<PoemDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());
      if (dynasty) params.set("dynasty", dynasty);
      if (type) params.set("type", type);

      const res = await fetch(`/api/v1/poems?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPoems(json.data.poems);
        setTotal(json.data.total ?? 0);
      } else {
        setError(json.message);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, dynasty, type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchPoems();
  }, [fetchPoems]);

  const totalPages = Math.ceil(total / pageSize);

  // 当前页超出总页数（如筛选后数据变少）时自动回到最后一页
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      const p = new URLSearchParams(searchParams.toString());
      p.set("page", totalPages.toString());
      router.replace(`/browse?${p.toString()}`);
    }
  }, [totalPages, page, searchParams, router]);

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    return `/browse?${p.toString()}`;
  };

  return (
    <div className="">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            诗词浏览
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            共 {(total ?? 0).toLocaleString()} 首 · 按朝代/体裁筛选 · 第 {page} 页
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">朝代:</span>
            <Link
              href={buildUrl({ dynasty: "", page: "1" })}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                !dynasty ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-400"
                : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400"
              }`}
            >全部</Link>
            {DYNASTIES.map((d) => (
              <Link
                key={d}
                href={buildUrl({ dynasty: d, page: "1" })}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  dynasty === d ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-400"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400"
                }`}
              >{d}</Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">体裁:</span>
            <Link
              href={buildUrl({ type: "", page: "1" })}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                !type ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-400"
                : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400"
              }`}
            >全部</Link>
            {TYPES.map((t) => (
              <Link
                key={t}
                href={buildUrl({ type: t, page: "1" })}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  type === t ? "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-400"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400"
                }`}
              >{t}</Link>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-zinc-400 dark:text-zinc-600">加载中...</div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
            加载失败: {error}
          </div>
        )}

        {/* Poem Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {poems.map((poem) => (
              <Link
                key={poem.id}
                href={`/detail?id=${poem.id}`}
                className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-800 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {poem.title}
                  </h3>
                  <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                    →
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {poem.author ?? "佚名"} · {poem.dynasty ?? "未知"} · {poem.type ?? "未知"}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 line-clamp-4 leading-relaxed">
                  {poem.content}
                </p>
              </Link>
            ))}
            {poems.length === 0 && (
              <div className="col-span-full text-center py-20 text-zinc-400 dark:text-zinc-600">
                暂无数据
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex flex-col items-center gap-3 mt-10">
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <span>共 {total.toLocaleString()} 首 · 每页</span>
              <select
                value={pageSize}
                onChange={(e) =>
                  router.push(buildUrl({ pageSize: e.target.value, page: "1" }))
                }
                className="h-9 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="每页条数"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span>条</span>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              buildHref={(p) => buildUrl({ page: p.toString() })}
              onJump={(p) => router.push(buildUrl({ page: p.toString() }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400">加载中...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
