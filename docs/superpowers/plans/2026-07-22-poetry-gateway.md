# Poetry Gateway 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建 Poetry Gateway BFF 后端服务，聚合 Chinese Poetry API，提供 AI 赏析、用户认证、收藏、阅读历史等完整 API。

**Architecture:** Next.js 16 App Router Route Handlers → Controller → Service → (Cache → Client → Chinese Poetry API / DeepSeek | Repository → PostgreSQL)。每个模块遵循六件套结构（types/schema/mapper/repository/client/service/controller）。

**Tech Stack:** Next.js 16, TypeScript Strict, pnpm, Prisma + PostgreSQL, Redis (ioredis), Zod, Pino, JWT (jose), DeepSeek (openai SDK)

## Global Constraints

- TypeScript Strict Mode，禁止 `any`
- 文件命名 kebab-case，变量 camelCase，类型 PascalCase，常量 UPPER_SNAKE_CASE
- 函数 < 50 行，文件 < 300 行
- Route Handler 禁止写业务逻辑、数据库、AI、Redis
- 禁止 JavaScript，仅 TypeScript
- 统一响应格式: `{ success: true, data: {} }` / `{ success: false, code: "", message: "" }`
- 使用 pnpm 作为包管理器
- 环境变量: DATABASE_URL, REDIS_URL, JWT_SECRET, DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, CHINESE_POETRY_API_URL

---

### Task 1: 项目初始化 — Next.js 16 + TypeScript + pnpm

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `src/lib/response.ts`

**Interfaces:**
- Produces: `successResponse(data)`, `errorResponse(code, message, statusCode)` — 统一 JSON 响应构建器

- [ ] **Step 1: Initialize Next.js 16 project**

```bash
cd e:/workspace/claw/api_poetry
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```

Expected: Project scaffolded with Next.js 16, TypeScript, App Router, pnpm

- [ ] **Step 2: Install all dependencies**

```bash
cd e:/workspace/claw/api_poetry
pnpm add prisma @prisma/client ioredis zod pino jose
pnpm add -D @types/node
```

- [ ] **Step 3: Configure tsconfig.json strict mode**

Read the generated `tsconfig.json`, ensure `compilerOptions` includes:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 4: Create `.env.example`**

```bash
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=placeholder-jwt-secret
DEEPSEEK_API_KEY=sk-placeholder
DEEPSEEK_BASE_URL=https://api.deepseek.com
CHINESE_POETRY_API_URL=http://208.167.233.53:1279/api/v1
```

- [ ] **Step 5: Update `.gitignore`**

Ensure `.env` is in `.gitignore` (Next.js default includes it). Add `dist/` if not present.

- [ ] **Step 6: Create `src/lib/response.ts`**

```typescript
import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly code: string;
  readonly message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 500
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, code, message }, { status });
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 project with pnpm and TypeScript strict mode"
```

---

### Task 2: Shared Infrastructure — 错误体系 + 日志 + 配置

**Files:**
- Create: `src/shared/errors/app-error.ts`
- Create: `src/shared/errors/index.ts`
- Create: `src/shared/logger/index.ts`
- Create: `src/shared/config/index.ts`

**Interfaces:**
- Produces: `AppError`, `NotFoundError`, `UnauthorizedError`, `ValidationError`, `RateLimitError`, `UpstreamError`
- Produces: `logger` (Pino instance)
- Produces: `config` object with all env vars

- [ ] **Step 1: Create error classes**

`src/shared/errors/app-error.ts`:

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}
```

`src/shared/errors/index.ts`:

```typescript
import { AppError } from "./app-error";

export { AppError } from "./app-error";

export class NotFoundError extends AppError {
  constructor(message = "资源不存在") {
    super(404, "NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "未登录或 Token 已过期") {
    super(401, "UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "参数校验失败") {
    super(400, "VALIDATION_ERROR", message);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "请求过于频繁") {
    super(429, "RATE_LIMITED", message);
    this.name = "RateLimitError";
  }
}

export class UpstreamError extends AppError {
  constructor(message = "上游服务不可用") {
    super(502, "UPSTREAM_ERROR", message);
    this.name = "UpstreamError";
  }
}

export class InternalError extends AppError {
  constructor(message = "服务器内部错误") {
    super(500, "INTERNAL_ERROR", message);
    this.name = "InternalError";
  }
}
```

- [ ] **Step 2: Create Pino logger**

`src/shared/logger/index.ts`:

```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
```

```bash
pnpm add pino-pretty -D
```

- [ ] **Step 3: Create config module**

`src/shared/config/index.ts`:

```typescript
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  databaseUrl: requireEnv("DATABASE_URL"),
  redisUrl: requireEnv("REDIS_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  deepseekApiKey: requireEnv("DEEPSEEK_API_KEY"),
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  chinesePoetryApiUrl: requireEnv("CHINESE_POETRY_API_URL"),
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "8080", 10),
} as const;

export type Config = typeof config;
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add error classes, Pino logger, and config module"
```

---

### Task 3: Database — Prisma Schema + Client 单例

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/shared/database/index.ts`

**Interfaces:**
- Produces: `prisma` — PrismaClient 单例
- Produces: Prisma schema with User, Favorite, ReadingHistory models

- [ ] **Step 1: Write Prisma schema**

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
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
  poemTitle   String
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

- [ ] **Step 2: Generate Prisma Client**

```bash
npx prisma generate
```

- [ ] **Step 3: Create Prisma Client singleton**

`src/shared/database/index.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema and database client singleton"
```

---

### Task 4: Cache — Redis 封装 + Auth — JWT

**Files:**
- Create: `src/shared/cache/index.ts`
- Create: `src/shared/auth/index.ts`

**Interfaces:**
- Produces: `cache.get<T>(key)`, `cache.set(key, value, ttlSeconds)`, `cache.del(key)`
- Produces: `auth.signToken(payload)`, `auth.verifyToken(token)`, `AuthPayload` type

- [ ] **Step 1: Create Redis cache wrapper**

`src/shared/cache/index.ts`:

```typescript
import { Redis } from "ioredis";
import { config } from "../config";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    redis.on("error", (err) => {
      console.error("Redis connection error:", err.message);
    });
  }
  return redis;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await getRedis().get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await getRedis().setex(key, ttlSeconds, serialized);
    } catch (err) {
      console.error("Redis set error:", (err as Error).message);
    }
  },

  async del(key: string): Promise<void> {
    try {
      await getRedis().del(key);
    } catch (err) {
      console.error("Redis del error:", (err as Error).message);
    }
  },
};
```

- [ ] **Step 2: Create JWT auth module**

`src/shared/auth/index.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import { UnauthorizedError } from "../errors";

export interface AuthPayload {
  readonly sub: string; // userId
  readonly email: string;
}

const encoder = new TextEncoder();
const secretKey = encoder.encode(config.jwtSecret);

function getExpiry(): string {
  return "7d";
}

export const auth = {
  async signToken(payload: AuthPayload): Promise<string> {
    return new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(getExpiry())
      .sign(secretKey);
  },

  async verifyToken(token: string): Promise<AuthPayload> {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      const sub = payload.sub;
      const email = payload.email as string | undefined;
      if (!sub || !email) {
        throw new UnauthorizedError();
      }
      return { sub, email };
    } catch {
      throw new UnauthorizedError();
    }
  },

  extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") return null;
    return parts[1] ?? null;
  },
};
```

- [ ] **Step 3: Create shared modules barrel export**

`src/shared/index.ts`:

```typescript
export { AppError, NotFoundError, UnauthorizedError, ValidationError, RateLimitError, UpstreamError, InternalError } from "./errors";
export { logger } from "./logger";
export { config } from "./config";
export { prisma } from "./database";
export { cache } from "./cache";
export { auth } from "./auth";
export type { AuthPayload } from "./auth";
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Redis cache wrapper and JWT auth module"
```

---

### Task 5: External Clients — Chinese Poetry API + DeepSeek

**Files:**
- Create: `src/clients/chinese-poetry.client.ts`
- Create: `src/clients/deepseek.client.ts`
- Create: `src/clients/index.ts`

**Interfaces:**
- Produces: `chinesePoetryClient` — `getPoems()`, `getPoemById()`, `getRandomPoem()`, `searchPoems()`, `getAuthors()`, `getAuthorById()`, `getDynasties()`, `getTypes()`, `getStats()`
- Produces: `deepSeekClient` — `chat(messages)` — openai-compatible

- [ ] **Step 1: Create Chinese Poetry API client**

`src/clients/chinese-poetry.client.ts`:

```typescript
import { config } from "@/shared/config";
import { UpstreamError } from "@/shared/errors";
import { logger } from "@/shared/logger";

const BASE_URL = config.chinesePoetryApiUrl;

interface RequestOptions {
  readonly params?: Record<string, string>;
}

async function get<T>(path: string, options?: RequestOptions): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    });
  }
  logger.info({ url: url.toString() }, "Chinese Poetry API request");
  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    throw new UpstreamError(`Chinese Poetry API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Types for upstream API responses
export interface UpstreamPoem {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author?: string;
  readonly dynasty?: string;
  readonly type?: string;
}

export interface UpstreamAuthor {
  readonly id: number;
  readonly name: string;
  readonly dynasty?: string;
  readonly description?: string;
  readonly poemCount?: number;
}

export interface UpstreamDynasty {
  readonly id: number;
  readonly name: string;
}

export interface UpstreamType {
  readonly id: number;
  readonly name: string;
}

export interface UpstreamStats {
  readonly totalPoems: number;
  readonly totalAuthors: number;
}

export interface PaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export const chinesePoetryClient = {
  getPoems(params: { page?: number; pageSize?: number; dynasty?: string; type?: string; author?: string }): Promise<PaginatedResponse<UpstreamPoem>> {
    return get<PaginatedResponse<UpstreamPoem>>("/poems", {
      params: {
        page: params.page?.toString(),
        page_size: params.pageSize?.toString(),
        dynasty: params.dynasty,
        type: params.type,
        author: params.author,
      },
    });
  },

  getPoemById(id: number): Promise<UpstreamPoem> {
    return get<UpstreamPoem>(`/poems/${id}`);
  },

  getRandomPoem(params?: { author?: string; type?: string; dynasty?: string; char?: string }): Promise<UpstreamPoem> {
    return get<UpstreamPoem>("/poems/random", {
      params: {
        author: params?.author,
        type: params?.type,
        dynasty: params?.dynasty,
        char: params?.char,
      },
    });
  },

  searchPoems(params: { q: string; type?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamPoem>> {
    return get<PaginatedResponse<UpstreamPoem>>("/poems/search", {
      params: {
        q: params.q,
        type: params.type,
        page: params.page?.toString(),
        page_size: params.pageSize?.toString(),
      },
    });
  },

  getAuthors(params: { page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamAuthor>> {
    return get<PaginatedResponse<UpstreamAuthor>>("/authors", {
      params: { page: params.page?.toString(), page_size: params.pageSize?.toString() },
    });
  },

  getAuthorById(id: number): Promise<UpstreamAuthor> {
    return get<UpstreamAuthor>(`/authors/${id}`);
  },

  getDynasties(): Promise<UpstreamDynasty[]> {
    return get<UpstreamDynasty[]>("/dynasties");
  },

  getTypes(): Promise<UpstreamType[]> {
    return get<UpstreamType[]>("/types");
  },

  getStats(): Promise<UpstreamStats> {
    return get<UpstreamStats>("/stats");
  },
};
```

- [ ] **Step 2: Create DeepSeek AI client**

```bash
pnpm add openai
```

`src/clients/deepseek.client.ts`:

```typescript
import OpenAI from "openai";
import { config } from "@/shared/config";
import { logger } from "@/shared/logger";

const client = new OpenAI({
  apiKey: config.deepseekApiKey,
  baseURL: config.deepseekBaseUrl,
});

export interface ChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export const deepSeekClient = {
  async chat(
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number }
  ): Promise<string> {
    logger.info({ messageCount: messages.length }, "DeepSeek API request");
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("DeepSeek returned empty response");
    }
    return content;
  },
};
```

- [ ] **Step 3: Create clients barrel export**

`src/clients/index.ts`:

```typescript
export { chinesePoetryClient } from "./chinese-poetry.client";
export type { UpstreamPoem, UpstreamAuthor, UpstreamDynasty, UpstreamType, UpstreamStats, PaginatedResponse } from "./chinese-poetry.client";
export { deepSeekClient } from "./deepseek.client";
export type { ChatMessage } from "./deepseek.client";
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Chinese Poetry API client and DeepSeek AI client"
```

---

### Task 6: Poem Module — 六件套

**Files:**
- Create: `src/modules/poem/types.ts`
- Create: `src/modules/poem/schema.ts`
- Create: `src/modules/poem/mapper.ts`
- Create: `src/modules/poem/repository.ts`
- Create: `src/modules/poem/client.ts`
- Create: `src/modules/poem/service.ts`
- Create: `src/modules/poem/controller.ts`
- Create: `src/modules/poem/index.ts`

**Interfaces:**
- Consumes: `chinesePoetryClient`, `cache`, `prisma`
- Produces: `poemController` with `list()`, `getById()`, `random()` methods

- [ ] **Step 1: Create types**

`src/modules/poem/types.ts`:

```typescript
export interface PoemDTO {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly author: string | null;
  readonly dynasty: string | null;
  readonly type: string | null;
}

export interface PoemListDTO {
  readonly poems: readonly PoemDTO[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface RandomPoemDTO extends PoemDTO {}

export interface PoemListParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly dynasty?: string;
  readonly type?: string;
  readonly author?: string;
}

export interface RandomPoemParams {
  readonly author?: string;
  readonly type?: string;
  readonly dynasty?: string;
  readonly char?: string;
}
```

- [ ] **Step 2: Create Zod schemas**

`src/modules/poem/schema.ts`:

```typescript
import { z } from "zod";

export const poemListParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  dynasty: z.string().optional(),
  type: z.string().optional(),
  author: z.string().optional(),
});

export const randomPoemParamsSchema = z.object({
  author: z.string().optional(),
  type: z.string().optional(),
  dynasty: z.string().optional(),
  char: z.string().max(1).optional(),
});
```

- [ ] **Step 3: Create mapper**

`src/modules/poem/mapper.ts`:

```typescript
import type { UpstreamPoem } from "@/clients";
import type { PoemDTO, PoemListDTO } from "./types";

export function toPoemDTO(poem: UpstreamPoem): PoemDTO {
  return {
    id: poem.id,
    title: poem.title,
    content: poem.content,
    author: poem.author ?? null,
    dynasty: poem.dynasty ?? null,
    type: poem.type ?? null,
  };
}

export function toPoemListDTO(
  poems: UpstreamPoem[],
  total: number,
  page: number,
  pageSize: number
): PoemListDTO {
  return {
    poems: poems.map(toPoemDTO),
    total,
    page,
    pageSize,
  };
}
```

- [ ] **Step 4: Create repository (for favorite count lookup)**

`src/modules/poem/repository.ts`:

```typescript
import { prisma } from "@/shared/database";

export const poemRepository = {
  async getFavoriteCount(poemId: string): Promise<number> {
    return prisma.favorite.count({ where: { poemId } });
  },
};
```

- [ ] **Step 5: Create client wrapper**

`src/modules/poem/client.ts`:

```typescript
import { chinesePoetryClient } from "@/clients";
import type { UpstreamPoem, UpstreamStats, PaginatedResponse } from "@/clients";

export const poemClient = {
  getPoems(params: { page?: number; pageSize?: number; dynasty?: string; type?: string; author?: string }): Promise<PaginatedResponse<UpstreamPoem>> {
    return chinesePoetryClient.getPoems(params);
  },

  getPoemById(id: number): Promise<UpstreamPoem> {
    return chinesePoetryClient.getPoemById(id);
  },

  getRandomPoem(params?: { author?: string; type?: string; dynasty?: string; char?: string }): Promise<UpstreamPoem> {
    return chinesePoetryClient.getRandomPoem(params);
  },

  getStats(): Promise<UpstreamStats> {
    return chinesePoetryClient.getStats();
  },
};
```

- [ ] **Step 6: Create service**

`src/modules/poem/service.ts`:

```typescript
import { cache } from "@/shared/cache";
import { NotFoundError } from "@/shared/errors";
import { poemClient } from "./client";
import { toPoemDTO, toPoemListDTO } from "./mapper";
import type { PoemDTO, PoemListDTO, RandomPoemDTO, PoemListParams, RandomPoemParams } from "./types";

const CACHE_POEM_PREFIX = "poetry:poem:";
const CACHE_POEM_TTL = 600;
const CACHE_POEM_LIST_TTL = 120;

export const poemService = {
  async list(params: PoemListParams): Promise<PoemListDTO> {
    const { page = 1, pageSize = 20 } = params;
    const cacheKey = `poetry:poems:${page}:${pageSize}:${params.dynasty ?? ""}:${params.type ?? ""}:${params.author ?? ""}`;
    const cached = await cache.get<PoemListDTO>(cacheKey);
    if (cached) return cached;

    const result = await poemClient.getPoems(params);
    const dto = toPoemListDTO(result.data, result.total, result.page, result.pageSize);
    await cache.set(cacheKey, dto, CACHE_POEM_LIST_TTL);
    return dto;
  },

  async getById(id: number): Promise<PoemDTO> {
    const cacheKey = `${CACHE_POEM_PREFIX}${id}`;
    const cached = await cache.get<PoemDTO>(cacheKey);
    if (cached) return cached;

    const poem = await poemClient.getPoemById(id);
    if (!poem) throw new NotFoundError("诗词不存在");

    const dto = toPoemDTO(poem);
    await cache.set(cacheKey, dto, CACHE_POEM_TTL);
    return dto;
  },

  async random(params?: RandomPoemParams): Promise<RandomPoemDTO> {
    const poem = await poemClient.getRandomPoem(params);
    if (!poem) throw new NotFoundError("暂无随机诗词");
    return toPoemDTO(poem);
  },
};
```

- [ ] **Step 7: Create controller**

`src/modules/poem/controller.ts`:

```typescript
import type { PoemListParams, RandomPoemParams } from "./types";
import { poemService } from "./service";
import { poemListParamsSchema, randomPoemParamsSchema } from "./schema";
import { ValidationError } from "@/shared/errors";

export const poemController = {
  async list(rawParams: Record<string, string | undefined>) {
    const result = poemListParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    return poemService.list(result.data as PoemListParams);
  },

  async getById(id: number) {
    if (Number.isNaN(id) || id <= 0) {
      throw new ValidationError("无效的诗词 ID");
    }
    return poemService.getById(id);
  },

  async random(rawParams: Record<string, string | undefined>) {
    const result = randomPoemParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    return poemService.random(result.data as RandomPoemParams);
  },
};
```

- [ ] **Step 8: Create barrel export**

`src/modules/poem/index.ts`:

```typescript
export { poemController } from "./controller";
export { poemService } from "./service";
export type { PoemDTO, PoemListDTO, RandomPoemDTO } from "./types";
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add poem module with cache-aside pattern"
```

---

### Task 7: Author Module

**Files:**
- Create: `src/modules/author/types.ts`
- Create: `src/modules/author/schema.ts`
- Create: `src/modules/author/mapper.ts`
- Create: `src/modules/author/client.ts`
- Create: `src/modules/author/service.ts`
- Create: `src/modules/author/controller.ts`
- Create: `src/modules/author/index.ts`

**Interfaces:**
- Consumes: `chinesePoetryClient`, `cache`
- Produces: `authorController` with `list()`, `getById()` methods

- [ ] **Step 1: Create author module**

`src/modules/author/types.ts`:

```typescript
export interface AuthorDTO {
  readonly id: number;
  readonly name: string;
  readonly dynasty: string | null;
  readonly description: string | null;
  readonly poemCount: number | null;
}

export interface AuthorListDTO {
  readonly authors: readonly AuthorDTO[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
```

`src/modules/author/schema.ts`:

```typescript
import { z } from "zod";

export const authorListParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
```

`src/modules/author/mapper.ts`:

```typescript
import type { UpstreamAuthor } from "@/clients";
import type { AuthorDTO, AuthorListDTO } from "./types";

export function toAuthorDTO(author: UpstreamAuthor): AuthorDTO {
  return {
    id: author.id,
    name: author.name,
    dynasty: author.dynasty ?? null,
    description: author.description ?? null,
    poemCount: author.poemCount ?? null,
  };
}

export function toAuthorListDTO(authors: UpstreamAuthor[], total: number, page: number, pageSize: number): AuthorListDTO {
  return {
    authors: authors.map(toAuthorDTO),
    total,
    page,
    pageSize,
  };
}
```

`src/modules/author/client.ts`:

```typescript
import { chinesePoetryClient } from "@/clients";
import type { UpstreamAuthor, PaginatedResponse } from "@/clients";

export const authorClient = {
  getAuthors(params: { page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamAuthor>> {
    return chinesePoetryClient.getAuthors(params);
  },
  getAuthorById(id: number): Promise<UpstreamAuthor> {
    return chinesePoetryClient.getAuthorById(id);
  },
};
```

`src/modules/author/service.ts`:

```typescript
import { cache } from "@/shared/cache";
import { NotFoundError } from "@/shared/errors";
import { authorClient } from "./client";
import { toAuthorDTO, toAuthorListDTO } from "./mapper";
import type { AuthorDTO, AuthorListDTO } from "./types";

const CACHE_AUTHOR_PREFIX = "poetry:author:";
const CACHE_TTL = 600;

export const authorService = {
  async list(page = 1, pageSize = 20): Promise<AuthorListDTO> {
    const cacheKey = `poetry:authors:${page}:${pageSize}`;
    const cached = await cache.get<AuthorListDTO>(cacheKey);
    if (cached) return cached;

    const result = await authorClient.getAuthors({ page, pageSize });
    const dto = toAuthorListDTO(result.data, result.total, result.page, result.pageSize);
    await cache.set(cacheKey, dto, CACHE_TTL);
    return dto;
  },

  async getById(id: number): Promise<AuthorDTO> {
    const cacheKey = `${CACHE_AUTHOR_PREFIX}${id}`;
    const cached = await cache.get<AuthorDTO>(cacheKey);
    if (cached) return cached;

    const author = await authorClient.getAuthorById(id);
    if (!author) throw new NotFoundError("作者不存在");

    const dto = toAuthorDTO(author);
    await cache.set(cacheKey, dto, CACHE_TTL);
    return dto;
  },
};
```

`src/modules/author/controller.ts`:

```typescript
import { ValidationError } from "@/shared/errors";
import { authorService } from "./service";
import { authorListParamsSchema } from "./schema";

export const authorController = {
  async list(rawParams: Record<string, string | undefined>) {
    const result = authorListParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { page, pageSize } = result.data;
    return authorService.list(page, pageSize);
  },

  async getById(id: number) {
    if (Number.isNaN(id) || id <= 0) {
      throw new ValidationError("无效的作者 ID");
    }
    return authorService.getById(id);
  },
};
```

`src/modules/author/index.ts`:

```typescript
export { authorController } from "./controller";
export { authorService } from "./service";
export type { AuthorDTO, AuthorListDTO } from "./types";
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add author module with cache-aside pattern"
```

---

### Task 8: Search Module + Aggregate Modules (Home, Discover, Categories, Recommend, Quote, Config)

**Files:**
- Create: `src/modules/search/types.ts`, `schema.ts`, `mapper.ts`, `client.ts`, `service.ts`, `controller.ts`, `index.ts`
- Create: `src/modules/poem/home.service.ts` (or extend existing services for aggregation)

**Interfaces:**
- Produces: `searchController.search(q, type, page, pageSize)`
- Produces: Aggregation functions for home/discover/categories/recommend/quote/config

- [ ] **Step 1: Create search module**

`src/modules/search/types.ts`:

```typescript
import type { PoemDTO } from "@/modules/poem";

export interface SearchResultDTO {
  readonly poems: readonly PoemDTO[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly query: string;
}
```

`src/modules/search/schema.ts`:

```typescript
import { z } from "zod";

export const searchParamsSchema = z.object({
  q: z.string().min(1, "搜索词不能为空"),
  type: z.enum(["all", "title", "content", "author"]).optional().default("all"),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
```

`src/modules/search/mapper.ts`:

```typescript
import { toPoemDTO } from "@/modules/poem/mapper";
import type { UpstreamPoem, PaginatedResponse } from "@/clients";
import type { SearchResultDTO } from "./types";

export function toSearchResultDTO(
  result: PaginatedResponse<UpstreamPoem>,
  query: string
): SearchResultDTO {
  return {
    poems: result.data.map(toPoemDTO),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    query,
  };
}
```

`src/modules/search/client.ts`:

```typescript
import { chinesePoetryClient } from "@/clients";
import type { UpstreamPoem, PaginatedResponse } from "@/clients";

export const searchClient = {
  search(params: { q: string; type?: string; page?: number; pageSize?: number }): Promise<PaginatedResponse<UpstreamPoem>> {
    return chinesePoetryClient.searchPoems(params);
  },
};
```

`src/modules/search/service.ts`:

```typescript
import { cache } from "@/shared/cache";
import { ValidationError } from "@/shared/errors";
import { searchClient } from "./client";
import { toSearchResultDTO } from "./mapper";
import type { SearchResultDTO } from "./types";

export const searchService = {
  async search(q: string, type = "all", page = 1, pageSize = 20): Promise<SearchResultDTO> {
    if (!q.trim()) throw new ValidationError("搜索词不能为空");

    const cacheKey = `poetry:search:${q}:${type}:${page}:${pageSize}`;
    const cached = await cache.get<SearchResultDTO>(cacheKey);
    if (cached) return cached;

    const result = await searchClient.search({ q, type, page, pageSize });
    const dto = toSearchResultDTO(result, q);
    await cache.set(cacheKey, dto, 60);
    return dto;
  },
};
```

`src/modules/search/controller.ts`:

```typescript
import { ValidationError } from "@/shared/errors";
import { searchService } from "./service";
import { searchParamsSchema } from "./schema";

export const searchController = {
  async search(rawParams: Record<string, string | undefined>) {
    const result = searchParamsSchema.safeParse(rawParams);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { q, type, page, pageSize } = result.data;
    return searchService.search(q, type, page, pageSize);
  },
};
```

`src/modules/search/index.ts`:

```typescript
export { searchController } from "./controller";
export { searchService } from "./service";
export type { SearchResultDTO } from "./types";
```

- [ ] **Step 2: Create aggregate services for home, discover, categories, recommend, quote, config**

Create `src/modules/poem/aggregate.service.ts`:

```typescript
import { cache } from "@/shared/cache";
import { poemClient } from "./client";
import { chinesePoetryClient } from "@/clients";
import { toPoemDTO } from "./mapper";
import type { PoemDTO, PoemListDTO } from "./types";
import { toAuthorDTO } from "@/modules/author/mapper";
import type { AuthorDTO } from "@/modules/author";
import type { UpstreamDynasty, UpstreamType } from "@/clients";

export interface HomeDTO {
  readonly featuredPoem: PoemDTO;
  readonly featuredAuthor: AuthorDTO | null;
  readonly totalPoems: number;
  readonly totalAuthors: number;
}

export interface DiscoverDTO {
  readonly recentPoems: readonly PoemDTO[];
  readonly dynasties: readonly UpstreamDynasty[];
  readonly types: readonly UpstreamType[];
}

export interface CategoriesDTO {
  readonly dynasties: readonly UpstreamDynasty[];
  readonly types: readonly UpstreamType[];
}

export interface RecommendDTO {
  readonly poems: readonly PoemDTO[];
  readonly reason: string;
}

export interface QuoteDTO {
  readonly content: string;
  readonly author: string;
  readonly source: string;
}

export interface ConfigDTO {
  readonly version: string;
  readonly bannerUrl: string | null;
  readonly features: Record<string, boolean>;
}

export const aggregateService = {
  async home(): Promise<HomeDTO> {
    const cacheKey = "poetry:home";
    const cached = await cache.get<HomeDTO>(cacheKey);
    if (cached) return cached;

    const [featuredPoem, stats, authors] = await Promise.all([
      poemClient.getRandomPoem(),
      poemClient.getStats(),
      chinesePoetryClient.getAuthors({ page: 1, pageSize: 1 }),
    ]);

    const dto: HomeDTO = {
      featuredPoem: toPoemDTO(featuredPoem),
      featuredAuthor: authors.data[0] ? toAuthorDTO(authors.data[0]) : null,
      totalPoems: stats.totalPoems,
      totalAuthors: stats.totalAuthors,
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async discover(): Promise<DiscoverDTO> {
    const cacheKey = "poetry:discover";
    const cached = await cache.get<DiscoverDTO>(cacheKey);
    if (cached) return cached;

    const [poems, dynasties, types] = await Promise.all([
      poemClient.getPoems({ page: 1, pageSize: 10 }),
      chinesePoetryClient.getDynasties(),
      chinesePoetryClient.getTypes(),
    ]);

    const dto: DiscoverDTO = {
      recentPoems: poems.data.map(toPoemDTO),
      dynasties,
      types,
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async categories(): Promise<CategoriesDTO> {
    const cacheKey = "poetry:categories";
    const cached = await cache.get<CategoriesDTO>(cacheKey);
    if (cached) return cached;

    const [dynasties, types] = await Promise.all([
      chinesePoetryClient.getDynasties(),
      chinesePoetryClient.getTypes(),
    ]);

    const dto: CategoriesDTO = { dynasties, types };
    await cache.set(cacheKey, dto, 3600);
    return dto;
  },

  async recommend(): Promise<RecommendDTO> {
    const cacheKey = "poetry:recommend";
    const cached = await cache.get<RecommendDTO>(cacheKey);
    if (cached) return cached;

    // Simple recommendation: get popular poems based on current season/time
    const poems = await poemClient.getPoems({ page: 1, pageSize: 5 });

    const dto: RecommendDTO = {
      poems: poems.data.map(toPoemDTO),
      reason: "为你精选",
    };
    await cache.set(cacheKey, dto, 300);
    return dto;
  },

  async quote(): Promise<QuoteDTO> {
    // No cache for random quotes
    const poem = await poemClient.getRandomPoem();

    // Extract first 2 lines (or first sentence) for the quote
    const lines = poem.content.split(/[，。！？\n]/).filter(Boolean);
    const quoteContent = lines.slice(0, 2).join("，");

    return {
      content: quoteContent || poem.content.slice(0, 50),
      author: poem.author ?? "未知",
      source: poem.title,
    };
  },

  async config(): Promise<ConfigDTO> {
    const cacheKey = "poetry:config";
    const cached = await cache.get<ConfigDTO>(cacheKey);
    if (cached) return cached;

    const dto: ConfigDTO = {
      version: "1.0.0",
      bannerUrl: null,
      features: {
        aiAnalysis: true,
        aiAsk: true,
        aiTranslate: true,
        favorites: true,
        readingHistory: true,
        recommendations: true,
      },
    };
    await cache.set(cacheKey, dto, 3600);
    return dto;
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add search module and aggregate services"
```

---

### Task 9: Route Handlers — Core Endpoints (no auth)

**Files:**
- Create: `app/api/v1/home/route.ts`
- Create: `app/api/v1/discover/route.ts`
- Create: `app/api/v1/poems/route.ts`
- Create: `app/api/v1/poems/random/route.ts`
- Create: `app/api/v1/poems/[id]/route.ts`
- Create: `app/api/v1/authors/route.ts`
- Create: `app/api/v1/authors/[id]/route.ts`
- Create: `app/api/v1/categories/route.ts`
- Create: `app/api/v1/search/route.ts`
- Create: `app/api/v1/recommend/route.ts`
- Create: `app/api/v1/quote/route.ts`
- Create: `app/api/v1/config/route.ts`

**Interfaces:**
- Consumes: `poemController`, `authorController`, `searchController`, `aggregateService`
- Produces: Working REST API at `/api/v1/*`

- [ ] **Step 1: Create all route handlers**

`app/api/v1/home/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aggregateService } from "@/modules/poem/aggregate.service";

export async function GET(_request: NextRequest) {
  const data = await aggregateService.home();
  return successResponse(data);
}
```

`app/api/v1/discover/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aggregateService } from "@/modules/poem/aggregate.service";

export async function GET(_request: NextRequest) {
  const data = await aggregateService.discover();
  return successResponse(data);
}
```

`app/api/v1/poems/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { poemController } from "@/modules/poem";

export async function GET(request: NextRequest) {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const data = await poemController.list(params);
  return successResponse(data);
}
```

`app/api/v1/poems/random/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { poemController } from "@/modules/poem";

export async function GET(request: NextRequest) {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const data = await poemController.random(params);
  return successResponse(data);
}
```

`app/api/v1/poems/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { poemController } from "@/modules/poem";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await poemController.getById(Number(id));
  return successResponse(data);
}
```

`app/api/v1/authors/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { authorController } from "@/modules/author";

export async function GET(request: NextRequest) {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const data = await authorController.list(params);
  return successResponse(data);
}
```

`app/api/v1/authors/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { authorController } from "@/modules/author";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await authorController.getById(Number(id));
  return successResponse(data);
}
```

`app/api/v1/categories/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aggregateService } from "@/modules/poem/aggregate.service";

export async function GET(_request: NextRequest) {
  const data = await aggregateService.categories();
  return successResponse(data);
}
```

`app/api/v1/search/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { searchController } from "@/modules/search";

export async function GET(request: NextRequest) {
  const params: Record<string, string | undefined> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const data = await searchController.search(params);
  return successResponse(data);
}
```

`app/api/v1/recommend/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aggregateService } from "@/modules/poem/aggregate.service";

export async function GET(_request: NextRequest) {
  const data = await aggregateService.recommend();
  return successResponse(data);
}
```

`app/api/v1/quote/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aggregateService } from "@/modules/poem/aggregate.service";

export async function GET(_request: NextRequest) {
  const data = await aggregateService.quote();
  return successResponse(data);
}
```

`app/api/v1/config/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aggregateService } from "@/modules/poem/aggregate.service";

export async function GET(_request: NextRequest) {
  const data = await aggregateService.config();
  return successResponse(data);
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm tsc --noEmit
```

Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add core API route handlers for poems, authors, search, home, discover"
```

---

### Task 10: Global Error Handler + Middleware

**Files:**
- Create: `src/shared/middleware/auth-guard.ts`
- Create: `src/shared/middleware/error-handler.ts`
- Create: `src/shared/middleware/request-logger.ts`
- Create: `src/shared/middleware/with-error-handler.ts`

**Interfaces:**
- Produces: `withErrorHandler(handler)` — wraps Route Handler with error catching
- Produces: `authGuard(request)` — extracts and verifies JWT, returns userId

- [ ] **Step 1: Create error handler wrapper**

`src/shared/middleware/with-error-handler.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/shared/errors";
import { errorResponse } from "@/lib/response";
import { logger } from "@/shared/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Next.js route handler context varies by route type
type Handler = (request: NextRequest, context?: any) => Promise<NextResponse>;

export function withErrorHandler(handler: Handler): Handler {
  return async (request: NextRequest, context?: any) => {
    const start = Date.now();
    try {
      const response = await handler(request, context);
      logger.info({
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        duration: Date.now() - start,
      }, "request completed");
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      if (error instanceof AppError) {
        logger.warn({
          method: request.method,
          path: request.nextUrl.pathname,
          status: error.statusCode,
          code: error.code,
          duration,
        }, error.message);
        return errorResponse(error.code, error.message, error.statusCode);
      }
      logger.error({
        method: request.method,
        path: request.nextUrl.pathname,
        duration,
        error: (error as Error).message,
      }, "unhandled error");
      return errorResponse("INTERNAL_ERROR", "服务器内部错误", 500);
    }
  };
}
```

- [ ] **Step 2: Create auth guard**

`src/shared/middleware/auth-guard.ts`:

```typescript
import { NextRequest } from "next/server";
import { auth } from "@/shared/auth";
import type { AuthPayload } from "@/shared/auth";
import { UnauthorizedError } from "@/shared/errors";

export async function getAuthPayload(request: NextRequest): Promise<AuthPayload> {
  const authHeader = request.headers.get("authorization");
  const token = auth.extractBearerToken(authHeader);
  if (!token) {
    throw new UnauthorizedError();
  }
  return auth.verifyToken(token);
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add global error handler and auth guard middleware"
```

---

### Task 11: User Module — Register, Login, Profile

**Files:**
- Create: `src/modules/user/types.ts`
- Create: `src/modules/user/schema.ts`
- Create: `src/modules/user/repository.ts`
- Create: `src/modules/user/service.ts`
- Create: `src/modules/user/controller.ts`
- Create: `src/modules/user/index.ts`

**Interfaces:**
- Consumes: `prisma`, `auth`, `cache`
- Produces: `userController` with `register()`, `login()`, `getProfile()`, `updateProfile()`

- [ ] **Step 1: Create user module types and schema**

`src/modules/user/types.ts`:

```typescript
export interface UserDTO {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly avatar: string | null;
  readonly createdAt: string;
}

export interface LoginResponseDTO {
  readonly token: string;
  readonly user: UserDTO;
}
```

`src/modules/user/schema.ts`:

```typescript
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少6位").max(100),
  name: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(1, "密码不能为空"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().url().optional(),
});
```

- [ ] **Step 2: Create user repository**

`src/modules/user/repository.ts`:

```typescript
import { prisma } from "@/shared/database";
import type { User } from "@prisma/client";

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: { email: string; passwordHash: string; name?: string }): Promise<User> {
    return prisma.user.create({ data });
  },

  async update(id: string, data: { name?: string; avatar?: string }): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },
};
```

- [ ] **Step 3: Create user service**

`src/modules/user/service.ts`:

```typescript
import { hash, compare } from "bcryptjs";
import { userRepository } from "./repository";
import { auth } from "@/shared/auth";
import { ValidationError, NotFoundError } from "@/shared/errors";
import type { UserDTO, LoginResponseDTO } from "./types";

function toUserDTO(user: { id: string; email: string; name: string | null; avatar: string | null; createdAt: Date }): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
  };
}

export const userService = {
  async register(email: string, password: string, name?: string): Promise<LoginResponseDTO> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError("该邮箱已注册");
    }

    const passwordHash = await hash(password, 12);
    const user = await userRepository.create({ email, passwordHash, name });

    const token = await auth.signToken({ sub: user.id, email: user.email });
    return { token, user: toUserDTO(user) };
  },

  async login(email: string, password: string): Promise<LoginResponseDTO> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ValidationError("邮箱或密码错误");
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      throw new ValidationError("邮箱或密码错误");
    }

    const token = await auth.signToken({ sub: user.id, email: user.email });
    return { token, user: toUserDTO(user) };
  },

  async getProfile(userId: string): Promise<UserDTO> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("用户不存在");
    return toUserDTO(user);
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string }): Promise<UserDTO> {
    const user = await userRepository.update(userId, data);
    return toUserDTO(user);
  },
};
```

```bash
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

- [ ] **Step 4: Create user controller**

`src/modules/user/controller.ts`:

```typescript
import { ValidationError } from "@/shared/errors";
import { userService } from "./service";
import { registerSchema, loginSchema, updateProfileSchema } from "./schema";

export const userController = {
  async register(body: unknown) {
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { email, password, name } = result.data;
    return userService.register(email, password, name);
  },

  async login(body: unknown) {
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { email, password } = result.data;
    return userService.login(email, password);
  },

  async getProfile(userId: string) {
    return userService.getProfile(userId);
  },

  async updateProfile(userId: string, body: unknown) {
    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    return userService.updateProfile(userId, result.data);
  },
};
```

`src/modules/user/index.ts`:

```typescript
export { userController } from "./controller";
export { userService } from "./service";
export type { UserDTO, LoginResponseDTO } from "./types";
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add user module with register, login, and profile"
```

---

### Task 12: User API Route Handlers

**Files:**
- Create: `app/api/v1/user/register/route.ts`
- Create: `app/api/v1/user/login/route.ts`
- Create: `app/api/v1/user/profile/route.ts`

- [ ] **Step 1: Create auth-related route handlers**

`app/api/v1/user/register/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { userController } from "@/modules/user";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const data = await userController.register(body);
  return successResponse(data, 201);
});
```

`app/api/v1/user/login/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { userController } from "@/modules/user";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const data = await userController.login(body);
  return successResponse(data);
});
```

`app/api/v1/user/profile/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { userController } from "@/modules/user";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const data = await userController.getProfile(sub);
  return successResponse(data);
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const body = await request.json();
  const data = await userController.updateProfile(sub, body);
  return successResponse(data);
});
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add user route handlers for register, login, and profile"
```

---

### Task 13: Favorite Module

**Files:**
- Create: `src/modules/favorite/types.ts`
- Create: `src/modules/favorite/schema.ts`
- Create: `src/modules/favorite/repository.ts`
- Create: `src/modules/favorite/service.ts`
- Create: `src/modules/favorite/controller.ts`
- Create: `src/modules/favorite/index.ts`

- [ ] **Step 1: Create favorite module**

`src/modules/favorite/types.ts`:

```typescript
export interface FavoriteDTO {
  readonly id: string;
  readonly poemId: string;
  readonly poemTitle: string;
  readonly poemAuthor: string | null;
  readonly poemDynasty: string | null;
  readonly createdAt: string;
}

export interface FavoriteListDTO {
  readonly favorites: readonly FavoriteDTO[];
  readonly total: number;
}
```

`src/modules/favorite/schema.ts`:

```typescript
import { z } from "zod";

export const addFavoriteSchema = z.object({
  poemId: z.string().min(1, "诗词 ID 不能为空"),
  poemTitle: z.string().min(1, "诗词标题不能为空"),
  poemAuthor: z.string().optional(),
  poemDynasty: z.string().optional(),
});
```

`src/modules/favorite/repository.ts`:

```typescript
import { prisma } from "@/shared/database";
import type { Favorite } from "@prisma/client";

export const favoriteRepository = {
  async findByUser(userId: string): Promise<Favorite[]> {
    return prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByUserAndPoem(userId: string, poemId: string): Promise<Favorite | null> {
    return prisma.favorite.findUnique({
      where: { userId_poemId: { userId, poemId } },
    });
  },

  async create(data: { userId: string; poemId: string; poemTitle: string; poemAuthor?: string; poemDynasty?: string }): Promise<Favorite> {
    return prisma.favorite.create({ data });
  },

  async delete(id: string): Promise<void> {
    await prisma.favorite.delete({ where: { id } });
  },

  async deleteByUserAndPoem(userId: string, poemId: string): Promise<void> {
    await prisma.favorite.deleteMany({ where: { userId, poemId } });
  },

  async countByUser(userId: string): Promise<number> {
    return prisma.favorite.count({ where: { userId } });
  },
};
```

`src/modules/favorite/service.ts`:

```typescript
import { favoriteRepository } from "./repository";
import { ValidationError, NotFoundError } from "@/shared/errors";
import type { FavoriteDTO, FavoriteListDTO } from "./types";

function toFavoriteDTO(f: { id: string; poemId: string; poemTitle: string; poemAuthor: string | null; poemDynasty: string | null; createdAt: Date }): FavoriteDTO {
  return {
    id: f.id,
    poemId: f.poemId,
    poemTitle: f.poemTitle,
    poemAuthor: f.poemAuthor,
    poemDynasty: f.poemDynasty,
    createdAt: f.createdAt.toISOString(),
  };
}

export const favoriteService = {
  async list(userId: string): Promise<FavoriteListDTO> {
    const favorites = await favoriteRepository.findByUser(userId);
    return {
      favorites: favorites.map(toFavoriteDTO),
      total: favorites.length,
    };
  },

  async add(userId: string, poemId: string, poemTitle: string, poemAuthor?: string, poemDynasty?: string): Promise<FavoriteDTO> {
    const existing = await favoriteRepository.findByUserAndPoem(userId, poemId);
    if (existing) {
      throw new ValidationError("已收藏该诗词");
    }
    const favorite = await favoriteRepository.create({ userId, poemId, poemTitle, poemAuthor, poemDynasty });
    return toFavoriteDTO(favorite);
  },

  async remove(userId: string, poemId: string): Promise<void> {
    const existing = await favoriteRepository.findByUserAndPoem(userId, poemId);
    if (!existing) {
      throw new NotFoundError("收藏不存在");
    }
    await favoriteRepository.deleteByUserAndPoem(userId, poemId);
  },
};
```

`src/modules/favorite/controller.ts`:

```typescript
import { ValidationError } from "@/shared/errors";
import { favoriteService } from "./service";
import { addFavoriteSchema } from "./schema";

export const favoriteController = {
  async list(userId: string) {
    return favoriteService.list(userId);
  },

  async add(userId: string, body: unknown) {
    const result = addFavoriteSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { poemId, poemTitle, poemAuthor, poemDynasty } = result.data;
    return favoriteService.add(userId, poemId, poemTitle, poemAuthor, poemDynasty);
  },

  async remove(userId: string, poemId: string) {
    if (!poemId) throw new ValidationError("诗词 ID 不能为空");
    return favoriteService.remove(userId, poemId);
  },
};
```

`src/modules/favorite/index.ts`:

```typescript
export { favoriteController } from "./controller";
export { favoriteService } from "./service";
export type { FavoriteDTO, FavoriteListDTO } from "./types";
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add favorite module with CRUD operations"
```

---

### Task 14: History Module + Favorites/History Route Handlers

**Files:**
- Create: `src/modules/history/types.ts`, `schema.ts`, `repository.ts`, `service.ts`, `controller.ts`, `index.ts`
- Create: `app/api/v1/favorites/route.ts`
- Create: `app/api/v1/favorites/[id]/route.ts`
- Create: `app/api/v1/history/route.ts`

- [ ] **Step 1: Create history module**

`src/modules/history/types.ts`:

```typescript
export interface HistoryDTO {
  readonly id: string;
  readonly poemId: string;
  readonly poemTitle: string;
  readonly poemAuthor: string | null;
  readonly poemDynasty: string | null;
  readonly readAt: string;
}

export interface HistoryListDTO {
  readonly records: readonly HistoryDTO[];
  readonly total: number;
}
```

`src/modules/history/schema.ts`:

```typescript
import { z } from "zod";

export const addHistorySchema = z.object({
  poemId: z.string().min(1),
  poemTitle: z.string().min(1),
  poemAuthor: z.string().optional(),
  poemDynasty: z.string().optional(),
});
```

`src/modules/history/repository.ts`:

```typescript
import { prisma } from "@/shared/database";
import type { ReadingHistory } from "@prisma/client";

export const historyRepository = {
  async findByUser(userId: string, limit = 50): Promise<ReadingHistory[]> {
    return prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { readAt: "desc" },
      take: limit,
    });
  },

  async create(data: { userId: string; poemId: string; poemTitle: string; poemAuthor?: string; poemDynasty?: string }): Promise<ReadingHistory> {
    // Each read creates a new record (user can read same poem multiple times)
    return prisma.readingHistory.create({
      data: {
        userId: data.userId,
        poemId: data.poemId,
        poemTitle: data.poemTitle,
        poemAuthor: data.poemAuthor,
        poemDynasty: data.poemDynasty,
      },
    });
  },

  async countByUser(userId: string): Promise<number> {
    return prisma.readingHistory.count({ where: { userId } });
  },
};
```

Wait - the upsert approach with a composite key including readAt won't work well. Let me use a simpler approach:

Actually, I realize the schema has `@@index([userId, readAt])` but no unique constraint on (userId, poemId) for history - which makes sense since you can read the same poem multiple times. Let me fix the repository to use a simple create:

```typescript
async create(data: { userId: string; poemId: string; poemTitle: string; poemAuthor?: string; poemDynasty?: string }): Promise<ReadingHistory> {
  return prisma.readingHistory.create({
    data: {
      userId: data.userId,
      poemId: data.poemId,
      poemTitle: data.poemTitle,
      poemAuthor: data.poemAuthor,
      poemDynasty: data.poemDynasty,
    },
  });
},
```

Actually let me just correct this in the plan. Let me rewrite the history repository properly.

`src/modules/history/service.ts`:

```typescript
import { historyRepository } from "./repository";
import { ValidationError } from "@/shared/errors";
import type { HistoryDTO, HistoryListDTO } from "./types";

function toHistoryDTO(h: { id: string; poemId: string; poemTitle: string; poemAuthor: string | null; poemDynasty: string | null; readAt: Date }): HistoryDTO {
  return {
    id: h.id,
    poemId: h.poemId,
    poemTitle: h.poemTitle,
    poemAuthor: h.poemAuthor,
    poemDynasty: h.poemDynasty,
    readAt: h.readAt.toISOString(),
  };
}

export const historyService = {
  async list(userId: string): Promise<HistoryListDTO> {
    const records = await historyRepository.findByUser(userId);
    return {
      records: records.map(toHistoryDTO),
      total: records.length,
    };
  },

  async record(userId: string, poemId: string, poemTitle: string, poemAuthor?: string, poemDynasty?: string): Promise<HistoryDTO> {
    if (!poemId || !poemTitle) {
      throw new ValidationError("参数不完整");
    }
    const record = await historyRepository.create({ userId, poemId, poemTitle, poemAuthor, poemDynasty });
    return toHistoryDTO(record);
  },
};
```

`src/modules/history/controller.ts`:

```typescript
import { ValidationError } from "@/shared/errors";
import { historyService } from "./service";
import { addHistorySchema } from "./schema";

export const historyController = {
  async list(userId: string) {
    return historyService.list(userId);
  },

  async record(userId: string, body: unknown) {
    const result = addHistorySchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { poemId, poemTitle, poemAuthor, poemDynasty } = result.data;
    return historyService.record(userId, poemId, poemTitle, poemAuthor, poemDynasty);
  },
};
```

`src/modules/history/index.ts`:

```typescript
export { historyController } from "./controller";
export type { HistoryDTO, HistoryListDTO } from "./types";
```

- [ ] **Step 2: Create favorites route handlers**

`app/api/v1/favorites/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { favoriteController } from "@/modules/favorite";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const data = await favoriteController.list(sub);
  return successResponse(data);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const body = await request.json();
  const data = await favoriteController.add(sub, body);
  return successResponse(data, 201);
});
```

`app/api/v1/favorites/[id]/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { favoriteController } from "@/modules/favorite";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const DELETE = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { sub } = await getAuthPayload(request);
  const { id } = await params;
  await favoriteController.remove(sub, id);
  return successResponse(null);
});
```

- [ ] **Step 3: Create history route handler**

`app/api/v1/history/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { historyController } from "@/modules/history";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const data = await historyController.list(sub);
  return successResponse(data);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { sub } = await getAuthPayload(request);
  const body = await request.json();
  const data = await historyController.record(sub, body);
  return successResponse(data, 201);
});
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add history module and favorites/history route handlers"
```

---

### Task 15: AI Module — Analyse, Ask, Translate

**Files:**
- Create: `src/modules/ai/types.ts`
- Create: `src/modules/ai/schema.ts`
- Create: `src/modules/ai/prompt-builder.ts`
- Create: `src/modules/ai/formatter.ts`
- Create: `src/modules/ai/service.ts`
- Create: `src/modules/ai/controller.ts`
- Create: `src/modules/ai/index.ts`
- Create: `app/api/v1/ai/analyse/route.ts`
- Create: `app/api/v1/ai/ask/route.ts`
- Create: `app/api/v1/ai/translate/route.ts`

- [ ] **Step 1: Create AI types, schema, prompt builder, formatter**

`src/modules/ai/types.ts`:

```typescript
export interface AIAnalysisDTO {
  readonly background: string;
  readonly appreciation: string;
  readonly keywords: readonly string[];
  readonly emotions: readonly string[];
}

export interface AIAskDTO {
  readonly answer: string;
}

export interface AITranslateDTO {
  readonly original: string;
  readonly translation: string;
  readonly notes: readonly string[];
}
```

`src/modules/ai/schema.ts`:

```typescript
import { z } from "zod";

export const analyseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  author: z.string().optional(),
  dynasty: z.string().optional(),
});

export const askSchema = z.object({
  question: z.string().min(1, "问题不能为空"),
  context: z.string().optional(),
});

export const translateSchema = z.object({
  content: z.string().min(1),
  targetLang: z.enum(["en", "ja", "ko"]).optional().default("en"),
});
```

`src/modules/ai/prompt-builder.ts`:

```typescript
export const promptBuilder = {
  analyse(title: string, content: string, author?: string, dynasty?: string): string {
    const header = author && dynasty
      ? `请赏析以下诗词：\n《${title}》- ${author}（${dynasty}）`
      : `请赏析以下诗词：\n《${title}》`;
    return `${header}\n\n${content}\n\n请从以下方面分析并返回JSON格式：\n1. background: 创作背景简介\n2. appreciation: 诗词赏析（200字左右）\n3. keywords: 3-5个关键词\n4. emotions: 2-3个主要情感`;
  },

  ask(question: string, context?: string): string {
    const base = "你是一位中国古诗词专家，请用中文回答用户问题。";
    if (context) {
      return `${base}\n\n参考诗词：\n${context}\n\n用户问题：${question}`;
    }
    return `${base}\n\n用户问题：${question}`;
  },

  translate(content: string, targetLang: string): string {
    const langNames: Record<string, string> = { en: "英文", ja: "日文", ko: "韩文" };
    const langName = langNames[targetLang] ?? "英文";
    return `请将以下古诗词翻译成${langName}，并解释关键典故。\n\n${content}\n\n请返回：\n1. translation: 翻译内容\n2. notes: 典故解释列表`;
  },
};
```

`src/modules/ai/formatter.ts`:

```typescript
import { InternalError } from "@/shared/errors";
import type { AIAnalysisDTO, AIAskDTO, AITranslateDTO } from "./types";

export const aiFormatter = {
  parseAnalysis(raw: string): AIAnalysisDTO {
    try {
      // Try to extract JSON from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        return {
          background: String(parsed.background ?? ""),
          appreciation: String(parsed.appreciation ?? ""),
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String) : [],
          emotions: Array.isArray(parsed.emotions) ? parsed.emotions.map(String) : [],
        };
      }
    } catch {
      // Fall through to text parsing
    }
    // Return raw text as appreciation if JSON parsing fails
    return {
      background: "",
      appreciation: raw,
      keywords: [],
      emotions: [],
    };
  },

  parseAsk(raw: string): AIAskDTO {
    return { answer: raw };
  },

  parseTranslation(raw: string): AITranslateDTO {
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        return {
          original: "",
          translation: String(parsed.translation ?? raw),
          notes: Array.isArray(parsed.notes) ? parsed.notes.map(String) : [],
        };
      }
    } catch {
      // Fall through
    }
    return { original: "", translation: raw, notes: [] };
  },
};
```

- [ ] **Step 2: Create AI service and controller**

`src/modules/ai/service.ts`:

```typescript
import { cache } from "@/shared/cache";
import { deepSeekClient } from "@/clients";
import { promptBuilder } from "./prompt-builder";
import { aiFormatter } from "./formatter";
import type { AIAnalysisDTO, AIAskDTO, AITranslateDTO } from "./types";

function hashContent(content: string): string {
  // Simple hash for cache key
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export const aiService = {
  async analyse(title: string, content: string, author?: string, dynasty?: string): Promise<AIAnalysisDTO> {
    const contentHash = hashContent(content);
    const cacheKey = `poetry:ai:analyse:${contentHash}`;
    const cached = await cache.get<AIAnalysisDTO>(cacheKey);
    if (cached) return cached;

    const prompt = promptBuilder.analyse(title, content, author, dynasty);
    const response = await deepSeekClient.chat([
      { role: "system", content: "你是一位中国古诗词研究专家，擅长深入浅出地赏析古诗词。请始终返回有效的JSON格式。" },
      { role: "user", content: prompt },
    ]);
    const dto = aiFormatter.parseAnalysis(response);
    await cache.set(cacheKey, dto, 86400);
    return dto;
  },

  async ask(question: string, context?: string): Promise<AIAskDTO> {
    const prompt = promptBuilder.ask(question, context);
    const response = await deepSeekClient.chat([
      { role: "system", content: "你是一位中国古诗词专家，擅长回答关于古诗词的各种问题。" },
      { role: "user", content: prompt },
    ]);
    return aiFormatter.parseAsk(response);
  },

  async translate(content: string, targetLang = "en"): Promise<AITranslateDTO> {
    const contentHash = hashContent(content + targetLang);
    const cacheKey = `poetry:ai:translate:${contentHash}`;
    const cached = await cache.get<AITranslateDTO>(cacheKey);
    if (cached) return cached;

    const prompt = promptBuilder.translate(content, targetLang);
    const response = await deepSeekClient.chat([
      { role: "system", content: "你是一位精通中英日韩翻译的古诗词专家。" },
      { role: "user", content: prompt },
    ]);
    const dto = aiFormatter.parseTranslation(response);
    await cache.set(cacheKey, dto, 86400);
    return dto;
  },
};
```

`src/modules/ai/controller.ts`:

```typescript
import { ValidationError } from "@/shared/errors";
import { aiService } from "./service";
import { analyseSchema, askSchema, translateSchema } from "./schema";

export const aiController = {
  async analyse(body: unknown) {
    const result = analyseSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { title, content, author, dynasty } = result.data;
    return aiService.analyse(title, content, author, dynasty);
  },

  async ask(body: unknown) {
    const result = askSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { question, context } = result.data;
    return aiService.ask(question, context);
  },

  async translate(body: unknown) {
    const result = translateSchema.safeParse(body);
    if (!result.success) {
      throw new ValidationError(result.error.issues.map(i => i.message).join(", "));
    }
    const { content, targetLang } = result.data;
    return aiService.translate(content, targetLang);
  },
};
```

`src/modules/ai/index.ts`:

```typescript
export { aiController } from "./controller";
export { aiService } from "./service";
export type { AIAnalysisDTO, AIAskDTO, AITranslateDTO } from "./types";
```

- [ ] **Step 3: Create AI route handlers**

`app/api/v1/ai/analyse/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aiController } from "@/modules/ai";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const POST = withErrorHandler(async (request: NextRequest) => {
  await getAuthPayload(request);
  const body = await request.json();
  const data = await aiController.analyse(body);
  return successResponse(data);
});
```

`app/api/v1/ai/ask/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aiController } from "@/modules/ai";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const POST = withErrorHandler(async (request: NextRequest) => {
  await getAuthPayload(request);
  const body = await request.json();
  const data = await aiController.ask(body);
  return successResponse(data);
});
```

`app/api/v1/ai/translate/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { successResponse } from "@/lib/response";
import { aiController } from "@/modules/ai";
import { withErrorHandler } from "@/shared/middleware/with-error-handler";
import { getAuthPayload } from "@/shared/middleware/auth-guard";

export const POST = withErrorHandler(async (request: NextRequest) => {
  await getAuthPayload(request);
  const body = await request.json();
  const data = await aiController.translate(body);
  return successResponse(data);
});
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add AI module with analyse, ask, and translate endpoints"
```

---

### Task 16: Docker + Final Configuration

**Files:**
- Create: `docker-compose.yml`
- Create: `Dockerfile`
- Create: `ecosystem.config.js` (PM2 config)

- [ ] **Step 1: Create Dockerfile**

```dockerfile
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
version: "3.8"
services:
  poetry-gateway:
    build: .
    ports:
      - "8080:8080"
    env_file:
      - .env
    restart: unless-stopped

  chinese-poetry-api:
    image: palemoky/chinese-poetry-api:latest
    ports:
      - "1279:1279"
    restart: unless-stopped
```

- [ ] **Step 3: Create PM2 ecosystem config**

`ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "poetry-gateway",
      script: "node_modules/.bin/next",
      args: "start -p 8080",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
```

- [ ] **Step 4: Update next.config.ts for standalone output**

Ensure `next.config.ts` has:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Docker, PM2, and docker-compose configuration"
```

---

### Task 17: Final Verification — Build + TypeScript Check

- [ ] **Step 1: Run TypeScript type check**

```bash
cd e:/workspace/claw/api_poetry
pnpm tsc --noEmit
```

Expected: No errors. If errors exist, fix them.

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: Successful Next.js build with no errors.

- [ ] **Step 3: Generate Prisma client**

```bash
npx prisma generate
```

Expected: Prisma client generated successfully.

- [ ] **Step 4: Verify all file paths exist**

```bash
ls app/api/v1/home/route.ts
ls app/api/v1/discover/route.ts
ls app/api/v1/poems/route.ts
ls app/api/v1/poems/random/route.ts
ls app/api/v1/poems/[id]/route.ts
ls app/api/v1/authors/route.ts
ls app/api/v1/authors/[id]/route.ts
ls app/api/v1/categories/route.ts
ls app/api/v1/search/route.ts
ls app/api/v1/recommend/route.ts
ls app/api/v1/quote/route.ts
ls app/api/v1/config/route.ts
ls app/api/v1/ai/analyse/route.ts
ls app/api/v1/ai/ask/route.ts
ls app/api/v1/ai/translate/route.ts
ls app/api/v1/user/login/route.ts
ls app/api/v1/user/register/route.ts
ls app/api/v1/user/profile/route.ts
ls app/api/v1/favorites/route.ts
ls app/api/v1/favorites/[id]/route.ts
ls app/api/v1/history/route.ts
```

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: final verification - TypeScript check and build passed"
```

---

## Implementation Order

1. Task 1: Project scaffolding
2. Task 2: Shared infrastructure (errors, logger, config)
3. Task 3: Database (Prisma schema + client)
4. Task 4: Cache + Auth
5. Task 5: External clients
6. Task 6: Poem module
7. Task 7: Author module
8. Task 8: Search + aggregate modules
9. Task 9: Core route handlers
10. Task 10: Error handler + middleware
11. Task 11: User module
12. Task 12: User route handlers
13. Task 13: Favorite module
14. Task 14: History module + route handlers
15. Task 15: AI module
16. Task 16: Docker + final config
17. Task 17: Final verification
