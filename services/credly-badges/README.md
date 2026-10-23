# credly-badges

A small Cloudflare Worker that serves the Credly badge count and issuer list
shown on the portfolio's Certifications tab (the Credly banner, see
`src/views/InternshipCertification/components/CredlyBanner.vue`).

```
GET https://api.samyabrata.codeium.xyz/credly-count

{
  "count": 3,
  "issuers": [{ "name": "IBM", "count": 2 }, { "name": "MongoDB", "count": 1 }],
  "updatedAt": "2026-09-01T06:00:04.112Z"
}
```

`updatedAt` is when Credly was last read successfully, and it is what the
banner shows as "Last updated".

## Where the data comes from

Credly has **no official API** for an earner's badges. Its documented API
(<https://www.credly.com/docs>) serves issuing organisations and needs an
organisation token. It lists what an organisation has issued, not what one
person holds.

This Worker instead reads the **undocumented** JSON endpoint behind the public
profile page:

```
https://www.credly.com/users/samyabrata-roy/badges.json?page=1
```

- It needs no authentication, so no secrets or tokens are involved anywhere.
- The count is `metadata.total_count`. The pages (48 badges each; Credly ignores
  a `page_size` parameter) are walked only to build the issuer tally.
- The response has no CORS headers, so a browser cannot call it directly. That
  is why this Worker exists.

**Maintenance risk:** Credly can change or remove this endpoint without notice.
The Worker checks every field it uses, and on anything unexpected it throws and
keeps the last good snapshot. A breakage therefore shows up as a "Last updated"
date that stops moving and a failed cron run in the Worker's logs, not as a
broken page. If that happens, compare a fresh response with `parsePage` and
`issuerNames` in `src/credly.ts`.

## How it stays current

- The cron trigger (`wrangler.jsonc`) runs daily at 06:00 UTC but only re-reads
  Credly when the stored snapshot is from an earlier month. In practice it
  refreshes on the 1st, and a failed run is retried the next day.
- Page views are answered from KV and never reach Credly. Browsers cache the
  answer for 6 hours.
- If there is no snapshot yet (first deploy, or after a forced refresh), the
  next request reads Credly live and stores the result.

**To pick up a new badge before the month turns,** delete the snapshot. The
next page view then re-reads Credly:

```sh
npx wrangler kv key delete snapshot --binding CREDLY_KV --remote
```

(Or: Cloudflare dashboard → Storage & databases → KV →
`folioforge-credly-badges-credly-kv` → delete the `snapshot` key.)

## When it fails

| Situation | Worker | Portfolio |
| --- | --- | --- |
| Credly down, rate-limiting, or changed format | keeps serving the last snapshot | unchanged; the date stops advancing |
| No snapshot yet **and** Credly unreachable | `503`, not cached | banner shows the plain Credly link |
| Worker unreachable, or `credlyBadgesApi` cleared in `profile.yml` | n/a | banner shows the plain Credly link |

The frontend client (`src/utils/credlyBadges.ts`) turns every failure, including
timeouts (8 s) and malformed bodies, into "no data", so none of this can break
the page.

## Commands

```sh
npm install
npm test            # node --test, no network
npm run typecheck
npm run dev         # http://127.0.0.1:8789/credly-count, local KV
                    # trigger the cron: curl "http://127.0.0.1:8789/__scheduled?cron=0+6+*+*+*"
npm run check       # bundle without deploying
npm run deploy
```

Deployed as `folioforge-credly-badges` on the `api.samyabrata.codeium.xyz`
custom domain (the admin Worker uses the same setup). The KV namespace was
created by the first deploy and its id is pinned in `wrangler.jsonc`.

To test the portfolio against `npm run dev`, point `credlyBadgesApi` in
`src/content/profile_info/profile.yml` at `http://127.0.0.1:8789/credly-count`.
Remember to point it back afterwards.
