# Blog image sources

Where every image on the blog (`blogs/`) is loaded from, and where each
address is written. Taken from the code and content on 23 October 2026; update
it when a new image source is added.

## Sources

| Folder | What it holds | How entries name a picture | Address built in |
| --- | --- | --- | --- |
| `https://media.samyabrata.codeium.xyz/blog-travel/` | Trip covers and trip photo belts | Full URL, 64 of them | Written out in `blogs/src/content/travel/trips.yml` |
| `https://media.samyabrata.codeium.xyz/` (bucket root) | Blog gallery photos | Media id, e.g. `my-photo` → `/my-photo.jpeg` | `blogs/src/content/gallery/data.ts:175` |
| `https://media.samyabrata.codeium.xyz/` (bucket root) | Movie posters and reading covers given as a short name | Media id, or a full URL | `blogs/src/content/movies/data.ts:39`, `blogs/src/content/readings/data.ts:33` |
| `https://media.samyabrata.codeium.xyz/hobby/` | Hobby tile photos | `imageId` with folder, e.g. `hobby/hike1` (a tile's `image` instead takes a `blogs/public/` path) | `blogs/src/content/hobbies/data.ts:20` |
| `https://covers.openlibrary.org/b/` | Book covers | Full URL | Written out in `blogs/src/content/readings/data.yml` |
| `https://picsum.photos/` | Home hero fallback, if `/hero.jpg` fails | Full URL | `blogs/src/content/site.yml` (`hero.fallbackImage`) |
| `blogs/public/` (served at the site root) | Home hero (`/hero.jpg`), profile icon (also the favicon), social card (`/og-image.jpg`) | Root path | `blogs/src/content/site.yml`, `blogs/index.html` |
| `blogs/public/posters/` | Movie posters kept in the repo | Root path, e.g. `/posters/the-cabinet-of-dr-caligari.jpg` | `blogs/src/content/movies/data.yml` |
| Post front matter | Post card covers | Any URL or root path, e.g. `cover: /hero.jpg` | `blogs/src/content/posts/*.md` |

## Where the media host is hard-coded

`https://media.samyabrata.codeium.xyz` is written separately in each of these
places. Moving the host, or a folder on it, means changing all of them:

- `blogs/src/content/gallery/data.ts:175`
- `blogs/src/content/movies/data.ts:39`
- `blogs/src/content/readings/data.ts:33`
- `blogs/src/content/hobbies/data.ts:20`
- `blogs/src/lib/tripCovers.ts:13`
- the 64 trip URLs in `blogs/src/content/travel/trips.yml`
- the admin: `admin/src/lib/galleryImages.ts:5`, `admin/worker/media.ts:19` and
  `admin/worker/content/tripCovers.ts:6` (the cover URLs it accepts)
- the gallery photo script: `scripts/fit-gallery-images.mjs:55`

## Missing on the media host

These are listed in `trips.yml` but answer 404, so the travel page shows a
placeholder or a broken image for them:

- Covers: `uttarakhand-devbhumi-2025`, `uttrakhand-trip-01` (no original
  either). Every other cover's WebP is missing too until
  `npm run fit-covers -- --upload` has been run once (see below).
- Photo belts:
  - every photo for `darjeeling-2026`, `uttarakhand-devbhumi-2025` and `uttrakhand-trip-01`
  - all 3 for `bike-trip-digha-2024`
  - `derjeeling-2024` -03, -04 and -05
  - `hyderabad-solo-2023` -03 and -04

## Trip covers are WebP

Every trip `coverImage` in `blog-travel/` points at a WebP,
`blog-travel/<name>.webp`, beside the original photo it was made from. The
WebP is at most 3840px on the long side, quality 90, and never over 10 MB
(`shared/travel/tripCoverPolicy.js`). Originals are never changed.

- `npm run fit-covers` (in `blogs/`) converts each original to
  `blogs/.trip-covers/`, which git ignores, for review. `--upload` puts the
  WebPs on the bucket and then points trips.yml at them; it never overwrites a
  WebP already on the host. The original is found from the cover itself, or as
  the `.jpeg`/`.jpg`/`.png` of the same name beside its WebP.
- The admin's Media Library has a Trip covers panel. A picked photo is
  re-encoded to WebP in the browser, and the Worker refuses anything that is
  not a WebP within the policy. It publishes to `blog-travel/<trip id>.webp`,
  or `-01`, `-02`... when that name is taken, and changes only that trip's
  `coverImage` line in the pending batch. Safari cannot encode WebP, so covers
  are uploaded from Chrome, Edge or Firefox.
