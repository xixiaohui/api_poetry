import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "更新日志 — Poetry Gateway",
};

const versions = [
  {
    version: "v1.0.0",
    date: "2026-07-22",
    description:
      "初始版本 — 21 个 API 端点、7 个业务模块、AI 赏析/问答/翻译、JWT 认证、收藏同步、阅读历史、Redis 缓存、Docker 部署",
  },
];

export default function ChangelogPage() {
  return (
    <div className="">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            更新日志
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Poetry Gateway 版本历史
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-10">
          {versions.map((v) => (
            <div key={v.version} className="relative pl-8 border-l-2 border-amber-500">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-zinc-950" />
              <div className="mb-1">
                <span className="text-lg font-bold text-zinc-900 dark:text-white">
                  {v.version}
                </span>
                <span className="ml-3 text-sm text-zinc-500 dark:text-zinc-400">
                  {v.date}
                </span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
