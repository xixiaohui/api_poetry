import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API 文档 — Poetry Gateway",
  description: "Poetry Gateway 完整 API 参考文档",
};

interface EndpointDoc {
  method: string;
  path: string;
  desc: string;
  auth?: boolean;
  params?: { name: string; type: string; desc: string }[];
  example: string;
  responseExample: string;
}

const sections: { title: string; endpoints: EndpointDoc[] }[] = [
  {
    title: "聚合接口",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/home",
        desc: "首页聚合数据：推荐诗词 + 推荐作者 + 统计数据",
        example: "curl /api/v1/home",
        responseExample: `{
  "success": true,
  "data": {
    "featuredPoem": { "id": 1, "title": "静夜思", "content": "床前明月光...", "author": "李白", "dynasty": "唐", "type": "五言绝句" },
    "featuredAuthor": { "id": 1, "name": "李白", "dynasty": "唐", "poemCount": 896 },
    "totalPoems": 385000,
    "totalAuthors": 14000
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/discover",
        desc: "发现页：近期诗词 + 朝代列表 + 体裁列表",
        example: "curl /api/v1/discover",
        responseExample: `{
  "success": true,
  "data": {
    "recentPoems": [ ... ],
    "dynasties": [ { "id": 1, "name": "唐" }, ... ],
    "types": [ { "id": 1, "name": "五言绝句" }, ... ]
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/categories",
        desc: "分类聚合：所有朝代 + 所有体裁",
        example: "curl /api/v1/categories",
        responseExample: `{
  "success": true,
  "data": {
    "dynasties": [ { "id": 1, "name": "唐" }, ... ],
    "types": [ { "id": 10, "name": "五言绝句" }, ... ]
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/recommend",
        desc: "为你推荐 — 随机翻页 + 多样化推荐理由",
        example: "curl /api/v1/recommend",
        responseExample: `{
  "success": true,
  "data": {
    "poems": [ ... ],
    "reason": "经典永流传"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/quote",
        desc: "每日一句 — 同一天返回相同诗句，带日期字段，适合 App 开屏",
        example: "curl /api/v1/quote",
        responseExample: `{
  "success": true,
  "data": {
    "content": "床前明月光，疑是地上霜",
    "author": "李白",
    "source": "静夜思",
    "date": "2026-07-23"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/solar-term",
        desc: "节气推荐 — 根据当前24节气推荐应景诗词，缓存6小时",
        example: "curl /api/v1/solar-term",
        responseExample: `{
  "success": true,
  "data": {
    "termName": "大暑",
    "termDescription": "炎热至极，一年中最热时期，荷花盛开",
    "poem": { "id": 42, "title": "...", "content": "...", "author": "...", "dynasty": "...", "type": "..." },
    "reason": "今日大暑，为你精选一首夏季诗词"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/config",
        desc: "客户端配置：版本号、功能开关、Banner 列表（含图片/标题/跳转链接）",
        example: "curl /api/v1/config",
        responseExample: `{
  "success": true,
  "data": {
    "version": "1.0.0",
    "banners": [
      { "id": "spring", "imageUrl": "https://...", "title": "春日诗词鉴赏", "link": "/browse?dynasty=唐", "sort": 1 }
    ],
    "features": { "aiAnalysis": true, "aiAsk": true, "solarTerm": true, "dailyQuote": true, ... }
  }
}`,
      },
    ],
  },
  {
    title: "诗词接口",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/poems",
        desc: "诗词列表，支持分页和筛选",
        params: [
          { name: "page", type: "number", desc: "页码，默认 1" },
          { name: "pageSize", type: "number", desc: "每页数量，默认 20，最大 100" },
          { name: "dynasty", type: "string", desc: "按朝代筛选" },
          { name: "type", type: "string", desc: "按体裁筛选" },
          { name: "author", type: "string", desc: "按作者筛选" },
        ],
        example: "curl \"/api/v1/poems?page=1&pageSize=10&dynasty=唐&type=五言绝句\"",
        responseExample: `{
  "success": true,
  "data": {
    "poems": [ { "id": 1, "title": "...", "content": "...", "author": "...", "dynasty": "...", "type": "..." } ],
    "total": 18895,
    "page": 1,
    "pageSize": 10
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/poems/:id",
        desc: "诗词详情",
        example: "curl /api/v1/poems/1",
        responseExample: `{
  "success": true,
  "data": {
    "id": 1, "title": "静夜思", "content": "床前明月光，疑是地上霜。举头望明月，低头思故乡。",
    "author": "李白", "dynasty": "唐", "type": "五言绝句"
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/poems/random",
        desc: "随机获取一首诗词",
        params: [
          { name: "author", type: "string", desc: "按作者筛选" },
          { name: "type", type: "string", desc: "按体裁筛选" },
          { name: "dynasty", type: "string", desc: "按朝代筛选" },
          { name: "char", type: "string", desc: "包含指定字（飞花令场景）" },
        ],
        example: "curl \"/api/v1/poems/random?author=李白&type=五言绝句\"",
        responseExample: `{ "success": true, "data": { "id": 42, "title": "...", "content": "...", "author": "李白", ... } }`,
      },
    ],
  },
  {
    title: "作者接口",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/authors",
        desc: "作者列表",
        params: [
          { name: "page", type: "number", desc: "页码，默认 1" },
          { name: "pageSize", type: "number", desc: "每页数量，默认 20" },
        ],
        example: "curl \"/api/v1/authors?page=1&pageSize=20\"",
        responseExample: `{
  "success": true,
  "data": {
    "authors": [ { "id": 1, "name": "李白", "dynasty": "唐", "description": "...", "poemCount": 896 } ],
    "total": 14000, "page": 1, "pageSize": 20
  }
}`,
      },
      {
        method: "GET",
        path: "/api/v1/authors/:id",
        desc: "作者详情",
        example: "curl /api/v1/authors/1",
        responseExample: `{ "success": true, "data": { "id": 1, "name": "李白", "dynasty": "唐", "description": "字太白...", "poemCount": 896 } }`,
      },
    ],
  },
  {
    title: "搜索接口",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/search",
        desc: "全文搜索诗词",
        params: [
          { name: "q", type: "string", desc: "搜索关键词（必填）" },
          { name: "type", type: "enum", desc: "搜索类型：all / title / content / author，默认 all" },
          { name: "page", type: "number", desc: "页码，默认 1" },
          { name: "pageSize", type: "number", desc: "每页数量，默认 20" },
        ],
        example: "curl \"/api/v1/search?q=静夜思&type=title\"",
        responseExample: `{
  "success": true,
  "data": {
    "poems": [ ... ],
    "total": 1, "page": 1, "pageSize": 20,
    "query": "静夜思"
  }
}`,
      },
    ],
  },
  {
    title: "AI 接口 🔒",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/ai/analyse",
        desc: "AI 诗词赏析 — 返回创作背景、赏析、关键词、情感分析",
        auth: true,
        params: [
          { name: "title", type: "string", desc: "诗词标题（必填）" },
          { name: "content", type: "string", desc: "诗词正文（必填）" },
          { name: "author", type: "string", desc: "作者" },
          { name: "dynasty", type: "string", desc: "朝代" },
        ],
        example: `curl -X POST /api/v1/ai/analyse \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"静夜思","content":"床前明月光...","author":"李白","dynasty":"唐"}'`,
        responseExample: `{
  "success": true,
  "data": {
    "background": "李白在扬州旅舍所作...",
    "appreciation": "此诗以明白如话的语言...",
    "keywords": ["思乡", "明月", "孤独"],
    "emotions": ["思乡之情", "孤寂之感"]
  }
}`,
      },
      {
        method: "POST",
        path: "/api/v1/ai/ask",
        desc: "AI 诗词问答 — 自由提问古诗词相关问题",
        auth: true,
        params: [
          { name: "question", type: "string", desc: "问题（必填）" },
          { name: "context", type: "string", desc: "参考诗词内容（可选）" },
        ],
        example: `curl -X POST /api/v1/ai/ask \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"question":"李白和杜甫的风格有什么不同？"}'`,
        responseExample: `{ "success": true, "data": { "answer": "李白与杜甫是唐代诗坛的双子星座..." } }`,
      },
      {
        method: "POST",
        path: "/api/v1/ai/translate",
        desc: "AI 诗词翻译 — 支持英/日/韩三种语言",
        auth: true,
        params: [
          { name: "content", type: "string", desc: "诗词内容（必填）" },
          { name: "targetLang", type: "enum", desc: "目标语言：en / ja / ko，默认 en" },
        ],
        example: `curl -X POST /api/v1/ai/translate \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"content":"床前明月光","targetLang":"en"}'`,
        responseExample: `{
  "success": true,
  "data": {
    "translation": "Moonlight before my bed...",
    "notes": ["床：指井栏或坐具，非现代意义的床"]
  }
}`,
      },
    ],
  },
  {
    title: "用户接口",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/user/register",
        desc: "用户注册",
        params: [
          { name: "email", type: "string", desc: "邮箱（必填）" },
          { name: "password", type: "string", desc: "密码，最少 6 位（必填）" },
          { name: "name", type: "string", desc: "昵称（可选）" },
        ],
        example: `curl -X POST /api/v1/user/register \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"123456","name":"诗词爱好者"}'`,
        responseExample: `{ "success": true, "data": { "token": "eyJ...", "user": { "id": "...", "email": "user@example.com", "name": "诗词爱好者" } } }`,
      },
      {
        method: "POST",
        path: "/api/v1/user/login",
        desc: "用户登录，返回 JWT Token",
        params: [
          { name: "email", type: "string", desc: "邮箱（必填）" },
          { name: "password", type: "string", desc: "密码（必填）" },
        ],
        example: `curl -X POST /api/v1/user/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"user@example.com","password":"123456"}'`,
        responseExample: `{ "success": true, "data": { "token": "eyJhbGciOiJIUzI1NiIs...", "user": { "id": "...", "email": "user@example.com", "name": "诗词爱好者", "avatar": null, "createdAt": "2026-07-22T..." } } }`,
      },
      {
        method: "GET",
        path: "/api/v1/user/profile",
        desc: "获取当前用户信息",
        auth: true,
        example: `curl /api/v1/user/profile \\
  -H "Authorization: Bearer <token>"`,
        responseExample: `{ "success": true, "data": { "id": "...", "email": "user@example.com", "name": "诗词爱好者", "avatar": null, "createdAt": "..." } }`,
      },
      {
        method: "PUT",
        path: "/api/v1/user/profile",
        desc: "更新用户信息",
        auth: true,
        params: [
          { name: "name", type: "string", desc: "新昵称" },
          { name: "avatar", type: "string", desc: "头像 URL" },
        ],
        example: `curl -X PUT /api/v1/user/profile \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"新昵称"}'`,
        responseExample: `{ "success": true, "data": { "id": "...", "email": "user@example.com", "name": "新昵称", ... } }`,
      },
    ],
  },
  {
    title: "收藏接口 🔒",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/favorites",
        desc: "获取收藏列表",
        auth: true,
        example: `curl /api/v1/favorites -H "Authorization: Bearer <token>"`,
        responseExample: `{ "success": true, "data": { "favorites": [ { "id": "...", "poemId": "1", "poemTitle": "静夜思", "poemAuthor": "李白", "poemDynasty": "唐", "createdAt": "..." } ], "total": 1 } }`,
      },
      {
        method: "POST",
        path: "/api/v1/favorites",
        desc: "添加收藏",
        auth: true,
        params: [
          { name: "poemId", type: "string", desc: "诗词 ID（必填）" },
          { name: "poemTitle", type: "string", desc: "诗词标题（必填）" },
          { name: "poemAuthor", type: "string", desc: "作者" },
          { name: "poemDynasty", type: "string", desc: "朝代" },
        ],
        example: `curl -X POST /api/v1/favorites \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"poemId":"1","poemTitle":"静夜思","poemAuthor":"李白","poemDynasty":"唐"}'`,
        responseExample: `{ "success": true, "data": { "id": "...", "poemId": "1", "poemTitle": "静夜思", "poemAuthor": "李白", ... } }`,
      },
      {
        method: "DELETE",
        path: "/api/v1/favorites/:id",
        desc: "取消收藏（:id 为 poemId）",
        auth: true,
        example: `curl -X DELETE /api/v1/favorites/1 -H "Authorization: Bearer <token>"`,
        responseExample: `{ "success": true, "data": null }`,
      },
      {
        method: "GET",
        path: "/api/v1/favorites/sync",
        desc: "收藏同步 — 返回全部收藏 + syncToken（updatedAt 时间戳），用于多端同步",
        auth: true,
        example: `curl /api/v1/favorites/sync -H "Authorization: Bearer <token>"`,
        responseExample: `{
  "success": true,
  "data": {
    "favorites": [ { "id": "...", "poemId": "1", "poemTitle": "静夜思", "createdAt": "...", "updatedAt": "..." } ],
    "syncToken": "2026-07-23T10:30:00.000Z",
    "total": 5
  }
}`,
      },
    ],
  },
  {
    title: "阅读历史接口 🔒",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/history",
        desc: "获取阅读历史（按时间倒序，最近 50 条）",
        auth: true,
        example: `curl /api/v1/history -H "Authorization: Bearer <token>"`,
        responseExample: `{ "success": true, "data": { "records": [ { "id": "...", "poemId": "1", "poemTitle": "静夜思", "poemAuthor": "李白", "poemDynasty": "唐", "readAt": "2026-07-22T..." } ], "total": 1 } }`,
      },
      {
        method: "POST",
        path: "/api/v1/history",
        desc: "记录阅读（每次阅读创建新记录）",
        auth: true,
        params: [
          { name: "poemId", type: "string", desc: "诗词 ID（必填）" },
          { name: "poemTitle", type: "string", desc: "诗词标题（必填）" },
          { name: "poemAuthor", type: "string", desc: "作者" },
          { name: "poemDynasty", type: "string", desc: "朝代" },
        ],
        example: `curl -X POST /api/v1/history \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"poemId":"1","poemTitle":"静夜思","poemAuthor":"李白"}'`,
        responseExample: `{ "success": true, "data": { "id": "...", "poemId": "1", "poemTitle": "静夜思", "readAt": "..." } }`,
      },
    ],
  },
  {
    title: "阅读统计接口",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/stats/reading",
        desc: "阅读统计 — 全局热门诗词/作者排行 + 近7日每日阅读量（无需认证，可做首页数据看板）",
        example: "curl /api/v1/stats/reading",
        responseExample: `{
  "success": true,
  "data": {
    "totalReads": 12580,
    "totalPoems": 3200,
    "topPoems": [
      { "poemId": "1", "poemTitle": "静夜思", "count": 523 }
    ],
    "topAuthors": [
      { "author": "李白", "count": 1890 }
    ],
    "readsByDay": [
      { "date": "2026-07-17", "count": 120 },
      { "date": "2026-07-18", "count": 145 }
    ]
  }
}`,
      },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function DocsPage() {
  return (
    <div className="">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mt-2">
              API 参考文档
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Poetry Gateway · 统一响应格式 · RESTful API
            </p>
          </div>
        </div>
      </header>

      {/* Quick Nav */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">
            快速导航
          </p>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <a
                key={s.title}
                href={`#${s.title}`}
                className="text-sm px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Response Format */}
      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-6">
          <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">
            统一响应格式
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                成功 200
              </p>
              <pre className="text-xs bg-amber-100 dark:bg-amber-950/50 rounded-lg p-3 overflow-x-auto">
{`{
  "success": true,
  "data": { ... }
}`}
              </pre>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                失败
              </p>
              <pre className="text-xs bg-amber-100 dark:bg-amber-950/50 rounded-lg p-3 overflow-x-auto">
{`{
  "success": false,
  "code": "NOT_FOUND",
  "message": "资源不存在"
}`}
              </pre>
            </div>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-3">
            错误码：VALIDATION_ERROR (400) · UNAUTHORIZED (401) · NOT_FOUND (404) ·
            RATE_LIMITED (429) · INTERNAL_ERROR (500) · UPSTREAM_ERROR (502)
          </p>
        </div>
      </section>

      {/* Endpoint Groups */}
      {sections.map((section) => (
        <section
          key={section.title}
          id={section.title}
          className="max-w-5xl mx-auto px-6 py-10 border-t border-zinc-100 dark:border-zinc-900"
        >
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            {section.title}
          </h2>
          <div className="space-y-6">
            {section.endpoints.map((ep) => (
              <div
                key={`${ep.method}:${ep.path}`}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                {/* Endpoint Header */}
                <div className="bg-zinc-50 dark:bg-zinc-900 px-5 py-4 flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-mono font-semibold ${methodColors[ep.method] ?? ""}`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-zinc-800 dark:text-zinc-200">
                    {ep.path}
                  </code>
                  {ep.auth && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-md font-medium">
                      🔒 需认证
                    </span>
                  )}
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {ep.desc}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Parameters */}
                  {ep.params && ep.params.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                        参数
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left border-b border-zinc-100 dark:border-zinc-800">
                              <th className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400">
                                名称
                              </th>
                              <th className="py-2 pr-4 font-medium text-zinc-500 dark:text-zinc-400">
                                类型
                              </th>
                              <th className="py-2 font-medium text-zinc-500 dark:text-zinc-400">
                                说明
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {ep.params.map((p) => (
                              <tr
                                key={p.name}
                                className="border-b border-zinc-50 dark:border-zinc-900/50"
                              >
                                <td className="py-2 pr-4 font-mono text-zinc-800 dark:text-zinc-200">
                                  {p.name}
                                </td>
                                <td className="py-2 pr-4">
                                  <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                                    {p.type}
                                  </code>
                                </td>
                                <td className="py-2 text-zinc-600 dark:text-zinc-400">
                                  {p.desc}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Request Example */}
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      请求示例
                    </p>
                    <pre className="text-xs bg-zinc-950 dark:bg-zinc-900 text-zinc-100 rounded-lg p-4 overflow-x-auto">
                      {ep.example}
                    </pre>
                  </div>

                  {/* Response Example */}
                  <div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      响应示例
                    </p>
                    <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-lg p-4 overflow-x-auto">
                      {ep.responseExample}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
