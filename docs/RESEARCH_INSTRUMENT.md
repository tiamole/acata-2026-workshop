# Proposed workshop research instrument · ACATA 2026 v1

**Status:** prepared for study-lead review. Collection disabled pending actual participant information, contact, retention, consent version, and review status. The user explicitly selected preparation pending these details.

## Purpose and design

The draft explores knowledge and self-reported confidence around blueprinting, responsible AI use, cognitive demand, fairness, evidence limits, and auditability. Repeated confidence and knowledge items are provided at three stages: before, after, and later reflection. The later-reflection interval is intentionally unspecified because no interval was supplied.

The source for item content is the five participant tools and five worked examples reviewed in `CONTENT_REVIEW.md`. This is an author-developed instrument. It has not undergone expert panel validation, cognitive interviewing, reliability analysis, measurement-invariance evaluation, or an empirical study. Those are not claims made by the website.

## Content mapping and codebook

| Fields | Content | Response encoding |
| --- | --- | --- |
| `role` | Broad professional role | Enumerated label or blank |
| `experience` | Current AI use in item development | Never, less than monthly, monthly, weekly, daily, prefer not to say, or blank |
| `c_blueprint` | Define construct, observable outcome, and blueprint | 1–5 confidence, `skip`, or missing |
| `c_prompt` | Write a blueprint-constrained AI prompt | Same |
| `c_cognition` | Judge cognitive demand from shortest solution path | Same |
| `c_fairness` | Screen fairness/accessibility concerns | Same |
| `c_metadata` | Separate provisional difficulty from empirical evidence | Same |
| `c_audit` | Record AI contributions and human decisions | Same |
| `k1` | Cognitive demand comes from required reasoning | Zero-based option index, correct `1` |
| `k2` | Pre-pilot difficulty is a design estimate | Correct `2` |
| `k3` | A wrong key blocks approval despite high ratings | Correct `1` |
| `k4` | AI fairness screening flags potential barriers | Correct `2` |
| `k5` | Audit record links contribution/action/reason/evidence/version | Correct `0` |
| `a_useful` | Perceived usefulness of blueprint-constrained AI | Post/follow-up only; 1–5 agreement, `skip`, or missing |
| `a_review` | Usefulness of a separate review pass | Same |
| `a_accountability` | Ability to explain human decision responsibilities | Same |
| `a_intent` | Intended documented-workflow use | Same |
| `transfer` | Later workflow use frequency | Follow-up only; not yet, once, a few times, regularly, prefer not to say, or blank |
| `reflection` | Stage-specific open reflection | Optional, up to 2,000 characters |

Confidence anchors: 1 not at all confident, 5 very confident. Agreement anchors: 1 strongly disagree, 5 strongly agree. Knowledge option `3` always means “Not sure / prefer not to answer”. Missing responses and explicit skips are not silently scored as incorrect. Exact question and option wording is in `public/content.js`.

## Interpretation plan for review

Report item distributions and stage counts first. Where pairing codes match, explore within-person changes with the missing-data treatment specified before analysis. Separate confidence, knowledge responses, perceived usefulness, and later reported use; they measure different things. Do not compute a combined “impact” score without a defensible measurement rationale.

Repeated knowledge questions may introduce familiarity effects. Opt-in participation, self-selection, attrition, self-report bias, shared devices, and timing differences limit interpretation. Before/after changes alone do not establish that the workshop caused the change. No student outcomes, item-quality gains, calibration, empirical fairness, or psychometric validation are inferred from these responses.

## Records and participant choices

- Learning access does not require research participation or analytics consent.
- A browser-local draft is never treated as a submitted response.
- All substantive questions can be skipped. Current voluntary consent is required to submit.
- A separate 192-bit random study code pairs stages. The server stores its keyed hash. It does not send workspace recovery codes or daily analytics identifiers with survey answers.
- A random 256-bit receipt deletion code lets a participant remove that stage’s response. Only its hash is stored server-side. Keep the code outside the browser if withdrawal access must survive browser-data loss.
- Duplicate submissions for one study code, stage, and instrument version are prevented. An identical submission-ID retry returns its existing receipt timestamp.
- Administrator exports include study hash, stage, instrument version, consent version/time, submission time, and coded responses. They exclude deletion codes, workspace recovery credentials, raw IPs, and visitor hashes.
- Free text and small groups can enable reidentification; the site uses “pseudonymous” rather than claiming guaranteed anonymity.
- Retention expiry is recorded per response. The scheduled cleanup deletes expired records; exports exclude expired records before cleanup. Provider backups/logs require separate review of the actual service settings.

## Fields still needed from the study lead

Actual study title/purpose; study contact; intended population/eligibility; review or exemption status; approved participant information; risks/benefits; use and access to responses; retention and backups policy; contact-based withdrawal arrangements; consent version; and whether the later-reflection stage will be used and at what interval. Technical configuration checks cannot establish ethical or scientific approval.

After these details are supplied, update the real consent information and the server settings described in `DEPLOYMENT.md`. Research can remain closed while the public learning website and optional analytics are in use.
