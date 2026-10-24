# Jarvis Hub

[English](README.md) | 简体中文

基于 Astro 5、TypeScript 和 Tailwind CSS 的个人作品集与技术写作站点。界面采用简洁的排版、结构化列表和响应式布局。视觉规范见 [DESIGN.md](DESIGN.md)。

## 功能

- 首页展示精选项目、近期公开文章，以及由外部服务提供的 GitHub 贡献热力图。
- 博客支持分类、相关文章、系列导航、预计阅读时间、文章目录和阅读进度。
- 阅读增强包括代码复制、行号、指定行高亮、代码折叠、图片说明、图片放大和表格横向滚动。
- 项目列表与详情页；生产环境排除已归档项目。
- 数据驱动的简历，支持打印和另存为 PDF，并提供 About 与开源贡献归档页。
- 基于 Fuse.js 的客户端模糊搜索，覆盖标题、摘要、别名、标签、分类和正文，支持 `Cmd/Ctrl + K` 快捷键。
- 可选的 Supabase 首页浏览量和基于 GitHub Discussions 的 Giscus 评论。
- 静态 RSS、站点地图、robots.txt 和页面级 SEO 元数据。
- GitHub Actions 检查、Pages 部署，以及每四小时运行的贡献快照同步。

## 个性化配置

先阅读[配置指南](docs/personalization.zh-CN.md)。个人资料放在 `src/config/profile.mjs`，站点设置放在 `src/config/site.mjs`，可选功能放在 `src/config/integrations.mjs`，文章和项目放在 `src/content/`。

这些配置与数据是个人站点和未来模板之间的主要差异；页面、组件、脚本和工作流共用同一套实现。

## 本地开发

CI 使用 Node.js 22 和 pnpm 10.14.0。建议本地使用相同版本，保持执行结果一致。

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

打开 `http://localhost:4321`。本地开发不强制要求配置环境变量：

| 变量                                                 | 用途                                                  |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `PUBLIC_SUPABASE_URL`、`PUBLIC_SUPABASE_ANON_KEY`    | 可选的首页浏览量，通过 `increment_page_view` RPC 更新 |
| `PUBLIC_GISCUS_REPO_ID`、`PUBLIC_GISCUS_CATEGORY_ID` | 评论仓库与分类的 ID                                   |

功能开关，以及 Giscus 的仓库、分类、主题和语言位于 `src/config/integrations.mjs`。功能开启且配置完整时才启用对应服务；没有环境变量也能构建站点。

启用 GitHub Discussions 并安装 Giscus GitHub App 后，可从 [giscus.app](https://giscus.app) 获取 ID。生产配置通过 GitHub Actions 仓库变量提供，由 `.github/workflows/deploy.yml` 和 `.github/workflows/sync-contributions.yml` 传入构建过程。

`PUBLIC_*` 变量可能出现在浏览器中，因此 Supabase 只能使用匿名密钥，不能使用 service-role 密钥。本仓库不负责创建 Supabase 数据库和 RPC，需要另行配置相应权限。缺少服务配置时，浏览量保持隐藏，生产环境不显示评论区；开发环境会显示评论配置提示。

## 内容管理

```bash
pnpm new:post --title "My New Post" --slug frontend/my-new-post --template mdx
pnpm new:post --title "Series Part One" --series "My Series" --series-order 1
pnpm new:project --title "My Project"
```

交互式终端中不传参数会进入逐项输入；非交互调用必须提供 `--title`。两个命令共用 `scripts/new-content.mjs`。Slug 可以包含目录，例如 `rec/my-post`，不需要带文件扩展名；脚本自动创建父目录，已有同名 Markdown 或 MDX 时拒绝覆盖。非法参数、模板类型、路径和系列序号会明确报错。

文件始终创建在本仓库中，不受执行命令时的工作目录影响；日期使用 `siteConfig.timeZone`。新文章默认为草稿；新项目默认为 `in-progress`，会被纳入生产构建。生成内容的默认语言为 `zh-CN`，使用其他语言时修改 frontmatter；项目模板包含 `githubUrl` 和别名字段。发布前应先检查内容。使用 `pnpm new:post --help` 或 `pnpm new:project --help` 查看参数。

内容 schema 位于 `src/content/config.ts`：

| 集合 | 字段                                                                                                                                                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 博客 | `title`、至少 10 个字符的 `description`、`commentId`、`language`、`publishDate`，以及可选的 `updatedDate`、`tags`、`series`、`seriesOrder` 和 `draft`                        |
| 项目 | `title`、至少 10 个字符的 `summary`、`language`、`status`、`roles`、`stack`、`featured`、`publishDate`，以及可选的 `updatedDate`、`externalUrl`、`githubUrl` 和 `coverImage` |

两个集合都支持可选英文标题和摘要：`titleEn` 搭配 `descriptionEn` 或 `summaryEn`。首页优先使用这些字段，但这不是完整的多语言翻译系统。阅读时间根据正文计算，不需要在 frontmatter 中维护。

项目列表展示名称、简介、Logo 和配置的外部链接。`externalUrl` 表示官网，`githubUrl` 表示可选的 GitHub 仓库：

```yaml
externalUrl: "https://example.com"
githubUrl: "https://github.com/owner/repository"
```

GitHub 链接展示图标和 `owner/repository`，不显示完整 URL。省略字段或设为空字符串即可隐藏链接；尚未公开的官网也可以留空，不会输出占位链接。

两个集合都支持搜索别名，例如 `aliases: ["WePeiYang-Flutter"]`。搜索会索引原文与英文标题、摘要以及别名。项目搜索结果优先显示与项目页面一致的英文名称和简介；文章结果保持原始标题。命中别名时，会在结果标题下方展示匹配名称。别名不会改变内容 URL。

开发环境的路由、列表、RSS 和搜索包含草稿文章，项目详情路由与搜索包含归档项目。首页和项目列表始终排除归档项目。生产环境的路由与索引排除草稿和归档项目。目前不按未来发布日期自动控制发布。

截至 2026-10-16，65 篇文章全部为草稿，因此生产构建没有文章详情页和 RSS 条目，搜索仅包含公开项目。草稿过滤不会隐藏公开仓库中的源文件；将 `draft` 改为 `false` 前，应检查内容是否适合公开。

### 站内搜索

搜索覆盖文章和项目的标题、摘要、标签、目录分类及正文，包括代码标识符。元数据匹配优先，正文命中会展示附近片段，通过安全的 DOM 文本节点高亮关键词。每次最多展示 20 条结果。

从导航或使用 `Cmd/Ctrl + K` 打开搜索。方向键切换选中项，Enter 打开结果；Escape 或关闭按钮关闭弹窗并恢复焦点。搜索索引在首次打开时加载，当前页面内复用，加载失败后可以重试。输入过程尊重中文输入法的组合状态。生产搜索遵循统一的草稿与归档过滤规则。

### 提示块

在 Markdown 或 MDX 中，使用顶层引用块编写 GitHub 风格提示：

```markdown
> [!NOTE]
> 简短定义或补充说明。

> [!TIP]
> 实用方法或建议。

> [!WARNING]
> 负采样会改变训练分布。
> 评估集应尽量接近真实分布。
```

也支持 `IMPORTANT` 和 `CAUTION`。标记需要单独占一行；使用空的引用行 `>` 开始新段落。正文可包含列表、代码块和公式。普通引用保持原有样式。

提示块通过 `rehype-github-alert` 在构建时生成，使用本地 CSS，不需要客户端 JavaScript。经过安全清理的 PR 正文渲染器也支持相同语法。

### Mermaid 图表

在 Markdown 或 MDX 中使用标记为 `mermaid` 的围栏代码块：

````markdown
```mermaid
flowchart LR
  accTitle: 推荐流程
  accDescr: 候选内容依次经过召回、排序和重排序。
  A[候选池] --> B[召回] --> C[排序] --> D[重排序]
```
````

图表在浏览器中渲染，Mermaid 依赖随项目打包，仅在页面存在图表时加载。添加 `accTitle` 和 `accDescr` 可以提供无障碍说明。宽图支持横向滚动；JavaScript 被禁用或渲染失败时，仍保留可读源码。

PR 正文渲染器也支持相同的代码块语法。HTML 标签和交互式链接被禁用。

### 数学公式

Markdown 和 MDX 支持 `$...$` 行内公式，以及用独立行 `$$...$$` 包裹的块级公式：

```markdown
预测概率为 $p = \sigma(z)$。

$$
p = \frac{1}{1 + e^{-z}}
$$
```

公式通过 KaTeX 在构建时渲染，样式和字体由本站提供。长公式在窄屏下局部横向滚动。可执行代码、文本示意图和实验输出应保留在代码块中；正文中的普通美元符号使用 `\$` 转义。PR 正文同样支持公式。

### 图片与代码块

文章脚本为普通 Markdown 图片添加懒加载、基于 alt 文本的图片说明和点击放大功能。文章直接使用标准 Markdown 图片语法，不需要额外维护图片组件。

代码块由 Expressive Code 和官方行号、折叠插件处理，配置集中在 `ec.config.mjs`。使用 `title`、`showLineNumbers`、`{2}` 和 `collapse={3-4}` 设置标题、行号、高亮和折叠。超过 24 行时保留前 24 行，其余自动折叠；显式折叠范围优先：

````md
```ts title="src/example.ts" showLineNumbers {2} collapse={3-4}
const first = true;
const highlighted = true;
const setup = true;
const example = true;
```
````

## 导入别名

Astro 直接读取 `tsconfig.json` 中的别名，不需要在 Vite 配置中重复维护。源码内部导入使用 `@config/*`、`@components/*`、`@layouts/*`、`@lib/*`、`@data/*`、`@scripts/*`、`@styles/*`、`@content/*`、`@assets/*` 和 `@pages/*`，包括动态导入与浏览器脚本。

```ts
import { getPosts } from "@lib/content";
import { profile } from "@config/profile.mjs";
```

Node 直接执行的配置文件、自动化脚本和测试继续使用带扩展名的相对路径。原生 Node 不会解析 TypeScript `paths` 别名。由 Node 测试直接导入的叶子模块，例如 `src/scripts/search.ts` 和 `src/lib/seo.ts`，其内部依赖也使用显式相对路径。

## 组件组织

组件按调用场景分组：`site/` 放共享布局组件，`blog/` 放文章详情组件，`contributions/` 放完整与精简贡献视图。页面专属布局保留在 `src/pages/`，不为没有独立职责的内容增加包装组件。

`Markdown.astro` 统一正文排版。传入原始 `content` 字符串时，会进行外部 Markdown 安全清理；已由 Astro 编译的内容通过插槽传入。PR 正文采用紧凑排版，博客和项目详情使用标准排版。共享展示组件不会绕过外部 HTML 的安全清理。

未使用的 `ArticleImage` 已移除；文章图片采用标准 Markdown 语法和现有客户端增强脚本。

## 业务逻辑模块

`src/lib/` 按职责组织。手写设置放在 `src/config/`，存储的快照放在 `src/data/`，DOM 交互放在 `src/scripts/`。

| 模块             | 职责与入口                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------- |
| `content/`       | `index.ts` 查询 Astro 内容集合；`select.ts` 放纯筛选与排序规则；`blog.ts` 放文章规则；`resume.ts` 组合简历数据   |
| `markdown/`      | `plugins.mjs` 共享 GFM、公式、提示块和 Mermaid 扩展；`render.mjs` 安全渲染外部 Markdown；`text.mjs` 提取搜索文本 |
| `search/`        | `index.ts` 实现 Fuse 搜索与摘要片段；`metadata.ts` 在构建时整理标题、简介和别名，不导入 Fuse                     |
| `contributions/` | `index.ts` 读取快照并提供仓库汇总和日期；`select.ts` 放纯筛选规则与记录类型                                      |
| `integrations/`  | `resolve.mjs` 解析设置和同步规则，不依赖 Astro 或浏览器；`index.ts` 读取环境变量；`supabase.ts` 初始化可选客户端 |
| `seo.ts`         | 生成 canonical URL 和分享元数据，保持独立文件                                                                    |

调用方使用具体入口，不通过全局聚合文件导入所有模块。Astro 页面使用 `@lib/content`、`@lib/contributions` 等对应路径；测试与 Node 命令使用带扩展名的显式路径导入纯模块。

`content/resume.ts` 组合内容查询和贡献数据，内容查询入口不反向依赖简历模块。浏览器搜索只导入搜索引擎，不加载 Markdown 渲染或 Astro 内容查询。

两条 Markdown 渲染管线共享语法插件，但保留各自的信任边界：作者编写的 Markdown/MDX 由 Astro 编译并进行代码高亮；字符串内容调用 `renderExternalMarkdown()`，先清理作者 HTML，再由可信扩展生成公式和提示块。搜索文本提取不渲染 HTML。

## 站点配置与页面元数据

`src/config/site.mjs` 管理站点名称、地址、导航、默认分享图片、网站图标和 RSS 默认值，并从个人资料派生邮箱与 GitHub 地址。Astro 配置、页面元数据和贡献自动化读取同一份设置；该模块不依赖 Astro 运行时或浏览器。

`src/lib/seo.ts` 提供 canonical URL，以及完整的 Open Graph 和 Twitter 元数据。页面通过 `Layout` 覆盖标题、摘要、分享图、文章日期、标签和 Twitter 设置；没有单独分享图时，使用现有 Logo。

## 客户端初始化与测试

`Search.astro` 和 `Toc.astro` 管理自身结构与样式，打包后的脚本调用 `src/scripts/` 中的 `initSearch` 和 `initToc`。测试直接导入这些模块并注入浏览器依赖，不需要从 Astro 源码提取或转译脚本。

搜索测试覆盖动画、焦点恢复（包括移动菜单入口）和减少动态效果偏好；目录测试覆盖重复标题、高亮跟踪和局部滚动。

移动菜单关闭时处于 inert 状态。打开菜单会启用内部链接并移入焦点；Escape 关闭菜单并恢复菜单按钮焦点。从移动菜单打开搜索后，关闭搜索会将焦点还给可见的菜单按钮。切换到桌面导航时，移动菜单会关闭，必要时将焦点移到桌面链接。

## 样式

- `src/styles/tokens.css` 是全站颜色和字体的来源。CSS 使用 `var(--color-accent)`，透明度使用 `rgb(var(--color-accent-rgb) / 0.1)` 等 RGB 通道写法。Tailwind 颜色读取相同通道，支持 `bg-accent-cyan/10` 等透明度修饰符。
- `tailwind.config.mjs` 将 token 映射到工具类，并启用 Typography 默认排版；站点正文覆盖样式放在 `src/styles/prose.css`。
- `src/styles/global.css` 管理全局基础规则和共享装饰背景。页面与组件布局保留在局部 Astro 样式中。
- `src/styles/prose.css` 管理 `.prose`、紧凑的 `.prose--compact`，以及共享的 KaTeX、Mermaid 和提示块样式。
- `src/styles/article.css` 管理博客专属图片说明、表格滚动和标题锚点，限定在 `.article-content` 下，仅由博客详情页导入。
- Mermaid 从计算后的 CSS token 读取配色和字体。Shiki 和 KaTeX 保留各自的语法颜色与数学字体；简历的打印配色和图片灯箱遮罩保留局部样式。

## 共享内容查询

`src/lib/content/` 统一管理草稿与归档可见性、按发布时间倒序排列、近期文章和精选项目。纯筛选规则放在 `select.ts`；`index.ts` 负责加载 Astro 内容集合并应用这些规则。首页、博客与项目列表/详情、RSS、搜索和简历都调用这一层，不分别查询集合。

- `getPosts()` 仅在开发环境默认包含草稿，可以显式传入 `includeDrafts` 覆盖。
- `getProjects()` 仅在开发环境默认包含归档项目；项目列表传入 `includeArchived: false`，始终只展示公开项目。
- `getRecentPosts(limit)` 使用相同的文章可见性规则。
- `getFeaturedProjects(limit?)` 始终排除归档项目，包括开发环境，同时供首页和简历使用。
- `src/lib/content/blog.ts` 管理相关文章排序、阅读时间和系列导航。
- `src/scripts/article.ts` 初始化阅读进度、图片预览、表格、标题锚点和分享功能，由详情页的 Astro 脚本导入并打包。
- `src/components/site/` 管理共享页头、页脚、搜索弹窗和浏览量组件。计数器自行延迟初始化 Supabase，页面只需向布局传入 `viewCounterSlug`。
- `src/scripts/mermaid.ts` 渲染 `rehype-mermaid` 的 `pre-mermaid` 模式提前生成的图表容器，不依赖 Expressive Code，从布局初始化，仅在存在未处理的图表代码块时加载 Mermaid；失败时保留源码。构建插件在 Node 中需要 Playwright 包，但此模式不启动浏览器，也不需要安装浏览器程序。

## 个人资料与简历

简历采用紧凑单栏布局，参考 [YAMLResume Calm](https://yamlresume.dev/docs/layouts/html/templates/calm)。打印/另存为 PDF 操作位于底部，打印时自动隐藏。这是 Astro 页面实现，没有集成 YAMLResume CLI。

- 在 `src/config/profile.mjs` 维护个人资料、首页/About 文案、工作经历、教育和技能。这些信息由作者明确编写，不从 GitHub 活动推断。
- `src/lib/content/resume.ts` 从精选且未归档的项目中生成简历项目部分。名称和简介优先使用英文元数据，否则使用原文；技术栈和链接与项目页保持一致。
- 开源贡献部分来自贡献快照，包括仓库、合并 PR 数量，以及各仓库最近一次合并的 PR 标题和链接，不单独维护另一份贡献简介。
- 贡献同步每四小时检查一次，元数据变化时更新快照并重新构建，因此简历遵循相同更新周期。构建不需要调用 GitHub API，部署仍需通过完整验证。
- 首页、About、简历、联系链接和人物元数据读取同一份个人资料。站点名称、地址、导航和时区仍由 `src/config/site.mjs` 管理。

## 贡献同步

About 从 `src/data/contributions.generated.json` 读取 GitHub 元数据：仓库、PR 编号、原始标题、创建与合并时间、标签、正文、变更统计和讨论数量。该文件由同步脚本维护。

About 展示贡献总数和最近六条合并 PR，并链接到完整归档。`/contributions` 按合并时间倒序展示全部记录，支持仓库筛选、分页和展开 PR 正文，默认每页六条。正文使用经过安全清理的 GitHub 风格 Markdown，支持表格、任务列表和代码块。

选中的仓库与页码保存在 URL 中，切换仓库会回到第一页。日期使用 `siteConfig.timeZone`，本站为 `Asia/Shanghai`。快照包含 `author` 和 PR 记录，不存储同步时间。仅在作者与配置的 GitHub 账号一致时显示记录；换账号后，下次同步生成新账号的快照。暂时被搜索遗漏的记录仅在同一账号下保留。

`Sync merged PR contributions` 每四小时运行一次，对应上海时间 00:00、04:00、08:00、12:00、16:00、20:00，也可以从 Actions 页面手动触发。

CLI 和工作流都读取 `src/config/integrations.mjs` 的 `contributions.enabled` 与 `contributions.sync`。关闭同步或 GitHub 用户名为空时，不发送 API 请求；工作流也跳过依赖安装、验证、提交和部署。脚本查询 `profile.githubUsername` 创建的已合并公开 PR，排除该账号自己的仓库，校验真实合并时间，并在搜索暂时遗漏时保留历史记录。API 错误或不完整结果会使同步失败，不修改快照。

元数据变化时，工作流使用生产配置执行一次 `pnpm verify`，仅将生成的 JSON 提交到默认分支，并把已验证的 `dist/` 上传为 Pages 产物。随后通过 `artifact-only` 模式调用部署工作流，直接部署同一份产物，不重复构建或重新检出分支。

启用的手动同步即使数据未变化，也会验证、构建和部署，便于重试失败的部署。定时同步遇到数据未变化时，则跳过验证、产物上传和部署。工作流使用内置 `GITHUB_TOKEN`，不需要个人令牌；仓库规则必须允许机器人向默认分支推送。定时工作流必须存在于默认分支，GitHub 可能延迟定时任务，或在公开仓库连续 60 天无活动后禁用定时运行。

本地执行 `pnpm sync:contributions` 可刷新快照；可选的 `GH_TOKEN` 用于提高 API 限额。数据未变化时不会产生提交。

## 维护脚本

根目录 `scripts/` 只保留日常维护用的 Node 命令：`new-content.mjs` 创建文章和项目，`sync-contributions.mjs` 更新对应账号的贡献快照。一次性的 `fix-mdx-*` 迁移脚本已删除。浏览器交互仍放在 `src/scripts/`，不作为仓库维护命令运行。

## 项目结构

```text
.github/workflows/    # 检查、Pages 部署、贡献同步
docs/                # 配置与使用指南
public/              # 静态图片和网站图标
scripts/             # 内容生成与贡献同步
tests/               # 内容规则、可选功能、同步和交互逻辑回归测试
src/
  components/
    site/            # Header、Footer、Search、ViewCounter
    blog/            # Toc、Comments
    contributions/   # 完整与精简贡献视图
  content/           # 博客与项目 Markdown / MDX
  config/            # 个人资料、站点与集成配置，以及类型和校验
  data/              # 存储的数据：生成的贡献快照
  layouts/           # 共享页面外壳与元数据
  lib/
    content/         # 内容查询、筛选、文章规则与简历数据组合
    contributions/   # 快照查询、汇总与纯筛选规则
    integrations/    # 服务配置解析与可选客户端
    markdown/        # 共享语法插件、安全 HTML 渲染与文本提取
    search/          # 浏览器搜索引擎与构建期元数据
    seo.ts           # 页面元数据
  pages/             # 静态路由、RSS、搜索索引
  scripts/           # 浏览器端文章交互
  styles/            # 全局样式
```

## 命令与验证

| 命令                                 | 用途                                         |
| ------------------------------------ | -------------------------------------------- |
| `pnpm dev`                           | 启动本地开发                                 |
| `pnpm test`                          | 运行回归测试，需要 Node.js 22.6+             |
| `pnpm check`                         | Astro 与 TypeScript 检查                     |
| `pnpm lint`                          | ESLint 检查                                  |
| `pnpm format:check`                  | 只检查格式，不修改文件                       |
| `pnpm format`                        | 格式化文件                                   |
| `pnpm build`                         | 构建生产文件到 `dist/`                       |
| `pnpm verify`                        | 依次执行测试、类型检查、Lint、格式检查和构建 |
| `pnpm preview`                       | 预览生产构建                                 |
| `pnpm new:post` / `pnpm new:project` | 创建内容文件                                 |
| `pnpm sync:contributions`            | 刷新合并 PR 快照                             |

PR 和手动检查使用 `verify.yml`；向 `main` 推送和手动部署使用 `deploy.yml`。每条路径只执行一次 `pnpm verify`。贡献同步在提交之前验证，再通过可复用部署工作流部署已有产物。

`artifact-only` 仅供已经在同一次工作流运行中上传了 `github-pages` 产物的调用方使用，不会读取其他运行中的产物。验证失败会阻止部署。同步工作流使用 `GITHUB_TOKEN` 推送时，不会再触发第二次 push 工作流。

2026-10-24，本地使用 Node.js 22.18.0 和 pnpm 10.14.0 通过完整 `pnpm verify`，包括 69 项测试、Astro 检查、ESLint、格式检查和生产构建。包含公开文章、空项目/履历和关闭集成的独立模板场景也已构建通过。远程 CI 结果仍需在工作流中确认。

Astro frontmatter 与客户端脚本显式使用 `typescript-eslint` 导出的解析器。目前没有自动化浏览器交互测试套件或专门的敏感内容扫描器。

## 博客子目录

文章可以放在 `src/content/blog/rec/example.md` 等子目录中，URL 保留目录路径，例如 `/blogs/rec/example`。`[...slug].astro` 同时处理根目录和嵌套文章。草稿在开发环境可见，生产构建排除草稿。

博客分类自动取 `src/content/blog/` 下的第一层目录：`rec/example.md` 属于 `rec`，`frontend/react/example.mdx` 属于 `frontend`。目录名称直接作为分类名称，不维护额外映射；根目录文章归为 `Uncategorized`。

分类依据源文件 ID，自定义 URL slug 不会改变分类。标签继续用于搜索和相关文章评分；共享目录会增加关联评分，根目录文章不会获得共享分类加分。

当前目录：

| 目录         | 内容                                  |
| ------------ | ------------------------------------- |
| `frontend`   | Web 基础、框架、浏览器 API 和工程笔记 |
| `interviews` | 面试准备与面试记录                    |
| `projects`   | 项目文档与实现笔记                    |
| `updates`    | 周报与工作记录                        |
| `algorithms` | 算法练习与强化学习笔记                |
| `databases`  | SQL 与数据库笔记                      |
| `life`       | 个人随笔                              |
| `rec`        | 搜索、广告与推荐系统                  |

从博客根目录迁移到子目录的旧文章，通过 frontmatter 中显式的 `slug` 保留原 URL。重新整理旧文章时，不要修改这个值。新文章如果没有自定义 slug，会以目录路径生成 URL。评论 ID、发布日期和草稿状态与目录位置无关。

### 文章标题层级

详情页使用 `h1` 展示文章标题。正文从 `##` 开始，子章节使用 `###`，保持层级连续。代码块中的示例不受这条规则影响。

目录兼容旧文章正文中的 `h1`–`h3`，根据正文最浅标题层级决定缩进，不包含页面顶部的文章标题。
