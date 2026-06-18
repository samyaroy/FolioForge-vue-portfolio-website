# Project Context

## Summary

FolioForge is a Vue 3 personal portfolio website for Samyabrata Roy. It is a static frontend app that combines route-level Vue pages, Vuetify components, Tailwind utility styling, and YAML files as the primary content layer.

The site is designed to present an academic, research, data science, and web development profile. It includes home/profile content, education, experience, research interests, awards and achievements, projects, publications, articles, posters, ongoing projects, teaching and mentoring work, internships, certifications, workshops, conferences, bootcamps, professional activities, affiliations, collaborators, memberships, a gallery, and contact information.

## Current Stack

- Runtime framework: Vue 3
- Bundler/dev server: Vite
- Routing: Vue Router 4
- UI framework: Vuetify 3
- Utility CSS: Tailwind CSS 3
- Icons: Material Design Icons, `@mdi/js`, and Font Awesome Vue for selected brand icons
- Content format: YAML imported directly into Vue modules
- YAML tooling: `@modyfi/vite-plugin-yaml`, `yaml`, and `yaml-loader`
- Sitemap generation: `vite-plugin-sitemap`
- Deployment helpers: `gh-pages` and Cloudflare `wrangler.jsonc`

## Runtime Entry Points

- [index.html](index.html): Vite HTML template with the root `#app` element.
- [src/main.js](src/main.js): Creates the Vue app, imports global CSS, installs Vue Router and Vuetify, registers the Font Awesome component, and mounts the app.
- [src/App.vue](src/App.vue): Root shell. Renders `Header`, `router-view`, and `Footer` inside Vuetify's `v-app`.
- [src/router/index.js](src/router/index.js): Defines routes, hash history, scroll behavior, and feature-flag-based route guarding.
- [src/style.css](src/style.css): Global CSS, Tailwind directives, base document styles, and shared helpers.

## Content Model

The project is primarily content-driven.

[src/profile_info.yml](src/profile_info.yml) is the main portfolio data source. Components import it as `config` and read sections such as:

- `last_updated_on`
- `profile`
- `contacts`
- `socials`
- `research_interests`
- `education`
- `experience`
- project, publication, article, poster, teaching, internship, certification, workshop, affiliation, professional activity, co-curricular, award, and achievement sections where present

[src/content/gallery.yml](src/content/gallery.yml) is the gallery source. It contains ordered gallery items with fields such as:

- `id`
- `title`
- `caption`
- `type`
- `date`
- `featured`
- `tags`
- `event`
- `location`
- `externalUrl`

[src/content/galleryImageManifest.yml](src/content/galleryImageManifest.yml) is generated from `gallery.yml` by [scripts/sync-gallery-image-manifest.js](scripts/sync-gallery-image-manifest.js). It preserves editable descriptions while syncing item ids, dates, and category placement.

[src/metadata/galleryTags.yml](src/metadata/galleryTags.yml) defines gallery tag metadata used by the gallery filter UI.

[src/metadata/hyperlinkMetadata.yml](src/metadata/hyperlinkMetadata.yml) supports smart caption links. Gallery captions can use patterns such as `[[Visible Text|Institute]]`, `[[Visible Text|Exact Metadata Name|Person]]`, bold, and italic markup.

Logo and people images live under [src/metadata](src/metadata) when imported by source code, and under [public](public) when served directly by URL.

## Routes

The app uses `createWebHashHistory()` so routes work reliably on static hosts without server-side rewrite rules.

Current route map:

| Path | Route Name | Component | Feature Flag |
| --- | --- | --- | --- |
| `/` | `Home` | `src/views/Home/index.vue` | none |
| `/projects-publications` | `ProjectsPublications` | `src/views/ProjectsPublications/index.vue` | `showProjectsPublications`, any |
| `/affiliation-memberships` | `Affilications` | `src/views/Affilications/index.vue` | `showAffiliations`, any |
| `/ongoing-projects` | `OngoingProjects` | `src/views/OngoingProjects/index.vue` | `showOngoingProjects` |
| `/cocurricular` | `Cocurricular` | `src/views/Cocurricular/index.vue` | `showCocurricular`, any |
| `/workshops-bootcamps-attended` | `Workshops` | `src/views/WorkshopsAttended/index.vue` | `showWorkshopsAttended`, any |
| `/teachings` | `Teachings` | `src/views/Teachings/index.vue` | `showTeachings`, any |
| `/internships-certifications` | `InternshipCertification` | `src/views/InternshipCertification/index.vue` | `showInternshipCertifications`, any |
| `/professional-activity` | `ProfessionalAcitivity` | `src/views/ProfessionalAcitivity/index.vue` | `showProfessionalActivity`, any |
| `/gallery` | `Gallery` | `src/views/Gallery/index.vue` | `showGallery` |
| `/contact` | `Contact` | `src/views/Contact.vue` | none |

The spelling `Affilications` and `ProfessionalAcitivity` appears in directory and route names. Treat it as an existing project convention unless intentionally renaming all imports, route names, and links in one coordinated change.

[src/views/PrivacyPolicy.vue](src/views/PrivacyPolicy.vue) exists but is not currently registered in the router.

## Navigation And Layout

[src/components/Header.vue](src/components/Header.vue) renders the sticky top navigation, profile brand link, desktop nav, mobile drawer, and "Hire Me" mail action. Navigation links are conditionally shown based on feature flags and registered routes.

[src/components/Footer/index.vue](src/components/Footer/index.vue) renders contact information, quick links, social and academic links, institution logo content, and the `last_updated_on` value from the profile YAML. Footer links also use feature flags.

[src/components/SmartLink.vue](src/components/SmartLink.vue) centralizes internal and external link behavior, using metadata when available.

[src/components/DocumentViewer.vue](src/components/DocumentViewer.vue) is used for embedded document previews where page components need credential or document display.

## Feature Flags

[src/config/featureFlags.ts](src/config/featureFlags.ts) exports:

- `featureFlags`
- `isFeatureEnabled(flagPath, options)`

Flags are nested booleans. By default, a nested object is enabled only when all descendant flags evaluate to true. Passing `{ mode: 'any' }` enables a route or section when at least one descendant flag is true.

Feature flags currently control:

- Home sections
- Projects, articles, publications, posters, and collapsible project defaults
- Gallery route
- Co-curricular sections
- Ongoing projects
- Internship and certification tabs
- Workshops, conferences, FDPs, bootcamps, and other learning engagements
- Teaching tabs
- Affiliations, collaborators, and memberships
- Professional activity tabs
- Header, footer, and route guard visibility

When adding a new page or section, add the flag first, then wire it through router metadata, header/footer visibility, and the relevant page component.

## Page Modules

### Home

[src/views/Home/index.vue](src/views/Home/index.vue) composes the homepage from:

- `HeroSection.vue`
- `researchInterests`
- `experience`
- `education`
- `awards`

These sections read from `profile_info.yml` and feature flags.

### Projects And Publications

[src/views/ProjectsPublications/index.vue](src/views/ProjectsPublications/index.vue) is a tabbed page with projects, articles, publications, and posters. Submodules include:

- `ProjectTab`
- `ArticlesTab`
- `PublicationsTab.vue`
- `PostersTab.vue`

Project content is split into research, technical, and other projects. Technical and other project sections have feature-flagged default expanded states.

### Gallery

[src/views/Gallery/index.vue](src/views/Gallery/index.vue) renders gallery content from `src/content/gallery.yml` and tag metadata from `src/metadata/galleryTags.yml`.

Gallery components:

- `GalleryHero.vue`
- `GalleryFilter.vue`
- `GalleryGrid.vue`
- `GalleryCard.vue`

There is a fallback SVG at [src/views/Gallery/assets/gallery-fallback-sample.svg](src/views/Gallery/assets/gallery-fallback-sample.svg).

### Other Route Areas

- [src/views/Affilications](src/views/Affilications): affiliations, collaborators, memberships.
- [src/views/Cocurricular](src/views/Cocurricular): leadership and volunteering.
- [src/views/InternshipCertification](src/views/InternshipCertification): internships and certifications.
- [src/views/OngoingProjects](src/views/OngoingProjects): active or in-progress projects.
- [src/views/ProfessionalAcitivity](src/views/ProfessionalAcitivity): invited talks and hosted events.
- [src/views/Teachings](src/views/Teachings): courses taught, mentored projects, and other teaching.
- [src/views/WorkshopsAttended](src/views/WorkshopsAttended): conferences, FDPs, workshops, bootcamps, and other learning engagements.
- [src/views/Contact.vue](src/views/Contact.vue): contact and profile links.

## Styling

Tailwind is configured in [tailwind.config.js](tailwind.config.js). The project extends the theme with:

- `base_black`
- `primary`
- `secondary`
- `accent`
- `gridTemplateColumns.20`

Vuetify is installed globally in [src/main.js](src/main.js), with all Vuetify components and directives registered.

Most components use a mix of Tailwind utility classes and scoped component CSS. Global anchor, body, button, heading, and app container styles live in [src/style.css](src/style.css).

## Build And Deployment

Key scripts from [package.json](package.json):

- `npm run dev`: local Vite server
- `npm run lint`: ESLint
- `npm run sync:gallery-manifest`: regenerates gallery image manifest
- `npm run build`: runs `prebuild`, then Vite build
- `npm run preview`: previews built assets
- `npm run deploy`: builds and publishes `dist/` through `gh-pages`

[vite.config.js](vite.config.js) configures:

- Vue plugin
- YAML imports
- sitemap generation
- `@` alias to `src`
- base path `/`

The sitemap hostname is currently `https://samyabrata.codeium.xyz`.

[wrangler.jsonc](wrangler.jsonc) configures Cloudflare static asset deployment from `./dist` with the project name `folioforge-vue-portfolio-website`.

The root [CNAME](CNAME) and [public/CNAME](public/CNAME) are present for custom domain hosting workflows.

## Maintenance Notes

- Prefer editing YAML content before editing Vue components when the desired change is content-only.
- Keep `profile_info.yml` field names stable because many components read directly from nested keys.
- Run `npm run sync:gallery-manifest` after adding or removing gallery items if you want the generated manifest updated before build.
- Run `npm run build` before deployment. It automatically syncs the gallery manifest.
- Check feature flags when a route, tab, or section appears to be missing.
- When adding a route, update `src/router/index.js`, `src/components/Header.vue`, `src/components/Footer/index.vue` if needed, and `vite.config.js` sitemap `publicRoutes` if the route should appear in the sitemap.
- Static assets referenced with absolute paths such as `/profile-icon.png` must be in `public/`.
- Imported assets should live under `src/` so Vite can process them.
- This repository currently has no dedicated unit or end-to-end test setup beyond linting and production build checks.

## Known Conventions And Quirks

- Hash routing is intentional for static hosting.
- Some directory and route names contain typos inherited by the codebase, including `Affilications` and `ProfessionalAcitivity`.
- `src/views/PrivacyPolicy.vue` is present but not routed.
- `src/profile_info.yml` contains the public-facing personal profile and contact data for the site.
- Gallery `type` values are used as display/source hints and include values such as `gallery`, `linkedin`, `Linkedin`, `youtube`, `instagram`, and `Zoom`.
- The gallery manifest script groups items into categories based on tag matching, not an explicit category field.

