"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const endpoints = [
  { label: "首页聚合", method: "GET", path: "/api/v1/home", hasBody: false },
  { label: "发现页", method: "GET", path: "/api/v1/discover", hasBody: false },
  { label: "诗词列表", method: "GET", path: "/api/v1/poems", hasBody: false },
  { label: "随机诗词", method: "GET", path: "/api/v1/poems/random", hasBody: false },
  { label: "作者列表", method: "GET", path: "/api/v1/authors", hasBody: false },
  { label: "分类列表", method: "GET", path: "/api/v1/categories", hasBody: false },
  { label: "搜索诗词", method: "GET", path: "/api/v1/search", hasBody: false },
  { label: "为你推荐", method: "GET", path: "/api/v1/recommend", hasBody: false },
  { label: "每日一句", method: "GET", path: "/api/v1/quote", hasBody: false },
  { label: "客户端配置", method: "GET", path: "/api/v1/config", hasBody: false },
];

const methodColors: Record<string, string> = {
  GET: "text-green-600 dark:text-green-400",
  POST: "text-blue-600 dark:text-blue-400",
};

export default function PlaygroundPage() {
  const [selected, setSelected] = useState(endpoints[0]!);
  const [queryParams, setQueryParams] = useState("");
  const [body, setBody] = useState("");
  const [token, setToken] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const buildUrl = useCallback(() => {
    const base = selected.path;
    if (queryParams.trim()) {
      return base + (queryParams.startsWith("?") ? queryParams : `?${queryParams}`);
    }
    return base;
  }, [selected.path, queryParams]);

  const handleSend = useCallback(async () => {
    setLoading(true);
    setResponse(null);
    setStatus(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token.trim()) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
      }

      const fetchOptions: RequestInit = { method: selected.method, headers };
      if (selected.hasBody && body.trim()) {
        fetchOptions.body = body;
      }

      const res = await fetch(buildUrl(), fetchOptions);
      setStatus(res.status);
      const json = await res.json();
      setResponse(JSON.stringify(json, null, 2));
    } catch (e) {
      setStatus(0);
      setResponse(`Network Error: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [selected, queryParams, body, token, buildUrl]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="text-amber-600 dark:text-amber-400 hover:underline text-sm">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            API Playground
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            在线调试 API — 选择端点、填写参数、发送请求
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Panel */}
        <div className="lg:col-span-1 space-y-5">
          {/* Endpoint selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              端点
            </label>
            <select
              value={selected.path}
              onChange={(e) => {
                const ep = endpoints.find((x) => x.path === e.target.value);
                if (ep) setSelected(ep);
              }}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200"
            >
              {endpoints.map((ep) => (
                <option key={ep.path} value={ep.path}>
                  {ep.method} {ep.label}
                </option>
              ))}
            </select>
          </div>

          {/* Query params */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Query 参数
            </label>
            <input
              type="text"
              value={queryParams}
              onChange={(e) => setQueryParams(e.target.value)}
              placeholder="?page=1&pageSize=10"
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Auth token */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              JWT Token (可选)
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Bearer eyJhbGci..."
              rows={2}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-800 dark:text-zinc-200 resize-none"
            />
          </div>

          {/* Request Body */}
          {selected.hasBody && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={`{"key": "value"}`}
                rows={5}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-800 dark:text-zinc-200 resize-none"
              />
            </div>
          )}

          {/* Send button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSend}
              disabled={loading}
              className="rounded-lg bg-amber-600 px-6 py-2.5 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "发送中..." : "发送请求"}
            </button>
            <code className="text-xs font-mono text-zinc-500">
              {selected.method} {buildUrl()}
            </code>
          </div>
        </div>

        {/* Response Panel */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              响应
            </label>
            {status !== null && (
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-md ${
                  status >= 200 && status < 300
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : status === 0
                      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                }`}
              >
                {status === 0 ? "NETWORK ERROR" : `HTTP ${status}`}
              </span>
            )}
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 min-h-[400px]">
            {response ? (
              <pre className="p-5 text-sm font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                {response}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-zinc-400 dark:text-zinc-600 text-sm">
                选择端点并点击"发送请求"查看响应
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
