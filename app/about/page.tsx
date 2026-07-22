import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于 — Poetry Gateway",
};

const techStack = [
  { name: "Next.js 16", desc: "React 全栈框架 — App Router + Server Components" },
  { name: "TypeScript", desc: "类型安全 — 全栈类型推断" },
  { name: "Prisma", desc: "ORM — 类型安全的数据库访问" },
  { name: "PostgreSQL", desc: "关系型数据库 — 持久化用户与收藏数据" },
  { name: "Redis", desc: "缓存 — 热点数据毫秒级响应" },
  { name: "DeepSeek", desc: "AI 大模型 — 诗词智能赏析、翻译与问答" },
  { name: "JWT", desc: "认证 — 无状态 Token 鉴权" },
  { name: "Docker", desc: "容器化 — 多阶段构建 + PM2 集群部署" },
];

export default function AboutPage() {
  return (
    <div>
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            关于
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Poetry Gateway 项目介绍
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* 项目简介 */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">#</span>
            项目简介
          </h2>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Poetry Gateway 是中国古诗词统一 API 网关服务，基于 BFF（Backend For
              Frontend）架构设计，为 Flutter、Web 和小程序等多端客户端提供统一的
              RESTful 接口。项目聚合了近 40 万首唐诗、宋词、元曲数据，集成 DeepSeek
              AI 能力，提供智能赏析、翻译和问答功能，并内置用户认证、收藏同步和阅读历史等完整功能模块。
            </p>
          </div>
        </section>

        {/* 技术栈 */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">#</span>
            技术栈
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                  {tech.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 数据来源 */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">#</span>
            数据来源
          </h2>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              诗词数据来源于开源项目{" "}
              <a
                href="https://github.com/chinese-poetry/chinese-poetry"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
              >
                chinese-poetry
              </a>
              ，该项目收录了近 40 万首中国历代古诗词，覆盖唐诗、宋词、元曲等主要诗歌体裁，
              数据持续更新维护。在此对 chinese-poetry 项目团队表示由衷感谢。
            </p>
          </div>
        </section>

        {/* 开源协议 */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">#</span>
            开源协议
          </h2>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              本项目基于{" "}
              <span className="font-semibold text-zinc-900 dark:text-white">
                MIT 协议
              </span>{" "}
              开源，欢迎自由使用、修改和分发。详细信息请参阅项目根目录下的{" "}
              <code className="text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono">
                LICENSE
              </code>{" "}
              文件。
            </p>
          </div>
        </section>

        {/* 致谢 */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-amber-600 dark:text-amber-400">#</span>
            致谢
          </h2>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              感谢以下开源项目和 AI 服务对本项目的支持：
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">-</span>
                <div>
                  <a
                    href="https://github.com/chinese-poetry/chinese-poetry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 dark:text-amber-400 hover:underline font-medium"
                  >
                    chinese-poetry
                  </a>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-1">
                    — 海量中国古诗词数据集，是本项目的基石
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">-</span>
                <div>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    DeepSeek AI
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-1">
                    — 提供高质量的大语言模型能力，驱动诗词赏析、翻译与问答
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">-</span>
                <div>
                  <span className="text-zinc-900 dark:text-white font-medium">
                    Next.js · Prisma · Redis · PostgreSQL
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm ml-1">
                    — 优秀的开源基础设施
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
