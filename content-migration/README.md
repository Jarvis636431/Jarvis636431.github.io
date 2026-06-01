# Notes Migration

Source: `/Users/jarvis/Desktop/Notes/Jarvis`

This folder is a migration workspace. Files here are copied from the original
notes vault and are not part of the published Astro content collection yet.

## Raw Copy

`raw/Jarvis/` is the first-pass copy of the notes vault.

Excluded from the copy:

- `.git/`
- `.obsidian/`
- `.DS_Store`
- `腾讯云服务器数据库密码.md`

Current raw Markdown count: 86.

## Organized Copy

`organized/` keeps a second copy grouped by publishing intent:

- `blog-candidates/`: technical notes that can become public blog drafts.
- `interview-notes/`: interview records and internship notes.
- `project-docs/`: project documentation, deployment notes, and weekly project
  writeups.
- `weekly-reports/`: recurring weekly reports.
- `ai-and-algorithm-notes/`: Agent, RAG, RL, speech, and recommender-system
  learning notes.
- `leetcode-notes/`: algorithm practice records.
- `life-notes/`: non-technical personal notes.
- `review-required/`: unclear or miscellaneous notes that need manual review.

Current organized Markdown count: 86.

## Recommended Next Step

Before importing files into `src/content/blog`, review each candidate for:

- credentials, private URLs, tokens, or internal deployment details;
- whether it should be public, private, or archived;
- a stable `commentId`;
- tags, description, publish date, and draft status.

After review, move selected files into `src/content/blog` as drafts with the
required frontmatter.
