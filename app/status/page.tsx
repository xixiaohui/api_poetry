"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";

interface ServiceCheck {
  name: string;
  endpoint: string;
  status: "checking" | "ok" | "error";
  latency?: number;
  error?: string;
}

const services: ServiceCheck[] = [
  { name: "Gateway API", endpoint: "/api/v1/home", status: "checking" },
  { name: "Chinese Poetry API", endpoint: "/api/v1/poems?pageSize=1", status: "checking" },
  { name: "诗词搜索", endpoint: "/api/v1/search?q=静夜思", status: "checking" },
  { name: "AI 健康", endpoint: "/api/v1/config", status: "checking" },
  { name: "用户系统", endpoint: "/api/v1/user/login", status: "checking" },
];

export default function StatusPage() {
  const [checks, setChecks] = useState<ServiceCheck[]>(services);
  const [checking, setChecking] = useState(true);

  const runChecks = useCallback(async () => {
    setChecking(true);
    setChecks(services.map((s) => ({ ...s, status: "checking" as const })));

    const results = await Promise.all(
      services.map(async (svc) => {
        const start = Date.now();
        try {
          const res = await fetch(svc.endpoint, {
            method: svc.name === "用户系统" ? "POST" : "GET",
            headers: svc.name === "用户系统"
              ? { "Content-Type": "application/json" }
              : undefined,
            body: svc.name === "用户系统"
              ? JSON.stringify({ email: "health@check", password: "check" })
              : undefined,
            signal: AbortSignal.timeout(8000),
          });
          return {
            ...svc,
            status: (res.ok || res.status === 400 ? "ok" : "error") as "ok" | "error",
            latency: Date.now() - start,
          };
        } catch (e) {
          return {
            ...svc,
            status: "error" as const,
            latency: Date.now() - start,
            error: (e as Error).message,
          };
        }
      })
    );

    setChecks(results);
    setChecking(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial health check
    runChecks();
  }, [runChecks]);

  const okCount = checks.filter((c) => c.status === "ok").length;
  const allOk = okCount === checks.length;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-amber-600 dark:text-amber-400 hover:underline text-sm">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            服务状态
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            下游服务健康检查 — 实时监控各组件可用性
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Overall Status */}
        <div
          className={`rounded-2xl p-6 ${
            allOk
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50"
              : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="text-4xl">{allOk ? "✅" : "⚠️"}</span>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {allOk ? "所有系统正常" : `${okCount}/${checks.length} 服务正常`}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                {allOk
                  ? "Poetry Gateway 及其下游服务运行正常"
                  : "部分服务不可用，请检查下游服务状态"}
              </p>
            </div>
            <button
              onClick={runChecks}
              disabled={checking}
              className="ml-auto rounded-lg border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {checking ? "检查中..." : "重新检查"}
            </button>
          </div>
        </div>

        {/* Service Cards */}
        <div className="space-y-3">
          {checks.map((c) => (
            <div
              key={c.name}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-center gap-4"
            >
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  c.status === "checking"
                    ? "bg-zinc-400 animate-pulse"
                    : c.status === "ok"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900 dark:text-white">
                  {c.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                  {c.endpoint}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-semibold ${
                    c.status === "checking"
                      ? "text-zinc-400"
                      : c.status === "ok"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {c.status === "checking"
                    ? "检查中"
                    : c.status === "ok"
                      ? "正常"
                      : "异常"}
                </span>
                {c.latency !== undefined && (
                  <p className="text-xs text-zinc-400 mt-0.5">{c.latency}ms</p>
                )}
                {c.error && (
                  <p className="text-xs text-red-500 mt-0.5 max-w-[200px] truncate">
                    {c.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Architecture */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
            架构总览
          </h3>
          <pre className="text-xs font-mono text-zinc-600 dark:text-zinc-400 leading-relaxed text-center">
{`Flutter App / Web / 小程序
         │
  Poetry Gateway (8080)
         │
  ┌──────┼──────┬──────────┐
  ▼      ▼      ▼          ▼
Poems  Redis  DeepSeek  PostgreSQL
(1279) (6379) (API)     (5432)`}
          </pre>
        </div>
      </div>
      <Footer />
    </div>
  );
}
