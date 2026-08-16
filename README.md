# FolioForge Vue Portfolio Website

A personal academic and professional portfolio for Samyabrata Roy, built with Vue 3, Vite, Vuetify, Tailwind CSS, Vue Router, and YAML-backed content. The site presents education, experience, research interests, projects, publications, teaching work, certifications, professional activities, affiliations, a gallery, and contact details through a static frontend that can be hosted on GitHub Pages, Cloudflare Pages, or another static host.

For a deeper architecture and maintenance guide, see [CONTEXT.md](CONTEXT.md).

## Tech Stack

- Vue 3 with single-file components
- Vite 7 for development and production builds
- Vue Router 4 with hash-based routing
- Vuetify 3 and Material Design Icons
- Tailwind CSS 3 with custom theme colors
- Font Awesome Vue support for selected brand icons
- YAML content imports through `@modyfi/vite-plugin-yaml`
- `vite-plugin-sitemap` for sitemap generation

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Run lint checks:

```bash
npm run lint
```

## Available Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run lint` | Run ESLint across the project. |
| `npm run sync:gallery-manifest` | Regenerate `src/content/galleryImageManifest.yml` from gallery content. |
| `npm run og:build` | Re-render both social cards from `config/og-card.yml`. |
| `npm run build` | Sync the gallery manifest and build static assets into `dist/`. |
| `npm run preview` | Preview the built `dist/` output locally. |

## Project Structure

```text
.
├── config/                         Build-tool configuration (social card content)
├── public/                         Static files copied directly into the build
├── scripts/                        Maintenance scripts
├── shared/                         Framework-free modules used by both this app and blogs/
├── src/
│   ├── components/                 Shared layout and reusable UI components
│   ├── config/                     Feature flags and runtime display settings
│   ├── content/                    Gallery content and generated gallery manifest
│   ├── metadata/                   Link, tag, logo, and people metadata
│   ├── router/                     Vue Router setup
│   ├── views/                      Route-level pages
│   ├── App.vue                     Root app shell
│   ├── main.js                     Vue/Vuetify/router bootstrap
│   ├── profile_info.yml            Main portfolio content source
│   └── style.css                   Global styles and Tailwind directives
├── CONTEXT.md                      Detailed project context for maintainers and AI agents
├── vite.config.js                  Vite, YAML, sitemap, and path alias config
├── tailwind.config.js              Tailwind theme and content scan config
├── wrangler.jsonc                  Cloudflare static asset deployment config
└── package.json                    Dependencies and npm scripts
```

## Content Editing

Most portfolio content lives in [src/profile_info.yml](src/profile_info.yml). Update this file for profile text, contact information, socials, research interests, education, experience, projects, publications, workshops, teaching, affiliations, certifications, and other profile sections.

Gallery items live in [src/content/gallery.yml](src/content/gallery.yml). The gallery uses tag metadata from [src/metadata/galleryTags.yml](src/metadata/galleryTags.yml), hyperlink metadata from [src/metadata/hyperlinkMetadata.yml](src/metadata/hyperlinkMetadata.yml), and an auxiliary generated manifest at [src/content/galleryImageManifest.yml](src/content/galleryImageManifest.yml).

After editing gallery entries, run:

```bash
npm run sync:gallery-manifest
```

The production build runs this automatically through the `prebuild` script.

### Social cards

The image LinkedIn, X, WhatsApp and Slack show for a shared link is generated,
not hand-drawn. Edit the wording, palette or portrait in
[config/og-card.yml](config/og-card.yml), then run:

```bash
npm run og:build
```

That re-renders both cards — `public/og-image.jpg` for the portfolio and
`blogs/public/og-image.jpg` for the blog — and both are committed, so a build
and deploy never runs the generator. It needs `rsvg-convert` (`brew install
librsvg`) and macOS `sips`.

Keep the output at 1200×630. The size is declared to crawlers in
`vite.config.ts` and `blogs/vite.config.ts`, and a declared size that disagrees
with the file is worse than declaring none — see the note in
[scripts/seo-build.ts](scripts/seo-build.ts).

A blog post can override the card with a `cover:` in its frontmatter. The
portfolio has no per-route override: every page, including a shared gallery
card, uses the one image.

Social networks cache scrapes aggressively. After changing a card, force a
re-scrape through LinkedIn's Post Inspector, X's Card Validator, or Facebook's
Sharing Debugger.

## Routes

The app uses `createWebHashHistory()` for static hosting compatibility. Main routes are:

- `/`
- `/projects-publications`
- `/affiliation-memberships`
- `/ongoing-projects`
- `/cocurricular`
- `/workshops-bootcamps-attended`
- `/teachings`
- `/internships-certifications`
- `/professional-activity`
- `/gallery`
- `/contact`

Some pages support tab deep links through query parameters, for example `/projects-publications?tab=articles`.

## Feature Flags

Section visibility is controlled in [src/config/featureFlags.ts](src/config/featureFlags.ts). Route guards, header links, footer links, page tabs, and several page sections read from these flags through `isFeatureEnabled()`.

Use feature flags when temporarily hiding content or when a section should not appear until its YAML content is ready.

## Deployment

The app builds to a static `dist/` directory. Deployment options already represented in the repository include:

- GitHub Pages via `npm run deploy`
- Cloudflare static assets via [wrangler.jsonc](wrangler.jsonc)
- Any static host that can serve the Vite output

The current Vite sitemap hostname is configured as `https://samyabrata.codeium.xyz` in [vite.config.js](vite.config.js). Update it if the production domain changes.

## License

This project is open source under the [MIT License](LICENSE).

