"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
}

const SEARCH_TYPES = [
  { value: "", label: "全部" },
  { value: "title", label: "标题" },
  { value: "content", label: "内容" },
  { value: "author", label: "作者" },
] as const;

function SearchContent() {
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [query, setQuery] = useState(q);
  const [searchType, setSearchType] = useState(type);
  const [poems, setPoems] = useState<PoemDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(!!q);

  const fetchResults = useCallback(async () => {
    if (!q) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      params.set("q", q);
      params.set("page", page.toString());
      params.set("pageSize", "15");
      if (type) params.set("type", type);

      const res = await fetch(`/api/v1/search?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPoems(json.data.poems ?? json.data.results ?? []);
        setTotal(json.data.total ?? 0);
      } else {
        setError(json.message ?? "搜索请求失败");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [q, type, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    fetchResults();
  }, [fetchResults]);

  const totalPages = Math.ceil(total / 15);

  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    return `/search?${p.toString()}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Use window.location to do a full navigation so searchParams update
    window.location.href = `/search?q=${encodeURIComponent(query.trim())}&type=${searchType}`;
  };

  return (
    <div className="">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            诗词搜索
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            全文搜索 — 标题/内容/作者分类检索
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <div className="flex rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden flex-1">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="border-r border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
            >
              {SEARCH_TYPES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入关键词搜索..."
              className="flex-1 px-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 bg-transparent outline-none placeholder:text-zinc-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-xl bg-amber-600 px-6 py-2 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm"
          >
            搜索
          </button>
        </form>

        {/* Result count */}
        {searched && !loading && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            找到 {(total ?? 0).toLocaleString()} 条结果
            {page > 1 && ` · 第 ${page} 页`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-zinc-400 dark:text-zinc-600">
            搜索中...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
            搜索失败: {error}
          </div>
        )}

        {/* Results */}
        {!loading && searched && (
          <div className="space-y-4">
            {poems.map((poem) => (
              <div
                key={poem.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  {poem.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {poem.author ?? "佚名"} · {poem.dynasty ?? "未知"}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 line-clamp-4 leading-relaxed">
                  {poem.content}
                </p>
              </div>
            ))}
            {poems.length === 0 && (
              <div className="text-center py-20 text-zinc-400 dark:text-zinc-600">
                未找到匹配结果
              </div>
            )}
          </div>
        )}

        {/* Empty state before first search */}
        {!searched && !loading && (
          <div className="text-center py-20">
            <p className="text-5xl mb-6">🔍</p>
            <p className="text-zinc-500 dark:text-zinc-400">
              输入关键词，搜索海量古诗词
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            {page > 1 && (
              <Link
                href={buildUrl({ page: (page - 1).toString() })}
                className="text-sm px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                ← 上一页
              </Link>
            )}
            <span className="text-sm text-zinc-500">{page} / {totalPages}</span>
            {page < totalPages && (
              <Link
                href={buildUrl({ page: (page + 1).toString() })}
                className="text-sm px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                下一页 →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400">加载中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
