# Dummy data checklist — blog site (`blogs/`)

Every placeholder / dummy item found in the blog site content, as of 2026-07-19.
Check items off as they're replaced with real content.

## Travel trips — `src/content/travel/trips.yml`

The file marks itself: `# Dummy entries below — replace with real trips.` (line 51).

### Placeholder `summary` + `narrative` text (renders on trip cards and details pages)

- [ ] `mahababipuram26` — `ABC` (lines 60, 62–64)
- [ ] `uttarakhand-devbhumi-2025` — `BCD` (lines 93, 96–98)
- [ ] `vizag-01-2025` — `XYZ` (lines 122, 125–127)
- [ ] `uttrakhand-trip-01` — `PQR` (lines 158, 161–163)
- [ ] `bike-trip-digha-2024` — `SSS` (lines 202, 208–210)
- [ ] `ropar-aivs-iitrpr` — `QAZ` (lines 231, 234–236)
- [ ] `derjeeling-2024` — `UVW` (lines 251, 254–256)
- [ ] `chennai-001-iitmadras` — `MNO` (lines 277, 279–281)
- [ ] `delhi-001-iitdelhi` — `MNO` (lines 295, 301–303)
- [ ] `hyderabad-solo-2023` — `MNO` (lines 324, 330–332)

### Other leftovers in trips.yml

- [ ] Remove visible `[Dummy, Test]` tag chips on 3 trips:
  - `chennai-001-iitmadras` (line 278)
  - `delhi-001-iitdelhi` (line 300)
  - `hyderabad-solo-2023` (line 329)
- [ ] Stats copied from the example block — `uttarakhand-devbhumi-2025` has the exact
  `Places stayed: 14 villages / Distance: 320 km` from the file's example (lines 100–101)
- [ ] `derjeeling-2024` claims `Places stayed: 14 villages` for a weekend trip (line 258)
- [ ] `vizag-01-2025` tagged `[Mountains, Pilgrimage]` — pasted from the Uttarakhand trip (line 124)
- [ ] Empty photo-credit URL for Shuvadeep Mitra — blank `url:` (line 75)
- [ ] Delete commented-out duplicate `derjeeling-2024` block with `MNO` placeholders (lines 173–196)

## Blog posts — `src/content/posts/`

Both published posts are scaffold demos about the blog itself:

- [ ] `2026-06-18-hello-world.md` — "Hello, world" template post
- [ ] `2026-06-10-markdown-features.md` — GFM feature demo (tables, task lists, sample code)

Replace with real posts, or set `draft: true` to unpublish.

## Site config — `src/content/site.yml`

- [ ] X social link is a bare `https://x.com/` with no username — fix the handle or remove the entry

## Gallery — `src/content/gallery/data.yml`

- [ ] `items: []` — Gallery page is empty and shows the "Coming soon…" state
  (`src/views/Gallery/components/GalleryGrid.tsx:21`)

## Readings — `src/content/readings/data.yml` (verify)

- [ ] Possibly sample content: Deep Work, The Design of Everyday Things, Thinking in
  Systems — sequential dates (2026-06-20/21/22) and generic polished notes read like
  scaffold samples. Confirm these are real notes, or replace them.
