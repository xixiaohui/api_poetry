"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";

interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

export default function RandomPage() {
  const [poem, setPoem] = useState<PoemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [dynasty, setDynasty] = useState("");

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (author.trim()) params.set("author", author.trim());
      if (dynasty.trim()) params.set("dynasty", dynasty.trim());

      const qs = params.toString();
      const res = await fetch(`/api/v1/poems/random${qs ? `?${qs}` : ""}`);
      const json = await res.json();
      if (json.success) {
        setPoem(json.data);
      } else {
        setError(json.message);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [author, dynasty]);

  useEffect(() => {
    fetchRandom();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <Link href="/" className="text-amber-600 dark:text-amber-400 hover:underline text-sm">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            随机漫步
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            随机邂逅一首古诗词
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="作者（如 李白）"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 w-36"
          />
          <input
            type="text"
            value={dynasty}
            onChange={(e) => setDynasty(e.target.value)}
            placeholder="朝代（如 唐）"
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 w-36"
          />
          <button
            onClick={fetchRandom}
            disabled={loading}
            className="rounded-lg bg-amber-600 px-5 py-2 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "..." : "换一首"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Poem Display */}
        {poem && !loading && (
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 md:p-16 shadow-sm">
            <div className="text-center mb-8">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">
                {poem.dynasty ?? "未知朝代"} · {poem.type ?? ""}
              </p>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {poem.title}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
                {poem.author ?? "佚名"}
              </p>
            </div>

            <div className="text-center">
              {poem.content.split("\n").map((line, i) => (
                <p
                  key={i}
                  className="text-xl md:text-2xl leading-loose text-zinc-800 dark:text-zinc-200 tracking-wider"
                  style={{ fontFamily: "'Noto Serif SC', 'Songti SC', serif" }}
                >
                  {line || " "}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!poem && !loading && !error && (
          <div className="text-center py-32">
            <p className="text-6xl mb-6">📜</p>
            <p className="text-zinc-500 dark:text-zinc-400">
              点击上方按钮，邂逅一首诗词
            </p>
            <button
              onClick={fetchRandom}
              className="mt-6 rounded-xl bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700 transition-colors"
            >
              开始随机漫步
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
