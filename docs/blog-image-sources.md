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
- `blogs/src/lib/tripCovers.ts:7`
- the 64 trip URLs in `blogs/src/content/travel/trips.yml`
- the admin: `admin/src/lib/galleryImages.ts:5` and `admin/worker/media.ts:18`
- the gallery photo script: `scripts/fit-gallery-images.mjs:55`

## Missing on the media host

These are listed in `trips.yml` but answer 404, so the travel page shows a
placeholder or a broken image for them:

- Covers: `darjeeling-2026`, `uttarakhand-devbhumi-2025`, `uttrakhand-trip-01`
- Photo belts:
  - every photo for `darjeeling-2026`, `uttarakhand-devbhumi-2025` and `uttrakhand-trip-01`
  - all 3 for `bike-trip-digha-2024`
  - `derjeeling-2024` -03, -04 and -05
  - `hyderabad-solo-2023` -03 and -04

## HD trip cover copies

`npm run fit-covers` (in `blogs/`) writes a lighter copy of each trip cover to
`blogs/.trip-cover-cards/`, which git ignores. The copies are at most 3840px on
the long side, JPEG quality 94, and never over 10 MB. A cover that already
fits is kept as it is. Nothing on the site uses them yet, and nothing is
uploaded unless the script is run with `--upload`. Settings are in
`blogs/src/lib/tripCovers.ts`.
