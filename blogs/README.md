# Blog — blogs.samyabrata.codeium.xyz

A standalone React + Vite + TypeScript app, deployed independently of the main
Vue portfolio at the repo root. Markdown-driven, no CMS.

## Develop

```bash
cd blogs
npm install
npm run dev
```

## Write a post

Add a Markdown file to `src/content/posts/`, named `YYYY-MM-DD-slug.md`:

```md
---
title: My post
date: 2026-06-18
description: One-line summary for the listing page.
tags: [tag-a, tag-b]
draft: false
---

Body in Markdown (GitHub-flavored).
```

- The slug is the filename minus the date prefix and `.md` → `/posts/slug`.
- `draft: true` shows the post in dev only, never in production builds.

## Build & deploy (Cloudflare)

```bash
npm run build      # → dist/
npm run deploy     # build + wrangler deploy (Workers Static Assets)
```

The Worker is named `folioforge-blog` (see `wrangler.jsonc`). After the first
deploy, add the custom domain `blogs.samyabrata.codeium.xyz` to it in the
Cloudflare dashboard (Workers → folioforge-blog → Domains & Routes). SPA routing
is handled via `not_found_handling: single-page-application`.
