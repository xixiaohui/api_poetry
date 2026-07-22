import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Footer } from "@/components/footer";
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

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/docs", label: "文档" },
  { href: "/playground", label: "Playground" },
  { href: "/browse", label: "浏览" },
  { href: "/random", label: "随机" },
  { href: "/today", label: "今日" },
  { href: "/search", label: "搜索" },
  { href: "/status", label: "状态" },
  { href: "/getting-started", label: "接入" },
];

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
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link
              href="/"
              className="font-semibold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
            >
              Poetry Gateway
            </Link>
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors px-1 sm:px-2 py-1 shrink-0"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
