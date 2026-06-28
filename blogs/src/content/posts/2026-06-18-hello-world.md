---
title: Hello, world
date: 2026-06-18
description: First post on the new blog — what it runs on and why.
tags: [meta, react]
draft: false
---

Welcome to the blog. This lives at **blogs.samyabrata.codeium.xyz**, separate
from the [main portfolio](https://samyabrata.codeium.xyz) but in the same repo.

## How posts work

Each post is a Markdown file in `src/content/posts/`. The frontmatter block at
the top sets the metadata:

```md
---
title: Hello, world
date: 2026-06-18
description: A short summary used on the listing page.
tags: [meta, react]
draft: false
---
```

The filename becomes the URL slug (a leading `YYYY-MM-DD-` is stripped), so this
file is served at `/posts/hello-world`.

## What it's built with

- **React + Vite + TypeScript** for the app shell
- **react-router-dom** for routing
- **react-markdown** + **remark-gfm** to render posts

Set `draft: true` to keep a post visible in `npm run dev` but excluded from the
production build.
