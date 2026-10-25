# 在当前仓库中生成和维护模板

[English](template-workflow.md) | 简体中文

本方案只维护一套网站实现。个人站仓库保存真实资料和通用代码，生成器在其下创建完整的 `template/` 项目；这个子目录可以拥有独立的 Git 历史并推送到另一个仓库。

没有单独的示例数据目录。默认资料、空内容和通用 SVG 图标直接由 `scripts/build-template.mjs` 生成。

## 两个仓库的关系

```text
个人站仓库/
├── .git/                       # 管理个人站与生成器
├── src/                        # 通用实现和真实个人内容
├── scripts/build-template.mjs   # 模板生成器及默认值
└── template/                   # 生成的完整项目，主仓库忽略
    ├── .git/                   # 首次手动初始化；属于模板仓库
    ├── .template-manifest.json  # 生成器管理的文件清单
    ├── src/                    # 通用实现，使用默认配置和空内容
    ├── scripts/
    └── package.json
```

主仓库的 `.gitignore` 忽略 `/template/`，只表示主仓库不跟踪它，不会阻止子目录使用自己的 `.git`。进入已初始化的子目录后，Git 命令操作的是模板仓库。

没有子目录自己的 `.git` 时，Git 会向上寻找主仓库，因此必须先初始化，再在模板目录中提交。这里没有使用 Git submodule；两个仓库也不共享历史。

## 第一次生成

在个人站根目录执行：

```bash
pnpm template:build
```

这生成的是完整项目源码，不是网站静态文件。`pnpm build` 才会生成个人站的 `dist/`；在模板目录执行 `pnpm build` 则生成模板站点的 `template/dist/`。

生成器按明确列表复制通用页面、组件、业务逻辑、样式、配置校验、测试和维护命令，不复制真实文章、项目、履历、图片、贡献快照、环境文件或主仓库的 `.git`。

已有通用目录内新增的文件会自动带入；新增顶层通用目录或配置文件后，需要更新脚本的复制列表，再运行独立验证。根目录的 MIT `LICENSE` 会复制到模板，包的许可证声明也会保留。

默认项目包含占位姓名、空联系方式和履历、空博客/项目目录、空贡献快照，以及一个通用 SVG 图标。评论、浏览量、贡献展示和同步默认全部关闭。生成项目不包含生成器及 `template:*` 命令，避免递归生成。

## 独立验证

从个人站根目录执行：

```bash
pnpm template:verify
```

它依次重新生成模板、在 `template/` 中按锁文件安装依赖，并执行模板自己的 `pnpm verify`。首次安装需要能访问包仓库。不复用主站的 `node_modules`，不要求配置 `.env`。

也可以进入模板目录执行 `pnpm dev` 预览。空内容是预期状态；使用 `pnpm new:post` 或 `pnpm new:project` 可以创建内容。标题和公式检查只检查已有文章，不要求保留个人站的目录或文章数量。

当前 Astro 版本可能在空内容构建中输出集合为空的提示，构建仍可正常成功。

## 第一次建立模板仓库

在 GitHub 创建一个空仓库。然后在本地执行，远端地址替换为自己的：

```bash
cd template
git init -b main
git rev-parse --show-toplevel
git add .
git commit -m "Initial template"
git remote add origin https://github.com/YOUR_NAME/YOUR_TEMPLATE_REPO.git
git push -u origin main
```

`git init` 仅需在尚无 `template/.git` 时执行。检查 `--show-toplevel` 的输出应以 `/template` 结尾，确保操作的是子仓库。若它已经有远端，先执行 `git remote -v` 查看，不要重复添加。

可以在模板仓库 Settings 中开启 Template repository，方便其他人点击 Use this template。这不是生成脚本运行的前提。

## 以后如何更新

通用功能在个人站的 `src/` 中修改。模板默认资料或默认开关需要改变时，修改生成脚本中的默认值，不在生成结果中维护第二套实现。

在个人站根目录验证后，再发布子仓库：

```bash
pnpm verify
pnpm template:verify
cd template
git status
git diff
git add .
git commit -m "Update template"
git push
```

重新生成不会自动提交或推送，也不会执行 `git init`。生成器保留 `.git`、本地 `.env`、依赖和构建缓存，两个仓库的 Git 历史互不干扰。

## 换电脑后继续维护

父仓库忽略了 `template/`，克隆父仓库不会带回模板目录及其独立的 `.git`。新电脑上先安装 Node.js 22 和 pnpm 10.14.0，然后在已克隆的个人站根目录执行：

```bash
pnpm install --frozen-lockfile
git clone https://github.com/Jarvis636431/astro-template.git template
pnpm template:verify
git -C template diff
git -C template add .
git -C template commit -m "Update template"
git -C template push
```

仅在有变更时提交。克隆会恢复模板的提交历史和 origin；新电脑仍需配置自己的 Git 提交身份及 GitHub 推送凭据。每台新电脑只需克隆一次，后续生成会保留模板的 `.git`。

如果已经运行生成命令，导致 `template/` 存在但没有自己的 `.git`，先把它移到其他位置留存，再克隆模板仓库并重新生成。不要重新 `git init` 后强推，否则无法接续已有的模板历史。

在另一台电脑继续更新前，先在父仓库执行 `git pull --ff-only`，再执行 `git -C template pull --ff-only`，两边更新成功后重新生成。若任一仓库有未提交改动，先处理好这些改动再拉取。

## 更新和清理的边界

- `.template-manifest.json` 记录生成器管理的文件。这个清单应随模板源码一起提交。
- 当前管理的文件会被主仓库的实现或默认值覆盖。直接修改这些文件的内容会在下次生成时丢失，发布前应查看 `git diff`。
- 上次管理、现在不再生成的文件会被删除，避免留下旧模块。
- 不在清单中的自建文件保留不动，因此在模板目录手动加入的额外文件需要自己审查和维护。
- `.git`、环境文件和依赖目录受保护。损坏的清单或输出路径中的符号链接会让生成失败，不会借此删除仓库外文件。
- 主仓库的 Git、类型、Lint 和格式检查都排除 `template/`；模板仍可在自身目录独立执行这些检查。

## 工作流和发布范围

个人站的部署和同步流程不变。生成项目的检查工作流响应 push、PR 和手动运行；Pages 部署默认只允许手动触发，不包含定时贡献同步工作流。需要自动部署或定时同步时，再在模板仓库明确启用。

模板站点使用 `https://example.com`，发布前必须修改为自己的实际域名。目前支持域名根路径部署，子目录部署尚未适配。

模板采用父仓库的 MIT 许可证。演示站和 Astro 主题目录提交仍是独立的发布准备；生成器不会创建 GitHub 仓库或提交主题。
