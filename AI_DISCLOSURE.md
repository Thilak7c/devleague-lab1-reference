# AI Disclosure

This document states plainly what AI was used for, where, and what its known
limitations are — in the interest of the "responsible and ethical use of AI"
judging criterion. Nothing here is hidden or softened; if a limitation was
found during testing, it's listed below with what we did about it.

---

## 1. AI-assisted coding (building this project)

Parts of this codebase were built with AI-assisted coding (Claude). Where
this was used:
- Scaffolding the extraction, PII-masking, and anomaly-detection modules
- Generating test fixtures and integration tests
- Drafting documentation (including this file)

All AI-assisted code was reviewed, tested, and in several cases corrected
by the team before being trusted — see Section 3 for specific bugs this
process caught. AI-assisted code was not accepted on faith; every module
below has a passing automated test suite that was run against real inputs
(real generated files, real HTTP requests) before being considered done.

## 2. AI used within the product itself

- **Primary extraction path (spreadsheets, text-based PDFs): no AI/LLM
  call at all.** Data is parsed directly using deterministic libraries
  (papaparse, SheetJS, pdf-parse). This is the default and expected path
  for typical financial reports.
- **Fallback extraction path (scanned/image PDFs only):** if a PDF has no
  extractable text layer, the document is sent to a vision model (Groq,
  `qwen/qwen3.6-27b`) to read it — implemented and tested end-to-end,
  including against multi-page documents and a deliberately degraded,
  low-quality scan. The model is asked to extract both tabular line
  items and any non-tabular free text (e.g. a "Prepared by" / notes
  section), and both are checked for PII before anything is shown to
  the user — see Section 3 for a real gap this surfaced during testing
  and how it was fixed. This is an uncommon path: it only runs when a
  document has no usable text layer at all.
- **Anomaly/insight detection: no LLM involved.** All trend, outlier, and
  duplicate detection is rule-based arithmetic (variance thresholds,
  median/MAD statistical outlier detection, exact-match duplicate
  checking) run directly against the extracted numbers. This is a
  deliberate design choice — see "Why rule-based, not LLM-based" below.
- **PII masking: no LLM involved.** Detection is regex-based pattern
  matching, not a language model. This makes it deterministic and testable
  but also means it has hard edges — see Section 3.

### Why rule-based, not LLM-based, for the analysis layer

An LLM could plausibly generate an "anomaly summary" directly from the
extracted data. We deliberately did not build it this way. A rule-based
approach means every insight the user sees can be traced back to the exact
arithmetic and source rows that produced it — this is what the brief's
"explainability and transparency" requirement asks for, and it's something
a black-box LLM summary cannot honestly provide. It also means the same
input always produces the same output, which matters for something judges
or real financial reviewers need to trust.

---

## 3. Known limitations (found during testing, stated honestly)

These were discovered by our own automated test suites before Challenge
Day, not left for someone else to find later.

**PII masking:**
- Internal reference codes that happen to be long digit sequences (e.g. a
  "Cost Center: 7788990011" field) can be flagged and masked as if they
  were bank account numbers, since pattern-matching alone can't tell the
  difference. This is a deliberate false-positive-over-false-negative
  tradeoff: we would rather over-mask a harmless internal code than miss a
  real account number.
- Name detection only catches names that are explicitly labelled (e.g.
  "Prepared by: ..."). Free-text names embedded in prose are not detected
  — this would require a language model to do reliably, and we chose not
  to add that dependency/cost for this pass.

**Anomaly detection:**
- Outlier detection originally used a standard mean/standard-deviation
  z-score. Testing surfaced a real weakness: a single extreme value
  inflates the very mean/stddev it's being measured against, which can
  mask the outlier it should catch (a clear test case came out just under
  the detection threshold purely because of this effect). We switched to
  a median/MAD-based ("modified z-score") method instead, which is
  standard statistical practice for exactly this failure mode and is not
  distorted by the outlier itself.
- All thresholds (50% variance, etc.) are fixed values, not calibrated
  against real industry benchmarks for any specific sector. They are
  reasonable defaults, stated as such, not claimed to be tuned expertise.

**PDF extraction:**
- Text-layer PDF parsing uses a line-based heuristic tuned for typical
  single-line financial report entries (e.g. "Category, Period, Amount").
  A genuinely complex multi-column PDF table layout may not be extracted
  correctly. Scanned/image PDFs with no text layer are detected explicitly
  and are not silently mishandled — the system reports that it cannot
  read them rather than returning an empty/misleading result.
- The `pdf-parse` library's API changed significantly between major
  versions; this project uses the current (v2) class-based API. Noted
  here only because it's the kind of dependency-version issue that can
  silently break a pipeline if not verified against real files, which we
  did.

  **Vision-based extraction (scanned/image PDFs):**
- The vision model was initially prompted to extract only structured
  line items (category/period/amount/vendor). Testing with a document
  that had PII inside a non-tabular Notes section revealed that this
  free text was being silently excluded from extraction entirely — not
  masked incorrectly, but never captured in the first place, since it
  fell outside what the model was asked to return. This meant the PII
  masking step, working correctly on the data it was given, was being
  given an incomplete picture on this specific path. Fixed by extending
  the extraction prompt and response schema to also capture non-tabular
  free text, which is now run through the same PII masking logic as
  every other extracted field. Documented here rather than left
  unmentioned, since it's exactly the kind of gap this disclosure
  exists to surface.
- Accuracy on a deliberately degraded test scan (skew, blur, sensor
  noise, uneven lighting, JPEG compression) was verified correct for
  the one test case run. This has not been stress-tested against a
  wider range of real-world scan/photo quality, so we would not claim
  it is robust to every possible scan condition — only that it handled
  the specific degraded case tested.

---

## 4. What we did NOT do

- No document content is sent to any third-party AI service unless the
  scanned-PDF vision fallback is triggered — an uncommon path, and one
  the user is shown explicitly in the UI when it happens (see the
  in-app AI-assisted-reading disclosure).
- No uploaded document or extracted data is persisted to disk or a
  database — see the Data Privacy section of the Project Description for
  the full PDPA approach.
- No AI-generated insight is presented without a traceable source — every
  insight links back to specific row IDs from the original document.

---

*This document reflects the state of the project as of the last update
before submission. If anything changes during Challenge Day build time,
this file should be updated to match — an honest but outdated disclosure
is still misleading.*
