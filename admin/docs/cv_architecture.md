# CV Content, Build & Publishing

Status: revised 2026-10-04 to fit the admin as it is built, and again the same
day after analysing the seven existing CVs in `admin/docs/` (§18). On the
`admin-cv` branch: the schema, validator, resolver, LaTeX converter,
`resume-v1` template, the imported content for all seven presets, and
`npm run cv:build`. All seven build with no LaTeX errors on two pages each.
The admin screens, browser compilation, snapshots and Drive are not built yet.

> **Structured content is the source of truth. LaTeX and PDF are build
> artifacts.**

------------------------------------------------------------------------

## 1. Objective

A CV module inside the admin that:

-   builds the seven CVs maintained by hand today (consolidated,
    academic, corporate DA, FS and ML, research ML and statistics) as
    presets, from the content the portfolio already maintains plus a small
    layer of CV-only wording
-   keeps wording variants only where the emphasis genuinely differs
-   includes, excludes and orders content per preset by configuration
-   shows the generated LaTeX, allows one-off overrides, and downloads
    `.tex`
-   compiles in the browser, previews and downloads the PDF, and shows
    the build log with errors and warnings
-   archives immutable snapshots in Cloudflare R2
-   updates stable Google Drive files in place, so existing CV links
    keep working
-   tracks version history and whether the published CV is current

and does all of it **without relaxing the Content Security Policy of any
admin page** (§8).

------------------------------------------------------------------------

## 2. What changed from the first draft

| Topic | First draft | Now | Why |
|---|---|---|---|
| Master content | A new `cv_content` table in D1 | The portfolio YAML in `src/content/profile_info/`, plus a CV layer in `src/content/cv/` | The portfolio already holds education, experience, projects, publications and awards. A second copy is the maintenance problem this module exists to remove. |
| Presets, templates | D1 rows | `presets.yml` in Git; templates as files in the admin source | Reviewed, diffed and versioned like every other admin edit |
| Metadata database | D1 | None. The snapshot index is an R2 listing. | One owner, tens to hundreds of snapshots. Add D1 only if listing becomes slow; nothing here blocks it. |
| Snapshot contents | PDF, tex, config, metadata | PDF, tex, **resolved build input**, metadata | A config only references content. Once the YAML changes, a config alone cannot rebuild an old CV. |
| Snapshot storage | R2, bucket unspecified | A new private bucket, `CV_ARCHIVE` | `MEDIA` is public and `DRAFTS` is staging that expires |
| Template | A fixed placeholder per section | `{{HEADER}}` and `{{BODY}}` only | Presets order sections; fixed placeholders contradict that |
| Compilation | WebAssembly on the admin page | WebAssembly in a dedicated Web Worker with its own CSP | Keeps `'wasm-unsafe-eval'` off every admin page |
| Drive credentials | OAuth tokens | A service account shared on each CV file | OAuth apps left in Testing get refresh tokens that expire after seven days; a service account reaches only the files shared with it |
| Source editor | Monaco | CodeMirror 6 | Lighter, uses no eval, needs no blob workers |
| Application builds | Unspecified | Private R2 only | The repository is public; where you applied is not |
| Variant keys | A fixed set: concise, academic, industry, research, internship | Free-form keys; each preset lists the keys it prefers, in order | The existing CVs aim at audiences (statistics research, data analysis, full-stack) that no fixed set names |
| Recovered LaTeX errors | Not addressed | Any error fails the build and blocks publishing | Every existing CV builds with 11 to 58 errors that pdfTeX recovered from without anyone seeing them (§18) |

------------------------------------------------------------------------

## 3. Architecture

``` text
Owner's browser
   │
   │  Cloudflare Access protects the whole hostname
   ▼
Admin Worker (worker/index.ts)
   verifies the Access JWT on every request, Origin + CSRF on every
   mutation, and sets the security headers
   │
   ├── admin pages ──────────── page policy, UNCHANGED
   │     CV views: library, builder, versions, publishing
   │     TypeScript renderer · CodeMirror · PDF.js on <canvas>
   │        │ .tex                      ▲ PDF bytes + log
   │        ▼                           │
   ├── /cv-engine/* ─────────── engine policy (§8)
   │     TeX engine in a dedicated Web Worker
   │     vendored pdfTeX WebAssembly + the TeX files the template needs
   │     'wasm-unsafe-eval' applies here only; fetches only /cv-engine/
   │
   └── /api/*
         /api/content/cv/*   ─► pending store (DRAFTS) ─► GitHub, V1
         /api/cv/snapshots   ─► R2 CV_ARCHIVE (private, no delete)
         /api/cv/publish     ─► Google Drive (service account, files.update)
```

Core data flow:

``` text
PORTFOLIO YAML + CV LIBRARY ─► PRESET (+ application patch) ─► BUILD INPUT
   ─► GENERATED .TEX ─► COMPILED PDF ─► SNAPSHOT ─► PUBLICATION
```

------------------------------------------------------------------------

## 4. Where data lives

| Data | Store | Notes |
|---|---|---|
| Facts: roles, dates, degrees, institutions, projects, publications, awards, contact details | Portfolio YAML (Git, V1) | Unchanged, except that entries the CV uses gain an `id` |
| CV entries, bullets, variants, summaries, skills, interests | `src/content/cv/library.yml` (Git, V1) | Public: everything here appears on a published CV anyway |
| Presets | `src/content/cv/presets.yml` (Git, V1) | |
| Templates | `admin/src/cv/templates/` | Code; changes go through review |
| Drive targets (preset → file ID) | `CV_DRIVE_TARGETS` in `wrangler.jsonc` vars | File IDs are not secret; the site's CV file ID is already in `profile.yml` |
| Service-account key | Worker secrets | Never reaches the browser |
| Snapshots and publication records | R2 `CV_ARCHIVE` | Private |
| Application builds and snapshot reasons | R2 `CV_ARCHIVE` | Private, because the repository is public |
| Compiled but unsaved builds | Browser memory | Not persisted |

The CV header (name, email, phone, website, GitHub, LinkedIn, Google
Scholar) reads `profile.yml`, which already holds all of them.

------------------------------------------------------------------------

## 5. Content model

### 5.1 Facts come from the portfolio

A CV item refers to a portfolio entry as `<collection>#<id>`. The
collection is a key of `contentSources` in
[registry.ts](../worker/content/registry.ts), so the CV addresses content the
same way the rest of the admin does:

``` text
home/experience#ideas-tih-asd
home/education#msc-cu
projects-publications/technical#messymashup
```

Entries are currently addressed by index, which a preset cannot depend on.
Entries the CV uses therefore gain an `id`:

``` yaml
experience:
  - id: ideas-tih-asd
    job_role: Associate Software Developer
    company: Institute of Data Engineering, Analytics and Science Foundation - ...
    time_period: Oct 2025 - Aug 2026
```

-   Ids are lowercase kebab-case, unique within a collection, and never
    reused.
-   `id` is declared in `src/config/entryFields.ts` and shown read-only
    once set, so an edit cannot break a preset by accident.
-   The YAML writer keeps unknown keys and the Vue site ignores them, so
    adding ids changes nothing on the site.
-   A preset naming an id that no longer resolves fails to build, and the
    message names the preset and the reference. Nothing is dropped
    silently.

### 5.2 The CV layer

Website descriptions are long paragraphs with links and `@see[…]`
cross-references. CV bullets are short. And a CV often shows a fact
differently from the site: a shorter tech list, or "IIT Madras" instead of
the full name. So CV wording lives in its own file. Every list in it is
**flat, one row per thing**. The admin's list editor stops at one level of
nesting (see [CAVEATS.md](../CAVEATS.md)), and flat rows fit it without a
new editor.

``` yaml
# CV wording the portfolio pages don't carry. Facts come from the portfolio
# entry named by `ref`; a field set here replaces that fact on the CV only.
entries:
  - ref: projects-publications/research#messymashup
    tech: Python, Deep Learning, Audio Processing (Librosa), CNN
    context: BS in Data Science and Applications, DLGenAI - Diploma project, `IIT Madras`
  - ref: projects-publications/technical#quiz-pilot
    short_context: Diploma Proj., BS in DS and App., `IIT Madras`
  - id: ideas-mentor                 # no ref: an item that exists only on the CV
    title: IDEAS-TIH, Indian Statistical Institute Kolkata
    subtitle: Project Mentor, Spring and Summer (Data Science) Internship Programs
    location: Kolkata, WB
    period: '2026'

bullets:
  - id: npcyf-lead
    ref: home/experience#ideas-tih-asd
    kind: lead
    text: Developed core components of **National Platform for Crop Yield Forecasting (NPCYF)** as a part of **FASAL 2.0** ...
    research: Developed core components of **National Platform for Crop Yield Forecasting (NPCYF)** supporting nationwide ...
  - id: npcyf-models
    ref: home/experience#ideas-tih-asd
    text: Integrated **TabPFN**, **Panel Regression** and **Random Forest**-based forecasting workflows ...
    tags: [statistics, machine-learning, forecasting]

summaries:
  - id: profile
    text: Statistics postgraduate student with a background in data science ...
    research: M.Sc. Statistics student with experience in applied statistical modelling ...
    data: Data analyst with a background in statistics and data science ...
    fullstack: Quantitative developer with experience in statistical modelling ...

skills:
  - id: languages
    label: Languages
    text: Python, R, JavaScript, TypeScript
    research: Python, R, JavaScript
  - id: web
    label: Web Development (Backend & Frontend)
    text: FastAPI, Flask, Laravel, React, Vue 3, TanStack Query, Tailwind CSS

interests:
  - id: nonparametric
    text: Non-parametric Inference
```

**Entries** override portfolio facts on the CV. Every field is optional:
`title`, `subtitle`, `tech`, `context`, `link`, `location`, `period`,
`coursework`, and `short_title` and `short_context` for the one-line
style (§5.3). A row without a `ref` is an item that exists only on the CV,
and needs its own `id`. The IDEAS-TIH mentor position is one: the CVs
merge two cohorts that the site lists separately.

A project heading's subtitle comes from splitting the portfolio title at
its first `: `, as the CVs do now ("MessyMashup:" with the subtitle on the
next line), unless the entry sets one.

**Bullets** have a `kind`. `lead` is the paragraph under an experience
heading, before its bullets ("– Developed core components of …"). `item`,
the default, is an ordinary bullet.

**Variants.** `text` is the canonical wording. Any other lowercase key on
a row (`research`, `data`, `fullstack`, `ml`, `stats`) is a variant. Key
names are not fixed, because the existing CVs aim at audiences no fixed
list names. Every variant key must appear in some preset's `prefer` list,
so a typo fails validation instead of never being used.

Most rows should have `text` alone. Add a variant only where the emphasis
has to change; every variant is one more thing to keep current. Most of
the differences between the seven existing files are drift, meaning the
same bullet edited in one file and not the others, not intentional
variants (§18).

A row's wording in a preset is chosen in this order:

1.  the preset's per-row choice (its `variants` map)
2.  the first key in the preset's `prefer` list that the row has
3.  `text`

### 5.3 Presets

`presets.yml` is a list, because the registry writes lists and not maps:

``` yaml
presets:
  - id: research-stats
    name: Research CV (Statistics)
    prefer: [stats, research]
    template: resume-v1
    template_options:
      bullet_size: small
    filename: SamyabrataRoy_Resume_Research_Stats
    pages: 2
    header: [phone, gmail, website, linkedin, github]
    sections:
      - kind: summary
        items: [profile]
      - kind: education
        items: [home/education#msc-cu, home/education#bs-iitm, home/education#bsc-snu]
      - kind: experience
        items:
          - ref: home/experience#ideas-tih-asd
            bullets: [npcyf-lead, npcyf-models, npcyf-pipeline]
          - ref: home/experience#ideas-tih-intern
            bullets: [fasal-lead, imd-scraping, fastapi-react]
      - kind: projects
        title: Projects
        items:
          - ref: projects-publications/research#messymashup
            bullets: [mm-cnn, mm-mashups, mm-features]
          - ref: projects-publications/research#wine-quality
            bullets: [wine-methods, wine-compare]
          - ref: projects-publications/technical#quiz-pilot
            style: compact
      - kind: skills
        items: [stats-modelling, languages, databases, others]
      - kind: certifications
        items: [internships-certifications/certifications#jhu-uq]
      - kind: positions
        items:
          - ref: cocurricular/leadership#chi-square
            bullets: [chi-founded, chi-events, chi-reading-group]
      - kind: interests
        items: [nonparametric, bayesian, ml, dl, uq]
    variants:
      npcyf-models: concise
```

-   **Inclusion is explicit.** A preset lists what it shows, in the order
    it shows it. New content joins no preset until it is ticked in the
    builder, so adding a workshop to the site never silently lengthens a
    published CV. The builder flags candidates the preset does not include
    ("3 new items").
-   An item containing `#` is a portfolio entry; a bare id is a row of
    the CV library.
-   Section order is list order.
-   `style: compact` shows a project on one line, collected under "Other
    Projects" at the end of the section, as the current CVs do. The
    default is `full`.
-   `pages` is a budget. The build console warns when the PDF runs over.
    All seven CVs are two pages today.
-   `header` names keys of `profile.yml`. The address on the current CVs
    is `contacts.gmail`, not `contacts.email`.
-   Presets are edited in the builder's configuration column, which saves
    the whole row through `PUT /api/content/cv/presets`. They are deeper
    than the generic list editor handles.

The seven existing files become the seven launch presets:

| Preset | From |
|---|---|
| `consolidated` | `SamyabrataRoy_Resume_Consolidated.tex` |
| `academic` | `SamyabrataRoy_Resume_Academic.tex` |
| `corporate-da` | `SamyabrataRoy_Resume_Corporate_DA.tex` |
| `corporate-fs` | `SamyabrataRoy_Resume_Corporate_FS.tex` |
| `corporate-ml` | `SamyabrataRoy_Resume_Corporate_ML.tex` |
| `research-ml` | `SamyabrataRoy_Resume_Research_ML.tex` |
| `research-stats` | `SamyabrataRoy_Resume_Research_Stats.tex` |

Section kinds are fixed in code. Each has its own template macros and the
collections it may draw from:

| Section | Draws from |
|---|---|
| `summary` | `cv/summaries` |
| `education` | `home/education`, with `coursework` from entries |
| `experience` | `home/experience`, plus lead and bullets |
| `projects` | `projects-publications/research`, `technical`, `minor`, `other`, plus bullets |
| `publications` | `projects-publications/publications`, `articles`, `posters` |
| `certifications` | `internships-certifications/certifications` |
| `positions` | `cocurricular/leadership`, `cocurricular/volunteering`, `teaching/mentoring`, CV-only entries |
| `awards` | `home/awards`, `home/achievements` |
| `interests` | `cv/interests` |
| `skills` | `cv/skills` |

The site's research interests are a different, broader list
(Machine_Learning, Statistical_Modeling…), so CV interests are their own
list.

### 5.4 Application builds

A one-off build for a particular application is not a preset. It is stored
privately in R2 as `cv/applications/<ulid>.json`:

``` json
{
  "id": "01J9XYZ...",
  "base": "academic",
  "organization": "IISER Kolkata",
  "purpose": "Research internship",
  "patch": { "sections": [], "variants": {} },
  "createdAt": "2026-10-04T00:42:13+05:30"
}
```

The effective preset is the base with the patch applied: `sections`
replaces the base's list when present, and `variants` merges into it.
Application builds are archived like any other build but have no Drive
target.

### 5.5 Schema

The schema is code: zod schemas in
[admin/src/cv/schema.ts](../src/cv/schema.ts), with every TypeScript type
inferred from them, so the types and the runtime checks cannot drift
apart. Its only import is zod, so the browser, the Worker and the Node
tests load the same file.

| Schema | Reads | Type |
|---|---|---|
| `cvLibrarySchema` | `library.yml` | `CvLibrary` (`CvEntry`, `CvBullet`, `CvSummary`, `CvSkill`, `CvInterest`) |
| `cvPresetsSchema` | `presets.yml` | `CvPreset[]` (`PresetSection`, `PresetItem`) |
| `applicationBuildSchema` | `cv/applications/<ulid>.json` in R2 | `ApplicationBuild` |
| `buildInputSchema` | `build.json`, from the browser and in snapshots | `BuildInput` (`ResolvedSection`, `ResolvedItem`) |

-   **What the schemas fix while reading.** Blank YAML values are
    absent, and blank lists are empty. Numbers become text (`period: 2026`).
    Variant keys are gathered from beside `text` into a `variants` map.
    Defaults are filled in: `kind: item`, `style: full`, and empty
    `prefer`, `header`, `variants` and `template_options`.
-   **Preset fields keep their YAML names** (`template_options`). The
    builder edits a preset and writes the same row back.
-   **`buildInputSchema` transforms nothing**, so a parsed build input is
    exactly what was sent and hashes the same.
-   **Problems carry a path** from file to field:
    `presets.yml/presets/0/sections/2/kind`. `parseLibrary` and
    `parsePresets` return every problem, not just the first.
-   **zod runs `jitless`.** By default zod compiles fast paths with
    `new Function`. The admin's CSP forbids that, and so do Workers, and
    zod's probe for it is itself reported as a CSP violation. A test pins
    the setting.

Checks that span rows and files live in
[validate.ts](../src/cv/validate.ts) as `validateCv`:

-   ids are unique (across every list with wording, because a preset's
    `variants` map names rows by id alone)
-   every ref lands, in the portfolio or among CV-only entries
-   a section draws only from its allowed collections (§5.3)
-   a bullet shown under an item belongs to that item, with at most one
    lead
-   a summary section shows exactly one summary
-   each preset suits its template: section kinds, item styles and option
    values
-   every variant key is preferred by some preset, which catches typos

A `ResolvedSection` holds final strings with the variant already chosen:
titles, subtitles, locations, periods, links and bullets. The renderer
makes no content decisions.

------------------------------------------------------------------------

## 6. Build pipeline

``` text
portfolio YAML ─┐
library.yml ────┼─► resolve() ─► BuildInput ─► render() ─► document.tex ─► engine ─► PDF
presets.yml ────┘       │             │                       │                     │
application patch ──────┘        inputHash          view · copy · download   preview · download
```

-   `resolve()` takes the collections as arguments and does no fetching.
    In the admin they come from `/api/content/…`, which includes edits
    still waiting in the pending store, so a build can show unpublished
    changes.
-   `render()` is pure: the same `BuildInput` always produces a
    byte-identical `.tex`. No clock, no locale-dependent formatting, no
    randomness. Templates print no build date, because a date that changes
    daily would make every build look new.
-   `inputHash` is the SHA-256 of the canonical JSON (sorted keys) of
    `BuildInput` without `source`. It drives the status chips (§12) and
    recognises identical builds.
-   `render()` imports nothing from React or the DOM, so the Worker runs
    the same code to check snapshots (§9).
-   The `.tex` stays available when compilation fails.

### 6.1 Templates

Presentation stays separate from content, and **more than one template is
expected**. Each template is a folder plus one entry in the registry,
[templates/index.ts](../src/cv/templates/index.ts):

``` text
admin/src/cv/templates/
    index.ts                 the registry: one manifest per template
    resume-v1/
        skeleton.ts          the document: preamble, commands, {{HEADER}}, {{BODY}}
        render.ts            one renderer per section kind it supports
    <next-template>/
        skeleton.ts
        render.ts
```

A manifest (`TemplateManifest` in the schema) is what a template promises:

``` ts
export const resumeV1 = {
  id: 'resume-v1',
  name: 'Resume',
  version: 1,
  engine: 'pdftex',            // or 'xetex' for a template that needs system fonts
  paper: 'letter',
  sections: {
    kinds: SECTION_KINDS,      // the section kinds it can draw
    styles: { projects: ['full', 'compact'] },
  },
  options: {
    bullet_size: { type: 'choice', choices: ['footnotesize', 'small'], default: 'footnotesize' },
  },
} as const satisfies TemplateManifest
```

Adding a template touches nothing else:

-   **The content model does not change.** A template reads the same
    resolved `BuildInput`, and presets that don't choose it are
    unaffected.
-   **Presets are checked against the template they name.**
    `validateCv` reports a section kind the template cannot draw, an item
    style it lacks, and an unknown or ill-typed option. Switching a preset
    to a new template shows what has to change before anything renders.
-   **Options are the template's own knobs.** A preset sets them in
    `template_options`, and the manifest supplies a default for each one
    left out. `resume-v1`'s `bullet_size` exists because the Consolidated
    CV sets bullets in `\footnotesize` and the six older files used
    `\small`.
-   **The engine is per template.** A template that needs XeLaTeX (for
    `fontspec` and system fonts) says `engine: 'xetex'`, and the builder
    loads that engine from `/cv-engine/xetex/<version>/` instead. It sits
    under the same engine policy (§8), so the page policy still doesn't
    change.
-   **Renderers can be shared.** A new template's `render.ts` may reuse
    `resume-v1`'s renderer for any section it draws the same way, and
    write its own for the rest.
-   **An application build may switch template** through its patch, for
    a one-off application that wants a different look.

The template parts:

``` latex
% preamble and macros: \resumeSubheading, \resumeItem, \resumeProjectHeading ...
\begin{document}
{{HEADER}}
{{BODY}}
\end{document}
```

-   `resume-v1` is the Consolidated CV's preamble with the document body
    replaced by `{{HEADER}}` and `{{BODY}}`. It is the newest of the seven
    and the only one with `\resumePositionSubheading`.
-   The `\vspace` adjustments scattered through the current files, which
    differ in every file, are not carried over one by one. Spacing belongs
    to the macros, and each preset's page budget is the check that it
    still fits.
-   Each section kind emits calls to the template's macros. `{{BODY}}`
    receives the sections in preset order.
-   The template's id, version, SHA-256 and resolved options are part of
    `BuildInput`, so editing a template, or a preset's options, marks
    every affected build as outdated.
-   A skeleton is a TypeScript module exporting the document as a
    `String.raw` string, so the browser, the Worker and Node load it with no
    loader configured. LaTeX here never needs a backtick, the one character
    such a string cannot hold.
-   Several layouts (current resume, academic traditional, compact) are
    several files; content is not duplicated.

### 6.2 Text to LaTeX

All authored text goes through one converter. It reuses the site's own
parsers, so the CV recognises exactly the markup the site does:

| Authored | LaTeX |
|---|---|
| `**bold**`, `*italic*`, `__underline__` (`splitEmphasis` in `src/utils/inlineMarkup.ts`) | `\textbf{}`, `\textit{}`, `\underline{}` |
| `` `name` `` (the site's highlighted names) | `\textbf{name}`, as the CVs already bold institutions in project context lines |
| `[text](https://…)`, `[text](mailto:…)` | `\href{…}{text}` |
| A link with any other scheme (`javascript:`, a relative path) | the text only |
| `@see[label](/path)` (`stripCrossReference`) | removed, because it points into the site |
| `[[Visible\|Name\|Kind]]` (`smartLinkPlainText`) | `Visible` |
| `<br>` | a space |
| `\ { } $ & # ^ _ % ~ < >` | escaped (`\&`, `\%`, `\textbackslash{}`, …) |

This is security, not just formatting:

-   Escaping is what stops authored text from becoming LaTeX commands.
-   The scheme allowlist is what stops a `javascript:` link annotation
    from reaching a published PDF.
-   A character the template's fonts cannot set fails the build, naming
    the item, instead of vanishing from the PDF.

URLs are percent-encoded before `%`, `#` and `&` are escaped for `\href`.
Tests cover each special character.

------------------------------------------------------------------------

## 7. Builder

``` text
┌──────────────────────────────────────────────────────────────────────────┐
│ CV · Academic CV ▼     Content ✓    Build ⚠ outdated    Published ⚠      │
│                                                                          │
│ Save     Compile     Save Version     Publish                            │
├─────────────────┬───────────────────────────┬────────────────────────────┤
│ CONFIGURATION   │ SOURCE                    │ PREVIEW                    │
│                 │ [Generated] [Override]    │                            │
│ Prefers         │                           │  ┌──────────────────────┐  │
│ stats, research │ \section{Education}       │  │                      │  │
│ Template        │ ...                       │  │      CV PAGE         │  │
│ resume-v1 ▼     │                           │  │                      │  │
│                 │ \section{Experience}      │  │                      │  │
│ ☑ Education     │ \resumeSubheading...      │  │                      │  │
│ ☑ Experience    │                           │  └──────────────────────┘  │
│   ☑ NPCYF       │                           │                            │
│   ☑ Models  [academic ▼]                    │  Page 1 / 2    100%        │
│   ☐ Frontend    │                           │                            │
│ ☑ Projects      │ Copy   Download .tex      │  Download PDF              │
│   3 new items   │                           │                            │
├─────────────────┴───────────────────────────┴────────────────────────────┤
│ BUILD  ✓ Generated  ✓ Compiled  2 pages  181 KB  0 errors  1 warning     │
│ View Log                                                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

-   **Configuration** is the preset editor: preferred variants, template,
    page budget, sections, items, compact or full style, and per-row
    variants. Drag to reorder.
-   **Source** is CodeMirror 6 with the `stex` mode: highlighting,
    search, line numbers, bracket matching, error-line navigation. It is
    read-only in Generated mode.
-   **Preview** is PDF.js drawing to `<canvas>`, with page navigation and
    zoom.

### 7.1 Overrides

``` text
[ Create editable copy ]

⚠ Manual edits apply to this build only and never change CV content.
```

An override is a buffer seeded from the generated `.tex`. A snapshot of an
override build stores both `document.tex` (the override) and
`generated.tex`, and marks `override: true`. Nothing is written back to
`library.yml` or the portfolio.

### 7.2 Preview modes

``` text
Preview mode   ● On Compile   ○ Auto Compile
```

-   **On Compile** is the default.
-   **Auto Compile** waits 1.5 s after the last change, and compiles only
    if the `.tex` actually changed. A newer change cancels a compile in
    progress.
-   A compile running longer than 30 s is stopped by terminating the
    engine worker and starting a fresh one, so a runaway macro in an
    override cannot freeze the page.

### 7.3 Build console

``` text
──────────────────── Build Output ────────────────────
✓ LaTeX generated
✓ pdflatex

Warnings (1)
Overfull \hbox (2.734pt too wide) at lines 137--139

Build completed in 842 ms.                  [ Full Log ]
```

``` text
BUILD FAILED

! Undefined control sequence.
l.137 \resumeFooBar
                   ↑
[ Jump to line 137 ]          Raw LaTeX is still available. [ Download .tex ]
```

The log parser reads `!` errors with their `l.<n>` lines, `LaTeX Warning:`
lines and box warnings. pdfTeX runs a second pass only when the log asks
for a rerun.

**Any error fails the build**, even though pdfTeX in nonstop mode recovers
and writes a PDF anyway. The preview still shows that PDF under a "built
with errors" banner, but Save Version and Publish stay disabled. Recovered
errors are how the problems in §18 went unnoticed.

A page count over the preset's budget is a warning, not an error.

### 7.4 Compile all

The CV Overview has **Compile all**, the admin's version of
`compile_all.sh`. It compiles every preset in turn through one engine
worker and shows each one's pages, errors and warnings in a table.
**Download all** then saves every `.tex` and PDF in one `.zip`, built in
the page with `fflate`, which uses no eval.

------------------------------------------------------------------------

## 8. Compiling without loosening the CSP

### 8.1 The constraint

Every admin response carries this policy, set in
[http.ts](../worker/http.ts):

``` text
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
img-src 'self' https: blob: data:; connect-src 'self'; font-src 'self';
object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'
```

Without `'wasm-unsafe-eval'`, `script-src 'self'` blocks
`WebAssembly.compile` and `instantiate`, so a TeX engine cannot run on an
admin page. **This policy stays exactly as it is.**

For context on the risk being avoided: `'wasm-unsafe-eval'` permits
compiling WebAssembly. It does not permit `eval`, `new Function` or inline
scripts; those are `'unsafe-eval'` and `'unsafe-inline'`. Code must already
be running to call the WebAssembly APIs, so by itself the directive gives
an attacker little. Still, admin pages hold the GitHub write path and
authority over media, and the CV module gains nothing from widening their
policy. So it doesn't.

### 8.2 The engine gets its own policy

A dedicated Web Worker loaded from an `http(s)` URL is governed by the CSP
sent with its own script, not by the policy of the page that created it.
Chrome, Firefox and Safari all behave this way. A worker created from a
`blob:` or `data:` URL inherits the page's policy instead, which is why the
engine is never created from one.

1.  The engine (pdfTeX compiled to WebAssembly, its format file, and the
    TeX files the template needs) is vendored in
    `admin/public/cv-engine/<engine>/<version>/`.
2.  The page calls `new Worker('/cv-engine/pdftex/<version>/engine.js')`. The page
    policy already allows this, because `worker-src` falls back to
    `script-src 'self'`.
3.  The Worker serves every `/cv-engine/` response with the **engine
    policy**, built from `ADMIN_ORIGIN`:

    ``` text
    default-src 'none';
    script-src https://admin.samyabrata.codeium.xyz/cv-engine/ 'wasm-unsafe-eval';
    connect-src https://admin.samyabrata.codeium.xyz/cv-engine/;
    base-uri 'none'; frame-ancestors 'none'
    ```

4.  The page posts `.tex` to the engine worker, which posts back the PDF
    bytes and the log.

What the engine policy confines:

-   WebAssembly runs only inside the engine worker. The worker has no
    DOM, no `document.cookie`, and no storage shared with the page.
-   The worker can fetch and import only from `/cv-engine/`, a path
    prefix. It cannot call `/api/*`, so even a compromised engine cannot
    use the owner's Access session to read content, publish, or touch R2.
-   It cannot reach a third-party TeX file server either. The engine's
    own "set endpoint" message cannot point it outside `/cv-engine/`.
-   The only WebAssembly it can load is the vendored binary.
    `/cv-engine/` is static build output, and no admin route writes there.

### 8.3 Serving rules for `/cv-engine/`

-   `secureResponse()` picks the engine policy by path, and every other
    response keeps the page policy. The remaining security headers are
    unchanged.
-   A missing file returns **404**. Without that, the asset binding's
    single-page-application fallback would answer with `index.html` and
    status 200, and the engine would read the admin's HTML as a `.sty`
    file.
-   HTML is never served from `/cv-engine/`, so the engine policy can
    never apply to a document.
-   Files sit under a version path, so they can be cached privately
    (`private, max-age=31536000, immutable`) instead of `no-store`. The
    engine is several megabytes.
-   `MANIFEST.sha256` lists every vendored file, and a test checks it. A
    replaced engine binary therefore shows up in review.
-   The TeX file set is fixed to what the template needs. It is collected
    once in phase 0 by compiling the template locally against the
    engine's public TeX file server and recording every file fetched.

### 8.4 Everything else stays under the page policy

-   **PDF.js**: its worker loads from a same-origin URL (a Vite `?url`
    import, never a blob), with `isEvalSupported: false`, and draws to
    `<canvas>`. Its optional WebAssembly image decoders are blocked by the
    page policy and fall back to JavaScript; a CV contains no images that
    need them. No `<iframe>` or `<object>`: the page policy forbids
    `object`, and `frame-ancestors 'none'` stops the admin framing itself.
-   **CodeMirror 6**: uses no eval. The style elements it adds are covered
    by the existing `style-src 'unsafe-inline'`.
-   **Downloads**: an `<a download>` with a `blob:` URL, which CSP does
    not govern.

### 8.5 Failure mode

If a browser applied the page policy to the engine worker, WebAssembly
would be blocked and the compile would fail with a message in the build
console. The policy never becomes weaker, and the `.tex` is still
downloadable. It fails closed.

### 8.6 Alternatives considered

| Option | Verdict |
|---|---|
| Add `'wasm-unsafe-eval'` to the page policy | Simplest, and the real risk is small (§8.1). But it applies to every admin page for a feature one page uses. Rejected. |
| A sandboxed iframe with its own policy | Needs `frame-ancestors` and `X-Frame-Options: DENY` relaxed for that path. An opaque-origin frame loses the Access cookie, and its workers would have to be `blob:` URLs, which inherit policy. More moving parts for a weaker result. |
| Compile in a GitHub Action | No browser change. But this repository is public, and so are its Actions logs and artifacts, so CV drafts and application builds would leak. It needs a private repository. |
| Compile in a Cloudflare Container running TeX Live | No browser change and full TeX Live, at the cost of a paid service and cold starts. The fallback if the browser engine fails the phase 0 spike. |
| Typst instead of LaTeX | Also WebAssembly, so the same question, plus a template rewrite |

------------------------------------------------------------------------

## 9. Snapshots

Not every compile is kept:

``` text
Compile       → kept in memory only
Save Version  → permanent snapshot
Publish       → permanent snapshot, reusing the latest one if its inputHash matches
```

`CV_ARCHIVE` is a private bucket (`folioforge-cv-archive`) with no public
domain, no `r2.dev` URL and no lifecycle rule:

``` text
cv/
├── snapshots/<ulid>/
│   ├── document.pdf
│   ├── document.tex
│   ├── generated.tex        only when the build was overridden
│   ├── build.json           the resolved BuildInput
│   └── metadata.json
├── publications/<preset>/<ulid>.json     one record per Drive update
├── publications/<preset>/latest.json     the only object ever rewritten
└── applications/<ulid>.json
```

`metadata.json`:

``` json
{
  "id": "01J9XYZ...",
  "preset": "academic",
  "application": null,
  "reason": "IISER research application",
  "createdAt": "2026-10-04T00:42:13+05:30",
  "inputHash": "sha256:...",
  "template": { "id": "resume-v1", "sha256": "..." },
  "rendererVersion": 1,
  "source": { "v1Sha": "0f15f32d...", "pending": false },
  "override": false,
  "pdf": { "bytes": 184320, "pages": 2, "md5": "...", "compiledIn": "browser" }
}
```

The same summary is set as R2 custom metadata on `metadata.json`, so the
Versions page renders from one list call.

What the Worker checks on Save Version:

-   The PDF starts with `%PDF-` and is at most 5 MB. Each text part is at
    most 1 MB.
-   It parses `build.json` with `buildInputSchema`, so a malformed or
    oversized input never reaches the archive.
-   Optionally, it re-renders `build.json` with the shared renderer and
    requires the result to equal `document.tex`, or `generated.tex` for an
    override, so the archived source and input always agree. This is the
    only reason the Worker would import the renderer; it is an open
    question (§17).
-   It cannot prove the PDF came from that `.tex`, because only the
    browser saw the compile. The metadata says so: `compiledIn: browser`.
-   Keys are ULIDs the Worker generates. The browser never names a key.

Immutability: the handler's bucket type has `put`, `get` and `list` and no
`delete`, the same narrowing [types.ts](../worker/types.ts) uses for
`ReadOnlyBucket`. Snapshot keys are written once. An R2 bucket-lock
retention rule on `cv/snapshots/` can optionally make them undeletable even
from the dashboard.

Version history:

``` text
VERSION HISTORY

04 Oct 2026  00:42   Academic CV · IISER research application
PDF  TEX  Build input                         Published → Google Drive
──────────────────────────────────────────────────────────────────────
29 Sep 2026  14:16   Academic CV
PDF  TEX  Build input                         [ Rebuild ]
```

**Rebuild** loads `build.json` into the builder and renders it again. The
`.tex` is identical as long as the renderer version and template still
match; when they don't, the builder says which one changed.

------------------------------------------------------------------------

## 10. Publishing to Google Drive

R2 is the immutable archive. Drive holds the current copy at a stable link.

### 10.1 Credentials

-   A Google Cloud service account, whose key is stored as the Worker
    secrets `GOOGLE_SA_EMAIL` and `GOOGLE_SA_PRIVATE_KEY`.
-   Each target CV file in your Drive is shared with the service account
    as Editor. The account sees nothing else, so although it requests the
    `drive` scope, it can reach only the files you shared. (`drive.file`
    would not cover files you created yourself.)
-   The Worker mints short-lived access tokens. It signs an RS256 JWT with
    `jose`, already a dependency for Access, and exchanges it at
    `https://oauth2.googleapis.com/token` (grant
    `urn:ietf:params:oauth:grant-type:jwt-bearer`). The token is cached in
    memory until it expires.
-   Why not OAuth for your own account: apps left in Testing get refresh
    tokens that expire after seven days, and the publish button would
    stop working weekly.

### 10.2 Targets

``` json
"CV_DRIVE_TARGETS": {
  "consolidated": "1qeizy-UFYi6mzu9Y4grn801xs0RpLjoz",
  "academic": "...",
  "research-stats": "..."
}
```

The browser names a preset and the Worker looks up the file. This is the
content registry's rule again: no request carries a file ID.

`1qeizy…` is the file `profile.yml`'s `cv` link already points at, so the
site's "My CV" button serves each new publish with no site change. These
examples assume that file holds the Consolidated CV; which preset owns it
is an open question (§17).

### 10.3 Flow

``` text
POST /api/cv/publish { preset, snapshotId }
  1. the preset has a Drive target                    else 400 unknown_target
  2. the snapshot exists, belongs to that preset,
     and is not an application build
  3. PATCH https://www.googleapis.com/upload/drive/v3/files/{id}?uploadType=media
       body: document.pdf read from R2
  4. GET files/{id}?fields=md5Checksum,modifiedTime  → must equal the snapshot's md5
  5. write publications/<preset>/<ulid>.json and latest.json
```

-   The browser runs Save Version first (or reuses a matching snapshot),
    then Publish with its id. Drive only ever receives archived bytes, so
    every published PDF has a snapshot.
-   If step 3 or 4 fails, the snapshot stays and no publication is
    recorded. The UI shows "Saved, not published", and Retry publishes the
    same snapshot. Uploading identical bytes twice is harmless.
-   Updating the file keeps its ID, owner, sharing and link. Drive keeps
    its own revision history, but R2 is the record.

``` text
PUBLISHING · Google Drive

Academic CV                                            Connected ✓
File            Samyabrata_Roy_Academic_CV.pdf
Last published  04 Oct 2026, 12:42 AM  (snapshot 01J9XYZ…)
Status          Current ✓
                [ Copy Link ]  [ Open ]  [ Publish Current Build ]
```

------------------------------------------------------------------------

## 11. Worker API

### 11.1 What the Worker does, and doesn't

The Worker's CV code is small. It does only what the browser cannot do
safely:

| Job | Why it cannot be in the browser | Code |
|---|---|---|
| Talk to Google Drive | The service-account key must never reach the browser | `worker/cv/drive.ts` |
| Write and read the R2 archive | R2 is reached through the Worker's bucket binding; the browser holds no storage credentials | `worker/cv/snapshots.ts` |
| Check what the browser sends | Anything from the browser is untrusted: `build.json` goes through `buildInputSchema`, the PDF and `.tex` through size and format checks | `worker/cv/routes.ts` |
| Read and write CV content | Already done by the existing collection routes and GitHub publish path: **no new code**, six registry entries | `worker/content/registry.ts` |

It does **not** render LaTeX, compile, preview, diff or resolve presets.
All of that runs in the browser, which is why the Worker needs no TeX
engine. The one exception under discussion is the optional re-render
check (§9, §17).

### 11.2 Routes

All routes sit under the existing `/api/*` handling in
[index.ts](../worker/index.ts), so Access verification, and Origin plus
CSRF on mutations, apply without new code.

| Method | Route | Does |
|---|---|---|
| GET, POST, PUT, DELETE | `/api/content/cv/entries`, `cv/bullets`, `cv/summaries`, `cv/skills`, `cv/interests`, `cv/presets` | The existing collection route; six new registry entries |
| POST | `/api/cv/snapshots` | Multipart: `document.pdf`, `document.tex`, `build.json`, optional `generated.tex`, `reason`. Runs the §9 checks and returns the id. |
| GET | `/api/cv/snapshots?preset=&cursor=` | Lists snapshot metadata |
| GET | `/api/cv/snapshots/:id/:file` | Streams one file; `:file` comes from a fixed list |
| POST | `/api/cv/publish` | `{ preset, snapshotId }`, per §10.3 |
| GET | `/api/cv/targets` | For each preset: whether it has a target, and its latest publication |
| GET, POST, PUT | `/api/cv/applications[/:id]` | Application builds |

-   `jsonBody`'s 512 KB cap stays for JSON routes. The snapshot route
    checks `content-length` against its own limits before reading
    `formData()`.
-   A missing integration answers 503 with a code
    (`cv_archive_not_connected`, `drive_not_connected`), as the existing
    routes do. `/api/status` reports both.

`wrangler.jsonc` additions (the security test parses that file as strict
JSON, so it carries no comments):

``` json
"r2_buckets": [
  { "binding": "MEDIA", "bucket_name": "photo-dump" },
  { "binding": "DRAFTS", "bucket_name": "folioforge-admin-drafts" },
  { "binding": "CV_ARCHIVE", "bucket_name": "folioforge-cv-archive" }
],
"vars": {
  "ADMIN_ORIGIN": "https://admin.samyabrata.codeium.xyz",
  "CV_DRIVE_TARGETS": { "consolidated": "1qeizy-UFYi6mzu9Y4grn801xs0RpLjoz" }
}
```

------------------------------------------------------------------------

## 12. Status and diff

Each preset shows three chips:

| Chip | Current when |
|---|---|
| Content | The preset and library edits are saved (to the pending store or V1) |
| Build | The last compile's `inputHash` equals the current one |
| Published | `latest.json`'s `inputHash` equals the current one |

``` text
After editing        Content ✓   Build ⚠ outdated   Published ⚠ outdated
After compiling      Content ✓   Build ✓            Published ⚠ outdated
After publishing     Content ✓   Build ✓            Published ✓
```

When the content includes edits not yet published to V1, the builder says
so ("Includes 3 changes not yet published to V1"). Publishing to Drive is
still allowed, because `build.json` holds the content and the build is
reproducible either way. The snapshot records `pending: true`.

Before publishing, the builder compares the current `BuildInput` with the
published snapshot's `build.json`, section by section: items added and
removed, and word-level changes in text. It compares content, not LaTeX,
so a template change appears as one line instead of drowning everything
else.

``` text
Publish Academic CV?

Changes since the published version:
3 additions · 2 modifications · 1 deletion

[ Review Changes ]
[ Cancel ]                                   [ Publish ]
```

``` diff
PROFILE
- Statistics postgraduate student with...
+ Statistics postgraduate student interested in...

PROJECTS
+ Political Comment Classification
```

------------------------------------------------------------------------

## 13. Code layout

``` text
src/content/cv/                       Git (V1), written through the registry
  library.yml                         entries, bullets, summaries, skills, interests
  presets.yml

admin/src/cv/                         pure TypeScript; the Worker imports the schema
  schema.ts                           zod schemas and inferred types (done)
  validate.ts                         checks across rows, files and templates (done)
  resolve.ts                          collections + library + preset (+ patch) → BuildInput (done)
  hash.ts                             canonical JSON, SHA-256 (done)
  render.ts                           BuildInput → .tex, by the template it names (done)
  latex/escape.ts                     special characters, URLs (done)
  latex/markup.ts                     site markup → LaTeX, via the site's parsers (done)
  templates/index.ts                  registry of template manifests (done)
  templates/resume-v1/skeleton.ts     the document as a string (done)
  templates/resume-v1/render.ts       one renderer per section kind (done)
  compile/engine.ts                   engine worker lifecycle, timeout, messages
  compile/parseLog.ts                 log → errors and warnings with line numbers
  diff.ts                             BuildInput vs BuildInput
admin/src/components/cv/              ConfigPanel, SourceEditor, PdfPreview, BuildConsole, StatusChips
admin/src/services/cv.ts              /api/cv/* client
admin/src/views/CvOverview/           presets, their status, Compile all, Download all
admin/src/views/CvLibrary/            the existing list editor on cv/entries, bullets, summaries, skills, interests
admin/src/views/CvBuilder/
admin/src/views/CvVersions/
admin/src/views/CvPublishing/
admin/public/cv-engine/<engine>/<version>/  vendored engine, TeX files, MANIFEST.sha256
admin/worker/cv/
  routes.ts                           /api/cv/*
  snapshots.ts                        archive bucket, checks
  drive.ts                            token, update, verify
admin/worker/http.ts                  engine policy chosen by path
admin/scripts/cv-build.mjs            npm run cv:build: every preset to .tex, and with --pdf to PDF (done)
admin/scripts/cvContent.mjs           the committed content, read as the admin reads V1 (done)
```

Navigation gets a **CV** group between Editorial and Workspace in
[navigation.ts](../src/config/navigation.ts), with routes added to
[router/index.tsx](../src/router/index.tsx):

``` text
CV
├── Overview          /cv
├── Content Library   /cv/library
├── Builder           /cv/builder/:presetId   (one child per preset)
├── Versions          /cv/versions
└── Publishing        /cv/publishing
```

The template viewer is part of the builder; a separate Templates page can
come later.

------------------------------------------------------------------------

## 14. Delivery

Each phase ends with something usable, and the risky parts are tested
first.

### Phase 0: spikes

1.  **Template.** Turn the Consolidated CV into `resume-v1`: its preamble
    and macros, with `{{HEADER}}` and `{{BODY}}` (§6.1). The seven source
    files are in `admin/docs/` and are analysed in §18.
2.  **Engine.** Compile `resume-v1` with a pdfTeX WebAssembly build
    (SwiftLaTeX's, or a maintained fork) in a worker served with the
    engine policy, using `wrangler dev` or a static server that sets the
    header. Confirm it needs neither `'unsafe-eval'` nor a `blob:` worker.
    If it does, try a build without dynamic execution (Emscripten
    `-sDYNAMIC_EXECUTION=0`) or switch to the Container fallback. Compare
    the files it fetches with the list measured locally (§18.3).
3.  **Drive.** With the service account, update the site's real CV file
    by hand (curl). Confirm the existing link serves the new PDF and the
    file keeps its owner.

Exit: all three succeed, or this plan is amended before phase 1.

### Phase 1: content and renderer

-   Ids on the portfolio entries the CV uses; `id` declared read-only in
    `entryFields.ts`.
-   `library.yml`, `presets.yml`, six registry entries.
-   Schema, validator and template registry: done on `admin-cv`
    (`admin/src/cv/schema.ts`, `validate.ts`, `templates/index.ts`, with
    `worker/__tests__/cvSchema.test.mjs`).
-   Resolver, converter, renderer, hash, and `resume-v1`: done.
-   `npm run cv:build -- --pdf` builds every preset with pdflatex and
    `-halt-on-error`, the check `compile_all.sh` meant to make: done. All
    seven build with no errors and no box warnings, two pages each.
-   **Import the seven CVs** (done). Write `library.yml` and the seven presets
    from them by hand; the files are too irregular to parse reliably. The
    newest wording, the Consolidated file's (2026-10-04), becomes `text`.
    A difference becomes a variant only where it is clearly aimed at an
    audience; drift is dropped. The conflicting facts take the values the
    owner settled (§18.2).
-   CV Overview, and the builder's configuration column and source view
    with Copy and Download `.tex`. The Content Library uses the existing
    list editor.

Exit: every preset renders `.tex` from V1 plus pending edits, and the
renderer tests pass. Each generated preset, compiled locally and read side
by side with its legacy PDF, has the same sections, items and bullets
(apart from deliberate fixes) and fits its page budget. The module is
already useful without PDFs.

### Phase 2: compile and preview

-   The vendored engine and manifest; the `/cv-engine/` policy, 404 and
    HTML rules.
-   The engine wrapper with timeout; the log parser; the build console with
    jump-to-line.
-   PDF.js preview with page navigation and zoom; Download PDF; On Compile
    and Auto Compile; Compile all and Download all.

Exit: compiling works in the deployed admin in Chrome, Firefox and Safari;
the page policy header is byte-identical to before; a failed compile shows
the error and still offers the `.tex`.

### Phase 3: versions

-   The `CV_ARCHIVE` bucket and binding; snapshot routes with their checks;
    the Versions page.
-   Optionally, import the seven legacy PDFs and `.tex` files as snapshots
    marked `legacy`, so history starts with what was actually sent out.

Exit: Save Version produces a snapshot that appears in history with all of
its files; a `.tex` that doesn't match its `build.json` is refused.

### Phase 4: Drive

-   Secrets, `CV_DRIVE_TARGETS`, the token client, the publish route, the
    Publishing page, status chips, and the diff dialog.

Exit: publishing updates the site's CV file in place, the md5 check passes,
the site's "My CV" button serves the new PDF, and the chips turn current.

### Phase 5: quality of life

-   Overrides; application builds; template picker; rebuild from a
    snapshot.

Track each phase as an issue labelled `app:admin`.

------------------------------------------------------------------------

## 15. Tests

CV tests live in `worker/__tests__/` and run with `npm run test:worker`.
`admin/.gitignore` ignores `tests/`, so a test there is never committed.

| Test | Covers |
|---|---|
| `worker/__tests__/cvBuild.test.mjs` (done) | Escaping and the link allowlist; site markup to LaTeX; the committed content validates against the portfolio; every preset resolves to a build input the Worker would accept unchanged; facts from the portfolio, settled facts in the output; variant preference; compact and split project titles; roles sharing a heading; deterministic rendering and hashing; authored LaTeX printed, not run; template options; application patches |
| `worker/__tests__/cvSchema.test.mjs` (done) | zod runs `jitless`; a Consolidated fixture parses and validates cleanly; flat rows become the model; every problem reported at its path; references across files; presets against their template; unwanted variants and reused ids; template option defaults; a build input parses unchanged |
| `worker/__tests__/cvEscape.test.mjs` | Every special character; URL encoding; only `https` and `mailto` become links |
| `worker/__tests__/cvMarkup.test.mjs` | Emphasis, links, `@see`, smart links and `<br>` map as in §6.2, using the site's parsers |
| `worker/__tests__/cvRender.test.mjs` | A fixture `BuildInput` renders to a committed golden `.tex`; rendering twice is byte-identical |
| `worker/__tests__/cvResolve.test.mjs` | A missing ref fails, naming preset and ref; variant fallback order; explicit inclusion and order; compact items gathered under Other Projects; title split at the first `: ` |
| `worker/__tests__/cvLibrary.test.mjs` | Runs the validator on the committed `library.yml` and `presets.yml`: ids unique, every ref resolves, every variant key appears in some `prefer`. CI fails on a broken preset before the admin ever renders it. |
| `worker/__tests__/cvHash.test.mjs` | Key order does not change the hash; `source` is excluded |
| `worker/__tests__/cvLog.test.mjs` | Errors, line numbers and warnings parsed from captured pdfTeX logs |
| `worker/__tests__/cv.test.mjs` | Snapshot route refuses non-PDFs, oversized parts and `.tex`/`build.json` mismatches; publish refuses unknown presets and application builds; Drive request shape (mocked fetch); an md5 mismatch records nothing |
| `worker/__tests__/security.test.mjs` | The page policy equals its previous value exactly; `'wasm-unsafe-eval'` appears only on `/cv-engine/` responses; `'unsafe-eval'` appears nowhere; a missing `/cv-engine/` path is 404, not `index.html`; HTML under `/cv-engine/` is refused |
| `worker/__tests__/cvEngineManifest.test.mjs` | Every vendored engine file matches `MANIFEST.sha256` |

------------------------------------------------------------------------

## 16. Documentation to update with the code

-   `admin/README.md`: the CV module and the engine policy.
-   `admin/CAVEATS.md`: presets depend on portfolio entry ids, so renaming
    an id breaks builds (loudly); the engine policy is the one place
    WebAssembly may run; unlike the collection cards, the CV preview is
    the real output, not a replica.
-   `admin/worker/README.md`: the `CV_ARCHIVE` bucket, service-account
    setup, and `CV_DRIVE_TARGETS`.

------------------------------------------------------------------------

## 17. Open questions

-   Which presets besides `consolidated` get a permanent Drive file at
    launch? (`consolidated` is the file behind `profile.yml`'s `cv` link,
    settled 2026-10-04.)
-   Should an application build ever be published to Drive, for example as
    a temporary link? This plan says no.
-   Should the Worker re-render `build.json` to check a snapshot's `.tex`
    (§9)? It is the only reason the Worker would import the renderer;
    without it, the Worker's CV code is storage, Drive and validation only
    (§11).

------------------------------------------------------------------------

## 18. Baseline: the existing CVs

Seven hand-maintained files sit in `admin/docs/`, compiled together by
`compile_all.sh`:

| File | Updated | Sections, in order |
|---|---|---|
| Consolidated | 2026-10-04 | Summary, Experience, Education, Selected Projects, Skills, Positions, Interests |
| Academic | 2026-09-03 | Summary, Education, Experience, Projects, Skills, Positions, Interests |
| Corporate_DA | 2026-04-24 | Summary, Experience, Education, Projects, Skills, Interests |
| Corporate_FS | 2026-04-24 | As Corporate_DA |
| Corporate_ML | 2026-04-24 | As Corporate_DA |
| Research_ML | 2026-04-24 | As Academic |
| Research_Stats | 2026-04-24 | As Academic, plus Certifications before Positions |

All seven are Jake's Resume template. Six share one preamble byte for
byte. The Consolidated file's sets `\resumeItem` in `\footnotesize` instead
of `\small` and adds `\resumePositionSubheading`. Every file produces two
pages.

### 18.1 What varies, and how the model covers it

| Variation | Example | Covered by |
|---|---|---|
| Section order and presence | Education first on academic and research CVs; no Positions on corporate ones; Certifications only on Research_Stats | preset `sections` |
| Profile summary per audience | A different summary in nearly every file | `summaries` variants |
| Which entries and bullets appear | The 2025 internship is on Academic but commented out on Consolidated; the TanStack bullet appears on some files only | explicit `items` and `bullets` |
| Full or one-line project | Career Preferences is a full project on Corporate_DA and one line under "Other Projects" on Academic | `style: compact` |
| Lead paragraph under an experience | "– Developed core components of NPCYF…", worded differently per file | bullet `kind: lead` |
| Facts shown differently from the site | Shorter tech lists; "IIT Madras" for the full name | `entries` overrides |
| Skills rows | "Machine Learning: …" on one file, "Statistics & Modelling: …" on another | `skills` rows and variants |
| Hand-tuned `\vspace` | Different in every file | Not carried over; the template's spacing plus the `pages` budget |

### 18.2 Defects found

**Every file builds with errors that went unseen.** `compile_all.sh` passes
`-halt-no-error`, which is not a pdflatex option; the option is
`-halt-on-error`. pdflatex prints "unrecognized option", ignores it, and in
nonstop mode recovers from each error and writes a PDF anyway. Errors per
file range from 11 (Corporate_FS) to 58 (Research_Stats). The causes:

-   a `\resumeItemListEnd` with no matching start after the project list
-   `\\` at the start of a line in project headings ("There's no line here
    to end"); the stray `.\\` lines are a workaround for this
-   a misplaced `&` in the Reddit project heading
-   `\tem` for `\item` in Corporate_FS's Doctor Vahaan project

Recovered errors can drop or shift content with no visible sign. Generated
LaTeX avoids these by construction, and the builder treats any error as a
failed build (§7.3).

**Four CVs link a repository that does not exist.** Academic,
Corporate_ML, Research_ML and Research_Stats link
`github.com/22f2001443/MessyMashup-dl-genai-project`, which returns 404.
The repository is `MessyMashup-dl-genai-peoject`, which the Consolidated
file and `projects.yml` both use. On generated CVs the link comes from
`projects.yml`, so it cannot drift again.

**The same fact differs between files, or between a file and the site.**
Settled by the owner on 2026-10-04 (last column); the import uses these:

| Fact | Values found | Settled |
|---|---|---|
| NPCYF forecast-accuracy improvement | 30% (Consolidated); 40% (the other six) | 30% |
| Reduction in redundant API calls | 60% (Consolidated); 70% (Corporate_FS) | 60% |
| Interns mentored at IDEAS-TIH | 15 (Consolidated, Academic, Research_ML, Research_Stats); 13 across 4 projects (`experience.yml`) | 13 |

Typos in text that is not commented out: "into he platform's"
(Consolidated), "Techniquess" (Consolidated, Academic), and both "Vahaan"
(Corporate_FS) and "Vaahaan" (Consolidated).

### 18.3 TeX files needed

Measured with `pdflatex -recorder` over all seven files on TeX Live 2024:
**109 files, 2.5 MB**, plus the pdflatex format.

-   Packages: babel (english), color, enumitem, fancyhdr, fullpage (from
    the preprint bundle), hyperref and its dependencies, latexsym,
    marvosym, multicol, setspace, tabularx, titlesec, url, verbatim.
-   Fonts: Computer Modern Type 1 and cm-super (`sfrm`).

This is the expected vendoring list for `/cv-engine/` (§8.3). The engine's
own run in phase 0 confirms it, because a WebAssembly build's TeX Live
year may differ from the local one.
