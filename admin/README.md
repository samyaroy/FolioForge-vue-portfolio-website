# FolioForge Admin

Independent React + Vite + TypeScript application for the blog and Vue portfolio.
Uses Tailwind CSS 4, shadcn/ui (New York / Radix), and Lucide icons.
The shell matches the public sites' profile mark, Inter typography, blue brand
accent, white header, and pale page background. Admin theme values live in
`src/index.css`; keep them aligned with `blogs/src/index.css` and the root
`tailwind.config.js`. Semantic shadcn tokens remain local to the admin.

## Local development

Use Node 22.12+ (Node 24 recommended). From `admin/`:

```sh
npm ci
npm run dev
```

Vite binds to localhost and chooses an available port. The initial shell has Blog
and Portfolio tabs and links to both public sites. It does not read or modify
repository content, authenticate users, upload files, or persist drafts.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npm run preview
```

The build is independent of the root and blog builds. `@/` resolves to `src/` in
both TypeScript and Vite. Tailwind scans only this app's source, and Vite does not
inherit the root application's PostCSS configuration.

## UI components

Components live in `src/components/ui/`, with configuration in `components.json`.
Follow the [shadcn Vite setup](https://ui.shadcn.com/docs/installation/vite).
Add components from this directory:

```sh
npx shadcn@latest add input
```

Use typed functional components, focused hooks, two-space indentation, single
quotes, and descriptive names. Keep provider credentials and future Worker code
out of browser imports. Add components as needed rather than preinstalling the
whole registry.

## Planned integration

See [the implementation plan](../docs/admin-plan.md). Delivery order: blog posts
and images, blog gallery, other blog pages, then portfolio Career Unlocks.
The Vue preview will use a separate protected build; the React admin edits both
sites through collection-specific Markdown/YAML operations.

This is a local frontend foundation, not a protected admin deployment. Wrangler,
Access, storage, and publishing are not configured yet. There is deliberately no
deployment script until the planned authentication boundary exists. `noindex`
is a crawler preference, not access control. Never put secrets in `VITE_*` values.
