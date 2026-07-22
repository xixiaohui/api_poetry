import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Poetry Gateway — 中国古诗词 API 网关",
    template: "%s — Poetry Gateway",
  },
  description:
    "中国古诗词统一 API 网关服务，聚合近 40 万首唐诗宋词元曲，提供 AI 智能赏析、翻译和问答。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-semibold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Poetry Gateway
            </Link>
            <div className="flex items-center gap-5">
              <Link
                href="/"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                首页
              </Link>
              <Link
                href="/docs"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                文档
              </Link>
              <Link
                href="/playground"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Playground
              </Link>
              <Link
                href="/getting-started"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                接入
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
