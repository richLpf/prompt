# Prompt 管理（Next.js + Ant Design）

一个数据驱动的提示词/资讯目录站点，包含文生文、文生图、文生视频三大分类及 AI 资讯列表。项目以静态数据源为核心，方便接入真实 API 或通过 AI 生成接口实现动态化。

## 技术栈

- Next.js 14（App Router 之前的 `pages` 目录写法）
- React 18 + TypeScript 5
- Ant Design 5（UI 组件与主题定制）
- React Markdown（文章详情渲染）
- PNPM / npm / yarn（任选其一）

## 快速开始

```bash
# 安装依赖（推荐 PNPM）
pnpm install

# 本地开发
pnpm dev

# 生产构建 & 启动
pnpm build && pnpm start

# 代码检查
pnpm lint
```

## 目录结构

```
prompt/
├── components/          # UI 组件：PromptCatalog、AIQuickLinks
├── data/                # 静态数据与类型（prompts、articles、types）
├── pages/               # Next.js 页面（首页、资讯列表、资讯详情）
├── styles/              # 全局样式与响应式规则
├── package.json         # 脚本、依赖
├── pnpm-lock.yaml
└── tsconfig.json
```

## 业务概览

- `pages/index.tsx`：主体 Prompt 目录页，顶部菜单切换分类或跳转资讯。
- `components/PromptCatalog.tsx`：实现搜索、标签/职业筛选、卡片展示、复制提示词、详情抽屉等交互逻辑。
- `components/AIQuickLinks.tsx`：根据当前分类列出常用 AI 平台快捷入口。
- `pages/news.tsx`：AI 资讯聚合，含分类 Tag、分页、浏览量等信息。
- `pages/news/[id].tsx`：资讯详情，支持 Markdown 渲染、返回列表、顶部 Meta 信息。
- `data/*.ts`：以纯数据维护 Prompt/Article 列表，便于后续替换为 API。

## 数据模型

```startLine:endLine:data/types.ts
export type PromptCategory = 'text' | 'image' | 'video';

export interface PromptItem {
  id: string;
  category: PromptCategory;
  title: string;
  description: string;
  example?: string;
  imageUrl?: string;
  videoUrl?: string;
  tags: string[];
  source?: string;
  professions?: string[];
}
```

```startLine:endLine:data/articles.ts
export interface Article {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown
  category: string; // 见 articleCategories
  publishDate: string; // YYYY-MM-DD
  views: number;
  author?: string;
}
```

这些类型已经在 `data/prompts.ts` 中汇总导出，页面和组件可直接复用。

## UI 与样式

- 全局主题在 `pages/_app.tsx` 中通过 `ConfigProvider` 设置（主色 `#722ed1`、圆角、字体）。
- `styles/globals.css` 定义筛选面板、卡片、AI 快捷入口、Markdown 样式，以及大量移动端适配规则（Header、Drawer、分页等）。
- `_document.tsx` 额外引入了 Inter 字体，并设置 `lang="zh-CN"`。

## API/服务化建议

为了让 AI 快速生成对应接口，可参考下列 REST 设计。实际实现时可直接替换 `data/*.ts` 为 API 调用：

| 资源 | 用途 | 建议字段 |
| --- | --- | --- |
| `GET /api/categories` | 列出文生文/图/视频分类 | `key`, `label`, `description` |
| `GET /api/prompts` | 获取提示词（支持 query） | `category`, `tags`, `professions`, `keyword`, `page`, `pageSize` |
| `GET /api/prompts/{id}` | 单条提示词详情 | `PromptItem` |
| `GET /api/articles` | AI 资讯列表 | `category`, `page`, `pageSize`，返回分页元信息 |
| `GET /api/articles/{id}` | 资讯详情 | `Article`（Markdown 内容） |

GraphQL 方案可定义 `Prompt`, `Article`, `Category` 三类类型，提供 `prompts(filter: PromptFilterInput)` 与 `articles(filter: ArticleFilterInput)` 查询，同时暴露 `prompt(id: ID!)`、`article(id: ID!)`。

**接入步骤示例：**
1. 抽离 `data/prompts.ts`、`data/articles.ts` 调用层（例如 `services/promptService.ts`）。
2. 在 `PromptCatalog` 中替换为 `SWR`/`React Query` 获取 API 数据，保留现有筛选 UI。
3. `news` 页面同理，使用接口分页数据并更新 `Pagination` 的 `total`、`current`。

## 后端实现方案（Golang + Gorm + MySQL）

> 目标：满足 AI 平台管理、提示词复制行为统计去重，以及带过滤/分页能力的提示词列表接口，方便与现有前端快速对接。

### 核心数据表

| 表名 | 关键字段 | 说明 |
| --- | --- | --- |
| `ai_platforms` | `id (PK)`, `title`, `ai_chat_type` (`ENUM(text_generation,image_generation,video_generation)`), `link`, `sort_order`, `created_at`, `updated_at`, `is_active` | 管理 AI 平台入口，按 `sort_order` 升序返回，供 `AIQuickLinks` 使用 |
| `prompts` | `id (PK)`, `category` (`ENUM(text,image,video)`), `title`, `description`, `example`, `image_url`, `video_url`, `source`, `created_at`, `updated_at`, `copy_count` | 提示词主表 |
| `prompt_tags` | `id`, `prompt_id (FK)`, `tag` | 提示词-标签多对多，可用 `prompt_tag_relations` 进一步抽象 |
| `prompt_professions` | `id`, `prompt_id (FK)`, `profession` | 存储适用职业 |
| `prompt_copy_logs` | `id`, `prompt_id (FK)`, `ip_hash`, `user_agent_hash`, `created_at` | 复制日志，`UNIQUE(prompt_id, ip_hash, user_agent_hash)` 去重 |

### Gorm 模型示例

```go
type AIPlatform struct {
  ID         uint      `gorm:"primaryKey"`
  Title      string    `gorm:"size:64;not null"`
  AIChatType string    `gorm:"type:enum('text_generation','image_generation','video_generation');not null"`
  Link       string    `gorm:"size:255;not null"`
  SortOrder  int       `gorm:"default:0"`
  IsActive   bool      `gorm:"default:true"`
  CreatedAt  time.Time
  UpdatedAt  time.Time
}

type PromptCopyLog struct {
  ID            uint      `gorm:"primaryKey"`
  PromptID      uint      `gorm:"not null;index"`
  IPHash        string    `gorm:"size:64;not null"`
  UserAgentHash string    `gorm:"size:128;not null"`
  CreatedAt     time.Time
}
```

> 拦截重复复制：对 `prompt_copy_logs` 新建联合唯一索引 `uniq_prompt_copy (prompt_id, ip_hash, user_agent_hash)`。写入前使用 `sha256` 对真实 IP（考虑 `X-Forwarded-For`）及 `User-Agent` 进行哈希，捕获重复错误即可静默忽略。

### REST 接口

| Method & Path | 功能 | 说明 |
| --- | --- | --- |
| `GET /api/platforms` | 获取 AI 平台 | 支持 `ai_chat_type` 过滤；按 `sort_order` + `id` 排序；仅返回 `is_active=true` |
| `POST /api/platforms` | 新增平台 | 后台用途，校验 `ai_chat_type` 枚举 |
| `PUT /api/platforms/{id}` | 更新 | 支持修改标题/分类/链接/排序/启用状态 |
| `DELETE /api/platforms/{id}` | 删除/停用 | 建议软删除，设置 `is_active=false` |
| `GET /api/prompts` | 列表 | 查询参数：`search`（标题/描述/示例模糊）、`category`、`tags`（逗号分隔）、`professions`（逗号分隔）、`page`、`pageSize`（默认 10，最大 50）；返回 `{items,total,page,pageSize}` |
| `GET /api/prompts/{id}` | 详情 | 返回提示词及标签、职业、复制数 |
| `POST /api/prompts/{id}/copy` | 复制统计 | 从请求中获取 IP、UA，生成哈希并尝试写入 `prompt_copy_logs`；若成功再 `copy_count = copy_count + 1`，返回最新计数 |

### 查询与分页

- **模糊搜索**：`WHERE title LIKE ? OR description LIKE ? OR example LIKE ?`，参数为 `%search%`。
- **标签/职业筛选**：使用 `EXISTS` 子查询或 `JOIN prompt_tags` / `prompt_professions`，对每个过滤列表应用 `IN`。
- **分页**：`LIMIT pageSize OFFSET (page-1)*pageSize`，默认 `page=1`、`pageSize=10`，并返回 `total` 便于前端分页器显示。

### 复制日志处理

1. 解析 `clientIP`（优先 `X-Forwarded-For`）。
2. `ipHash = sha256(clientIP)`，`uaHash = sha256(User-Agent)`。
3. 开启事务，尝试 `INSERT` `prompt_copy_logs`。
4. 若成功，`UPDATE prompts SET copy_count = copy_count + 1 WHERE id = ?`。
5. 捕获唯一约束错误则直接返回 `copied=false`，无需重复计数。

### 与前端的衔接

- `AIQuickLinks` 改为请求 `/api/platforms?ai_chat_type=text_generation` 等接口，数据结构一致。
- `PromptCatalog` 的筛选表单映射到 `GET /api/prompts` 的 query 参数；分页按钮使用响应 `total` 和 `pageSize`。
- “复制”按钮在调用 `POST /api/prompts/{id}/copy` 后根据返回状态展示成功提示或忽略重复。

## 开发注意事项

- 组件使用大量浏览器 API（剪贴板、window 尺寸），需确保只在客户端执行。
- `PromptCatalog` Drawer 宽度监听 `resize`，SSR 环境需守护 `typeof window !== 'undefined'`（已处理）。
- 如果改造为国际化站点，注意 Ant Design `ConfigProvider` + `next/head` 的多语言配置。
- 建议对 `data/` 改造时补充单元测试或 mock，防止分类/标签丢失导致筛选为空。

## 下一步可选优化

- 接入真实后台接口或 Edge Functions，结合上文 API 设计。
- 引入搜索引擎（Algolia/Elastic）或向量检索提升提示词搜索体验。
- 增加用户登录、收藏、评分等交互，为提示词推荐算法提供数据。
- 将 `articles` Markdown 改为 MDX，支持更丰富的内容组件。

---

如需让 AI 自动生成接口或文档，只需提供本 README 中的数据模型与资源描述，即可快速推理出 CRUD API、GraphQL Schema 或 OpenAPI 规范。***

