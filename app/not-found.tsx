import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <p className="text-8xl mb-6">📜</p>
      <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">
        页面未找到
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
        你访问的页面不存在，也许它藏在一首古诗里。
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-amber-600 px-5 py-2.5 text-white font-medium hover:bg-amber-700 transition-colors"
        >
          返回首页
        </Link>
        <Link
          href="/docs"
          className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-5 py-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          API 文档
        </Link>
      </div>
    </div>
  );
}
