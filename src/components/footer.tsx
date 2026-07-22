import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Pages */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
              页面
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "首页" },
                { href: "/docs", label: "API 文档" },
                { href: "/browse", label: "诗词浏览" },
                { href: "/random", label: "随机漫步" },
                { href: "/today", label: "今日诗词" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
              工具
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/playground", label: "API Playground" },
                { href: "/status", label: "服务状态" },
                { href: "/getting-started", label: "快速开始" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* API Groups */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
              API 接口
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/docs#聚合接口", label: "聚合接口" },
                { href: "/docs#诗词接口", label: "诗词接口" },
                { href: "/docs#作者接口", label: "作者接口" },
                { href: "/docs#搜索接口", label: "搜索接口" },
                { href: "/docs#AI 接口 🔒", label: "AI 接口" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
              资源
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/docs#用户接口", label: "用户接口" },
                { href: "/docs#收藏接口 🔒", label: "收藏接口" },
                { href: "/docs#阅读历史接口 🔒", label: "历史接口" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/chinese-poetry/chinese-poetry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  数据源 ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Poetry Gateway · Built with Next.js 16 · API v1 ·{" "}
          <a
            href="https://github.com/chinese-poetry/chinese-poetry"
            className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            chinese-poetry
          </a>
        </div>
      </div>
    </footer>
  );
}
