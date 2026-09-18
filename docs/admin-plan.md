# Blog and Complete Portfolio Admin Plan

Status: React + Vite + TypeScript + shadcn/ui frontend and a separate fail-closed Cloudflare Worker security foundation are implemented locally in `admin/`. Wrangler targets `admin.samyabrata.codeium.xyz`; Access JWT verification, owner authorization, asset protection, session-bound CSRF, and beta-only policy have local security tests. Owner identity and the Access audience are Worker secrets, absent from this public repository, and denials are logged for the live gate. Phase 2 is complete: the Worker is deployed at `admin.samyabrata.codeium.xyz` behind a Cloudflare Access application, Access intercepts every path including `/api/*` and static assets, and the owner signs in to a working read-only admin. Persisted editing, R2, GitHub, and publishing remain planned and disconnected. See `admin/worker/README.md` for the setup, the deployment order, the live security gate, and the checks that remain outstanding.

## Outcome

Create a separate React `admin/` application, deployed with Wrangler at a dedicated admin subdomain. It must provide a structured editor for every piece of authored information displayed by the blog and portfolio, including content that currently lives in YAML, metadata, TypeScript settings, route SEO metadata, hardcoded page copy, and managed images. Both public sites continue to consume versioned Markdown, YAML, and generated assets at build time and serve static pages. React is the editor framework; it does not constrain which site's content the Worker can update.

The admin adds a small serverless backend for authentication enforcement, image processing, draft storage, and GitHub writes. Git remains the published content source of truth. Private storage holds unpublished drafts and recoverable operations, not a second published-content database.

### Fixed beta branch policy

Every change created by the admin targets the repository's `V1` branch and therefore the beta portfolio environment. The admin never writes, opens a pull request against, or merges into `main`. This is a server-side invariant, not a browser-selected option: the Worker owns the literal target ref `refs/heads/V1`, its API accepts no repository or base-branch input, and any provider response or operation state naming another base branch fails closed. Candidate branches are created from the latest `V1` revision and merged back only into `V1` after checks pass. Promotion from `V1` to `main` remains a separate developer-controlled release process outside this admin.

## Repository Findings

- The root application uses Vue 3, Vite, Vue Router, Vuetify, Tailwind 3, and an incremental strict TypeScript setup.
- `blogs/` is already an independently built React application with its own package, Wrangler configuration, and Worker. Follow that deployment boundary and React component/hook conventions. Use shadcn/ui with Tailwind 4 and Lucide for new admin controls.
- Blog posts live in `blogs/src/content/posts/*.md`; other blog collections have dedicated YAML files. Implement a separate schema and path policy for each collection. A `draft: true` post committed to a public repository is not private.
- `shared/` already holds framework-free modules. Extend it only for logic actually consumed by multiple applications or scripts.
- Career Unlocks are authored in `src/content/profile_info/gallery.yml`. Editable fields include `id`, `title`, `caption`, `type`, `date`, `featured`, `tags`, `event`, `location`, `externalUrl`, `images`, and `manifestDescription`.
- Tags and caption link lookups come from `src/metadata/galleryTags.yml` and `src/metadata/hyperlinkMetadata.yml`.
- `src/views/Gallery/index.vue` resolves bare image keys to `https://media.samyabrata.codeium.xyz/<encoded-key>.jpeg`. Full image URLs are also supported. The repository does not establish which storage service currently backs this hostname.
- Shared gallery URLs use the post ID in `/gallery?item=...`. Existing IDs must remain stable.
- `scripts/sync-gallery-image-manifest.js` generates `src/content/galleryImageManifest.yml`. It currently tracks post IDs, dates, and descriptions, not every carousel image; it must not be used as a complete inventory for deleting media.
- Local hooks handle generated artifacts, but GitHub API commits do not execute those hooks. Required generation must run explicitly in the publishing service or CI.
- No workflow files were found under `.github/`. Confirm the deployed build trigger before wiring publication status.
- Some README and CONTEXT paths describe an older structure. Use current imports and configuration as implementation evidence; correct affected documentation during implementation.

## Complete Portfolio Coverage Contract

“Everything is editable” means every owner-authored value visible on the portfolio has a named, validated admin form. It does not mean the browser can edit arbitrary repository files or application code. Routes, component behavior, security policy, build scripts, and schemas remain developer-owned code.

The admin navigation must expose these portfolio modules:

| Admin module | Current source | Editable information |
| --- | --- | --- |
| Profile and branding | `profile.yml`, `meta.yml` | Name, biography, hero heading, footer line, CV, hero image/alt text, beta URL, last-updated value, favicon/profile image |
| Contact and social links | `profile.yml` | Email addresses, phone, location, social/profile URLs, blog URL |
| Media settings | `profile.yml`, managed media | Logo/icon media bases and owner-managed images; advanced URL changes require validation and a warning |
| Research interests | `research_interests.yml` | Ordered interest list and stable keys |
| Awards and achievements | new `awards.yml` migration required | Award and achievement cards currently expected by the Home components but absent from the profile source registry |
| Education | `education.yml` | Institutions, programmes, dates, grades, coursework, links, logos, and nested details |
| Experience | `experience.yml` | Roles, organisations, dates, locations, descriptions, links, and logos |
| Internships | `internships.yml` | All internship cards, credentials, organisations, dates, and nested details |
| Certifications | `certifications.yml` | Featured and additional credentials, issuers, dates, links, IDs, and logos |
| Projects | `projects.yml` | Research, technical, minor, and other project groups with all nested links and collaborators |
| Articles, publications, posters | `publications.yml` | Every article type, publication, poster, author, venue, date, credential, image, and tag |
| Ongoing projects | `ongoing_projects.yml` | Current project entries, status, descriptions, collaborators, and links |
| Co-curricular | `cocurricular.yml` | Leadership, organisation, volunteering, dates, descriptions, and credentials |
| Workshops and conferences | `workshops.yml` | FDPs, workshops, webinars/other learning, bootcamps, conferences, institutions, dates, modes, and credentials |
| Teaching and mentoring | `teaching.yml` | Courses, mentored projects, students, affiliations, descriptions, registrations, and credential links |
| Affiliations | `affiliations.yml` | Affiliations, collaborators, memberships, roles, dates, links, and logos |
| Professional activity | `professional_activity.yml` | Invited talks, hosted events, additional events, dates, locations, links, and credentials |
| Career Unlocks | `gallery.yml`, `galleryTags.yml` | Entries, ordered images, captions, dates, tags, filters, featured state, locations, events, and external links |
| Resources | `resources.yml` | Subjects, materials, external groups, links, people, logos, and Worth Exploring entries |
| Facts | `facts.yml` | Ordered facts, descriptions, and MDI icons |
| Announcements | `ribbon.yml` | Ordered ribbon messages, caption markup, icons, and rotation-ready content |
| Page descriptions | `description.yml` | Subtitle copy for every route |
| Page quotes | `page_quotes.yml` | Default and route-specific quote lists, authors, and sources |
| Link directory | `hyperlinkMetadata.yml` | Institutes, people, aliases, websites, and supporting metadata used by smart links |
| Visibility and display settings | currently `featureFlags.ts` | Section visibility, description visibility, collapsed defaults, gallery columns, ribbon visibility, and navigation availability |
| Navigation and page copy | currently Vue templates | Header/footer labels, page and section headings, tab names, empty states, button labels, and editable explanatory copy |
| SEO | currently `router/routes.ts` | Site name, page titles, search descriptions, canonical host inputs, and social metadata; route paths and component mappings remain code |
| Privacy policy | currently `PrivacyPolicy.vue` | Policy heading, introduction, ordered clauses, labels, and contact reference |
| Social cards | `config/og-card.yml` | Text, palette, portrait, quality within safe limits, and preview; output paths and dimensions remain constrained |
| Managed assets | local metadata/public images and R2 | Profile/favicon, institution and society logos, people images, poster images, gallery media, resource logos, and social-card portraits |

During implementation, create a machine-readable collection registry that lists every editable source, schema, form route, preview, derived artifact, and affected build. A coverage test must compare that registry against the portfolio content imports and approved editable-copy sources. CI fails when a new content source is added without an admin adapter or an explicit developer-only classification.

### Content migration required

- Move editable feature values from `src/config/featureFlags.ts` into a validated `src/content/site_settings.yml`. Keep flag evaluation and numeric normalization in TypeScript. The admin uses toggles, segmented controls, and bounded numeric controls; it never edits TypeScript.
- Split editable SEO values from `src/router/routes.ts` into `src/content/seo.yml`. Keep route paths, names, beta-only rules, component imports, and guard behavior in TypeScript. Validate that every registered route has exactly one SEO record.
- Move privacy-policy prose into `src/content/profile_info/privacy.yml`, preserving its ordered structure and contact reference.
- Move owner-facing navigation labels, page headings, section headings, tab labels, empty states, and reusable button text into a structured `src/content/profile_info/ui_copy.yml`. Accessibility labels that describe fixed control behavior may remain in code; owner-authored wording belongs in content.
- Add `description.yml`, `resources.yml`, `facts.yml`, and `gallery.yml` to the content source registry even though they are currently imported directly instead of through `profile_info/index.ts`.
- Add a validated `awards.yml` source and register it before exposing the currently dormant Awards/Achievements editor and visibility toggles.
- Replace direct imports of editable local people/logo assets with a validated asset registry where needed. Keep build-critical defaults so a missing remote asset cannot blank the site.
- Treat changes to URLs, identity/contact details, visibility, SEO, privacy text, and asset deletion as high-impact fields. Show a field-level diff and require explicit review before publication.

The first implementation task for each module is a lossless round-trip fixture made from its current source. Existing misspellings, unknown fields, comments, nulls, nested structures, Unicode, and legacy values must survive editing an unrelated field.

## Architecture

```text
Owner browser
  -> Cloudflare Access: allowed identity + MFA
  -> admin Worker: validate identity on every request
       -> protected React assets and same-origin /api routes
       -> collection-specific Markdown/YAML editors
       -> private R2: drafts and staged images
       -> Images binding: decode, resize, re-encode
       -> Durable Object: publication state and duplicate prevention
       -> GitHub App: candidate branch from V1, commit, PR, checked merge to V1
  -> verified build of the affected site
  -> existing static blog / Vue portfolio and public media
```

Use one admin Worker deployment, a private draft bucket, and isolated published media storage if the existing media service cannot provide suitable isolation. Separate blog and portfolio object namespaces. Prefer explicit full URLs for new assets when using a separate media hostname; verify support in each collection renderer. Do not migrate historical images as part of this feature.

### R2 storage decision

#### Logo catalog and management

The admin uses a shared searchable logo selector for array-valued logo fields, including course logos. Legacy scalar logo fields remain single-valued until their public renderer supports multiple logos. A shared catalog powers the selector and Media Library. Existing references absent from the catalog stay visible and are never silently removed.

`GET /api/media/logos` must be authenticated and list the configured `logo/` R2 prefix through the Worker binding, never through browser-held R2 credentials. The browser accepts `{ items: [{ value, name, url }], cursor?: string }` and follows opaque pagination cursors. The Worker owns the prefix, validates cursors, filters supported image formats, and returns values compatible with the existing logo URL resolver. Do not accept bucket or prefix selection from the browser.

Logo uploads and replacements require the same authenticated, CSRF-protected image pipeline as other media. Keep new bytes private until explicit publication, generate immutable final keys, and include reviewed reference changes in the V1 candidate commit. Replacement must not overwrite a live key or change main through shared mutable media. Reject deletion of referenced logos and retain old objects for rollback.

Current UI status: the selector calls the read endpoint, falls back explicitly to repository logo assets when the Worker is unavailable, and lets the owner stage local previews or replacements in Media Library. Staging does not upload bytes to R2 or persist across reloads. Protected R2 handlers and publishing remain unimplemented; the local draft must not be represented as a successful R2 update.

The existing `photo-dump` R2 bucket can back the image workflow through a normal Worker R2 binding. The enabled R2 Data Catalog is not part of this architecture: it is an Apache Iceberg catalog for analytical tables queried by engines such as Spark and PyIceberg, while this application stores and retrieves ordinary image objects. Do not add the catalog URI, warehouse name, or Iceberg credentials to the admin frontend or GitHub repository.

Bind the bucket by its bucket name in the admin Worker's Wrangler configuration after the authenticated Worker exists. Use private prefixes such as `drafts/<owner>/<draft-id>/` for staged images and explicit public prefixes such as `published/blog/` and `published/portfolio/` for immutable output. Keep the bucket private by default and expose published objects through the existing media custom domain or a narrowly scoped media Worker. Disable the `r2.dev` development URL in production.

The storage ownership is intentionally split:

| Data | Destination | Reason |
| --- | --- | --- |
| Source and processed image bytes | R2 | Object storage and media delivery |
| Blog Markdown and frontmatter | GitHub | Existing build-time content source |
| Blog and portfolio YAML | GitHub | Existing build-time content source |
| Generated manifests | GitHub in the same candidate commit | Reproducible builds and review |
| Private drafts and publishing operation state | Private R2 / Durable Object | Must remain unpublished and recoverable |

Publishing must upload and verify immutable R2 image objects first, then create one reviewed GitHub candidate containing the final object URLs or keys. A GitHub merge triggers the affected static-site build. If the repository update fails, retain the staged operation for retry; if the deployment fails, keep the previous content and images available for rollback.

The Durable Object has a narrow purpose: persist operation IDs and progress and serialize publication updates. Use explicit durable states and repository revision checks; do not rely on an in-memory lock surviving a Worker restart. No additional queue or database is needed initially.

## Security Boundaries

### Identity and access

- Protect the entire admin hostname, including static assets, API routes, and image previews, with Cloudflare Access. Allow only the owner's identity through an identity provider with enforced MFA or a passkey. Configure a short session, initially one hour.
- Independently verify the Access JWT in the Worker using a maintained JOSE library: signature, fixed issuer, fixed application audience, expiry, and allowed identity. Never trust the email header alone. Fail closed when configuration is missing or verification fails. Cloudflare explicitly documents Worker-side validation. [JWT validation](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- Run the Worker before all admin static assets so the same checks cover every route. Configure the asset binding explicitly. [Worker asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)
- Disable `workers.dev` and preview URLs in Wrangler for production. Any enabled staging hostname gets its own Access policy, audience, secrets, and storage. Test alternate hostnames directly. [workers.dev configuration](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/), [preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
- Keep local test identities in the test harness or a separately configured local entry point. A production request header or query parameter must never enable authentication bypass.

### Requests, content, and secrets

- Keep API calls same-origin. For mutations, verify the exact Origin and a session-bound CSRF token; allow only expected methods and content types. GET requests never mutate state. Do not enable wildcard CORS.
- Validate every request server-side with a shared runtime schema. Enforce body, field, image, and batch limits before expensive processing. Reject unsupported fields, invalid dates, duplicate IDs, traversal attempts, and unsafe URL schemes.
- Expose domain operations such as `updateProfile`, `saveEducationEntry`, `updateSiteSettings`, and `saveCareerUnlock`. Do not expose arbitrary file paths, repository names, Git refs, object keys, or generic YAML writes to the browser.
- Render captions with the established component-based syntax. Do not introduce raw HTML rendering. Validate link protocols both when accepting content and when rendering older authored content.
- Serve a restrictive CSP, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, a restrictive referrer policy, and a minimal Permissions Policy. Use `Cache-Control: no-store` for authenticated content and previews. Verify shadcn/Radix styles under the real CSP. The isolated portfolio preview is the sole framing exception: allow only the exact admin origin in its `frame-ancestors` and allow only its exact origin in the admin's `frame-src`.
- Store the GitHub App private key and any webhook secret only as Worker secrets. No secrets in `VITE_*`, YAML, browser storage, source maps, logs, or committed environment files. Prefer R2 bindings over storage API keys.
- Add per-identity upload and publication rate limits, bounded transformation concurrency, provider timeouts, and capped retries. Log request and operation IDs, actor, result, and commit SHA; omit tokens, uploaded bytes, and draft text.

### Repository permissions

- Use a GitHub App installed on this repository only, with short-lived installation tokens. Grant Contents and Pull Requests writes plus only the read permissions needed for checks. Do not grant Actions/Workflows administration or branch-protection bypass. [GitHub App installation authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation)
- Recognize that Contents write is repository-wide, not a folder-level permission. Enforce the exact writable file allowlist in the Worker and independently in required CI. Protect the default branch and security-sensitive workflow files; the app must not bypass these rules.
- Hard-code `refs/heads/V1` as the only allowed base and merge destination in the Worker. Resolve and compare the base ref before candidate creation, before opening a pull request, and again immediately before merge. Reject `main`, the repository default branch, caller-supplied refs, and pull requests whose base is not `V1`.
- Use candidate branches created from `V1` and required checks before merging back into `V1`. Support review and merge from the admin UI after checks pass, so routine beta publishing can stay in this UI. Where hosting rules require an independent reviewer, expose that status rather than bypassing it.
- Keep Cloudflare deployment credentials separate from the admin runtime. Repository write access must not grant the Worker infrastructure administration.

## Editor Experience

The first complete editor screen is a searchable blog post list with a New Post action. Navigation groups blog posts, gallery, and other pages separately from portfolio Career Unlocks. Use shadcn/ui controls, Lucide icons, restrained colors, and compact typography. Keep components in `admin/src/components/ui`; do not mix Vuetify controls into React.

Blog writing includes a Markdown editor, formatting toolbar, title, description, calendar date, tags, cover upload, and rendered preview. Reuse the blog's Markdown rules through narrow pure modules and presentation components; do not import its routing shell or all published content. Audit React 18 blog components for compatibility with the admin's React 19 runtime before sharing them.

Blog gallery and other page editors must follow their actual YAML fields. Add readings, movies, travel, and other collections incrementally with dedicated forms, not a generic raw-file editor. Preserve existing slugs and trip IDs on ordinary edits. Treat renaming public URLs as a separate explicit operation with a redirect strategy.

The portfolio workspace uses route-oriented navigation plus global settings. Home groups Profile, Research Interests, Experience, Education, and Awards/Achievements. The remaining modules follow the public route names, with separate global screens for Navigation and Copy, SEO, Visibility, Link Directory, Announcements and Quotes, Branding and Media, and Privacy. A global search finds entries across all modules without exposing their underlying file paths.

Every repeated collection supports add, edit, duplicate, reorder, archive/delete, and restore-before-publish. Nested collections use purpose-built controls: institutions within education, students within mentoring, links within credentials, aliases within metadata, materials within resources, and images within galleries. Single-value settings use the appropriate input, toggle, select, or constrained color control. The UI preserves empty strings, nulls, and omitted fields where their distinction affects current rendering.

Each portfolio form provides a real Vue preview for the affected component or page. Batch changes can open a full-site preview built from the candidate branch. Content without a compact component preview, such as SEO and feature visibility, shows its derived result: search snippet, navigation map, or visible/hidden section tree.

Common workflows and the later Career Unlocks editor support:

- Create, edit, duplicate with a new ID, and remove a post through the same reviewed publishing flow.
- Title, date, event, location, type, featured toggle, tags, caption, external URL, and manifest description.
- Existing tag and hyperlink suggestions; preserve legacy values rather than silently rewriting them. New tags, people, and institutes are created through their dedicated taxonomy or Link Directory forms, with reference validation and an impact preview before renaming or deletion.
- Upload, replace, remove, and reorder photos. Include keyboard-accessible move controls in addition to dragging, plus per-image progress, retry, and cancellation.
- Caption formatting and smart links using the existing syntax, with validation and an actual rendered preview.
- Private draft autosave with visible save state, unsaved-change handling, session-expiry recovery, and explicit discard. Start with server-side drafts; do not silently persist sensitive drafts on a shared browser.
- Review of changed fields, final filenames, image order, and YAML diff before submission.
- Distinct states for Draft, Preparing, Checks Running, Ready to Publish, Publishing, Live, Conflict, and Failed. A commit or merge alone is not a successful deployment.

For Vue Career Unlocks, build a small Vue preview entry from the real public gallery components and host it on a separate Access-protected preview origin. Embed it in an iframe with only the sandbox capabilities needed for rendering. Restrict `postMessage` to exact origins, check `event.source`, and validate versioned payloads on both sides. Never send credentials to the frame. Give it bounded preview content and image bytes, with object URLs created and revoked in the receiving frame. Test framing, Access sessions, and CSP together in staging. If cross-site authentication prevents framing, provide an authenticated standalone preview rather than weakening access controls.

Keep React and Vue runtimes in separate builds. Share only framework-free schemas and normalization where needed; do not attempt to render Vue components directly inside React. The main Vue portfolio build remains independent of the preview entry.

## Image Pipeline and Naming

1. Accept JPEG, PNG, and WebP initially. Proposed application limits: 10 MiB and 25 megapixels per photo, 10 photos per post, and two concurrent uploads. These are product limits to verify in staging, not claims about provider limits.
2. Generate a browser preview and optionally resize for transfer using a maintained browser image library. Browser checks improve usability; the server remains authoritative. Never repeatedly recompress on each field edit.
3. Stream uploads through an authenticated endpoint with a byte counter. Validate signatures, decoded format, dimensions, and animation policy. Reject SVG, corrupt files, unsupported formats, and oversized inputs.
4. Decode and re-encode with Cloudflare's Images binding, normalize orientation, discard EXIF/GPS metadata, and produce bounded JPEG output matching current conventions. Begin with a 2400-pixel longest edge, no upscaling, and quality around 82; verify text-heavy photos before fixing defaults. Test metadata removal on real fixtures. The binding works with raw bytes, so source images need not be public. [Images binding](https://developers.cloudflare.com/images/optimization/binding/)
5. Keep normalized draft images in private R2. Preview them through authenticated endpoints. No public staging bucket or durable public preview URLs.
6. Generate the final name from the latest validated fields on submission, for example `2026-09-14-imsc-workshop-01-<digest>.jpeg`. Use a bounded lowercase ASCII slug, stable fallbacks, and a digest of normalized bytes. The Worker generates and validates the key.
7. Keep the post ID stable independently of the image name. For an existing post, a Rename Images option can explicitly create new immutable keys from changed fields and update `images` in the same YAML revision. It must not overwrite or immediately delete old objects.
8. Preserve the current fallback for older posts with no explicit `images`. Always write an explicit ordered `images` array for new posts so later title edits cannot break image resolution.

Prefer uploading final bytes once and serving them statically afterward. Verify Images availability and cost in the account during setup. Do not assume the existing Node `sharp` package can execute inside a Worker; it remains suitable for local fixtures or a separately designed CI processing path.

## Markdown and YAML Updates

- Blog posts: allow only server-generated `blogs/src/content/posts/YYYY-MM-DD-slug.md` paths with validated dates and bounded slugs. Preserve existing filenames on ordinary edits, frontmatter fields, and authored Markdown. Use a structured frontmatter parser with the established blog semantics; do not enable raw HTML in preview.
- The current blog frontmatter reader handles a limited flat subset, including comma-split inline arrays. Before emitting general YAML quoting or multiline values, align the blog reader with the structured parser and add compatibility fixtures; otherwise valid YAML could still display incorrectly on the public blog.
- Blog gallery: allow `blogs/src/content/gallery/data.yml`; read `tags.yml` for suggestions. Add other exact page paths only with their collection schema, dedicated form, and validation tests.
- Each operation selects a known collection identifier. Its server-side adapter owns writable paths, schemas, media namespace, serialization, derived artifacts, and which public app must build. The browser cannot override those mappings.

- Use the existing `yaml` package's document API to edit the target item. Preserve comments, ordering, unrelated items, Unicode content, and unknown legacy fields. Do not round-trip the whole file through plain JSON or use regex replacements.
- Treat dates as calendar strings. Validate actual dates without local-time conversions. Preserve null versus omitted values where the existing content depends on that distinction.
- Use a runtime schema with inferred TypeScript types for new editor input. Validate the edited item strictly while keeping untouched legacy items compatible; inventory existing inconsistencies before making a whole-file schema a required gate.
- Maintain an explicit portfolio allowlist for every source in the coverage table: all `src/content/profile_info/*.yml` files, `src/metadata/galleryTags.yml`, `src/metadata/hyperlinkMetadata.yml`, the new content/settings files created by migration, and `config/og-card.yml`. Generated outputs are writable only by their named generator. Binary asset paths are written only by the asset adapter. No API accepts a caller-supplied repository path.
- For Career Unlocks, update `src/content/profile_info/gallery.yml` and regenerate `src/content/galleryImageManifest.yml` in the same candidate. Read tag and hyperlink metadata as suggestions and publish intentional taxonomy changes as part of the same reviewed operation.
- For site-wide copy and settings migrations, update Vue consumers first and publish the new content source plus all required consumer changes as a normal developer-reviewed migration. Only after that migration lands may the admin adapter expose the fields. The runtime admin never modifies Vue or TypeScript source.
- Extract the manifest renderer into a pure shared function and keep the current CLI as a filesystem wrapper. The Worker generates the manifest from the candidate gallery document; CI regenerates it and requires an identical result.
- Commit the gallery and generated manifest together using Git trees and commits. Do not make sequential single-file commits that temporarily disagree.
- Associate every edit with the source revision. If its base changed, show a conflict and reload or explicitly reconcile; never silently overwrite another edit. Ref updates must be non-forced. [Git reference updates](https://docs.github.com/en/rest/git/refs)

## Publication and Recovery

There is no atomic transaction across GitHub, media storage, and deployment. Model publication as a resumable operation with durable progress.

1. Save a private draft with its source revision, normalized inputs, and image references.
2. Prepare an immutable candidate and record an operation ID. Repeated submissions with the same key and payload return the same operation; a different payload with that key is rejected.
3. Generate exact Markdown/YAML and any required derived files, final image keys, and the review diff. Record the candidate digest and affected application. Changes after review require a new candidate.
4. On explicit submission, verify the recorded `V1` base revision and persist final immutable images. Verify each stored object's digest before creating a candidate branch from `V1` and one candidate commit, then open a PR whose base is exactly `V1`.
5. Required checks validate permitted paths, schemas, captions, manifest consistency, media availability, and affected builds. Authenticate webhook delivery and deduplicate events, or poll through authenticated APIs initially to avoid a new inbound webhook surface.
6. The UI enables Publish only for the same checked candidate SHA. The Worker revalidates identity, candidate, required checks, mergeability, and the current `V1` state. Merge only into `V1` through branch rules; never use force pushes, unchecked administrative merge, or a fallback to `main`.
7. Observe the affected application's deployment for the merged revision. Mark Live only when that revision is deployed and its public page and referenced images pass smoke checks. Changes spanning both sites require both deployment results. Confirm both Cloudflare build integrations in phase 1; add a read-only status integration or deployment marker if needed.
8. On timeout, resume from persisted state and reconcile existing storage objects, branch, commit, and PR. Do not create duplicate posts or assume a failed response means GitHub did not accept a request.

Drafts stay private until explicit submission. In a public repository, submitted PR content is public even before merge. With a static public media host, promoted images can also be public before the page deployment. Explain that boundary at submission; never claim that a public PR is private staging. If strict confidentiality until launch becomes a requirement, introduce private publishing storage and controlled media release as a separate design change.

Retain previous published images for rollback. Reverting a publication creates a new checked content change and deployment; it does not erase history. Expire abandoned private drafts on a documented schedule, initially 30 days. Clean unused promoted objects only after checking live content, open operations and PRs, and retained rollback revisions. Use dry-run reports and a retention window; never infer unused carousel images from the existing manifest alone.

## Code Organization and Style

```text
admin/
  src/
    components/              Small reusable editor controls
    views/Posts/             Markdown writing and React preview
    views/Gallery/           Blog image collections
    views/Pages/             Dedicated blog page forms
    views/Portfolio/         Route-oriented portfolio editors
    views/Settings/          SEO, visibility, copy, links, media, privacy
    views/CareerUnlocks/     Gallery form and Vue preview bridge
    hooks/                   Draft and upload state used by the UI
    services/api.ts          Typed browser requests, no secrets
    router/                  Admin routes
  worker/
    index.ts                 Authenticate, route, handle errors
    auth.ts                  Access and CSRF verification
    collections/             Explicit blog and portfolio adapters
    collections/registry.ts Machine-readable source and coverage map
    images.ts                Validation, transformation, storage
    github.ts                Installation auth and Git operations
    publishing.ts            Durable publication state machine
  tests/                     Boundary, content, and browser tests
  package.json
  wrangler.jsonc
  README.md
shared/
  content/                   Framework-free contracts when shared
  portfolio/                 Portfolio schemas and serialization helpers
  gallery/                   Normalization and manifest rendering
previews/portfolio/          Separate protected Vue preview build (later)
docs/
  admin-plan.md
```

- Follow the blog's React functional component and hook conventions, strict TypeScript, camelCase functions, PascalCase components, two-space indentation, and single quotes. Keep new controls consistent with shadcn/ui; preserve Vue conventions only inside the later Vue preview entry.
- Use descriptive domain names such as `preparePublication`, `updateGalleryItem`, and `createImageKey`. Keep functions short enough to explain by their name; comment decisions and constraints rather than narrating assignments.
- Parse network data as unknown and validate it. Keep typed results and useful field errors, with a central safe response mapper for unexpected failures.
- Keep React and Vue out of shared content logic and Cloudflare/GitHub code out of browser imports. Server modules must never enter Vite's browser dependency graph.
- Add abstractions only when two real consumers need them. Avoid a generic CMS framework, repository-wide service layer, or unrelated TypeScript/style migration.
- Give `admin/` its own package, lockfile, lint/typecheck/build scripts, and pinned Wrangler dependency, matching the independent blog pattern. Scope root lint and build discovery so they do not accidentally absorb the new app.
- Choose maintained JOSE, schema, GitHub API, and image libraries during implementation after checking compatibility and advisories. Commit lockfiles and review dependency updates. Do not implement JWT cryptography or image decoders by hand.

## Delivery Phases and Exit Criteria

| Phase | Work | Exit criterion |
| --- | --- | --- |
| 1. Establish contracts | Confirm both sites' media origins, schemas, repository rules, build triggers, identity provider, and toolchain baseline. | Architecture assumptions are recorded and staging resources can be scoped precisely. |
| 2. Secure shell | Extend the initialized React/shadcn app with a Worker, Access verification, protected asset routing, request limits, headers, and isolated staging. | Anonymous, forged, expired, wrong-audience, and alternate-host requests cannot reach protected content. |
| 3. Blog writing | Build Markdown writing, frontmatter forms, actual React preview, and private drafts. | Existing posts render equivalently and saving a draft leaves published files untouched. |
| 4. Media | Implement server validation/transformation, private previews, ordering, replacement, and final naming. | Invalid uploads fail safely; orientation, metadata stripping, image quality, and naming pass fixtures. |
| 5. Publication | Add GitHub App integration, candidate reviews, atomic content commits, required CI, UI merge, and deployment status. | A new and an edited post reach the static site from the UI with recoverable, revision-aware operations. |
| 6. Release readiness | Exercise conflicts, retries, revocation, rollback, backup recovery, accessibility, mobile layout, and deployment isolation; document operations. | All release gates pass in staging before production secrets and domain are enabled. |
| 7. Blog collections | Add gallery, then individual page editors using the proven upload and publication flow. | Each collection preserves its schema, URLs, and unaffected content. |
| 8. Portfolio content foundation | Inventory and fixture every current portfolio source; migrate editable flags, SEO, privacy, and hardcoded copy to validated content; add the collection registry and coverage check. | Every visible portfolio value is classified as admin-editable, generated, or developer-owned, and CI detects unregistered content. |
| 9. Portfolio core | Add Profile/Branding, Contact/Socials, Home sections, Education, Experience, Projects, Publications, Internships, and Certifications. | Core portfolio content can be edited, previewed in Vue, reviewed, published, and rolled back entirely from the admin. |
| 10. Portfolio extended | Add Ongoing Projects, Co-curricular, Workshops, Teaching, Affiliations, Professional Activity, Resources, Facts, Announcements, Quotes, and Link Directory. | Every remaining YAML-backed portfolio section has full CRUD/reordering, lossless serialization, and preview coverage. |
| 11. Portfolio presentation | Add Career Unlocks and media, navigation/copy, visibility settings, SEO, privacy, social cards, and managed asset replacement. | All owner-authored portfolio information and managed images are updateable from the admin, generated outputs match, and a complete-site candidate passes build and visual checks. |

## Verification and Operations

Use focused unit tests for YAML preservation, date/slug/schema handling, ID stability, manifest parity, and candidate digests. Use Worker integration tests for authentication, CSRF, allowed files, upload limits, and provider failures. Exercise actual Cloudflare image processing in staging because local emulation is not evidence of production encoder behavior.

Run Playwright through create, edit, image replacement/reorder, review, conflict, expired session, retry after interrupted publish, and rollback. Inspect desktop and mobile screenshots for preview parity, readable field errors, keyboard focus, and overflow. Ensure public portfolio routes remain independent of admin API availability.

Required CI runs admin lint, strict typecheck, tests, and build; validates candidate paths and generated output; and builds the affected public app. Changes to shared contracts run both public app checks. Test iframe origin/source rejection and malformed preview payloads when adding the Vue bridge. Capture existing lint/typecheck failures before implementation and resolve only relevant blockers transparently; do not hide failures by globally weakening rules. Use least-privileged CI tokens, pinned action revisions, and no privileged execution of untrusted PR code.

Add portfolio coverage tests for all top-level YAML keys, direct content imports, route SEO entries, feature settings, editable UI-copy keys, and asset registry entries. Add a browser smoke test for every public route using a candidate containing representative edits. The release gate requires the edited value to appear in the intended component and unchanged values to remain byte-for-byte or semantically equivalent according to that source's preservation contract.

Document bootstrap configuration, secret rotation, identity revocation, draft retention, failed-operation recovery, rollback, media backups, and deployment recovery. Add alerts for repeated authorization failures, publish failures, stuck operations, and unexpectedly high image usage. Verify a restore in staging. The operational security target is enforced and tested boundaries, not a claim of absolute security.

## Scope and Completion Definition

The first usable release still establishes blog writing, media, security, and GitHub publication so the shared pipeline is proven on a contained workflow. Delivery is not considered complete until phases 8 through 11 cover every portfolio module in the coverage contract. Ribbon management, taxonomy, SEO, privacy, visibility, metadata, social cards, and managed branding assets are required portfolio scope.

Arbitrary repository editing, application code editing, route creation, schema design, Cloudflare infrastructure changes, multiple editor roles, and deletion of historical media remain developer operations. When a new portfolio field or section is introduced in code, the registry and coverage test require its admin ownership to be decided in the same change.

## MCP Role

MCP may help during development by inspecting GitHub or Cloudflare configuration through an authorized tool connection. It is not a runtime dependency of the deployed admin. The production admin authenticates to GitHub with its narrowly scoped GitHub App and to Cloudflare resources through Worker bindings, so publishing continues to work without a Codex session or personal MCP connection.

Account facts still to confirm during phase 1: the actual media storage provider, allowed owner identity and MFA provider, available protection rules for `V1`, the beta deploy integration, and Images/R2 availability. The publishing base is not undecided: it is fixed to `V1`. Repository inspection alone does not verify the external deployment and account settings.

Confirmed on 2026-09-18: the admin hostname is `admin.samyabrata.codeium.xyz`, it does not currently resolve, and `samyabrata.codeium.xyz` is served by Cloudflare nameservers. One fact contradicts an assumption written above: GitHub reports `V1`, not `main`, as this repository's **default branch**. The branch-protection rule in Repository Permissions therefore has to be read as protecting `main` and `V1` by name — "reject the repository default branch" would otherwise reject the very ref the admin is required to publish to. Settle which branch GitHub's default should be before the phase 5 GitHub App work, because branch protection, required checks, and the app's allowed base ref all key off that answer.
