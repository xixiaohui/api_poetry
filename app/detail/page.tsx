"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

interface PosterResultDTO {
  readonly svg: string;
  readonly pngBase64?: string;
  readonly width: number;
  readonly height: number;
  readonly theme: string;
  readonly filename: string;
}

const THEMES: ReadonlyArray<{ id: string; label: string; desc: string }> = [
  { id: "ink", label: "水墨", desc: "宣纸留白 · 远山淡影" },
  { id: "sunset", label: "落日", desc: "暖色纸笺 · 疏影横斜" },
  { id: "night", label: "夜月", desc: "深蓝夜空 · 明月星辉" },
];

/** 将后端生成的 SVG 转换为 PNG Blob（浏览器本地渲染，与预览完全一致） */
async function svgToPngBlob(svg: string, width: number, height: number): Promise<Blob> {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("SVG 渲染失败"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("浏览器不支持 Canvas");
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG 转换失败"))), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function DetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [poem, setPoem] = useState<PoemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Poster state
  const [posterOpen, setPosterOpen] = useState(false);
  const [theme, setTheme] = useState("ink");
  const [poster, setPoster] = useState<PosterResultDTO | null>(null);
  const [generating, setGenerating] = useState(false);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  const handleGeneratePoster = useCallback(async (targetTheme: string) => {
    if (!poem) return;
    setGenerating(true);
    setPosterError(null);
    setPoster(null);
    try {
      const res = await fetch("/api/v1/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poemId: poem.id,
          theme: targetTheme,
          format: "both",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPoster(json.data);
      } else {
        setPosterError(json.message ?? "生成失败");
      }
    } catch (e) {
      setPosterError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }, [poem]);

  const handleOpenPoster = () => {
    setPosterOpen(true);
    if (!poster) handleGeneratePoster(theme);
  };

  const handleThemeChange = (next: string) => {
    setTheme(next);
    handleGeneratePoster(next);
  };

  const handleDownload = async () => {
    if (!poster) return;
    setDownloading(true);
    try {
      const blob = await svgToPngBlob(poster.svg, poster.width, poster.height);
      triggerDownload(blob, poster.filename);
    } catch (e) {
      setPosterError((e as Error).message);
    } finally {
      setDownloading(false);
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
            {(poem.content ?? "").split("\n").map((line, i) => (
              <p
                key={i}
                className="text-xl md:text-2xl leading-loose text-zinc-800 dark:text-zinc-200 tracking-wider font-serif"
              >
                {line || "\u00a0"}
              </p>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <button
            onClick={handleOpenPoster}
            className="rounded-xl bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700 transition-colors shadow-sm"
          >
            🎨 生成海报
          </button>
          <Link
            href={`/poem/${poem.id}`}
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-center"
          >
            AI 赏析与收藏
          </Link>
        </div>

        {/* Poster Modal */}
        {posterOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPosterOpen(false)}
          >
            <div
              className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-white">诗词海报</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    1080×1440 · 适配小红书 3:4 竖版
                  </p>
                </div>
                <button
                  onClick={() => setPosterOpen(false)}
                  className="w-8 h-8 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {/* Theme selector */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id)}
                      className={`text-sm px-4 py-2 rounded-xl border transition-colors text-left ${
                        theme === t.id
                          ? "bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900/40 dark:border-amber-600 dark:text-amber-300"
                          : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400"
                      }`}
                    >
                      <span className="font-medium">{t.label}</span>
                      <span className="block text-xs opacity-70 mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Error */}
                {posterError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 text-sm text-red-700 dark:text-red-400 mb-6">
                    {posterError}
                  </div>
                )}

                {/* Generating */}
                {generating && (
                  <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
                    <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <span className="text-sm">海报生成中...</span>
                  </div>
                )}

                {/* Preview + Download */}
                {poster && !generating && (
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1 w-full">
                      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="mx-auto max-w-85 aspect-3/4 w-full"
                          dangerouslySetInnerHTML={{ __html: poster.svg }}
                        />
                      </div>
                    </div>
                    <div className="md:w-64 w-full flex flex-col gap-3">
                      <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="rounded-xl bg-amber-600 px-5 py-3 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
                      >
                        {downloading ? "生成中..." : "⬇ 下载 PNG"}
                      </button>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        PNG 为高清竖版海报，可直接用于小红书等平台发布。
                        {poster.pngBase64 ? "服务端已同时返回 PNG（可用于自动化上传）。" : "服务端未配置中文字体，已由浏览器本地渲染。"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400 dark:text-zinc-600">加载中...</div>}>
      <DetailContent />
    </Suspense>
  );
}
