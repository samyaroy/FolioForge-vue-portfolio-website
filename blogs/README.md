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
cover: /my-image.jpg
tags: [tag-a, tag-b]
draft: false
---

Body in Markdown (GitHub-flavored).
```

- The slug is the filename minus the date prefix and `.md` → `/posts/slug`.
- `draft: true` shows the post in dev only, never in production builds.
- `cover` (optional) fills the left 40% image pane of the post's card on the
  home page — a public path (drop the file in `public/`) or a full URL. When
  omitted, a placeholder pattern renders instead.

## Edit site content

All non-post content lives in per-section YAML files under `src/content/`,
each paired with a small `.ts` module that applies the TypeScript types
(edit the YAML; the `.ts` files only pin shapes and derive values):

| YAML file           | Contents                                          |
| ------------------- | ------------------------------------------------- |
| `site.yml`          | Profile, home hero, social links, footer copy     |
| `sections.yml`      | Per-page titles, description lines, labels        |
| `navigation.yml`    | Header nav items, cross-links to the main site    |
| `readings/data.yml` | Reading notes (sorted newest-first automatically) |
| `travel/data.yml`   | Travel-map state/city visit data, legend labels   |

Keep dates quoted (`"2026-06-20"`) so they stay strings, and quote values
containing `:` or starting with punctuation.

## Rail-route geometry (train map)

Train legs on the travel map are drawn from real route geometry. To stay within
RailRadar's free tier (50 requests/day per key, shared across all visitors),
each train's route is fetched **once** at commit time and stored in Workers KV;
the Worker serves every visitor from KV instead of calling RailRadar live.

One-time setup:

```bash
cd blogs
npm run hooks:install                       # enable the pre-commit sync hook
npx wrangler kv namespace create RAIL       # paste the printed id into wrangler.jsonc
printf 'RAILRADAR_API_KEY=your-key\n' > .dev.vars   # local key, gitignored
npx wrangler secret put RAILRADAR_API_KEY   # same key, for the Worker's KV-miss fallback
```

After that, every commit that changes `src/content/travel/trips.yml` fetches any
new train numbers and uploads them to KV automatically. Manual controls:

```bash
npm run sync-rail              # fetch + upload only new trains
node scripts/sync-rail.mjs --reseed   # re-upload every cached route to KV
```

Fetched routes are cached in `scripts/rail-cache/<train>.json` (committed, since
a train's route never changes) — that folder is the re-seed source if KV is ever
lost. A failed fetch never blocks the commit; that leg just falls back to a
straight line.

## Build & deploy (Cloudflare)

```bash
npm run build      # → dist/
npm run deploy     # build + wrangler deploy (Workers Static Assets)
```

The Worker is named `folioforge-blog` (see `wrangler.jsonc`). After the first
deploy, add the custom domain `blogs.samyabrata.codeium.xyz` to it in the
Cloudflare dashboard (Workers → folioforge-blog → Domains & Routes). SPA routing
is handled via `not_found_handling: single-page-application`.
