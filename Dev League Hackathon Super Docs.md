# DevLeague Hackathon Super Docs

**Last updated:** 16 Aug 2026 (organizer full reply received — all 5 questions answered)
**Status:** Living document — keep updating as tasks progress and organizer answers come in. This replaces piecing together info from multiple chat threads/files.

---

## 1. Quick Reference

| | |
|---|---|
| **Event** | DevLeague 2026 — Xsolla × Curine Academy |
| **Lab** | Lab 1 — Digital Transformation & Operations |
| **Challenge** | AI-Powered Financial Report Analysis — Powered by Experian |
| **Challenge Day** | 22 Aug 2026, 09:30–16:30 (7-hour build window) |
| **Submission deadline** | 16:30 sharp — **no late submissions, even 1 min late is rejected** |
| **Team size** | 3 (valid — event allows 3–4) |
| **Repo** | `https://github.com/Thilak7c/devleague-starter-mock` |

**Team & roles:**
- **Thilak (you)** — Integration Lead: backend pipeline wiring, Cloud Run/Vercel deploy, final integration testing
- **Student A** — Ingest & Frontend: upload UI, dashboard, visual polish
- **Student B** — Analysis, PDPA & Disclosure: anomaly detection, PII masking, AI disclosure docs

---

## 2. The Problem Statement (official brief, revealed 15 Aug 2026)

> Develop an AI-powered solution that streamlines the analysis of financial reports. The tool should extract and interpret key financial information from structured and unstructured sources (PDFs, spreadsheets), identify trends, anomalies, and noteworthy insights, and present findings in a clear, user-friendly format — enabling faster, more informed decisions while improving productivity and accuracy.

**Key requirements:**
- Extract data from PDFs and spreadsheets
- Analyse for trends, patterns, exceptions, risks
- Generate concise summaries and recommendations
- Present via intuitive dashboard/report/conversational interface
- Demonstrate explainability and transparency

**PDPA (Malaysia) requirements:**
- Process only necessary data
- Avoid collecting/storing/exposing PII unless required and protected
- Mask/anonymise/redact PII where applicable
- User control over retention/deletion
- Clear communication of data use

**Success criteria:** Innovation, accuracy/quality of insights, UX, scalability/business value, PDPA compliance, responsible AI use.

---

## 3. Judging Criteria & Rules

| Criterion | Weight |
|---|---|
| Technical Execution | **25%** |
| Problem & Lab Alignment | 20% |
| Innovation & Creativity | 20% |
| Impact & Potential | 20% |
| User Experience & Design | 15% |

- Separate **Best UI/UX prize ($450)**, independent of main ranking.
- Devpost submission needs: public GitHub repo (README, setup instructions), live demo link (or local run instructions), pitch video (≤3:00), Project Description.
- Tool choice is explicitly **not judged** — no KIRO/AWS requirement despite earlier kickoff note (superseded).
- Repo can continue from practice work as long as Aug 22 has "substantially developed" real commits.

---

## 4. Open Questions Sent to Organizers

**Status: partial response received 16 Aug 2026.** Organizer reply below, verbatim intent preserved. Two of five questions answered; document scope, repo continuity still open.

> On the dataset - no specific dataset or API has been provided for Lab 1 at this stage. We have raised this with the relevant party and will update you as soon as we hear back. In the meantime, you are welcome to source publicly available datasets from platforms like Kaggle or generate your own synthetic test data for the purposes of your build.
>
> On data privacy - the PDPA compliance requirements in the problem statement are part of the judging criteria, so we'd recommend treating it as more than just a pass/fail checkbox.

**What this resolves:**

1. **Sample data (Q1) — answered, actionable now.** No organizer-provided dataset. **Action: source from Kaggle or generate synthetic test data ourselves** — this becomes our own task rather than a wait. Since nothing is provided, it's also unlikely judges will upload their own live documents during judging (nothing suggests otherwise) — but worth keeping the rehearsed-demo-data approach as the primary plan regardless, with our own synthetic set as backup for both dev and the actual demo.

2. **Experian (Q2) — implicitly answered.** "No specific dataset or API has been provided for Lab 1" covers this too — Experian's involvement is very likely branding/sponsorship only, not a technical integration point, at least for now. Organizers say they'll follow up if this changes — **revisit if/when they do, but don't design around Experian for now.**

4. **PDPA scoring (Q4) — answered, changes priority.** PDPA compliance is **explicitly part of the judging criteria, not a pass/fail checkbox.** This raises the importance of the PII masking module and its visible demonstration in the UI (see Section 9.1 and `PDPA_UI_Copy.md`) — "we don't persist data" alone is *not* enough anymore; **actively demonstrating the masking feature working live is now a real scoring factor, not just a nice-to-have.** Worth allocating a specific pitch-video moment to showing the masking badge in action (see Section 6 pitch script — may need a small addition here).

**Still open — no reply yet:** none. All 5 original questions now answered as of 16 Aug 2026.

**Q3 — Document scope (answered 16 Aug):**
> You should plan for both — native PDFs and spreadsheets with selectable text are the primary format, but handling scanned or image-only PDFs would definitely strengthen your solution and is worth considering as part of your build. Ultimately it comes down to how robust you want your solution to be, and the judges will be looking at the quality and completeness of your approach.

**What this changes:** vision-fallback is no longer "build if there's time" — organizers are explicitly signalling it's part of what judges assess ("quality and completeness"). **Priority raised: actually wire up the Groq vision call**, not just leave `needsVisionFallback: true` as a documented dead-end. See Section 5 and updated task list below.

**Q5 — Repo continuity (answered 16 Aug):**
> On the GitHub repo - you're welcome to use an existing repo, but what's important is that there are clear, substantial commits dated 22 August that demonstrate the work was done on Challenge Day itself. The judging team will be verifying submission activity as part of the review process, so please make sure your commit history reflects your actual build on the day.

**What this changes:** confirmed — existing repo is fine, but **judges will actively check commit history**, not just take "substantially developed" on faith. This means Challenge Day needs a deliberate, frequent-commit workflow (not one giant end-of-day commit) so the history genuinely shows real build activity across the 7-hour window. Worth agreeing on a commit cadence as a team norm before the 22nd — e.g. commit after each working feature/module, not just at milestones.

**➡ Action: update Section 5 and Section 9.1 given the PDPA scoring answer; source/generate sample data per Section 10 task list.**

---

## 5. Architecture Decisions (locked, don't relitigate without reason)

- **Frontend:** Next.js on Vercel (no change from practice build)
- **Backend:** Express on Cloud Run (no change — remember `--source ./backend` deploy pattern)
- **Extraction:** text-first, not LLM-first
  - Spreadsheets (CSV/XLSX) → direct parsing (papaparse / SheetJS), no API call
  - Text-layer PDFs → direct text extraction (pdf-parse), no API call
  - Scanned/image PDFs → Groq vision fallback (`qwen/qwen3.6-27b`), triggered only when text layer is empty/near-empty. **Updated 16 Aug: organizers confirmed judges assess "quality and completeness" and scanned-PDF handling "would definitely strengthen your solution" — this is now a real build priority, not an optional stretch. The detection hook (`needsVisionFallback: true`) already exists in `documentParser.js`; the actual Groq API call still needs to be implemented and wired in before Challenge Day if possible, or early in the build window.**
- **Analysis:** rule-based, deterministic, explainable — NOT an LLM black-box summary. Every insight traces back to source row IDs.
- **PDPA approach:** no persistence beyond session (server processes in-memory only) + active regex-based PII masking before display/export. No auth, no database, no user accounts. **Updated 16 Aug: organizers confirmed PDPA is part of the judging criteria, not pass/fail — the masking feature needs to be visibly demonstrated working, not just claimed in text.** See Section 9.1 and `PDPA_UI_Copy.md` Section 3 (masking confirmation badge) — this UI element is now higher priority than originally scoped.
- **Sample/test data:** no organizer-provided dataset for Lab 1 (confirmed 16 Aug). Source from Kaggle or generate synthetic financial report data ourselves — added to task list below.
- **Data contract:** locked — see Section 7.

---

## 6. Team Roles — Detailed

**Thilak — Integration Lead**
- Own `/api/process` pipeline wiring: extraction → analysis → masking → response
- Extraction routing (spreadsheet vs. text-PDF vs. vision-fallback decision)
- Cloud Run / Vercel deployment, env config, demo-mode/fallback resilience
- Final integration testing between Student A's frontend and Student B's analysis output

**Student A — Ingest & Frontend**
- Upload UI (drag-and-drop, all 4 states: idle/uploading/processing/error)
- Dashboard: headline summary + insight cards + drill-down to source rows
- Visual polish (modern-SaaS aesthetic, carried over from practice build)
- Owns the "first 3 seconds" wow-moment UX

**Student B — Analysis, PDPA & Disclosure**
- Rule-based anomaly detection (variance, outlier, duplicate checks)
- PII detection/masking (IC numbers, account numbers, names)
- AI_DISCLOSURE.md + "how we use your data" PDPA UI copy
- Checks build against rubric line-by-line before submission

**Undecided — needs team decision:** who owns the pitch video / who's primary speaker for live judge Q&A.

---

## 7. Insight Object Data Contract (LOCKED)

**Endpoint:** `POST /api/process` — `multipart/form-data`, field name `file`.

```json
{
  "meta": {
    "filename": "Q2_2026_Expense_Report.pdf",
    "fileType": "pdf",
    "extractionMethod": "text",
    "processedAt": "2026-08-22T10:15:32Z"
  },
  "extracted": {
    "rowCount": 42,
    "rows": [
      { "id": "row_1", "category": "Marketing", "period": "Q2 2026", "amount": 198000, "vendor": "Global Supplies Sdn Bhd" }
    ]
  },
  "privacy": {
    "maskedCount": 2,
    "matches": [ { "field": "vendor", "type": "EMAIL", "rowId": "row_7" } ]
  },
  "insights": [
    {
      "id": "insight_1",
      "type": "variance",
      "severity": "high",
      "message": "Marketing spend up 340% vs last quarter (threshold: 50%)",
      "sourceRowIds": ["row_1", "row_2"],
      "metric": { "current": 198000, "previous": 45000, "changePercent": 340, "threshold": 50 }
    }
  ],
  "summary": { "totalInsights": 3, "bySeverity": { "high": 1, "warning": 1, "info": 1 } }
}
```

**Key rules:**
- Every row needs a stable `id` — insights reference rows via `sourceRowIds`
- `type` enum: `"variance" | "outlier" | "duplicate"` — extend only by team agreement
- `severity` enum: `"info" | "warning" | "high"` — drives dashboard badge color
- `message` must be a complete human-readable sentence, rendered as-is
- Every insight MUST have ≥1 source row — no traceable source = not explainable = don't emit it
- `privacy.matches` never includes the original unmasked value
- Errors use `{ "error": { "code": "...", "message": "..." } }` — known codes: `UNSUPPORTED_FILE_TYPE`, `FILE_TOO_LARGE`, `EXTRACTION_FAILED`, `NO_DATA_FOUND`

Full doc with fixture JSON for frontend dev: `Insight_Object_Data_Contract.md`

---

## 8. Frontend Core Functionalities (spec, not yet built)

Full doc: `Frontend_Core_Functionalities.md`. Summary:

- Upload: drag-drop + click-to-browse, client-side type/size validation
- 4 required states: idle, uploading, processing, error (never leave user staring at nothing)
- Results: headline summary (3-second understanding) → insight list → drill-down to source rows → empty state (zero anomalies = good result, not broken)
- PDPA UI: visible "how we use your data" statement, masking badge ("2 fields masked")
- Error handling: per-scenario messages (unsupported type, too large, extraction failed, backend unreachable)
- Demo resilience: Demo Mode / cached-response fallback for live wifi failure
- Explicitly OUT of scope: auth, persistent storage, multi-file batch, export, mobile-responsive

---

## 9. Built Modules — Status & Findings

### 9.1 PII Masking (`pii-masking/piiMask.js`) — ✅ built & tested

Pure regex, no dependencies. Detects: Malaysian IC numbers, phone numbers, emails, bank account numbers, labelled names (e.g. "Name: John Tan").

**Functions:** `detectPII(text)`, `maskText(text)`, `maskRows(rows)`

**Bugs found & fixed during testing:**
- Name regex was bleeding across newlines (`\s+` matched `\n`) — e.g. "Siti Aminah\nContact" got captured as one name. Fixed by restricting to `[ \t]+` (no newline).
- Invoice numbers like "INV-2026-0442" were partially false-flagged as bank accounts. Fixed with a negative lookbehind excluding digit runs glued to a preceding hyphen.
- "Approved by:" wasn't in the name-label list — added.

**Known limitation (document in AI_DISCLOSURE.md):** internal reference codes (e.g. "Cost Center: 7788990011") can get swept up as ACCOUNT matches since they're pattern-indistinguishable from real account numbers. Deliberate false-positive-over-false-negative tradeoff — stated honestly, not hidden.

### 9.2 Anomaly Detection (`anomaly-detection/anomalyDetection.js`) — ✅ built & tested

Rule-based, deterministic, no LLM calls. Three checks: variance (period-over-period by category), outlier (within-category), duplicate (same vendor+amount).

**Function:** `analyzeRows(rows)` → returns `{ insights, summary, skippedRowCount }` matching the locked contract shape directly.

**Bug found & fixed during testing:** outlier detection originally used plain mean/standard-deviation z-scores. A genuine test case (one vendor at RM8,500 vs. ~RM500 average) came out at z=1.999 — just under the 2.0 threshold — because the outlier's own extremity inflated the mean/stddev it was being measured against. **Fixed by switching to median + MAD (median absolute deviation)** with the standard 0.6745 scaling constant (Iglewicz & Hoaglin modified z-score), which is far less sensitive to the outlier it's trying to detect. This is a legitimate, defensible technical talking point if a judge asks about methodology.

**Tunable thresholds** (named constants, easy to justify to judges):
- Variance: 50% flags, 150%+ = high severity
- Outlier: modified z-score ≥ 2.0, ≥3.5 = high severity, needs ≥3 rows in category to run
- Duplicate: amounts within 1% tolerance (handles rounding)

### 9.3 Document Parser (`parsers/documentParser.js`) — ✅ built & tested end-to-end

**Function:** `parseDocument(fileBuffer, fileType)` — dispatches to CSV/XLSX/PDF parsing, returns normalized rows matching the contract shape.

- **CSV/XLSX:** papaparse + SheetJS, with a column-alias normalizer (e.g. "Amount (RM)", "Supplier Name" → canonical `amount`, `vendor`) and `coerceAmount()` that strips currency symbols/commas.
- **PDF:** text-layer extraction via `pdf-parse`, then a line-based heuristic that catches two common formats: comma/tab-delimited rows and "Label .... RM amount" dot-leader style. Explicitly NOT a general table extractor — good enough for typical financial statement layouts, not dense multi-column tables.
- **Scanned PDF detection:** if extracted text is near-empty (<50 meaningful chars), returns `needsVisionFallback: true` instead of guessing — this is the hook for triggering the Groq vision path.

**Bugs found & fixed during testing:**
- **`pdf-parse` v2 API break:** the installed version (2.4.5) uses a completely different class-based API (`new PDFParse({ data }).getText()`) than the `pdf(buffer)` callable-function API shown in most online examples (v1). This would have failed on the very first real PDF upload during the actual build. Caught only because we tested against a real generated PDF file, not just simulated text — **worth remembering this pattern: always test the actual library call against a real file, not just the parsing logic downstream of it.**
- **Delimiter regex didn't handle "comma + space" formatting** (e.g. `"Marketing, Q1 2026, RM45,000.00"` — space before "RM" broke the match silently). Fixed by adding `\s*` after each delimiter in the regex.

**Known limitation:** the PDF table-detection heuristic is line-based and works for typical single-line financial entries; a genuinely complex multi-column PDF table layout may need manual handling — flag this honestly if it comes up during real-data testing before Challenge Day.

### 9.4 Backend Pipeline & API Endpoint (`backend-pipeline/`) — ✅ built & tested end-to-end

**This is the integration piece — extraction → PII masking → anomaly analysis → contract-shaped response, all wired together.**

- `pipeline.js` — `processDocument({ buffer, originalName, mimeType })`: pure function, no Express dependency, fully unit-testable on its own. Order is deliberate: **mask PII before analysis, before response assembly** — so raw PII is never seen by the analysis layer or sent to the frontend, full stop.
- `server.js` — thin Express layer: `POST /api/process` (multer, in-memory storage only — file bytes never touch disk, matches the no-persistence PDPA story), `GET /health`. Maps each `PipelineError` code to the correct HTTP status (400/413/422/500) per the contract's documented error codes.
- `integration.test.js` — 22 assertions, all passing, run as **real HTTP requests via supertest** against real CSV and real generated PDF files — not just unit-level function calls. Covers: happy path, PII masking end-to-end (confirms the original PII value never appears anywhere in the JSON response), real PDF text extraction, blank/scanned PDF error handling, unsupported file type, missing file, and no-usable-data CSV.

**Bug found & fixed during this integration step:** the contract requires `privacy.matches[].rowId` so the frontend can trace which row a masked field came from — but `maskRows()` in the PII module didn't track row IDs at all. Fixed at the source (`piiMask.js` `maskRows()` now includes `rowId` per match, falling back to `null` if a row has no `id`) rather than patching around it in the pipeline layer. This fix was synced back into the canonical `pii-masking/piiMask.js` copy too, so there's one source of truth, not a fork.

**To run locally:** `npm install` in `backend-pipeline/`, then `npm start` (server on port 8080, override via `PORT` env var) or `npm test` (integration suite).

**Deploy note:** ready for `gcloud run deploy --source ./backend-pipeline` once folder is placed in the repo — matches the known `--source` subfolder pattern from the practice build's Cloud Run pitfalls.

### 9.5 Synthetic Sample Data (`sample-data/`) — ✅ generated & verified against the real pipeline

Since organizers confirmed no dataset/API is provided for Lab 1 (16 Aug reply, Section 4), generated our own test/demo data, deliberately designed to exercise every feature:

- `demo_report_main.csv` / `.xlsx` (19 rows) — **primary demo file.** Contains a planted 340% Marketing variance spike (high severity), a planted outlier (RM8,500 vs. ~RM500 category norm), a planted duplicate entry, and PII across NAME/EMAIL/IC types in a Notes field for the masking demo.
- `demo_report_clean.csv` (10 rows) — zero anomalies, zero PII. Verifies the honest empty-state UI path ("no anomalies found" / "no PII detected" reading as a positive result, not a broken one).
- `demo_report_main.pdf` — text-layer PDF version of a subset of the main data, for testing/demoing the PDF extraction path specifically.
- `demo_report_scanned_simulation.pdf` — deliberately blank PDF simulating a scanned/image document with no text layer, for testing the vision-fallback trigger path.

**All five files were run through the real `processDocument()` pipeline end-to-end** (not just visually inspected) — confirmed: CSV and XLSX produce identical results (19 rows, 3 insights: variance/outlier/duplicate, 7 PII fields masked across NAME/EMAIL/IC); clean CSV correctly returns zero insights and zero masks; the PDF correctly extracts its subset of rows and still catches the variance insight; the blank PDF correctly returns `EXTRACTION_FAILED` rather than a misleading empty result.

**Note for demo planning:** the PDF version intentionally contains fewer rows than the CSV/XLSX (kept short for a clean visual PDF), so it only surfaces the variance insight, not the duplicate — expected, not a bug. If PDF is used for the live demo specifically, decide whether to expand it to include the duplicate/outlier rows too, or accept variance-only as the PDF-path demo moment.

### 9.6 Frontend Scaffold (`frontend/`) — ✅ built, compiles clean, ready for Student A to extend

Working Next.js (App Router) frontend, wired against the real API contract and existing PDPA copy — not a mockup. Carries forward the indigo-accent, modern-SaaS aesthetic from the practice build for continuity (Best UI/UX prize positioning).

**Structure:**
- `app/page.js` — the state machine: idle → uploading → processing → results/error, matching all 4 required states from `Frontend_Core_Functionalities.md` Section 2
- `components/UploadZone.js` — drag-and-drop + click-to-browse, client-side validation (type, size, empty file)
- `components/ProcessingState.js` — sequential status messages, explicitly including "Checking for personal information…" per `PDPA_UI_Copy.md` Section 2, so masking reads as a real pipeline step
- `components/ErrorState.js` — per-scenario messaging via `lib/api.js`'s error-code mapping; offers **Demo Mode** as a fallback specifically on network failure
- `components/ResultsDashboard.js` — headline summary (severity counts, the "3-second understanding" moment), masking badge, insight list, honest empty state
- `components/InsightCard.js` — the explainability feature: expandable drill-down showing the actual source rows behind each insight
- `components/PrivacyNotice.js` / `components/MaskingBadge.js` — copy sourced directly from `PDPA_UI_Copy.md`, kept in sync with that doc
- `lib/api.js` — fetch wrapper matching the locked contract's error codes exactly
- `lib/demoModeData.js` — canned fallback response for judging-day resilience, **built from the real verified pipeline output in Section 9.5**, not fabricated numbers

**Verified:**
- `npm install` + `npx next build` — clean production build, zero errors
- Backend (`backend-pipeline/server.js`) and frontend both started as real local servers and confirmed reachable (health check + page HTML returned)
- Full interactive browser testing (drag-drop, click-through) not done in this environment — no browser automation tool available — but every piece of logic the UI depends on (the API contract, error codes, insight shape) has already been independently verified end-to-end in Sections 9.3–9.5

**To run locally:** `npm install` in `frontend/`, copy `.env.local.example` to `.env.local`, then `npm run dev` (with `backend-pipeline` running separately on port 8080).

**What Student A should do next:** visual polish pass (this scaffold is functional/structural, not final-visual), verify on the actual demo device/browser, and decide on real interactive testing before Challenge Day — per the hackathon tips doc, rehearsing the exact demo path matters more than most other polish.

---

## 10. Task List — Sequential

**Before Challenge Day**
- [x] Lock insight object data contract
- [x] Build rule-based anomaly detection logic
- [x] Build spreadsheet parser (CSV/XLSX)
- [x] Build text-layer PDF parser
- [x] Build PII masking module
- [x] Wire PII masking into the extraction/analysis pipeline (call `maskRows()` on extracted rows before returning from `/api/process`)
- [x] Build frontend upload UI + all 4 states (Student A)
- [x] Build dashboard results view (Student A) — can start now using the fixture JSON in the contract doc
- [x] Draft AI_DISCLOSURE.md — include the known limitations documented in Section 9 above
- [x] Write "how we use your data" PDPA UI copy (Student B)
- [x] Create Devpost account (if not done)
- [x] Get organizer answers (all 5 questions now answered as of 16 Aug), update Section 4, revisit affected decisions
- [x] Source or generate synthetic financial report test data (Kaggle or self-generated) — no organizer dataset provided, this is now our own task
- [ ] Ensure masking confirmation badge (PDPA_UI_Copy.md Section 3) is treated as a must-have for the dashboard, not optional polish, given PDPA is scored not pass/fail
- [ ] Implement the actual Groq vision fallback call (extraction hook already exists — `needsVisionFallback: true` in `documentParser.js` — now needs a real API call wired in, given organizer signal that this strengthens the submission)
- [ ] Agree on team commit-cadence norm for Challenge Day (commit after each working piece, not one end-of-day commit) — judges will actively verify Aug 22 commit history per organizer reply

**Once organizer answers arrive**
- [x] ~~Adjust Experian-related plans if applicable~~ — no dataset/API for now, branding-only assumption stands; revisit only if organizers follow up
- [x] ~~Adjust PDPA depth/messaging~~ — done: PDPA is judged, not pass/fail; masking must be actively demonstrated (see Section 5)
- [x] Finalize vision-fallback scope — organizers confirmed it should be built if possible, not just handled gracefully; see new task above

**On Challenge Day**
- [ ] Integrate: extraction → masking → analysis → frontend display
- [ ] Build demo-mode/fallback resilience path
- [ ] Deploy backend (Cloud Run) + frontend (Vercel)
- [ ] End-to-end test with real sample data, same device/network as demo
- [ ] Rehearse pitch against 3-minute limit
- [ ] Fill in Devpost Project Description (skeleton already drafted)
- [ ] Record pitch video
- [ ] Submit before 16:30 sharp

---

## 11. Files Reference

| File | Purpose |
|---|---|
| `Devpost_Project_Description_Skeleton.md` | Fill-in template for final submission |
| `Frontend_Core_Functionalities.md` | Full frontend states/flows spec |
| `Insight_Object_Data_Contract.md` | Full API contract + fixture JSON |
| `pii-masking/piiMask.js` + `test.js` | PII detection/masking module |
| `anomaly-detection/anomalyDetection.js` + `test.js` | Anomaly detection module |
| `parsers/documentParser.js` + `test.js` | CSV/XLSX/PDF parsing module |
| `backend-pipeline/` | Full wired backend: `pipeline.js` (orchestrator), `server.js` (Express API), `integration.test.js` — deployable as-is |
| `Dev League Hackathon Super Docs.md` | **This file** — master reference, keep updated |
| `AI_DISCLOSURE.md` | Honest AI-usage disclosure + known limitations, drafted from real testing findings — update Section 2 if vision fallback gets wired in |
| `PDPA_UI_Copy.md` | Ready-to-use privacy messaging for upload screen, processing state, results badge, error states |
| `sample-data/` | Synthetic demo/test files (CSV, XLSX, 2× PDF) — verified end-to-end against the real pipeline, see Section 9.5 |
| `frontend/` | Working Next.js scaffold — upload, processing, results, error states, wired to the real API — see Section 9.6 |
| `PDPA_UI_Copy.md` | Ready-to-use frontend text for data privacy messaging + masking badge — cross-checked against AI_DISCLOSURE.md so claims don't contradict |

---

## 12. Key Learnings Log (running list, add to this as things come up)

- Explainability-first (rule-based, traceable) beats LLM-black-box for judge defensibility.
- "No persistence" is a strong, simple PDPA story — reduces build surface too.
- Always test library calls against real files, not just downstream logic — caught a major `pdf-parse` v2 API break this way that would have failed silently until Challenge Day.
- Statistical methods matter: naive mean/stddev z-scores can be distorted by the very outlier they're trying to catch — median/MAD is more robust and more defensible if questioned.
- Lock data contracts early — before either frontend or backend teammate builds far against assumptions.
- Document known limitations honestly (regex false positives, heuristic PDF parsing gaps) rather than hiding them — aligns with the "responsible AI disclosure" judging criterion and is a real differentiation opportunity since most teams likely won't do this.
- Integration testing at the real HTTP level (not just unit tests of individual functions) caught a contract-compliance gap (`rowId` missing from PII match records) that unit tests alone wouldn't have surfaced, since each module in isolation "worked" — the gap only showed up when wiring them together against the actual contract shape.
- Organizer answers can reprioritize work retroactively: PDPA being confirmed as a scored criterion (not pass/fail) means a UI element that was previously "nice to have" (the masking confirmation badge) is now something to make sure actually ships — worth periodically checking finished work against new information rather than treating early decisions as permanently settled.
- "We've handled the failure case gracefully" (e.g. the scanned-PDF detection hook) and "we've actually built the feature" are different bars — organizers signalling that scanned-PDF support "would definitely strengthen your solution" means the graceful-failure version, while honest, is no longer sufficient if there's time to do the real thing.
- Judges verifying actual Aug 22 commit timestamps (not just trusting a "substantially developed" claim) means commit discipline is itself a small piece of technical execution — frequent, real commits during the build window, not one end-of-day dump.
