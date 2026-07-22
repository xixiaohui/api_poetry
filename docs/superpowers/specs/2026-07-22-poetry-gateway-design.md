# Poetry Gateway 设计文档

**日期**: 2026-07-22
**版本**: 1.0.0
**状态**: 已确认

---

## 一、项目概述

Poetry Gateway 是整个 Poetry 系统的唯一后端入口（BFF - Backend For Frontend）。所有客户端（Flutter、Web、未来小程序）只能通过 Gateway 访问后端服务。

### 核心原则

- 禁止客户端直接访问 Chinese Poetry API、OpenAI、DeepSeek、PostgreSQL、Redis
- 所有请求必须经过 Gateway
- 所有业务逻辑放在 Gateway
- Flutter 只负责展示

---

## 二、技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 框架 | Next.js 16 (App Router) | Route Handlers 作为 API 端点 |
| 语言 | TypeScript Strict Mode | 禁止 `any` |
| 包管理 | pnpm | |
| ORM | Prisma | Repository 模式访问 PostgreSQL |
| 缓存 | Redis (ioredis) | 热点数据缓存 |
| 验证 | Zod | 请求参数 & 响应 Schema |
| 日志 | Pino | 结构化日志，记录每个请求 |
| 认证 | JWT (jose) | 无状态鉴权 |
| AI | DeepSeek | openai-compatible SDK，统一 AIService |
| 部署 | PM2 + Nginx + Docker | Ubuntu 24.04 LTS, Node.js 22 LTS |

### 禁止使用

- JavaScript（仅 TypeScript）
- `any` 类型
- class-validator
- Sequelize

---

## 三、目录结构

```
api_poetry/
├── app/
│   └── api/v1/              # Route Handlers（极简，只委托 Service）
│       ├── home/route.ts
│       ├── discover/route.ts
│       ├── poems/
│       │   ├── route.ts              # GET 列表
│       │   ├── random/route.ts       # GET /poems/random (静态路由优先于 [id])
│       │   └── [id]/route.ts
│       ├── authors/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── categories/route.ts
│       ├── search/route.ts
│       ├── recommend/route.ts
│       ├── quote/route.ts
│       ├── config/route.ts
│       ├── ai/
│       │   ├── analyse/route.ts
│       │   ├── ask/route.ts
│       │   └── translate/route.ts
│       ├── user/
│       │   ├── login/route.ts
│       │   └── profile/route.ts
│       ├── favorites/
│       │   ├── route.ts          # GET + POST
│       │   └── [id]/route.ts     # DELETE
│       └── history/route.ts      # GET + POST
│
├── src/
│   ├── modules/              # 业务模块
│   │   ├── poem/             # controller, service, repository, schema, types, mapper, index
│   │   ├── author/
│   │   ├── ai/
│   │   ├── user/
│   │   ├── favorite/
│   │   ├── history/
│   │   └── search/
│   ├── shared/               # 共享基础设施
│   │   ├── auth/             # JWT 签发 & 验证
│   │   ├── cache/            # Redis 缓存封装
│   │   ├── database/         # Prisma Client 单例
│   │   ├── logger/           # Pino 日志
│   │   ├── errors/           # AppError 错误体系
│   │   ├── middleware/       # 日志中间件、限流、Auth Guard
│   │   ├── config/           # 环境变量 & 配置
│   │   └── utils/            # 通用工具
│   ├── clients/              # 第三方 API 封装
│   │   ├── chinese-poetry.client.ts
│   │   └── deepseek.client.ts
│   └── lib/                  # 响应构建器、DTO 工具
│
├── prisma/
│   └── schema.prisma
├── docker-compose.yml
├── .env
├── .env.example
├── next.config.ts
├── tsconfig.json
└── package.json
```

### 禁止

- 把所有代码放进 `app/api`
- Route Handler 中写业务逻辑

---

## 四、模块内部结构（六件套）

每个业务模块遵循统一结构，以 `poem` 为例：

```
modules/poem/
├── types.ts        # TypeScript 类型定义
├── schema.ts       # Zod 请求验证 & 响应 Schema
├── mapper.ts       # Chinese Poetry API 数据 → Gateway DTO 转换
├── repository.ts   # 数据库 CRUD（如收藏计数查询）
├── client.ts       # ChinesePoetryClient 调用封装
├── service.ts      # 核心业务逻辑（缓存→客户端→聚合）
├── controller.ts   # 纯 HTTP 处理（解析参数→调 service→构建响应）
└── index.ts        # 统一导出
```

### 分层职责

| 层 | 允许 | 禁止 |
|---|---|---|
| Route Handler | 解析 query/params → 调 Controller → NextResponse.json | 数据库、AI、Redis、拼 JSON、业务逻辑 |
| Controller | 验证参数 → 调 Service → 返回 DTO | 数据库、第三方 API、业务逻辑 |
| Service | 缓存、数据库、第三方 API、AI、聚合、返回 DTO | 直接操作 HTTP 请求/响应 |
| Repository | CRUD | 业务逻辑、调用第三方 API |
| Client | 封装第三方 API 调用 | 数据库操作、业务逻辑 |

### 调用链路

```
Route Handler
  → Controller (参数验证)
    → Service (业务编排)
      → Cache (Redis, 先查)
        → Client (Chinese Poetry API, cache miss 时)
        → Repository (PostgreSQL, 收藏/用户/历史)
      → Mapper (数据转换, 上游 JSON → Gateway DTO)
      → Cache (写回, 带 TTL)
```

### AI 调用链路

```
AIService
  → PromptBuilder (构建诗词分析的 Prompt)
  → DeepSeekClient (调用 DeepSeek API)
  → Formatter (解析 AI 原始回复 → 结构化 DTO)
  → Cache (Redis, TTL=86400)
```

---

## 五、数据库 Schema

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id             String            @id @default(uuid())
  email          String            @unique
  passwordHash   String
  name           String?
  avatar         String?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  favorites      Favorite[]
  readingHistory ReadingHistory[]
}

model Favorite {
  id          String   @id @default(uuid())
  userId      String
  poemId      String
  poemTitle   String   // 冗余存储，避免每次查询收藏列表都回源诗词 API
  poemAuthor  String?
  poemDynasty String?
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, poemId])
  @@index([userId])
}

model ReadingHistory {
  id          String   @id @default(uuid())
  userId      String
  poemId      String
  poemTitle   String
  poemAuthor  String?
  poemDynasty String?
  readAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, readAt])
}
```

### 设计要点

- 诗词基础数据由 Chinese Poetry API 管理，Gateway 只存用户相关数据
- `Favorite`/`ReadingHistory` 冗余存储 `poemTitle`/`poemAuthor`/`poemDynasty`，避免展示列表时每次都回源查询
- `@@unique([userId, poemId])` 防止重复收藏
- `ReadingHistory` 按 `[userId, readAt]` 复合索引，支持时间线查询

---

## 六、API 端点设计

### 代理/聚合端点

| Gateway 端点 | 方法 | 数据来源 | 缓存 TTL |
|---|---|---|---|
| `/api/v1/home` | GET | `poems/random` + `authors` + `stats` 聚合 | 300s |
| `/api/v1/discover` | GET | `poems` + `types` + `dynasties` 聚合 | 300s |
| `/api/v1/search?q=&type=&page=&page_size=` | GET | `poems/search` | 60s |
| `/api/v1/poems?page=&page_size=&dynasty=&type=&author=` | GET | `poems` 透传 | 120s |
| `/api/v1/poems/:id` | GET | `poems/:id` (GraphQL) | 600s |
| `/api/v1/poems/random?author=&type=&dynasty=&char=` | GET | `poems/random` 透传 | 不缓存 |
| `/api/v1/authors?page=&page_size=` | GET | `authors` 透传 | 600s |
| `/api/v1/authors/:id` | GET | `authors/:id` 透传 | 600s |
| `/api/v1/categories` | GET | `types` + `dynasties` 聚合 | 3600s |
| `/api/v1/recommend` | GET | Service 层推荐（节气/时间/热度算法） | 300s |
| `/api/v1/quote` | GET | `poems/random?char=` + 简单文案 | 不缓存 |
| `/api/v1/config` | GET | 静态配置 (Banner/TTL/版本号) | 3600s |

### AI 端点（需认证）

| Gateway 端点 | 方法 | 数据来源 | 缓存 TTL |
|---|---|---|---|
| `/api/v1/ai/analyse` | POST | DeepSeek | 86400s |
| `/api/v1/ai/ask` | POST | DeepSeek | 不缓存 |
| `/api/v1/ai/translate` | POST | DeepSeek | 86400s |

### 用户端点

| Gateway 端点 | 方法 | 说明 |
|---|---|---|
| `/api/v1/user/login` | POST | 邮箱+密码 → JWT |
| `/api/v1/user/register` | POST | 注册 |
| `/api/v1/user/profile` | GET | 获取用户信息（需认证） |
| `/api/v1/user/profile` | PUT | 更新用户信息（需认证） |

### 收藏端点（需认证）

| Gateway 端点 | 方法 | 说明 |
|---|---|---|
| `/api/v1/favorites` | GET | 用户收藏列表 |
| `/api/v1/favorites` | POST | 添加收藏 |
| `/api/v1/favorites/:id` | DELETE | 取消收藏 |

### 阅读历史端点（需认证）

| Gateway 端点 | 方法 | 说明 |
|---|---|---|
| `/api/v1/history` | GET | 阅读历史列表 |
| `/api/v1/history` | POST | 记录阅读 |

---

## 七、统一响应格式

### 成功

```json
{
  "success": true,
  "data": {}
}
```

### 失败

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "诗词不存在"
}
```

### 错误码体系

| HTTP 状态码 | Code | 说明 |
|---|---|---|
| 400 | `VALIDATION_ERROR` | 参数校验失败 |
| 401 | `UNAUTHORIZED` | 未登录或 Token 过期 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 429 | `RATE_LIMITED` | 请求过于频繁 |
| 500 | `INTERNAL_ERROR` | 服务器内部错误 |
| 502 | `UPSTREAM_ERROR` | Chinese Poetry API 不可用 |

### 错误类体系

```typescript
class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string
  ) { super(message) }
}
class NotFoundError extends AppError { /* 404 */ }
class UnauthorizedError extends AppError { /* 401 */ }
class ValidationError extends AppError { /* 400 */ }
class RateLimitError extends AppError { /* 429 */ }
class UpstreamError extends AppError { /* 502 */ }
```

---

## 八、中间件栈

每个请求经过：

```
Request
  → Logger 中间件 (Pino: method, path, userId?, duration, statusCode)
  → Rate Limiter (基于 IP, 60 req/min, Redis 存储计数)
  → Auth Guard (JWT verify, 仅应用于 /user/*, /favorites/*, /history/*, /ai/*)
  → Route Handler
  → Error Handler (最外层 catch, AppError → 统一错误响应)
```

---

## 九、缓存策略

| 数据 | TTL | 策略 |
|---|---|---|
| 首页聚合 | 300s (5分钟) | Cache-Aside |
| 诗词详情 | 600s (10分钟) | Cache-Aside |
| 作者信息 | 600s (10分钟) | Cache-Aside |
| 分类列表 | 3600s (1小时) | Cache-Aside |
| AI 赏析 | 86400s (24小时) | Cache-Aside (key=hash(content)) |
| 每日推荐 | 300s (5分钟) | Cache-Aside |
| 搜索 | 60s (1分钟) | Cache-Aside |
| 随机诗词 | 不缓存 | 每次实时获取 |
| 配置 | 3600s (1小时) | Cache-Aside |

### Cache Key 规范

```
poetry:poem:<id>
poetry:author:<id>
poetry:home
poetry:discover
poetry:categories
poetry:search:<query_hash>
poetry:ai:analyse:<content_hash>
poetry:ai:translate:<content_hash>
poetry:recommend
poetry:config
```

---

## 十、部署架构

```
Nginx (80/443)
  └─ proxy_pass → localhost:8080
      └─ PM2 cluster → Next.js server

Docker Compose (开发环境，仅本地服务):
├── poetry-gateway        (localhost:8080)
└── chinese-poetry-api    (localhost:1279，可选 — 也可连接远程 :1279)

PostgreSQL 和 Redis 连接远程服务器，不在 docker-compose 中启动。
```

### 环境变量 (`.env`)

```bash
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=placeholder-jwt-secret
DEEPSEEK_API_KEY=sk-placeholder
DEEPSEEK_BASE_URL=https://api.deepseek.com
CHINESE_POETRY_API_URL=http://208.167.233.53:1279/api/v1
```

---

## 十一、开发流程

1. TypeScript Strict Mode，禁止 `any`
2. 文件 kebab-case，变量 camelCase，类型 PascalCase
3. 函数不超过 50 行，文件不超过 300 行
4. 每完成一个独立功能 → git commit (feat:/fix:/refactor: 等)
5. 每次提交保证：TypeScript 无错误、Build 成功、不破坏已有功能
6. 小步提交，禁止一次性重构整个项目
