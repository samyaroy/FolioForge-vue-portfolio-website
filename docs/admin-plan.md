# Blog and Portfolio Admin Plan

Status: React + Vite + TypeScript + shadcn/ui foundation initialized in `admin/`. Authentication, editing, storage, and publishing below are planned, not implemented. No infrastructure has been deployed.

## Outcome

Create a separate React `admin/` application, deployed with Wrangler at a dedicated admin subdomain. Prioritize blog post writing and image uploads, followed by the blog gallery, other blog pages, and the Vue portfolio's Career Unlocks. Both public sites continue to consume Markdown or YAML at build time and serve static pages. React is the editor framework; it does not constrain which site's content the Worker can update.

The admin adds a small serverless backend for authentication enforcement, image processing, draft storage, and GitHub writes. Git remains the published content source of truth. Private storage holds unpublished drafts and recoverable operations, not a second published-content database.

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
       -> GitHub App: content branch, commit, PR, checked merge
  -> verified build of the affected site
  -> existing static blog / Vue portfolio and public media
```

Use one admin Worker deployment, a private draft bucket, and isolated published media storage if the existing media service cannot provide suitable isolation. Separate blog and portfolio object namespaces. Prefer explicit full URLs for new assets when using a separate media hostname; verify support in each collection renderer. Do not migrate historical images as part of this feature.

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
- Expose domain operations such as saving a Career Unlock. Do not expose arbitrary file paths, repository names, Git refs, object keys, or generic YAML writes to the browser.
- Render captions with the established component-based syntax. Do not introduce raw HTML rendering. Validate link protocols both when accepting content and when rendering older authored content.
- Serve a restrictive CSP, `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, a restrictive referrer policy, and a minimal Permissions Policy. Use `Cache-Control: no-store` for authenticated content and previews. Verify shadcn/Radix styles under the real CSP. The isolated portfolio preview is the sole framing exception: allow only the exact admin origin in its `frame-ancestors` and allow only its exact origin in the admin's `frame-src`.
- Store the GitHub App private key and any webhook secret only as Worker secrets. No secrets in `VITE_*`, YAML, browser storage, source maps, logs, or committed environment files. Prefer R2 bindings over storage API keys.
- Add per-identity upload and publication rate limits, bounded transformation concurrency, provider timeouts, and capped retries. Log request and operation IDs, actor, result, and commit SHA; omit tokens, uploaded bytes, and draft text.

### Repository permissions

- Use a GitHub App installed on this repository only, with short-lived installation tokens. Grant Contents and Pull Requests writes plus only the read permissions needed for checks. Do not grant Actions/Workflows administration or branch-protection bypass. [GitHub App installation authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation)
- Recognize that Contents write is repository-wide, not a folder-level permission. Enforce the exact writable file allowlist in the Worker and independently in required CI. Protect the default branch and security-sensitive workflow files; the app must not bypass these rules.
- Use content branches and required checks before merging. Support review and merge from the admin UI after checks pass, so routine publishing can stay in this UI. Where hosting rules require an independent reviewer, expose that status rather than bypassing it.
- Keep Cloudflare deployment credentials separate from the admin runtime. Repository write access must not grant the Worker infrastructure administration.

## Editor Experience

The first complete editor screen is a searchable blog post list with a New Post action. Navigation groups blog posts, gallery, and other pages separately from portfolio Career Unlocks. Use shadcn/ui controls, Lucide icons, restrained colors, and compact typography. Keep components in `admin/src/components/ui`; do not mix Vuetify controls into React.

Blog writing includes a Markdown editor, formatting toolbar, title, description, calendar date, tags, cover upload, and rendered preview. Reuse the blog's Markdown rules through narrow pure modules and presentation components; do not import its routing shell or all published content. Audit React 18 blog components for compatibility with the admin's React 19 runtime before sharing them.

Blog gallery and other page editors must follow their actual YAML fields. Add readings, movies, travel, and other collections incrementally with dedicated forms, not a generic raw-file editor. Preserve existing slugs and trip IDs on ordinary edits. Treat renaming public URLs as a separate explicit operation with a redirect strategy.

Common workflows and the later Career Unlocks editor support:

- Create, edit, duplicate with a new ID, and remove a post through the same reviewed publishing flow.
- Title, date, event, location, type, featured toggle, tags, caption, external URL, and manifest description.
- Existing tag and hyperlink suggestions; preserve legacy values rather than silently rewriting them. Creating new taxonomy entries is a later scoped editor, not an implicit side effect of typing a tag.
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
- For Career Unlocks, allow exactly `src/content/profile_info/gallery.yml` and its generated `src/content/galleryImageManifest.yml`. Read tag and hyperlink metadata as suggestions. Add any timestamp file only after confirming a real existing dependency.
- Extract the manifest renderer into a pure shared function and keep the current CLI as a filesystem wrapper. The Worker generates the manifest from the candidate gallery document; CI regenerates it and requires an identical result.
- Commit the gallery and generated manifest together using Git trees and commits. Do not make sequential single-file commits that temporarily disagree.
- Associate every edit with the source revision. If its base changed, show a conflict and reload or explicitly reconcile; never silently overwrite another edit. Ref updates must be non-forced. [Git reference updates](https://docs.github.com/en/rest/git/refs)

## Publication and Recovery

There is no atomic transaction across GitHub, media storage, and deployment. Model publication as a resumable operation with durable progress.

1. Save a private draft with its source revision, normalized inputs, and image references.
2. Prepare an immutable candidate and record an operation ID. Repeated submissions with the same key and payload return the same operation; a different payload with that key is rejected.
3. Generate exact Markdown/YAML and any required derived files, final image keys, and the review diff. Record the candidate digest and affected application. Changes after review require a new candidate.
4. On explicit submission, verify the base revision and persist final immutable images. Verify each stored object's digest before creating a content branch and one candidate commit, then open a PR.
5. Required checks validate permitted paths, schemas, captions, manifest consistency, media availability, and affected builds. Authenticate webhook delivery and deduplicate events, or poll through authenticated APIs initially to avoid a new inbound webhook surface.
6. The UI enables Publish only for the same checked candidate SHA. The Worker revalidates identity, candidate, required checks, mergeability, and current branch state. Merge through branch rules; never use force pushes or unchecked administrative merge.
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
    views/CareerUnlocks/     Portfolio form and Vue preview bridge
    hooks/                   Draft and upload state used by the UI
    services/api.ts          Typed browser requests, no secrets
    router/                  Admin routes
  worker/
    index.ts                 Authenticate, route, handle errors
    auth.ts                  Access and CSRF verification
    collections/             Explicit blog and portfolio adapters
    images.ts                Validation, transformation, storage
    github.ts                Installation auth and Git operations
    publishing.ts            Durable publication state machine
  tests/                     Boundary, content, and browser tests
  package.json
  wrangler.jsonc
  README.md
shared/
  content/                   Framework-free contracts when shared
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
| 8. Vue portfolio | Add Career Unlocks, manifest generation, and the protected Vue preview entry. | One React admin edits both sites; Vue preview parity and both independent deployments are verified. |

## Verification and Operations

Use focused unit tests for YAML preservation, date/slug/schema handling, ID stability, manifest parity, and candidate digests. Use Worker integration tests for authentication, CSRF, allowed files, upload limits, and provider failures. Exercise actual Cloudflare image processing in staging because local emulation is not evidence of production encoder behavior.

Run Playwright through create, edit, image replacement/reorder, review, conflict, expired session, retry after interrupted publish, and rollback. Inspect desktop and mobile screenshots for preview parity, readable field errors, keyboard focus, and overflow. Ensure public portfolio routes remain independent of admin API availability.

Required CI runs admin lint, strict typecheck, tests, and build; validates candidate paths and generated output; and builds the affected public app. Changes to shared contracts run both public app checks. Test iframe origin/source rejection and malformed preview payloads when adding the Vue bridge. Capture existing lint/typecheck failures before implementation and resolve only relevant blockers transparently; do not hide failures by globally weakening rules. Use least-privileged CI tokens, pinned action revisions, and no privileged execution of untrusted PR code.

Document bootstrap configuration, secret rotation, identity revocation, draft retention, failed-operation recovery, rollback, media backups, and deployment recovery. Add alerts for repeated authorization failures, publish failures, stuck operations, and unexpectedly high image usage. Verify a restore in staging. The operational security target is enforced and tested boundaries, not a claim of absolute security.

## Deliberate Initial Scope

The first release handles blog writing and images end to end. Blog gallery, other blog pages, and Career Unlocks follow in that order. Additional portfolio YAML editors, ribbon management, taxonomy editing, arbitrary media imports, multiple editor roles, and historical media migration remain later work. This initialization provides only a local frontend shell and shadcn configuration; it does not claim any of the planned security or publication capabilities.

Account facts still to confirm during phase 1: the actual media storage provider, chosen admin hostname, allowed owner identity and MFA provider, default branch and available repository rules, current deploy integration, and Images/R2 availability. The plan assumes these can be configured; repository inspection alone does not verify external account settings.
