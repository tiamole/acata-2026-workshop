# ACATA 2026 · The Item Development Lab

A participant learning workspace for **Modernising Item Development with AI and LLMs**, by **Taiwo Feyijimi**.

The public frontend is prepared for `tiamole/acata-2026-workshop` on GitHub Pages. It has no runtime dependencies or frontend build step. Shared analytics, optional workspace sync, and research collection use the separate Cloudflare Workers / D1 backend included here.

## Included

- Five content-based learning modules and self-reported completion checklists.
- Editable practice worksheets, a 16-criterion review rubric, and all ten source prompts.
- The supplied Ohm’s law worked example, original DOCX templates, and both ZIP bundles.
- Local saving, validated JSON export/import, and a printable learning record.
- Optional cross-device workspace recovery using a private, random recovery code.
- A proposed before/after/follow-up research survey with draft saving, consent/version checks, stage pairing, duplicate prevention, receipts, and response deletion.
- An authenticated facilitator dashboard with recorded page views, visitor-days, approximate countries, synced completion, and survey counts. No sample metrics are presented as live data.
- Opt-in analytics, no browser geolocation, separate study and workspace identifiers, API rate limits, hashed server-side access codes, parameterized queries, and formula-safe CSV exports.
- Responsive layouts, keyboard navigation, a skip link, reduced-motion support, print styles, and automated accessibility checks.

## Current release state

The frontend works locally now. `public/config.js` deliberately has an empty `apiBase` until the shared service is actually deployed. Research collection is disabled by default and stays disabled until the configured study information is complete. No GitHub or Cloudflare credentials are included.

The intended Pages address is `https://tiamole.github.io/acata-2026-workshop/`; this is a deployment target, not a claim that publication has succeeded.

## Preview

Install Node.js 22.13 or newer, then run:

```sh
npm run dev
```

Open `http://127.0.0.1:4173`. Serve the folder over HTTP; opening `index.html` as a local file does not support ES-module loading consistently.

## Checks

```sh
npm ci
npm run check
npm test
npm run test:browser
npm run test:accessibility
```

Windows browser checks use installed Microsoft Edge. On other systems install the matching Playwright Chromium with `npx playwright install chromium`, or set `BROWSER_PATH` to a compatible installed browser executable. Unit/integration checks use Node’s SQLite API to run the actual migration and SQL; this API emits an experimental-feature warning in Node 22.

The browser test uses a temporary in-memory database and test-only consent text. It does not create real research records. Screenshots and reports go into ignored `artifacts/`.

## Publish the frontend

1. Create the public repository `tiamole/acata-2026-workshop` and push this folder’s contents to `main`.
2. In repository **Settings → Pages**, choose **GitHub Actions** as the publishing source.
3. Run or re-run **Validate and publish workshop** in Actions. It checks JavaScript, source download checksums, and backend/state tests before uploading only `public/`.
4. Confirm the deployment job succeeded and use its returned Pages URL.

For an authenticated GitHub CLI installation, `node scripts/publish-github.mjs` performs the new-repository flow, enables workflow-based Pages, and launches deployment. It refuses an existing remote repository rather than replacing it. Authenticate with GitHub through the CLI’s own flow; never put a token in this repository or chat.

The workflow intentionally excludes backend code, research settings, review extracts, test artifacts, and development dependencies from the hosted frontend. No API secret belongs in `public/config.js`.

## Connect the shared service

See [DEPLOYMENT.md](DEPLOYMENT.md) for the exact D1, Worker, secrets, and frontend connection steps. The dashboard is at `/#dashboard` on the published site; it requires the server-side `ADMIN_TOKEN` and stores it only in memory for that page session.

GitHub Pages serves static files and cannot execute the backend. Publishing only the Pages frontend enables the lessons, original downloads, local progress, and private survey drafts. Shared analytics, cloud sync, and research submission require the separately deployed backend.

## Content and study documentation

- [Source review](docs/CONTENT_REVIEW.md): every supplied file and archive member, duplicate differences, and content decisions.
- [Research instrument](docs/RESEARCH_INSTRUMENT.md): proposed constructs, item mappings, codebook, interpretation limits, and the activation fields awaiting the study lead.
- [Download manifest](docs/download-manifest.json): sizes and SHA-256 checksums for all 12 served downloadable assets.

The original source documents remain unchanged. The site’s lesson summaries, activities, and proposed survey are additions; they are not presented as empirical workshop findings. Source review extracts are included for traceability and contain the supplied workshop content only.

© 2026 Taiwo Feyijimi. All rights reserved. See [LICENSE](LICENSE).
