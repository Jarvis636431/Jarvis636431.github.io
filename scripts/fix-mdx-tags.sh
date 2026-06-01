#!/bin/bash
# Fix MDX-incompatible HTML tags in blog files
# Wraps bare HTML tags in backticks to prevent MDX from treating them as JSX

BLOG_DIR="src/content/blog"

for f in "$BLOG_DIR"/*.mdx; do
  # Skip the original blog post that already works
  [[ "$f" == *"京东-创新零售-前端.mdx" ]] && continue

  # Escape <link> tags in prose (not inside backticks or code blocks)
  # Pattern: <tagname ...> that's NOT already inside backticks
  sed -i '' \
    -e 's/|<link \([^`|]*\)>/| `<link \1>` /g' \
    -e 's/|<script \([^`|]*\)>/| `<script \1>` /g' \
    -e 's/|<meta \([^`|]*\)>/| `<meta \1>` /g' \
    -e 's/|<img \([^`|]*\)>/| `<img \1>` /g' \
    -e 's/|<input \([^`|]*\)>/| `<input \1>` /g' \
    -e 's/|<video \([^`|]*\)>/| `<video \1>` /g' \
    -e 's/|<audio \([^`|]*\)>/| `<audio \1>` /g' \
    -e 's/|<div \([^`|]*\)>/| `<div \1>` /g' \
    "$f" 2>/dev/null
done

echo "Fixed HTML tags in all files"
