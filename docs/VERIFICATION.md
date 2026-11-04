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

## Production verification remains separate

Publication is verified only by a successful GitHub Pages deployment and its returned URL. Shared analytics/sync are verified only after a real Worker/D1 deployment, runtime secrets, allowed origin, migration, and API URL are configured. Research collection remains intentionally disabled pending study details. No production URL, remote database, participant traffic, study approval, or study outcome is implied by the local checks.

Ignored `artifacts/` contains the local screenshots, accessibility report, and backend build output. The screenshot titled `dashboard-connected-test.png` contains test data and must not be presented as real workshop reach.
