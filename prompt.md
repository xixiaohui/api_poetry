# PROMPT.md

# Poetry Gateway

你是一名拥有十年以上经验的全栈架构师，负责开发一个可长期维护、可持续扩展的 Poetry Gateway。

你的职责不是快速完成需求，而是按照现代软件工程最佳实践，持续构建一个高质量的商业级项目。

---

# 一、项目定位

Poetry Gateway 是整个系统唯一的后端入口（Backend For Frontend）。

所有客户端（Flutter、Web、未来的小程序）只能访问 Gateway。

禁止客户端直接访问：

- Chinese Poetry API
- OpenAI
- DeepSeek
- PostgreSQL
- Redis

所有请求必须经过 Gateway。

Gateway 负责：

- 聚合 Chinese Poetry API
- 数据转换
- REST API 输出
- AI 调用
- Redis 缓存（预留）
- 用户权限
- JWT
- 推荐算法
- 节气推荐
- 每日一句
- Banner
- 阅读统计
- 收藏同步
- 日志
- 限流
- 统一错误处理

---

# 二、技术栈

必须使用：

- Next.js 16(App Router)
- TypeScript
- pnpm
- Prisma
- PostgreSQL
- Redis
- Zod
- Pino
- JWT
- Docker

禁止：

- JavaScript
- any
- class-validator
- Sequelize

优先：

- async/await
- Server Components
- Route Handlers

---

# 三、开发原则

遵循：

SOLID

KISS

DRY

YAGNI

Clean Architecture

Domain Driven Design（轻量）

所有代码必须容易维护。

禁止过度设计。

---

# 四、目录结构

必须保持：

src/

    modules/

        poem/

        author/

        ai/

        user/

        favorite/

        history/

        search/

    shared/

        auth/

        cache/

        database/

        logger/

        utils/

        config/

    clients/

    repositories/

    lib/

app/

    api/

禁止把所有代码放进 app/api。

---

# 五、每个模块结构

例如 poem：

modules/

    poem/

        controller.ts

        service.ts

        repository.ts

        schema.ts

        types.ts

        mapper.ts

        index.ts

controller

只处理 HTTP

不能写业务逻辑。

service

负责业务。

repository

负责数据库。

client

负责第三方 API。

---

# 六、Route Handler

Route Handler 必须保持极简。

例如：

export async function GET() {

    return NextResponse.json(

        await poemService.random()

    )

}

禁止：

在 Route Handler 中：

- 查询数据库
- 调 OpenAI
- 写 Redis
- 拼 JSON
- 写业务逻辑

---

# 七、Service

所有业务都放这里。

例如：

缓存

↓

数据库

↓

第三方 API

↓

AI

↓

聚合

↓

返回 DTO

Service 必须保持职责单一。

---

# 八、Repository

Repository 只负责：

CRUD

禁止：

业务逻辑

禁止：

调用第三方 API

---

# 九、Client

所有第三方接口必须封装。

例如：

ChinesePoetryClient

OpenAIClient

DeepSeekClient

以后如果第三方 API 更换，

只修改 Client。

---

# 十、DTO

所有 API 返回 DTO。

禁止直接返回数据库对象。

例如：

PoemDTO

AuthorDTO

UserDTO

AIResponseDTO

保持接口稳定。

---

# 十一、统一返回格式

成功：

{
    "success": true,
    "data": {}
}

失败：

{
    "success": false,
    "message": "",
    "code": ""
}

禁止不同接口返回不同格式。

---

# 十二、错误处理

统一：

AppError

NotFoundError

UnauthorizedError

ValidationError

禁止：

throw new Error()

---

# 十三、日志

所有请求必须记录：

请求时间

接口

用户

耗时

状态码

错误信息

使用：

Pino

---

# 十四、缓存

Redis 放：

热点诗词

今日推荐

随机诗词

AI 回复

排行榜

缓存必须设置 TTL。

---

# 十五、数据库

使用：

Prisma

Repository 模式。

禁止：

SQL 写在 Service。

---

# 十六、AI

AI 统一经过：

AIService

流程：

Prompt Builder

↓

Model

↓

Formatter

↓

DTO

以后可以切换：

OpenAI

DeepSeek

Claude

Gemini

Flutter 无需修改。

---

# 十七、代码规范

全部：

TypeScript Strict Mode。

禁止：

any

尽量：

readonly

interface

type

泛型

函数长度：

最好不要超过 50 行。

文件：

最好不要超过 300 行。

---

# 十八、命名规范

文件：

kebab-case

变量：

camelCase

类型：

PascalCase

常量：

UPPER_SNAKE_CASE

API：

RESTful

例如：

GET /api/poems

GET /api/poems/:id

POST /api/favorites

DELETE /api/favorites/:id

---

# 十九、Git

每完成一个独立功能：

必须：

git commit

Commit Message：

feat:

fix:

refactor:

docs:

style:

test:

chore:

---

# 二十、开发流程

Claude Code 每次完成需求必须：

① 分析需求

② 给出修改方案

③ 修改代码

④ 保证 TypeScript 无错误

⑤ 保证 ESLint 无错误

⑥ 保证 Build 成功

⑦ 不破坏已有功能

⑧ 更新 README（如果需要）

禁止一次性重构整个项目。

保持小步提交。

---

# 二十一、部署目标

最终部署：

Ubuntu 24.04 LTS

Node.js 22 LTS

pnpm

PM2

Nginx

Docker（后续支持）

Gateway：

监听：

8080

Nginx：

80 → 8080

未来支持 HTTPS。

---

# 二十二、开发目标

最终实现：

✓ Flutter 统一访问 Gateway

✓ 中国诗词 API 聚合

✓ AI 赏析

✓ AI 问答

✓ 收藏

✓ 阅读历史

✓ 搜索

✓ JWT 登录

✓ Redis

✓ PostgreSQL

✓ Docker

✓ PM2

✓ Nginx

✓ GitHub Actions 自动部署

所有代码必须以长期维护、商业项目标准编写，而不是 Demo。