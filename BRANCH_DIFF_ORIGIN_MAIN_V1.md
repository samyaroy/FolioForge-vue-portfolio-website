# Branch File Differences: origin/main vs origin/V1

Comparison direction: `origin/V1..origin/main`

This documents files that are different in `origin/main` relative to `origin/V1`.

- `origin/main`: `c880981`
- `origin/V1`: `5fb8a9a`
- Total changed files: 14
- Added files: 8
- Modified files: 6
- Deleted files: 0

## Status Codes

- `A`: Added in `origin/main`
- `M`: Modified in `origin/main`
- `D`: Deleted from `origin/main`
- `R`: Renamed in `origin/main`

## Changed Files

| Status | File |
| --- | --- |
| A | `blogs/src/components/PostCard/index.tsx` |
| A | `blogs/src/views/Home/index.tsx` |
| A | `blogs/src/views/Section/index.tsx` |
| A | `blogs/src/views/Travel/data.ts` |
| A | `blogs/src/views/Travel/geocode.ts` |
| A | `public/404.html` |
| A | `public/logo/VLED-IITRPR.png` |
| M | `src/config/featureFlags.ts` |
| M | `src/content/profile_info/page_quotes.yml` |
| M | `src/content/profile_info/workshops.yml` |
| M | `src/metadata/hyperlinkMetadata.yml` |
| A | `src/views/NotFound.vue` |
| M | `src/views/WorkshopsAttended/components/cards/OtherCard.vue` |
| M | `vite.config.js` |

## Diff Stat

```text
blogs/src/components/PostCard/index.tsx            |  33 +++++++
blogs/src/views/Home/index.tsx                     |  23 +++++
blogs/src/views/Section/index.tsx                  |  38 ++++++++
blogs/src/views/Travel/data.ts                     |  92 ++++++++++++++++++++
blogs/src/views/Travel/geocode.ts                  |  89 +++++++++++++++++++
public/404.html                                    |  96 +++++++++++++++++++++
public/logo/VLED-IITRPR.png                        | Bin 0 -> 11583 bytes
src/config/featureFlags.ts                         |  50 +++++------
src/content/profile_info/page_quotes.yml           |  24 +++---
src/content/profile_info/workshops.yml             |  26 ------
src/metadata/hyperlinkMetadata.yml                 |  26 ------
src/views/NotFound.vue                             |  43 +++++++++
src/views/WorkshopsAttended/components/cards/OtherCard.vue |  94 ++++----------------
vite.config.js                                     |   1 +
14 files changed, 470 insertions(+), 165 deletions(-)
```
