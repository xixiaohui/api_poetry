import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "快速开始",
  description: "Poetry Gateway 开发者接入指南",
};

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="text-amber-600 dark:text-amber-400 hover:underline text-sm">
            ← 返回首页
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
            快速开始
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            开发者接入指南 — 5 分钟接入 Poetry Gateway
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-16">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            概述
          </h2>
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Poetry Gateway 是中国古诗词数据的统一 API 网关。所有客户端
              （Flutter、Web、小程序）统一通过 Gateway 获取诗词数据，不直接访问
              底层 Chinese Poetry API。
            </p>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 mt-4">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Base URL
              </p>
              <code className="text-sm bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-md text-amber-700 dark:text-amber-400 font-mono">
                https://your-domain.com/api/v1
              </code>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Flutter 接入
          </h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-900 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                使用 Dio 调用 Gateway
              </span>
            </div>
            <pre className="p-5 text-sm overflow-x-auto bg-zinc-950 text-zinc-100">
{`// poetry_repository.dart
import 'package:dio/dio.dart';

class PoetryRepository {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://your-domain.com/api/v1',
    connectTimeout: Duration(seconds: 10),
  ));

  // 首页数据
  Future<Map<String, dynamic>> getHome() async {
    final res = await _dio.get('/home');
    return res.data['data'];
  }

  // 诗词列表
  Future<Map<String, dynamic>> getPoems({
    int page = 1, String? dynasty, String? type,
  }) async {
    final res = await _dio.get('/poems', queryParameters: {
      'page': page, 'dynasty': dynasty, 'type': type,
    });
    return res.data['data'];
  }

  // 搜索
  Future<Map<String, dynamic>> search(String query) async {
    final res = await _dio.get('/search', queryParameters: {'q': query});
    return res.data['data'];
  }
}`}
            </pre>
          </div>
        </section>

        {/* Web Access */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            Web / JavaScript 接入
          </h2>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="bg-zinc-50 dark:bg-zinc-900 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Fetch API
              </span>
            </div>
            <pre className="p-5 text-sm overflow-x-auto bg-zinc-950 text-zinc-100">
{`const API = 'https://your-domain.com/api/v1';

// 首页数据
const home = await fetch(API + '/home').then(r => r.json());
// { success: true, data: { featuredPoem, featuredAuthor, ... } }

// 分页诗词
const poems = await fetch(
  API + '/poems?page=1&pageSize=20&dynasty=唐'
).then(r => r.json());

// 随机诗词（飞花令）
const random = await fetch(
  API + '/poems/random?char=春&author=李白'
).then(r => r.json());

// 搜索
const results = await fetch(
  API + '/search?q=静夜思&type=title'
).then(r => r.json());`}
            </pre>
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            认证
          </h2>
          <div className="space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Poetry Gateway 使用 JWT Bearer Token 进行认证。以下端点需要认证：
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "/ai/*", "/user/profile", "/favorites/*", "/history/*",
              ].map((p) => (
                <code
                  key={p}
                  className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md font-mono"
                >
                  {p}
                </code>
              ))}
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-4">
              <div className="bg-zinc-50 dark:bg-zinc-900 px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  认证流程
                </span>
              </div>
              <pre className="p-5 text-sm overflow-x-auto bg-zinc-950 text-zinc-100">
{`// 1. 注册或登录获取 Token
const login = await fetch(API + '/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: '123456' }),
}).then(r => r.json());

const token = login.data.token; // JWT Token

// 2. 后续请求携带 Token
const favs = await fetch(API + '/favorites', {
  headers: { 'Authorization': \`Bearer \${token}\` },
}).then(r => r.json());

// 3. Token 有效期 7 天，过期后重新登录`}
              </pre>
            </div>
          </div>
        </section>

        {/* Unified Response */}
        <section>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            统一响应格式
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-5">
              <p className="font-semibold text-green-800 dark:text-green-300 mb-2">
                成功 (200)
              </p>
              <pre className="text-xs text-green-700 dark:text-green-400 overflow-x-auto">
{`{
  "success": true,
  "data": { ... }
}`}
              </pre>
            </div>
            <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-5">
              <p className="font-semibold text-red-800 dark:text-red-300 mb-2">
                失败
              </p>
              <pre className="text-xs text-red-700 dark:text-red-400 overflow-x-auto">
{`{
  "success": false,
  "code": "NOT_FOUND",
  "message": "资源不存在"
}`}
              </pre>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">
                    HTTP 状态码
                  </th>
                  <th className="py-2 pr-4 text-zinc-500 dark:text-zinc-400 font-medium">
                    Code
                  </th>
                  <th className="py-2 text-zinc-500 dark:text-zinc-400 font-medium">
                    说明
                  </th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr><td className="py-2 pr-4 font-mono">400</td><td className="py-2 pr-4 font-mono">VALIDATION_ERROR</td><td className="py-2">参数校验失败</td></tr>
                <tr><td className="py-2 pr-4 font-mono">401</td><td className="py-2 pr-4 font-mono">UNAUTHORIZED</td><td className="py-2">未登录或 Token 过期</td></tr>
                <tr><td className="py-2 pr-4 font-mono">404</td><td className="py-2 pr-4 font-mono">NOT_FOUND</td><td className="py-2">资源不存在</td></tr>
                <tr><td className="py-2 pr-4 font-mono">429</td><td className="py-2 pr-4 font-mono">RATE_LIMITED</td><td className="py-2">请求过于频繁</td></tr>
                <tr><td className="py-2 pr-4 font-mono">500</td><td className="py-2 pr-4 font-mono">INTERNAL_ERROR</td><td className="py-2">服务器内部错误</td></tr>
                <tr><td className="py-2 pr-4 font-mono">502</td><td className="py-2 pr-4 font-mono">UPSTREAM_ERROR</td><td className="py-2">上游服务不可用</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Navigation */}
        <section className="border-t border-zinc-200 dark:border-zinc-800 pt-10">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
            >
              📖 完整 API 文档 →
            </Link>
            <Link
              href="/playground"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
            >
              🛠 API Playground →
            </Link>
            <Link
              href="/status"
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400 hover:border-amber-400 hover:text-amber-600 transition-colors"
            >
              📊 服务状态 →
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
