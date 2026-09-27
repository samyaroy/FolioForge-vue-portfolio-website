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

## Editor depth stops at one level of nesting

`entryFields.ts` declares a collection's fields. A field may be a plain key, an
object with named sub-fields, a list of rows, or a credential holder. A list row
may name a nested value with a dotted path (`organization.name`).

It does not go deeper than that. A **list inside a list row** cannot be edited:

- `cred_link` on a leadership affiliation — a list of labelled documents
- `field` inside a volunteering role — a list of sub-fields and periods

These are **preserved, not editable**. The list editor starts from the original
item and overwrites only the declared columns, so anything it does not
understand survives a save untouched. Edit them in the YAML.

Lifting this means a recursive editor rather than the current flat column model.
Worth doing only if this content starts changing often.

Extra scalar keys that are not declared columns still appear as columns, so a
field added by hand does not vanish from view.

## Six collections have no write adapter

`home/profile`, `home/awards`, `contact/details`, and previously the nested
co-curricular and mentoring collections. The first three are **maps, not lists** —
one record of fields rather than a sequence of entries — so the list editor is
the wrong shape for them. They need a settings-style form.

`home/awards` additionally has no file: the Home components expect awards but
nothing backs them. `awards.yml` has to exist and be read by the site before the
admin can expose it.

## Two commit paths

Most collections write through GitHub's Contents API, one file per request.
The gallery writes through the Git data API, because `gallery.yml` and the
generated `galleryImageManifest.yml` must land in the same commit — a commit
where those two disagree is a state nothing should be able to create.

Publishing a batch also uses the Git data API. The single-file path remains only
for a collection with no generated output, and unifying them would be a
simplification with no behaviour change.

## Previews are replicas, not previews

Education, experience, projects, articles, research interests and memberships
draw a card in the collection list that mirrors what the site renders — same
fields, same order, same icons. It is **React re-implementing Vue**. Restyling
the site does not restyle these, and the two can drift.

A real preview means the separate Vue preview build described in
`docs/admin-plan.md`: an isolated origin, an iframe, and versioned messages
between them. Until then, treat these as a convenience, not as proof of how
something will look.

## Projects Mentored: the semester dropdown filters, it does not target

Semesters are content, not configuration, so that dropdown derives its options
from the values the entries carry. It **filters the view**. A new entry is still
appended to the last semester in the file.

Usually right — you add to the current semester — but creating an entry while
viewing an earlier one puts it somewhere you did not choose. Projects and
Workshops do not have this problem: their dropdowns select a real write target.

Fixing it needs dynamic collection keys so a selector like
`projects_mentored[semester=Summer 2026].projects` can be addressed from the
browser. The registry already supports that path syntax.

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

## Still local-only

The blog post editor, blog gallery, Settings and taxonomy screens read content
but do not write it.

Settings is blocked upstream: feature flags live in `src/config/featureFlags.ts`,
and `docs/admin-plan.md` requires migrating them to a validated
`site_settings.yml` — with the Vue consumers updated — before the admin may
touch them. That is a developer migration, not admin work.

## Access is single-factor

Tracked as [issue #30](https://github.com/samyaroy/FolioForge-vue-portfolio-website/issues/30). Login uses Cloudflare Access One-time PIN, so the admin's
security is the security of the owner's mailbox. Uploads write only to a private
drafts bucket and content edits are reviewable commits, which is what makes this
tolerable. It should be resolved before any unreviewed write path is added.
