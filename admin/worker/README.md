# Cloudflare Admin Setup

Status: local security boundary implemented and tested. No Worker deployment,
Access application, DNS change, or bucket mutation has been performed.

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
4. Set `ACCESS_ISSUER`, `ACCESS_AUDIENCE`, and `ACCESS_OWNER_EMAIL` in the Worker
   Wrangler variables. Issuer is exactly `https://<team>.cloudflareaccess.com`
   without a trailing slash. Audience is this application's AUD tag, not the
   account ID. These settings are not credentials, but stay server-side.
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
