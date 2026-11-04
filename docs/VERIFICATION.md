# Release verification · 4 November 2026

## Completed locally

- JavaScript syntax checks and checksums for all 12 served DOCX/ZIP assets.
- Full ten-prompt library generation from the supplied prompt pack.
- Ten passing state/backend tests using the actual SQL migration on SQLite: research activation gate; origin and administrator protection; idempotent visits and hashed visitor IDs; private workspace recovery/revision conflicts/deletion; survey schema/consent/duplicates/idempotency/withdrawal; safe CSV cells; retention cleanup; rate limiting; state backup validation.
- Browser verification with installed Microsoft Edge: persistent notes/checklists, a JSON export and restore, blueprint-driven prompt construction, all ten prompt panels, 16 rubric criteria, resource searching and a real DOCX download, worked-item feedback, private survey draft persistence, disabled research collection, and 14 routes at 390 px without page overflow.
- Browser-to-handler checks against a temporary local SQL database: opt-in analytics, private cloud workspace creation, consented research submission, private dashboard authentication, and a research CSV download. Test-only data and study wording were used; no external participant data was created.
- Automated WCAG A/AA checks across seven representative pages found no remaining violations after contrast and accessible-name corrections. This automated result is not a claim of full accessibility conformance or manual assistive-technology testing.
- A successful Cloudflare Wrangler production-bundle dry run. This did not provision, deploy, or execute a remote database or scheduled job.
- Visual inspection of desktop and mobile overview screenshots. The visual asset is a locally authored vector illustration; no external image, font CDN, or tracking library is loaded.

## Production verification completed

- The public GitHub repository was created at `https://github.com/tiamole/acata-2026-workshop`.
- GitHub Actions checks and Pages deployment succeeded. The public overview rendered in a real browser with HTTP 200, and the original participant toolkit downloaded successfully.
- The Cloudflare Worker, D1 database, initial migration, runtime secrets, allowed website origin, and daily `17 4 * * *` UTC cleanup trigger were deployed. The frontend configuration points to the actual returned API origin.
- The live API passed health/configuration checks. A temporary production workspace was created, retrieved, updated with revision enforcement, and deleted. The real administrator dashboard and research-export header were accessible with the protected administrator credential. Unauthenticated dashboard access and an unapproved origin were rejected. A direct survey POST was rejected while research collection is closed.
- Production checks did not create survey responses or visit events. Dashboard data is not populated with synthetic reach or participant counts.
- The service secrets are stored in Cloudflare and backed up in Windows Credential Manager. The local dashboard launcher copies the administrator token directly to the clipboard without printing it or including it in the browser URL.

Research collection remains intentionally disabled pending study details. No study approval, participant traffic, or research outcome is implied. The daily retention handler passed local SQL tests and its real schedule is deployed; a future scheduled production execution has not been observed as part of this release check. Provider availability and provider-level backup/log policies remain operational considerations.

Ignored `artifacts/` contains the local screenshots, accessibility report, and backend build output. The screenshot titled `dashboard-connected-test.png` contains test data and must not be presented as real workshop reach.
