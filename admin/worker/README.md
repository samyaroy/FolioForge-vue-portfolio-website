# Cloudflare Admin Setup

Status: deployed and closed. The Worker runs at
`admin.samyabrata.codeium.xyz` behind a Cloudflare Access application on the
`samyaroy00` team, with all four secrets installed. It remains read-only: no
R2 binding, no GitHub App, no publishing.

Verified against the live deployment on 2026-09-18:

- Access intercepts every path — `/`, SPA routes, all of `/api/*`, images and
  hashed JS assets each answer `302` to the team login page. No path reaches the
  Worker unauthenticated, and no bypass policy exists.
- Before the secrets were installed, every one of those paths answered `503`
  with no body from `dist/`, so the deployment was closed from its first second.
- The owner signs in and the admin loads, which exercises the whole chain: the
  Worker's own check of signature, issuer, audience, expiry and owner address
  runs on that request and passes.
- Cloudflare redacts `cf-access-jwt-assertion` in its logs; denial records carry
  no token (see Live verification below).

Still to verify, because each needs something this terminal does not have: a
second identity being refused, the browser console being free of CSP errors, and
`workers.dev` serving nothing. `workers_dev` and `preview_urls` are `false` in
`wrangler.jsonc`, asserted by a test, and the deploy output lists the custom
domain as the only trigger — but that is configuration evidence, not a request
to an alternate hostname.

## Account and Access prerequisites

1. Authenticate from an interactive terminal in `admin/` with `npx wrangler login`.
   Verify the intended account with `npx wrangler whoami`. Do not paste OAuth
   tokens or API tokens into chat, browser configuration, or tracked files.
2. Confirm that the Cloudflare account controls `admin.samyabrata.codeium.xyz`.
   A custom-domain route is configured, but is not created until deployment.
   Do not replace another application already using this hostname.
3. Create a self-hosted Cloudflare Access application covering the entire
   hostname, including assets and `/api/*`, with no bypass policies. Restrict
   Allow to the owner identity and require MFA through the identity provider.
   Set a short application session duration, initially one hour.
4. Install `ACCESS_ISSUER`, `ACCESS_AUDIENCE`, and `ACCESS_OWNER_EMAIL` with
   `npx wrangler secret put <NAME>`. They are identifiers rather than
   credentials, but this repository is public and the owner's address and the
   application's audience do not belong in it, so `wrangler.jsonc` names none of
   them. Issuer is exactly `https://<team>.cloudflareaccess.com` with no
   trailing slash. Audience is this application's AUD tag: 64 hexadecimal
   characters, not the 32-character account ID, which the Worker rejects.
5. Generate a cryptographically random secret of at least 32 bytes using a
   password manager or `openssl rand -hex 32`. Store it with
   `npx wrangler secret put CSRF_SECRET`. Never commit it or use `VITE_*`.
   For local Worker tests, use an ignored `.dev.vars` file; production secrets
   must be installed on the intended `folioforge-admin-beta` Worker.

Access configuration cannot be proven by local tests. Confirm policy coverage
and correct account ownership before manually deploying this read-only Worker.
The Worker independently validates Access tokens and fails closed if required
settings or the CSRF secret are absent. Keep R2 and GitHub disconnected until
the live verification below passes.

## Deployment order

The Worker is closed at every stage of this sequence, so no step opens the
hostname before the one that protects it.

1. `npm run build` then `npx wrangler deploy`. This creates the Worker and the
   `admin.samyabrata.codeium.xyz` custom domain, which is what puts the hostname
   into DNS. No secret is installed yet, so every request — the owner's
   included — is answered with `503 security_not_configured` and nothing is
   served from `dist/`.
2. Create the Access application for that hostname now that it resolves. Cover
   the whole host, including `/api/*`, with no bypass policy.
3. Install the four secrets from the prerequisites above. The Worker begins
   accepting the owner's Access token on the next request; there is no restart
   and no window in which it accepts anything less.
4. Work through the live verification below before connecting any integration.

Deploying before the Access application exists is deliberate: the hostname must
resolve before Access can be attached to it, and the missing secrets keep the
admin shut for the minutes in between. Do not install secrets first.

## Local checks

```sh
npm run lint
npm run typecheck
npm run test:worker
npm run build
npm run worker:check
```

Security tests sign test-only RSA tokens and verify signature, claims, owner
authorization, asset protection, hostname rejection, Origin, and session-bound
CSRF. The injected local key resolver is used only by tests. Production always
fetches keys from the trusted Access issuer; requests cannot supply a key URL.
Wrangler dry-run validates the actual deployment bundle, not account policy.

## Live verification before integrations

- Anonymous page, JS, CSS, image, and API requests encounter Access, never the UI.
- Signed-in owner can use the UI and read `/api/session` and `/api/status`.
- Other identities are rejected by both Access policy and Worker authorization.
- Missing, expired, modified, wrong-issuer, and wrong-audience tokens are denied.
- Mutations with a wrong/missing Origin or missing/incorrect CSRF token are denied.
- Direct `workers.dev`, preview, and alternate hostname access is unavailable.
- `/api/status` reports `refs/heads/V1` and all integrations disabled.
- The browser shows no CSP errors or font/asset failures.

Each denial is written to Workers Logs as one `admin_request_denied` record
naming the status, the code, the reason the check failed, the method, the path,
and the Cloudflare ray. It carries no token, header, query string or identity.
Follow them live with `npx wrangler tail --format pretty` while working through
the list above: a repeated run of them is the signal worth alerting on, and the
`reason` field is how an unexplained 401 gets diagnosed without a debug mode.

Cloudflare records its own invocation metadata beside that record, and it is
wider than the record is. Verified on 2026-09-18 against the deployed Worker:
the payload carries the full request URL, query string included, and replaces
`cf-access-jwt-assertion` with `REDACTED`. The Access token is therefore logged
by neither side, but a secret placed in a query string would be. Keep secrets
out of URLs; API input belongs in the path and the body.

Access JWTs remain bearer credentials: protect sessions and keep expiry short.
CSRF is bound to the JWT but does not make a stolen valid JWT unreplayable.
Logout/revocation behavior must be checked against the actual Access policy;
local signature validation alone does not guarantee immediate revocation.

## Next integration

After the live gate passes, add repository-scoped GitHub App reads from the
current V1 SHA, then private drafts and typed collection schemas. Connect logo
listing through an R2 binding using a server-owned `logo/` prefix. Do not enable
uploads or replacements until the authenticated image pipeline, immutable keys,
private staging, and checked V1 publication are implemented.
