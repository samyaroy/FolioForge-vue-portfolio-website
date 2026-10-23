# Caveats

Known limits of the admin, and the places where it and the root project are
coupled tightly enough that a change to one can break the other.

Each entry says what the limit is, why it exists, and what it would take to lift
it. Nothing here is a bug to be fixed in passing; they are decisions with
consequences worth knowing before the next change.

Tracked as [issue #31, admin-root integration](https://github.com/samyaroy/FolioForge-vue-portfolio-website/issues/31).

## The admin and the site read the same files

The admin and the Vue site both read `src/content/**` and `src/config/**`. A
change to the shape of that content is a change to two applications.

This has already bitten once. Volunteering entries gained a `roles` list so that
two roles could share one card on the site. Those entries no longer had a
top-level `role`, so the admin's collection list — which titles an entry by its
`role` — showed the entry as untitled. The fix was to title a grouped entry by
the roles it holds (`admin/src/data/portfolioEntries.ts`).

**When changing content shape, check both.** The admin reads content through
`src/data/portfolioEntries.ts` and writes it through `worker/content/registry.ts`.
Neither is regenerated; both are hand-maintained tables.

## The deploy build installs only the admin

Cloudflare builds this app from `admin/` and installs only its dependencies.
Anything the build reaches outside `admin/` must not need the root project's
`node_modules`. Two places did, and broke the first such build:

- `vite.config.ts` imports `yaml` directly, from the admin's own dependencies.
- The Worker bundles `shared/gallery/manifest.js`, whose `yaml` import would
  resolve from the repository root. The `alias` in `wrangler.jsonc` points it
  at the admin's copy. (That file is parsed as strict JSON by the security
  test, so it carries no comments; the reason lives here.)

**Before importing a package from shared or root code,** check it resolves with
only `admin/node_modules` present: a checkout with no root `node_modules`,
then `npm run build` and `npm run worker:check`.

## Editor depth stops at one level of nesting

`entryFields.ts` declares a collection's fields. A field may be a plain key, an
object with named sub-fields, a list of rows, or a credential holder. A list row
may name a nested value with a dotted path (`organization.name`).

It does not go deeper than that. A **list inside a list row** cannot be edited:

- `cred_link` on a leadership affiliation — a list of labelled documents
- `field` inside a volunteering role — a list of sub-fields and periods

These are **preserved, not editable**. The list editor starts from the original
item and overwrites only the declared columns, so anything it does not
understand survives a save untouched. Edit them in the YAML. A declared column
that holds such a list — an affiliation's `cred_link` — is shown as kept (the
role's Link reads "2 credential documents") rather than as an empty box.

Lifting this means a recursive editor rather than the current flat column model.
Worth doing only if this content starts changing often.

Extra scalar keys that are not declared columns still appear as columns, so a
field added by hand does not vanish from view.

## `home/profile` has no write adapter

`profile.yml` is a **map, not a list** — four blocks of fields rather than a
sequence of entries — so the list editor is the wrong shape for it, and the
Worker registry has no entry that writes it. Profile & Hero is shown but cannot
be saved. It needs a settings-style form.

The others this once named are settled: `awards.yml` exists and the site reads
it, so Awards & Achievements are written like any collection, and Contact is a
page of visibility switches whose values live in `profile.yml`.

## One commit path

An edit does not commit. It waits in the pending store, and publishing commits
the whole batch at once through the Git data API, with a non-forced ref update so
a branch that moved underneath fails instead of losing work. A generated file
travels with its source in the same commit — `gallery.yml` with
`galleryImageManifest.yml` — so the two can never disagree.

`writeFile` in `worker/content/files.ts`, the per-file Contents API path, is no
longer called by anything.

## Gallery photos go live before the entry does

Photos uploaded from the Career Unlocks editor are prepared in the browser to
the limits `scripts/fit-gallery-images.mjs` checks (`shared/gallery/photoPolicy.js`),
staged privately, and published to the media bucket when the entry is saved.
Closing the editor or removing a photo before then discards it.

Saving the entry only queues `gallery.yml` for the next publish, but the photo
is on the media host from that moment. Nothing links to it until the batch is
published; if the batch is discarded instead, the photo stays in the bucket
unreferenced, and can be archived from the Media Library. The browser does not
add the card-crop margins the fit script adds, so the next V1 push may still
pad a photo whose shape the card would crop too hard.

## Previews are replicas, not previews

Education, experience, projects, articles, research interests and memberships
draw a card in the collection list that mirrors what the site renders — same
fields, same order, same icons. It is **React re-implementing Vue**. Restyling
the site does not restyle these, and the two can drift.

A real preview means the separate Vue preview build described in
`docs/admin-plan.md`: an isolated origin, an iframe, and versioned messages
between them. Until then, treat these as a convenience, not as proof of how
something will look.

## Projects Mentored adds through the cohort

Projects Mentored lists every cohort's projects flat, and its semester dropdown
only **filters the view**: the collection it writes cannot say which semester a
new project joins, and a project created there landed in the last one in the
file. So it creates nothing itself. Its New project opens the cohort page of the
semester on screen (Mentoring → the cohort → Project info), which edits that
cohort's own `projects` list. Editing and deleting a listed project still work
in place.

The page matches a semester to its cohort by the semester's name; a semester no
cohort carries falls back to the Mentoring list.

## YAML formatting is normalised on write

Edits go through the `yaml` document API, so comments, key order, explicit nulls
and unknown fields survive. Rendering still normalises trailing whitespace,
spacing inside flow collections (`['a','b']` becomes `[ 'a', 'b' ]`) and blank
lines containing spaces.

Measured across the portfolio content that is five to ten per cent of lines,
semantically identical, and it happens **once per file**. Every writable file was
normalised deliberately in one commit so that later edits diff cleanly.

`lineWidth: 0` in `worker/content/entries.ts` is load-bearing, not cosmetic.
Without it the renderer re-wraps long strings and a no-op round trip rewrites
most of a file — measured at 435 of 521 lines in `education.yml`.

## CV presets point at portfolio entries by id

The CV module (`admin/docs/cv_architecture.md`) reads its facts — titles, places,
dates, links — from the portfolio YAML, addressing each entry as
`<collection>#<id>`. Entries a CV uses therefore carry an `id:` key, which the
site ignores.

Renaming or removing such an id breaks every preset that names it. It breaks
loudly: `validateCv` reports the preset and the reference, `npm run cv:build`
refuses to build, and `worker/__tests__/cvBuild.test.mjs` fails. The list editor
still shows `id` as an ordinary column, so for now nothing stops the edit
itself; declaring it read-only in `src/config/entryFields.ts` would.

Unlike the collection cards above, a CV preview is not a replica: it is the real
LaTeX the template produces, compiled by a real TeX engine.

## Still local-only

The blog post editor, blog gallery, Settings and taxonomy screens read content
but do not write it. Visibility switches, the portfolio's flags and the blog's
(`blog:` paths) alike, change only the current session.

Settings is blocked upstream: feature flags live in `src/config/featureFlags.ts`,
and `docs/admin-plan.md` requires migrating them to a validated
`site_settings.yml` — with the Vue consumers updated — before the admin may
touch them. That is a developer migration, not admin work.
