# Publication and service setup

The prepared architecture is a GitHub Pages frontend plus a small Cloudflare Worker and D1 database. The frontend can be published before backend setup; its service-dependent controls clearly state that the service is not connected.

## Existing production installation

The website is live at **https://tiamole.github.io/acata-2026-workshop/**. The shared API is **https://acata-workshop-api.acata-2026-workshop.workers.dev**. The checked-in Worker configuration identifies the already-created database. Its migration and daily cleanup trigger are deployed. Research submission is intentionally closed.

For normal updates, run the relevant checks and push frontend changes to `main`; Pages publishes automatically. Deploy backend source changes with `npm run backend:deploy` while signed into the owning Cloudflare account. Do not create another database or replace the existing secrets just to update the site.

The four random service secrets are backed up in the deploying Windows account’s Credential Manager under `ACATA2026Workshop/CloudflareSecrets`. Double-click `Open-Facilitator-Dashboard.cmd` to copy the administrator token and open the private dashboard. The helper uses a child-process-only script execution setting and leaves the computer’s PowerShell execution policy unchanged.

`scripts/bootstrap-secrets.ps1` reuses that protected credential if rerun; it does not deliberately rotate the salts. Run it only for explicit secret recovery/reconfiguration, not routine publication. The installation steps below are retained as a **fresh-install reference**; database creation and initial secret setup have already been completed for this installation.

## 1. GitHub Pages

The authorized destination is `tiamole/acata-2026-workshop` (public). Push this checkout’s contents, including `.github/workflows/pages.yml`, to `main`. Enable **Settings → Pages → GitHub Actions**. Re-run the workflow if the initial push ran before Pages was enabled.

Only `public/` is uploaded as the Pages artifact. It uses relative asset/download URLs and hash routes, so it works below `/acata-2026-workshop/` without a custom 404 rewrite.

With an authenticated GitHub CLI, the supplied publisher runs the creation and Pages activation flow:

```sh
node scripts/publish-github.mjs
```

It verifies the signed-in account is `tiamole`, validates the checkout, refuses to overwrite an existing GitHub repository, and does not print credentials. Use `gh auth login` separately if needed.

## 2. Provision D1

Use the Cloudflare account intended to own the participant service. From the repository root:

```sh
npm ci
npx wrangler login
npx wrangler d1 create acata-workshop
```

Copy the returned database ID into `backend/wrangler.jsonc`, replacing `REPLACE_WITH_CREATED_D1_DATABASE_ID`. Preserve the `DB` binding. The ID is a public resource identifier, not an access token.

Apply the bounded schema migration:

```sh
npx wrangler d1 migrations apply acata-workshop --remote --config backend/wrangler.jsonc
```

## 3. Set runtime secrets

Generate four independent random secrets, each with at least 32 bytes of entropy, in a trusted password manager. Enter them through Wrangler’s interactive secret prompts:

```sh
npx wrangler secret put ADMIN_TOKEN --config backend/wrangler.jsonc
npx wrangler secret put ANALYTICS_SALT --config backend/wrangler.jsonc
npx wrangler secret put RESEARCH_SALT --config backend/wrangler.jsonc
npx wrangler secret put RATE_LIMIT_SALT --config backend/wrangler.jsonc
```

Store `ADMIN_TOKEN` privately; it grants access to all dashboard statistics and retained research exports. The dashboard does not have a public self-service account-creation route. Do not add these values to the source, workflow files, browser configuration, command arguments, logs, or deployment screenshots.

Keep the salts stable. Rotating `RESEARCH_SALT` changes future study-code hashes and breaks cross-stage pairing with earlier records. Rotating `ANALYTICS_SALT` changes future visitor hashes. Workspace recovery/deletion code hashes use SHA-256 on high-entropy random codes and do not depend on those salts.

## 4. Deploy and connect

`ALLOWED_ORIGIN` should be exactly `https://tiamole.github.io` (no path or trailing slash). If you add a custom domain, list its exact HTTPS origin in the comma-separated value. Never use `*`. Local origins should be enabled only for a development service.

```sh
npm run backend:deploy
```

Use the actual returned `https://…workers.dev` origin in `public/config.js` as `apiBase`, with no trailing slash. The frontend deliberately accepts only HTTPS workers.dev API origins and includes that boundary in its content-security policy. A custom backend domain requires an explicit matching update to both the allowed URL check in `app.js` and `connect-src` in `index.html`.

Commit and push the config change to republish Pages. From the public site verify:

1. Analytics preferences appear. Declining sends no visit events; allowing records page/country data.
2. My workspace can create a recovery code, upload, restore on a second browser, and delete the cloud record.
3. `/#dashboard` rejects an incorrect token and accepts the private administrator token. A fresh database shows zero recorded metrics.
4. Research submission stays closed by default; frontend settings cannot bypass this server gate.

## 5. Research activation is intentionally pending

The user requested preparation pending study details. Keep `RESEARCH_ENABLED` set to `false` until the study lead supplies the study information. The server requires every field below before it reports collection as enabled:

| Variable | Required content |
| --- | --- |
| `RESEARCH_ENABLED` | Literal `true` after the study is ready |
| `RESEARCH_CONTACT` | Actual research contact and participant question/withdrawal route |
| `RESEARCH_APPROVAL` | Actual review or exemption status; do not invent a review reference |
| `RESEARCH_CONSENT_VERSION` | Version identifier for the displayed participant information |
| `RESEARCH_CONSENT_TEXT` | Actual approved participant information, at least 100 characters |
| `RESEARCH_RETENTION_DAYS` | Study lead’s chosen retention interval, integer 1–3650 |

These are nonsensitive study configuration fields in `backend/wrangler.jsonc`; secrets remain managed separately. The character-count gate checks configuration completeness only. It does not determine approval, legal compliance, scientific adequacy, or consent quality.

The participant information must describe the actual study purpose, eligibility, procedures, risks, benefits, voluntary participation, data use/access, contact, retention, pairing, and withdrawal limits. Confirm wording and data handling with the responsible study lead. The draft survey includes a before, after, and later-reflection stage; no fixed workshop duration, venue, study approval, or follow-up date was supplied, so none is invented.

## 6. Retention and operations

The Worker’s daily UTC cron deletes visit events older than 90 days, expired survey records, and expired anti-abuse buckets. Research response expiry is recorded at submission using the then-configured retention interval. Changing the interval later does not rewrite existing expiry dates. The platform can execute a daily job after the exact expiry time; normal research exports exclude expired records immediately.

Synced workspaces remain until deleted with their recovery code. Provider-level backups and logs follow provider settings; review those settings before opening research collection. App-level deletion does not promise removal from every provider backup. Observability is disabled in the supplied Worker configuration, and the app does not log secrets, response content, or IP addresses.

Anti-abuse buckets use a keyed hash of the connection address, route, and hour. Raw addresses are used transiently, not retained in application tables. Buckets expire after two hours and are removed by the daily cleanup. Public limits allow a shared venue network: 500 workspace creations, 1,000 survey requests, and 10,000 other requests per address/route/hour; administrator routes allow 60. This is an application-level limit, not comprehensive bot protection. Review limits for unusually large events, and consider provider-side traffic protection if needed.

The public data-creation endpoints can be automated. Do not treat page views or response counts as verified attendance. Visitor-days intentionally count the same browser again on each UTC day. The app never calls browser geolocation; the location chart is approximate network country only.

Schedule a test deletion after setup, retain a secure database backup according to the study’s actual policy, review dependency updates, and monitor the provider’s resource usage. The local test suite and build do not verify production credentials, provider availability, or an undeployed cron.

## References used for this implementation

- [GitHub: custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Cloudflare: D1 database binding and batch API](https://developers.cloudflare.com/d1/worker-api/d1-database/)
- [Cloudflare: incoming request properties and country metadata](https://developers.cloudflare.com/workers/runtime-apis/request/)

© 2026 Taiwo Feyijimi. All rights reserved.
