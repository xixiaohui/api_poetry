import Link from "next/link";

const features = [
  {
    title: "海量诗词",
    desc: "聚合近 40 万首唐诗、宋词、元曲，涵盖五言绝句、七言律诗等丰富体裁。",
    icon: "📜",
  },
  {
    title: "AI 赏析",
    desc: "基于 DeepSeek 大模型，提供深度诗词赏析、翻译和智能问答。",
    icon: "🤖",
  },
  {
    title: "高速缓存",
    desc: "Redis 缓存热点数据，首页聚合 300s 刷新，诗词详情秒级响应。",
    icon: "⚡",
  },
  {
    title: "统一网关",
    desc: "BFF 架构 — Flutter / Web / 小程序统一入口，客户端零业务逻辑。",
    icon: "🔐",
  },
  {
    title: "用户系统",
    desc: "JWT 认证、收藏同步、阅读历史，所有数据持久化到 PostgreSQL。",
    icon: "👤",
  },
  {
    title: "容器部署",
    desc: "Docker 多阶段构建 + PM2 集群，Ubuntu 24.04 + Node.js 22 生产级部署。",
    icon: "🐳",
  },
];

const endpoints = [
  { method: "GET", path: "/api/v1/home", desc: "首页聚合 — 推荐诗词 + 作者 + 统计" },
  { method: "GET", path: "/api/v1/discover", desc: "发现页 — 近期诗词 + 朝代 + 体裁" },
  { method: "GET", path: "/api/v1/poems", desc: "诗词列表 — 分页、按朝代/体裁/作者筛选" },
  { method: "GET", path: "/api/v1/poems/random", desc: "随机诗词 — 支持按作者/体裁/朝代/单字过滤" },
  { method: "GET", path: "/api/v1/poems/:id", desc: "诗词详情" },
  { method: "GET", path: "/api/v1/authors", desc: "作者列表" },
  { method: "GET", path: "/api/v1/authors/:id", desc: "作者详情" },
  { method: "GET", path: "/api/v1/search", desc: "全文搜索 — 标题/内容/作者分类检索" },
  { method: "GET", path: "/api/v1/categories", desc: "分类 — 朝代 + 体裁聚合" },
  { method: "GET", path: "/api/v1/recommend", desc: "为你推荐" },
  { method: "GET", path: "/api/v1/quote", desc: "每日一句" },
  { method: "GET", path: "/api/v1/config", desc: "客户端配置" },
  { method: "POST", path: "/api/v1/ai/analyse", desc: "AI 诗词赏析", auth: true },
  { method: "POST", path: "/api/v1/ai/ask", desc: "AI 诗词问答", auth: true },
  { method: "POST", path: "/api/v1/ai/translate", desc: "AI 诗词翻译", auth: true },
  { method: "POST", path: "/api/v1/user/register", desc: "用户注册" },
  { method: "POST", path: "/api/v1/user/login", desc: "用户登录" },
  { method: "GET", path: "/api/v1/user/profile", desc: "获取个人信息", auth: true },
  { method: "PUT", path: "/api/v1/user/profile", desc: "更新个人信息", auth: true },
  { method: "GET", path: "/api/v1/favorites", desc: "收藏列表", auth: true },
  { method: "POST", path: "/api/v1/favorites", desc: "添加收藏", auth: true },
  { method: "DELETE", path: "/api/v1/favorites/:id", desc: "取消收藏", auth: true },
  { method: "GET", path: "/api/v1/history", desc: "阅读历史", auth: true },
  { method: "POST", path: "/api/v1/history", desc: "记录阅读", auth: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-amber-600 dark:text-amber-400 font-medium mb-4 tracking-wide">
          Backend For Frontend · Next.js 16
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6">
          Poetry Gateway
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          中国古诗词 API 统一网关服务。聚合海量诗词数据，提供 AI 智能赏析，
          所有客户端（Flutter / Web / 小程序）的唯一后端入口。
        </p>
        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700 transition-colors shadow-sm"
          >
            API 文档
            <span className="text-amber-200">→</span>
          </Link>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 dark:bg-zinc-700 px-6 py-3 text-white font-medium hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors shadow-sm"
          >
            API Playground
            <span className="text-zinc-400">→</span>
          </Link>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            诗词浏览
          </Link>
          <Link
            href="/random"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700 px-6 py-3 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            随机漫步
          </Link>
        </div>
      </header>

      {/* Quick Links */}
      <section className="max-w-5xl mx-auto px-6 pb-4">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { href: "/browse", icon: "🔍", label: "诗词浏览" },
            { href: "/random", icon: "🎲", label: "随机漫步" },
            { href: "/today", icon: "📅", label: "今日诗词" },
            { href: "/playground", icon: "🛠", label: "Playground" },
            { href: "/status", icon: "📊", label: "服务状态" },
            { href: "/search", icon: "🔎", label: "诗词搜索" },
            { href: "/changelog", icon: "📋", label: "更新日志" },
            { href: "/about", icon: "📖", label: "关于项目" },
            { href: "/getting-started", icon: "🚀", label: "快速开始" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:border-amber-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors bg-white dark:bg-zinc-900"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-12">
          核心特性
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* API Quick Reference */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            API 速览
          </h2>
          <Link
            href="/docs"
            className="text-amber-600 dark:text-amber-400 font-medium hover:underline text-sm"
          >
            查看完整文档 →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-left">
                  <th className="px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-16">
                    方法
                  </th>
                  <th className="px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                    端点
                  </th>
                  <th className="px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                    说明
                  </th>
                  <th className="px-5 py-3 font-medium text-zinc-500 dark:text-zinc-400 w-16">
                    认证
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {endpoints.map((ep) => (
                  <tr
                    key={ep.path}
                    className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-mono font-semibold ${
                          ep.method === "GET"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                            : ep.method === "POST"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                              : ep.method === "PUT"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                        }`}
                      >
                        {ep.method}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-zinc-700 dark:text-zinc-300">
                      {ep.path}
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-400">
                      {ep.desc}
                    </td>
                    <td className="px-5 py-3">
                      {ep.auth ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          🔒 JWT
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-12">
          系统架构
        </h2>
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 overflow-x-auto">
          <pre className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono text-center">
{`                    Flutter App / Web / 小程序
                         │
                  HTTPS REST API
                         │
                 Poetry Gateway  ← 本项目 (8080)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
Chinese Poetry API   AI Service      User Service
  (1279/Docker)     (DeepSeek)      (PostgreSQL)
        │
   诗词数据库(40万首)                  Redis Cache`}
          </pre>
        </div>
      </section>

    </div>
  );
}
