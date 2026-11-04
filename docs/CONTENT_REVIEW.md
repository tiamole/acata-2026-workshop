# Review of the supplied workshop directory

Reviewed on 4 November 2026 for Taiwo Feyijimi’s ACATA 2026 participant website.

## Scope and method

The original directory contained five root DOCX files, a participant-downloadables subfolder containing five DOCX files, and two ZIP archives. Both archives were inspected, and all ten embedded DOCX documents were read. That is 20 document instances across ten principal document types. Word paragraph and table-cell text was extracted from each document’s `word/document.xml`; archive entries were read directly without executing embedded content. Source text and inventory are retained in `review/`.

This was a comprehensive content review of the supplied documents and archive members. It was not a claim of manual Word pagination or visual rendering review. No slides, agenda, session duration, participant roster, actual study protocol, venue, or survey approval document was present.

## Source relationships

| Location | Contents | Finding |
| --- | --- | --- |
| Root | Five participant tools, numbered 01–05 | Same substantive framework as the participant subfolder; minor blank-entry and line-layout differences |
| `Modernising_Item_Development_Participant_Downloadables/` | Five participant tools | Chosen as the individual download source because fill-in fields are clearer |
| Participant-downloadables ZIP | Same five participant tools | Extracted text exactly matches the corresponding subfolder documents |
| Minimal-example ZIP | Five completed minimal examples | Distinct instructional set following OHM-001 across all five stages |

Root-versus-subfolder differences: the blueprint adds explicit blank-entry lines; the rubric adds blank response lines; metadata consolidates a few sample/date/calibration fields and adds a classification entry line. Prompt-pack and AI-audit extracted text matches exactly. None of these differences changes the substantive workflow. Original files were not modified.

## Content findings and website decisions

### 1. Item Blueprint Mini-Template

The source covers assessment context; construct, outcome, and observable evidence; six cognitive processes; content boundaries and prerequisites; item specification; a six-item coverage mini-matrix; fairness/accessibility constraints; and final sign-off. Sections A–E precede generation, with F–H used during set review.

The website provides an editable planning worksheet and four completion checks linked to these stages. It preserves the distinction between a blueprint/design intention and empirical validation evidence. Cognitive demand is established through the solution process, not the action verb.

### 2. AI & LLM Prompt Pack

Six principles are ground first, constrain output, request evidence, separate generation and review, use human gates, and record changes. Ten full prompts address generation, selected-response review, constructed-response/rubric review, cognitive demand, fairness, language/accessibility, distractors, parallel variants, set coverage, and final adversarial pre-pilot review. The source also provides a rapid prompt-builder structure and safe-use checklist.

All ten source prompt bodies are included in `public/prompts.json`, with presentation-only line breaks. A browser-local brief builder uses the participant’s current blueprint; it does not send content to an AI service. The website does not claim that prompt completion validates an item or makes variants equivalent.

### 3. Item Review Rubric

The source includes 16 criteria, anchors 1–4 plus N/A, selected-response and constructed-response diagnostic checklists, fairness questions, four dispositions, and independent-review/adjudication guidance. Its critical rule is that a serious defect must not be averaged away.

The interactive worksheet implements all 16 criteria with evidence notes, a disposition, and reviewer summary. It deliberately omits a total or average. The full diagnostic checklists remain available in the original DOCX download.

### 4. Item Metadata Sheet

The source covers identification/lifecycle, construct/blueprint tags, scoring, provisional versus empirical difficulty, distractor hypotheses, review evidence, fairness/accessibility, AI provenance, bank restrictions, and CAT readiness.

The website groups these into six editable practice fields and retains the explicit limits on pre-pilot claims and adaptive readiness. Metadata completion is never presented as calibration or CAT eligibility.

### 5. AI-Use Audit Log

The source emphasises traceability, human accountability, minimisation, evidence separation, version control, and proportionality. It provides session/input records, accept/edit/reject decision logs, substantive-change logs, claim verification, final disposition, and minimum scaled-workflow fields.

The website asks participants to record an accepted, edited, and rejected suggestion with reasons, then record verification and outstanding uncertainty. Browser saving and optional sync are separate from research collection.

### 6–10. Minimal worked example set

The five example documents follow a low-stakes secondary-science item: a single-resistor direct-current circuit, 12 V / 4 ohms, correct current 3 A (key B). Candidate distractors are 0.33 A, 8 A, and 48 A. Intended cognitive demand is Apply. The blueprint excludes series/parallel networks and avoids an unnecessary diagram.

The worked review and metadata label distractor plausibility and difficulty as provisional. The example version progresses from 1.0 to 1.1 and is considered for pilot use after human review; empirical difficulty, discrimination, distractor functioning, and differential performance remain unknown. It is not calibrated for CAT. The website’s interactive practice item, stage narrative, downloads, and knowledge questions preserve these limits.

## Additions made for the participant website

The visual identity, learning navigation, worksheets, progress features, analytics service, and proposed research instrument are new website features based on the supplied content. The research survey is an author-developed draft, not an existing approved or validated workshop instrument. Collection stays closed pending actual study details, as requested by the user.

No workshop date, session timings, official organisational endorsement, reviewer approvals, participant counts, outcomes, map points, or live metrics were invented. Copyright is attributed to Taiwo Feyijimi throughout.

`review/inventory.json` records the reviewed instances and source-file hashes. `docs/download-manifest.json` verifies every served DOCX and ZIP. The website’s check script checks these downloadable bytes against the release manifest.

## Participant download revision

At Taiwo Feyijimi’s request, the five individual participant downloads now use the exact root-level DOCX files he supplied as the visually formatted versions. These supersede the subfolder copies originally selected above. The website’s participant-toolkit ZIP has been rebuilt from those same five files, preserving their bytes and formatting. Comparison found no wording changes beyond blank-entry lines and layout whitespace. The worked examples are unchanged. The current download manifest records the replacement files and rebuilt ZIP.
