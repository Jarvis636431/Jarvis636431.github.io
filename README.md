# Jarvis Hub

A modern, high-performance personal portfolio and digital garden built with [Astro](https://astro.build). Designed for speed, clarity, and ease of content management, featuring a responsive **Bento Grid** layout and rich interactive elements.

## ✨ Features

- **Framework**: Built on Astro v5 for lightning-fast performance (Islands Architecture).
- **Styling**: Tailwind CSS for a utility-first, responsive design system.
- **Design System**:
  - **Bento Grid Layout**: Responsive, grid-based card layout.
  - **Spotlight Effect**: Mouse-tracking radial gradient spotlight.
  - **Staggered Animations**: Smooth entrance animations for cards.
  - **Infinite Marquee**: Seamless scrolling tech stack display.
- **Dynamic Content**:
  - **GitHub Heatmap**: Real-time contribution graph with dynamic year tracking.
  - **Music/Vibe Card**: Spotify-style animated music visualizer.
  - **Supabase Integration**: Real-time page view counting.
- **Content**: Type-safe content management using Astro Content Collections (MDX & Markdown).
- **Search**: Integrated client-side fuzzy search with Fuse.js (CMD+K support).
- **Automation**: Custom CLI scripts for generating new content templates.
- **Deployment**: Published to GitHub Pages with GitHub Actions.

## 🚀 Getting Started

This project uses [pnpm](https://pnpm.io/) as the package manager.

### Installation

```bash
git clone https://github.com/Jarvis636431/Jarvis636431.github.io.git
cd Jarvis636431.github.io
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory and add your Supabase credentials (required for the view counter):

```ini
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PUBLIC_GISCUS_REPO=Jarvis636431/Jarvis636431.github.io
PUBLIC_GISCUS_REPO_ID=your_giscus_repo_id
PUBLIC_GISCUS_CATEGORY=Announcements
PUBLIC_GISCUS_CATEGORY_ID=your_giscus_category_id
PUBLIC_GISCUS_THEME=light
```

Giscus comments use GitHub Discussions. Get the `PUBLIC_GISCUS_REPO_ID` and
`PUBLIC_GISCUS_CATEGORY_ID` values from [giscus.app](https://giscus.app) after
enabling Discussions and installing the Giscus GitHub App for the repository.

### Development

Start the local development server:

```bash
pnpm dev
```

The site will be available at `http://localhost:4321`.

## 📝 Content Management

### Creating New Posts

The project includes a helper script to quickly scaffold new blog posts with the correct frontmatter.

```bash
# Interactive mode
pnpm new:post

# Command line arguments mode
pnpm new:post -- --title "My New Post" --template mdx
```

This will create a new file in `src/content/blog/` with the current date and default fields.

### Content Collections

#### Blog (`src/content/blog`)

Schema fields defined in `src/content/config.ts`:

- `title` (string): Post title
- `description` (string): Short summary (min 10 chars)
- `commentId` (string): Stable identifier used by Giscus
- `language` (string): BCP 47 content language (defaults to `zh-CN`)
- `publishDate` (date): Publication date
- `tags` (array): List of tags
- `series` (string, optional): Shared title for a sequence of posts
- `seriesOrder` (positive integer, optional): Reading order inside the series
- `draft` (boolean): If true, hidden in production
- Reading time is calculated automatically from the Markdown/MDX body.

Article images written with regular Markdown receive lazy loading, captions from
their alt text, and click-to-zoom behavior. For responsive AVIF/WebP output with
intrinsic dimensions, use `ArticleImage` in an MDX post:

```mdx
import ArticleImage from "@components/ArticleImage.astro";
import screenshot from "../../assets/blog/screenshot.png";

<ArticleImage
  src={screenshot}
  alt="Dashboard overview"
  caption="Optional caption"
/>
```

Fenced code blocks accept a filename, line numbers, highlighted lines, and an
explicit collapse flag. Blocks longer than 24 lines collapse automatically:

````md
```ts title="src/example.ts" lineNumbers {2,4-6} collapse
const first = true;
const highlighted = true;
```
````

#### Projects (`src/content/projects`)

Schema fields defined in `src/content/config.ts`:

- `title` (string): Project name
- `summary` (string): Brief overview
- `language` (string): BCP 47 content language (defaults to `zh-CN`)
- `status` (enum): 'in-progress' | 'launched' | 'archived'
- `stack` (array): Technologies used
- `featured` (boolean): Whether to show on the homepage
- `externalUrl` (url): Link to the live project
- `coverImage` (string): Path to project cover image

## 📂 Project Structure

The About page displays GitHub metadata directly from
`src/data/contributions.generated.json`: repository, PR number, original title,
creation and merge times, labels, descriptions, change statistics, and discussion
counts. This file is maintained by the sync script.

About shows contribution totals and the latest six merged PRs, with a link to
the complete archive. `/contributions` contains the full archive in reverse chronological
order, with repository filters, six PRs per page, and expandable PR descriptions rendered
as sanitized GitHub-flavored Markdown (including tables, task lists and code blocks).
The selected repository and page are preserved in the URL; switching repositories
returns to the first page. Dates use `Asia/Shanghai`. The snapshot contains only PR records; no sync
timestamp is stored.

`Sync merged PR contributions` runs daily at midnight (00:00 in Asia/Shanghai,
16:00 UTC), and can be triggered manually from the Actions tab. It queries
PRs authored by `Jarvis636431`, excludes their own repositories, verifies actual
merge times, and keeps existing records if search results temporarily omit them.
API errors or incomplete results fail the run without changing the snapshot.

When metadata changes, the workflow verifies the site, commits only the generated
JSON to `main`, and calls the existing deployment workflow directly. Manual runs
also redeploy unchanged data, allowing a failed deployment to be retried. It uses
the built-in `GITHUB_TOKEN`; no personal token is needed. Repository rules must
allow the bot to push to `main`. The workflow must be on the default branch to
run on a schedule; GitHub may delay scheduled runs or disable them after 60 days
of inactivity in a public repository.

Run `pnpm sync:contributions` locally (optional `GH_TOKEN` for higher API limits).
Unchanged metadata does not produce a commit.

```text
/
├── public/            # Static assets (images, favicon)
├── scripts/           # Automation scripts (new-post.js)
├── src/
│   ├── components/    # Reusable UI components (BlogCard, ProjectCard, Search, etc.)
│   ├── content/       # MDX/Markdown content sources
│   ├── layouts/       # Page layouts
│   ├── lib/           # Utility libraries (supabase.ts)
│   ├── pages/         # Astro routes and pages
│   └── styles/        # Global styles
├── astro.config.mjs   # Astro configuration
└── tailwind.config.mjs # Tailwind configuration
```

## 🧞 Commands

All commands are run from the root of the project:

| Command         | Action                                      |
| :-------------- | :------------------------------------------ |
| `pnpm dev`      | Starts local dev server at `localhost:4321` |
| `pnpm build`    | Build your production site to `./dist/`     |
| `pnpm preview`  | Preview your build locally                  |
| `pnpm new:post` | Create a new blog post from template        |
