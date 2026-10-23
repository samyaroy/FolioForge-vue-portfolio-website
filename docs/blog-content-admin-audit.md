# Blog content and admin sync audit

Reviewed 19 October 2026 against the local checkout. This is a source-code audit; authenticated deployed admin integrations, Cloudflare deployment settings, remote images and external links were not verified. Application code and personal content were not changed.

Implementation update, 20 October 2026: the shared collection editor now hydrates fetched rows together with their revision on load and after mutations. Nested and named-group API reads use the write path resolver. Supported blog forms now expose optional review dates, notes, ratings, hobby images/tint, and state home flags with typed serialization. Public blog loaders respect disabled entries before deriving features and map counts; hidden trip pages are also excluded from generated SEO output. Seven new regression tests pass; both apps build and all TypeScript checks pass. The two baseline test failures below remain, as does a full-admin lint error in unchanged `LogoLibrary.tsx`. The remainder of this report records the original audit findings; unimplemented content types and deployment verification are still outstanding.

## Finding

The blog admin is partially connected and does not have feature parity with the portfolio admin. Five blog collections have repository read/stage/publish adapters. Posts, gallery, travel stories and shared copy do not. The portfolio also has a stale-row issue in its shared collection editor, so it should not be treated as completely synchronized.

## Content that needs updating

### Travel stories: all 10 entries

Source: `blogs/src/content/travel/trips.yml`. Replace each `summary` and both placeholder `narrative` paragraphs with your actual experience.

| Entry id | Current placeholder | Additional updates or review |
| --- | --- | --- |
| `mahababipuram26` | ABC | Correct title spelling (`specialy`); review slug spelling before changing a public URL; photo credit has an empty `url` (optional: fill or remove). |
| `uttarakhand-devbhumi-2025` | BCD | Confirm `stats` values against the actual trip. |
| `vizag-01-2025` | XYZ | Review copied-looking `Pilgrimage` tag; verify image keys (`vizag-01` cover versus `vizag-001` gallery, uppercase `.JPG`). These differences are review items, not confirmed broken URLs. |
| `uttrakhand-trip-01` | PQR | `date: 2024-11` lacks the day required by the documented schema; correct location spelling (`Uttarpradesh`) and review city names for geocoding. |
| `bike-trip-digha-2024` | SSS | Review title grammar and actual statistics. |
| `ropar-aivs-iitrpr` | QAZ | Review `IIT Roper` / `Panjab` spelling. `places[].via: Delhi` is not part of `TripStop` and is not consumed by `tripStops`; model Delhi as a route stop if intended. |
| `derjeeling-2024` | UVW | Confirm `stats` values (14 villages / 501 km), repeated from scaffold examples. Review slug spelling before changing it. |
| `chennai-001-iitmadras` | MNO | Replace `tags: [Dummy, Test]`; confirm campus/city stay statistics. |
| `delhi-001-iitdelhi` | MNO | Replace `tags: [Dummy, Test]`; `date: 2023-03` lacks a day; confirm statistics. |
| `hyderabad-solo-2023` | MNO | Replace `tags: [Dummy, Test]`; `date: 2023-03` lacks a day; confirm statistics. |

Do not invent days where only a month is known: either supply the actual date or implement explicit month precision in the schema and date presentation. Review `places`, transport `mode`, `train`, optional `lat`/`lng` and `note`, `coverImage`, `gallery`, `clicked_by`, `location`, `tags` and `stats` for each trip. Missing optional fields alone are not defects.

### Recommendations: six scaffold entries

Source: `blogs/src/content/recommended/data.yml` explicitly labels all six entries as placeholders. Review `title`, `author`, `source`, `year`, `url`, and especially `note` for Karpathy, Sutton, Olah, Tao, Weng and Graham. Replace first-person claims with your own reasons. The first three entries are featured on the home page, so ordering also matters. URLs were not checked online.

### Reading notes: two entries

Source: `blogs/src/content/readings/data.yml`.

- `the-book-of-why`: optional `date`, `note`, `rating` are absent.
- `pedagogy-of-the-oppressed`: optional `date`, `note`, `rating`, `image` are absent.

These fields enrich the reviews; their absence does not break the site. Without `note`, the modal repeats the generic `description`. Add personal notes and dates if desired. Commented sample books are not published content and need no immediate update.

### Movie review: one entry

Source: `blogs/src/content/movies/data.yml`. `the-cabinet-of-dr-caligari` lacks optional `date`, `note`, and `rating`. The poster exists locally. Add your own review; currently the modal falls back to the film description.

### Posts: two published scaffold articles

Sources: `blogs/src/content/posts/2026-06-10-markdown-features.md` and `2026-06-18-hello-world.md`. Both have `draft: false`. Decide whether to retain these as public articles, replace them, or mark them as drafts. Fields to review: `title`, `date`, `description`, `tags`, optional `cover`, `draft`, and Markdown body. No missing cover is inherently an error.

### Identity and shared copy

- `blogs/src/content/site.yml`: X social link is the generic `https://x.com/`; set your profile URL or remove it. Review hero `alt: Featured artwork` for a useful image description, the generated-image caption, and profile name/email/social URLs. `hero.jpg` and `profile-icon.png` exist locally. `hero.fallbackImage` uses Picsum as a fallback. Footer `lastUpdated` is manually maintained and currently says October 2026.
- `blogs/src/content/descriptions.yml`: gallery copy describes career milestones; confirm this is the intended blog gallery purpose.
- `blogs/src/content/sections.yml`: labels and headings are populated. Privacy `lastUpdated` is August 16, 2026; update only if the policy changes. Policy body is hardcoded in `blogs/src/views/PrivacyPolicy/index.tsx`.
- `blogs/src/content/navigation.yml`: labels and portfolio destination are populated; no obvious empty destination.
- `blogs/src/config/featureFlags.ts`: recommendations nav link and facts link are intentionally off; hobbies/gallery descriptions are off. Review those choices; they are not missing data.

### Gallery, hobbies, visit map

- `blogs/src/content/gallery/data.yml` contains `items: []`, while `showGallery` is true. Populate it if the gallery should have content. Supported raw fields: `id`, `type`, `date`, `tags`, `images`, `image`, `alt`, `event`, `location`, `externalUrl`, `featured`. Use `images` for explicit photos: the loader resolves `images` or an id-based CDN fallback, rather than the raw singular `image` value. Tags are separately configured in `gallery/tags.yml`.
- `blogs/src/content/hobbies/data.yml`: six active tiles; icons are valid content on their own. Optional `imageId`, `image`, `tint` can customize tiles. Hiking references remote `hobby/hike1`; availability was not checked.
- `blogs/src/content/travel/data.yml`: review `states[].purpose`, `home`, and `cities[].name`, `visits`, `stayed`, `stayReason`, `home`, `lat`, `lng` against your history. The states map is separate from stories and does not derive visit counts from `trips.yml`. Chandigarh is currently grouped under Punjab: review geographic grouping against the map dataset before changing it.

## Admin synchronization coverage

| Area | Source-backed admin support | Gap |
| --- | --- | --- |
| Recommendations | `recommended/items` worker adapter and shared editor | No dedicated reorder action, despite first-three home featuring. |
| Readings | `readings/items` adapter and shared editor | Declared schema omits `date`, `note`, `rating`; existing raw keys show on edit, but absent keys are not offered. |
| Movies | `movies/items` adapter and shared editor | Same omissions: `date`, `note`, `rating`. |
| Travel visit map | `travel/states` adapter and shared editor | Schema declares only `state`, `purpose`, `cities`; no declared state `home` field; existing nested cities use generic structured editing. Legend copy has no adapter. |
| Travel stories | None | `travel/trips.yml` has no collection, editor or writable-path entry. |
| Hobbies | `hobbies/tiles` adapter and shared editor | Declared schema only has `label`, `icon`; absent `imageId`, `image`, `tint` cannot be added through its form. Existing raw fields remain editable. |
| Posts | Hardcoded list and session-only editor | No Markdown repository adapter. `?source=` links are not read by the editor; existing posts open a blank new-post form. Save only changes React state; cover is a local object URL; draft flag and filename/slug workflow are absent. Filters are mostly inert. Sidebar post count is fixed at 2. |
| Blog gallery | Session-only preview | No adapter. Image selection handler is empty; entries store only title strings, not date/tag/photos as records. |
| Shared page copy | Four hardcoded source cards | “Open editor” buttons have no handlers. No adapters for `site.yml`, `navigation.yml`, `descriptions.yml`, `sections.yml`. |
| Gallery taxonomy | None | Blog `gallery/tags.yml` is not allowlisted. |
| Blog visibility | Only movies has a section visibility mapping | Other blog flags lack equivalent section controls. Entry enabled switches do not affect public blog loaders. |

Evidence: `admin/worker/content/registry.ts`, `admin/src/config/portfolio.ts`, `src/config/entryFields.ts:96`, `admin/src/views/{BlogPosts,PostEditor,BlogPages,BlogGallery}/index.tsx`, `admin/src/data/content.ts`, `admin/src/config/navigation.ts`, and `admin/src/config/visibility.ts`.

## Shared sync defects and limits

1. **Latest revision, stale displayed rows:** `admin/src/views/PortfolioContent/index.tsx:151` initializes rows from build-time YAML imports. Its fetch effect sets `baseSha`, but applies fetched `entries` only for `teaching/mentoring`. `refreshBase` and post-save refresh follow the same pattern. This affects portfolio and blog collections. Since writes identify entries by index, an external insertion/reorder can pair stale rows with a fresh SHA and target the wrong row. Apply fetched rows through the presentation adapters on every collection read before allowing saves.
2. **Hidden blog entries still render:** the shared editor writes `enabled: false`; blog loaders for recommendations, readings, movies, hobbies and visit states do not implement the portfolio's enabled filtering. A successful save therefore does not deliver the visibility promised by the admin.
3. **Schema completeness and field types:** the shared dialog offers missing keys only when declared in `entryFields`. It uses text controls for ordinary scalar fields, and edited numeric/boolean values can serialize as strings. Add appropriate typed controls and validation for years, ratings, counts and boolean flags as part of completing blog forms.
4. **Overview counts are snapshots:** blog overview counts use build-time YAML and hardcoded post metadata. They are not a live reconciliation against repository state.
5. **Publishing means V1:** both admin client and Worker target branch `V1` / Beta. The portfolio preview URL is beta, but the configured blog URL is the public blog origin. A commit to V1 does not by itself prove that the deployed blog rebuilt from that branch. Cloudflare build triggers/branches and authenticated integration status require separate runtime verification; the checked-in GitHub workflow routes project items rather than deploying the sites.

## Verification

Parsed active YAML to confirm 10 trips, 6 recommendations, 2 readings, 1 movie, 6 hobby tiles, and 0 gallery records. Checked local hero/profile/poster assets and traced form-to-service-to-worker collection paths.

Ran `npm run test:worker` in `admin`: **192 tests, 190 passed, 2 failed**:

- `worker/__tests__/content.test.mjs:244`: deleting an entry does not preserve the expected surrounding comments (`home/education`: 18 comments became 7).
- `worker/__tests__/gallery.test.mjs:30`: gallery-derived manifest assertion fails (expected the manifest to reflect the edit).

These are failures in the unchanged checkout; the failing assertions require diagnosis before deciding whether implementation or test expectations need fixing. Existing tests do not establish end-to-end deployed sync.

## Suggested implementation order

1. Fix repository-row hydration and index safety in the shared editor.
2. Complete blog schemas, scalar typing and public enabled filtering.
3. Add travel-story, Markdown-post, gallery and shared-copy repository adapters and working editors.
4. Replace scaffold content using your actual notes; complete optional reviews where desired.
5. Verify authenticated save → pending batch → V1 commit → intended deployment → public content for each supported content type.
