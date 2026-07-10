---
title: Markdown features 
date: 2026-06-10
description: Tables, task lists, code blocks, and other GFM niceties.
cover: /hero.jpg
tags: [markdown, reference]
draft: false
---

Because the renderer uses `remark-gfm`, GitHub-flavored Markdown works here.

## Tables

| Feature      | Supported |
| ------------ | --------- |
| Tables       | ✅        |
| Task lists   | ✅        |
| Strikethrough| ✅        |

## Task lists

- [x] Scaffold the blog
- [x] Render Markdown
- [ ] Write more posts

## Code

```ts
function greet(name: string): string {
  return `Hello, ${name}`
}
```

> Quotes, **bold**, _italics_, and ~~strikethrough~~ all render as expected.
