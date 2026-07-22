"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

interface AIAnalysisDTO {
  readonly background: string;
  readonly appreciation: string;
  readonly keywords: readonly string[];
  readonly emotions: readonly string[];
}

async function authPost(
  url: string,
  body: unknown
): Promise<{ success: boolean; data?: unknown; message?: string }> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    return { success: false, message: "需要登录" };
  }
  return res.json();
}

export default function PoemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [poem, setPoem] = useState<PoemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AIAnalysisDTO | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [analyseError, setAnalyseError] = useState<string | null>(null);

  const [favoriting, setFavoriting] = useState(false);
  const [favoriteMsg, setFavoriteMsg] = useState<string | null>(null);

  const fetchPoem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/poems/${id}`);
      const json = await res.json();
      if (json.success) {
        setPoem(json.data);
      } else {
        setError(json.message ?? "加载失败");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchPoem();
  }, [fetchPoem]);

  const handleAnalyse = async () => {
    if (!poem) return;
    setAnalysing(true);
    setAnalyseError(null);
    setAnalysis(null);
    try {
      const result = await authPost("/api/v1/ai/analyse", {
        title: poem.title,
        content: poem.content,
        author: poem.author,
        dynasty: poem.dynasty,
      });
      if (result.success) {
        setAnalysis(result.data as AIAnalysisDTO);
      } else {
        setAnalyseError(result.message ?? "分析失败");
      }
    } catch (e) {
      setAnalyseError((e as Error).message);
    } finally {
      setAnalysing(false);
    }
  };

  const handleFavorite = async () => {
    if (!poem) return;
    setFavoriting(true);
    setFavoriteMsg(null);
    try {
      const result = await authPost("/api/v1/favorites", {
        poemId: String(poem.id),
        poemTitle: poem.title,
        poemAuthor: poem.author,
        poemDynasty: poem.dynasty,
      });
      if (result.success) {
        setFavoriteMsg("收藏成功");
      } else {
        setFavoriteMsg(result.message ?? "需要登录");
      }
    } catch (e) {
      setFavoriteMsg((e as Error).message);
    } finally {
      setFavoriting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400 dark:text-zinc-600">
        加载中...
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-6 text-sm text-red-700 dark:text-red-400 max-w-md text-center">
          {error ?? "诗词不存在"}
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
        {/* Poem Card */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 md:p-16 shadow-sm mb-8">
          <div className="text-center mb-8">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">
              {poem.dynasty ?? "未知朝代"} · {poem.type ?? ""}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
              {poem.title}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-lg">
              {poem.author ?? "佚名"}
            </p>
          </div>

          <div className="text-center space-y-1">
            {poem.content.split("\n").map((line, i) => (
              <p
                key={i}
                className="text-xl md:text-2xl leading-loose text-zinc-800 dark:text-zinc-200 tracking-wider font-serif"
              >
                {line || " "}
              </p>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <button
            onClick={handleAnalyse}
            disabled={analysing}
            className="rounded-xl bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            {analysing ? "AI 赏析中..." : "AI 赏析"}
          </button>
          <button
            onClick={handleFavorite}
            disabled={favoriting}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {favoriting ? "收藏中..." : "☆ 收藏"}
          </button>
        </div>

        {/* AI Analysis Error */}
        {analyseError && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 mb-8 text-center">
            {analyseError}
          </div>
        )}

        {/* AI Analysis Result */}
        {analysis && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 mb-8">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <span>🤖</span> AI 赏析
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  创作背景
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {analysis.background}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  诗词赏析
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {analysis.appreciation}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  关键词
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-zinc-600 dark:text-zinc-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  情感
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.emotions.map((em) => (
                    <span
                      key={em}
                      className="text-xs rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-amber-700 dark:text-amber-400"
                    >
                      {em}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorite Message */}
        {favoriteMsg && (
          <div
            className={`rounded-xl p-4 text-sm text-center mb-8 ${
              favoriteMsg === "收藏成功"
                ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400"
            }`}
          >
            {favoriteMsg}
          </div>
        )}
      </div>
    </div>
  );
}
