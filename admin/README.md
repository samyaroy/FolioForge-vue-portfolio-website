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

Install the root project's dependencies as well (`npm ci` from the repository
root). Vite uses its existing YAML parser at build time to import the portfolio
sources; no YAML parser is shipped to the browser.

Vite binds to localhost and chooses an available port. The routed shell puts the
Portfolio workspace first, followed by Editorial and Workspace tools. Every
sidebar destination renders a dedicated page. Search, selection, Markdown
formatting, tag editing, visibility toggles, and image previews work locally;
they do not modify repository content or persist after a reload.

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

The browser application follows the same route-oriented organization as the
blog subproject:

```text
src/
  components/admin/    Shared dashboard controls
  components/editor/   Content-authoring controls
  components/layout/   Sidebar and workspace shell
  config/               Navigation registry
  data/                 Read-only portfolio source adapters and local fixtures
  router/               Route definitions
  views/                One module per admin destination
```

`App.tsx` remains only the router boundary. Add page behavior to its view or a
focused shared component instead of growing the application root.

Portfolio navigation is page-first and mirrors the Vue router. The canonical
mapping lives in `src/config/portfolio.ts`; it defines each public path, its
admin subsections, source YAML files, and editable field groups. The sidebar,
Portfolio Overview, subsection routes, and global search all consume this same
registry so their hierarchy cannot drift independently.

Visibility panes read the actual values from `src/config/featureFlags.ts` in the
root project. `src/config/visibility.ts` maps each section to its exact boolean
leaf paths, including nested collections. A shared provider retains local flag
changes while navigating and keeps Settings synchronized. Discard restores the
source values. Contact and Privacy have no visibility flags, so their panes are
read-only. No toggle changes the public site or writes TypeScript; publication
still requires the planned validated settings migration and V1 Worker API.

Use typed functional components, focused hooks, two-space indentation, single
quotes, and descriptive names. Keep provider credentials and future Worker code
out of browser imports. Add components as needed rather than preinstalling the
whole registry.

## Planned integration

See [the implementation plan](../docs/admin-plan.md). Delivery order: blog posts
and images, blog gallery, other blog pages, then portfolio Career Unlocks.
The Vue preview will use a separate protected build; the React admin edits both
sites through collection-specific Markdown/YAML operations.

The portfolio scope now includes every authored section and global setting:
profile, contact, home content, projects, publications, education, experience,
credentials, teaching, activities, resources, facts, gallery, metadata, ribbon,
quotes, navigation copy, visibility, SEO, privacy, branding, and managed media.
The plan requires a source registry and CI coverage check so future content
cannot be added without an admin editor or an explicit developer-only decision.

This is a local frontend foundation, not a protected admin deployment. Wrangler,
Access, storage, and publishing are not configured yet. There is deliberately no
deployment script until the planned authentication boundary exists. `noindex`
is a crawler preference, not access control. Never put secrets in `VITE_*` values.

## Publishing target

All future admin publishing is restricted to the beta `V1` branch. The target is
displayed in the UI from `src/config/publishing.ts`, but the future Worker must
enforce the literal `refs/heads/V1` independently. Browser requests will not be
allowed to choose a repository or branch. Candidate branches start from `V1`
and merge only into `V1`; promotion to `main` remains outside the admin.

The planned image store is the existing `photo-dump` bucket through a standard
Worker R2 binding. R2 Data Catalog/Iceberg settings are unrelated to image
objects and must not be added to browser code. Markdown, YAML, and generated
manifests continue to be published through GitHub.
