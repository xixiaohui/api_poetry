"use client";

import { useState, useEffect, useCallback } from "react";

interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

interface AIResult {
  readonly background: string;
  readonly appreciation: string;
  readonly keywords: readonly string[];
  readonly emotions: readonly string[];
}

export default function TodayPage() {
  const [poem, setPoem] = useState<PoemDTO | null>(null);
  const [analysis, setAnalysis] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // First, get a random poem
      const poemRes = await fetch("/api/v1/poems/random");
      const poemJson = await poemRes.json();
      if (!poemJson.success) {
        setError(poemJson.message);
        return;
      }
      setPoem(poemJson.data);

      // Then try AI analysis (may fail if no auth or AI key not configured)
      try {
        const aiRes = await fetch("/api/v1/ai/analyse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: poemJson.data.title,
            content: poemJson.data.content,
            author: poemJson.data.author,
            dynasty: poemJson.data.dynasty,
          }),
        });
        const aiJson = await aiRes.json();
        if (aiJson.success) {
          setAnalysis(aiJson.data);
        }
      } catch {
        // AI analysis is optional for this page
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load
    fetchToday();
  }, [fetchToday]);

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekDay = weekDays[today.getDay()]!;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-amber-50 to-white dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            今日诗词
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {dateStr} 星期{weekDay} · 每日精选一首古诗词
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-32">
            <p className="text-6xl animate-bounce mb-6">📖</p>
            <p className="text-zinc-500 dark:text-zinc-400">正在为你准备今日诗词...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
            {error}
          </div>
        )}

        {poem && !loading && (
          <div className="space-y-6">
            {/* Poem Card */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 md:p-16 shadow-sm">
              <div className="text-center mb-8">
                <p className="text-xs font-medium text-red-500 dark:text-red-400 uppercase tracking-widest mb-2">
                  今日精选
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                  {poem.dynasty ?? "未知"} · {poem.author ?? "佚名"} · {poem.type ?? ""}
                </p>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {poem.title}
                </h2>
              </div>
              <div className="text-center">
                {poem.content.split(/[。！？\n]/).filter(Boolean).map((line, i) => (
                  <p
                    key={i}
                    className="text-xl md:text-2xl leading-loose text-zinc-800 dark:text-zinc-200 tracking-wider font-serif"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            {analysis && (
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>🤖</span> AI 赏析
                </h3>
                {analysis.background && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                      创作背景
                    </p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {analysis.background}
                    </p>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    赏析
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {analysis.appreciation}
                  </p>
                </div>
                {analysis.keywords.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {analysis.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={fetchToday}
                className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
              >
                换一首 →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
