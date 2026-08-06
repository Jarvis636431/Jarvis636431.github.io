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
- `draft` (boolean): If true, hidden in production
- Reading time is calculated automatically from the Markdown/MDX body.

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
