# 个性化配置与模板边界

[English](personalization.md) | 简体中文

个人站点与未来的模板共用页面渲染、交互、内容查询和自动化流程。通过修改数据和配置完成个性化，不需要修改页面或维护第二套实现。功能是否开启以各项目的配置为准；生成的模板默认关闭全部外部集成。

## 配置入口

| 文件                                         | 用途                                                               |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `src/config/profile.mjs`                     | 姓名、职业、邮箱、GitHub 用户名、首页/About 文案、经历、教育和技能 |
| `src/config/site.mjs`                        | 站点名称、域名、语言、时区、导航、RSS、网站图标和分享图片          |
| `src/config/integrations.mjs`                | 功能开关、Giscus 设置、贡献同步和每页条数                          |
| `.env` / Actions 仓库变量                    | 可选服务的 ID、Supabase 地址和匿名密钥                             |
| `src/content/blog/`、`src/content/projects/` | Markdown 与 MDX 内容                                               |
| `src/styles/tokens.css`                      | 全站颜色和字体                                                     |

配置使用标准 ESM，Astro 和 Node 自动化脚本都能读取。工作流不再单独维护作者的 GitHub 用户名或 Giscus 仓库名称。

没有经历或技能时，保留空数组；不展示教育背景时，将学校名称设为空字符串；邮箱或 GitHub 用户名为空时，对应的联系链接会隐藏。首页和项目列表也提供了无内容时的提示。

配置文件只声明和校验设置，运行时解析逻辑放在 `src/lib/integrations/resolve.mjs`。CLI 和工作流直接调用这个纯模块；Astro 从 `src/lib/integrations/index.ts` 获取结合环境变量解析后的设置。贡献查询统一放在 `src/lib/contributions/`，`src/data/` 只存储快照。修改个人信息或功能开关时，通常不需要改这些内部实现。

## 配置检查

个人资料与功能配置使用 `@ts-check`，并通过 `src/config/types.ts` 共享类型定义。`pnpm check` 会检查字段结构；文件本身仍是标准 ESM，Node 无需安装项目依赖即可执行。

加载配置时也会校验关键字段，并在错误中指出字段名，例如 `Invalid configuration: contributions.pageSize must be a positive integer`。

- 功能开关必须是布尔值，不能写成字符串 `"false"`。
- `pageSize` 必须是正整数。
- 站点地址必须是域名根路径下的完整 HTTP(S) URL；时区必须能被 `Intl.DateTimeFormat` 识别。
- GitHub 账号填写用户名，评论仓库使用 `owner/repository` 格式。
- 联系方式仍允许留空。浏览量开启且连接配置完整时，会检查 Supabase 地址；关闭或配置不完整时，不初始化服务。
- URL 校验报错不会输出其中可能包含的账号或密码。

测试使用独立配置样例，不依赖本站当前的个人设置，因此关闭全部集成也不会改变测试的预期结果。

## 可选功能

```js
export const integrationConfig = {
  comments: {
    enabled: true,
    repository: "owner/repository",
    category: "Announcements",
    theme: "light",
    language: "zh-CN",
  },
  viewCounter: { enabled: true },
  contributions: {
    enabled: true,
    heatmap: true,
    sync: true,
    pageSize: 6,
  },
};
```

- 评论需要同时配置 `PUBLIC_GISCUS_REPO_ID` 和 `PUBLIC_GISCUS_CATEGORY_ID`。关闭评论后，评论组件和文章中的评论入口都不会显示，开发环境也一样。开启但配置不完整时，开发环境显示配置提示，生产环境不显示评论区。
- 浏览量需要 `PUBLIC_SUPABASE_URL` 和 `PUBLIC_SUPABASE_ANON_KEY`。关闭或未配置时，不显示计数器，也不初始化服务。数据库和 RPC 仍需另行配置，只能使用可公开的匿名密钥。
- `contributions.enabled` 控制 About、简历中的贡献数据和首页热力图。`heatmap` 可以单独关闭外部热力图。GitHub 用户名为空时，热力图和 GitHub 资料链接也会隐藏。
- `contributions.sync` 同时控制 `pnpm sync:contributions` 和定时、手动同步工作流。仅关闭同步时，已存储的贡献仍可展示；将 `enabled` 和 `sync` 都关闭，才能停用整个功能。`pageSize` 必须是正整数。
- 关闭贡献展示后，`/contributions` 地址仍然可访问，但只显示空列表，不会在页面中包含原有 PR 正文。

Giscus 仓库、分类、主题和语言等非敏感设置放在配置文件里，不再通过环境变量设置。不配置环境变量也能进行本地开发和生产构建。

## GitHub 贡献与自动化

贡献快照的结构为 `{ author, pullRequests }`。只有快照作者与配置中的 GitHub 账号一致时，才会展示数据；账号比较不区分大小写。

修改 `profile.githubUsername` 后，旧账号的记录会立即隐藏；下一次启用的同步会用新账号的记录替换快照。同一账号同步时，会保留 GitHub 搜索暂时遗漏的历史记录。API 校验失败不会修改已有快照。

工作流在安装依赖之前，读取与 CLI 相同的同步开关。启用后，它会检出仓库默认分支，使用生产服务配置验证站点，再提交数据并部署已验证的构建产物。

定时同步遇到数据未变化时，不会重新构建；启用的手动同步即使数据未变化，也会重新验证、构建和部署，便于重试失败的部署。关闭同步也会关闭这条手动重部署路径；需要单独重新部署时，使用部署工作流。

普通推送部署目前监听 `main`。如果使用其他默认分支，需要修改 `.github/workflows/deploy.yml` 中的触发分支。当前版本支持站点部署在域名根路径；仅修改 Astro 的 `base`，还不能保证所有站内链接在子目录部署下正常工作。

## 生成的模板项目

生成项目的配置结构与维护仓库相同，个人资料使用占位值，文章和项目目录为空，可选集成默认关闭。直接修改配置并通过内容创建命令添加自己的资料和文章即可。

维护者的模板生成、独立 Git 和发布流程记录在维护仓库的 README 中。生成项目不包含生成器，也不包含 `template:*` 命令。项目采用 MIT 许可证，详见根目录的 `LICENSE`；新增第三方代码或素材时，请遵守其各自的许可证。
