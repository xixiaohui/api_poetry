"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface AuthorDTO {
  readonly id: number;
  readonly name: string;
  readonly dynasty: string | null;
  readonly description: string | null;
  readonly poemCount: number | null;
}

interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

export default function AuthorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [author, setAuthor] = useState<AuthorDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [poems, setPoems] = useState<PoemDTO[]>([]);
  const [poemsLoading, setPoemsLoading] = useState(false);
  const [poemsError, setPoemsError] = useState<string | null>(null);

  const fetchAuthor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/authors/${id}`);
      const json = await res.json();
      if (json.success) {
        setAuthor(json.data);
      } else {
        setError(json.message ?? "加载失败");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPoems = useCallback(async (authorName: string) => {
    setPoemsLoading(true);
    setPoemsError(null);
    try {
      const params = new URLSearchParams();
      params.set("author", authorName);
      params.set("pageSize", "10");
      const res = await fetch(`/api/v1/poems?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPoems(json.data.poems ?? json.data.results ?? []);
      } else {
        setPoemsError(json.message ?? "加载诗词列表失败");
      }
    } catch (e) {
      setPoemsError((e as Error).message);
    } finally {
      setPoemsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchAuthor();
  }, [fetchAuthor]);

  useEffect(() => {
    if (author?.name) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- data load after author fetch
      fetchPoems(author.name);
    }
  }, [author?.name, fetchPoems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400 dark:text-zinc-600">
        加载中...
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-6 text-sm text-red-700 dark:text-red-400 max-w-md text-center">
          {error ?? "作者不存在"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link
            href="/browse"
            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
          >
            ← 返回浏览
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Author Info Card */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 md:p-10 shadow-sm mb-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              {author.name}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2">
              {author.dynasty ?? "朝代不详"}
              {author.poemCount != null && (
                <span> · 收录 {author.poemCount.toLocaleString()} 首</span>
              )}
            </p>
          </div>

          {author.description && (
            <div className="mt-6 max-w-2xl mx-auto">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed text-center">
                {author.description}
              </p>
            </div>
          )}
        </div>

        {/* Poems Section */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
            诗词作品
            {author.poemCount != null && (
              <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-2">
                · 展示最近 10 首
              </span>
            )}
          </h2>

          {poemsLoading && (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-600">
              加载中...
            </div>
          )}

          {poemsError && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
              加载失败: {poemsError}
            </div>
          )}

          {!poemsLoading && !poemsError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {poems.map((poem) => (
                <Link key={poem.id} href={`/poem/${poem.id}`}>
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer h-full">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {poem.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {poem.dynasty ?? "未知"} · {poem.type ?? "未知体裁"}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 line-clamp-4 leading-relaxed">
                      {poem.content}
                    </p>
                  </div>
                </Link>
              ))}
              {poems.length === 0 && (
                <div className="col-span-full text-center py-16 text-zinc-400 dark:text-zinc-600">
                  暂无诗词数据
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
