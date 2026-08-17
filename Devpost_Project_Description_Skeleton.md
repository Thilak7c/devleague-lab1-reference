# Devpost Project Description — Skeleton

Fill in the [bracketed] parts on Challenge Day once the build is real.
Structure follows Devpost's required components + Lab 1 rubric weighting,
so nothing here needs to change shape later — only content.

---

## Project Title

[Working title — needs to be specific, not "AI Financial Analyzer".
 Candidates to refine day-of once the actual standout feature is clear:]
- [Option 1]
- [Option 2]
- [Option 3]

---

## Elevator Pitch (1–2 sentences, shown in Devpost search/listing)

[e.g. "[Product name] turns a stack of financial reports into a plain-language
summary of trends, risks, and anomalies — with every insight traceable back
to the exact number that triggered it."]

---

## Which Lab

Lab 1 — Digital Transformation & Operations
Challenge: AI-Powered Financial Report Analysis — Powered by Experian

---

## The Problem

[2–3 sentences. Pull from the brief but make it concrete with a specific
user, not abstract. E.g.: "Finance teams reviewing quarterly reports or
expense spreadsheets manually spend hours cross-checking numbers across
formats, and small but important anomalies — a duplicate line item, an
unexplained spend spike — get missed. [Product name] automates that first
pass so a human reviewer starts from a prioritized list of what actually
needs attention, not a blank spreadsheet."]

---

## The Solution — How It Works

[Plain-language walkthrough a judge can predict the demo from after reading
this paragraph. Suggested shape:]

1. **Upload** — [PDF or spreadsheet, drag-and-drop]
2. **Extract** — [structured parsing for spreadsheets/text-PDFs; vision
   fallback for scanned docs, if built]
3. **Analyze** — [explainable rule-based checks: variance, outliers,
   duplicates — name the actual checks once built]
4. **Present** — [dashboard: headline summary + drill-down to source data]
5. **Protect** — [PDPA layer: PII masking before display/export, no
   persistence beyond session]

[One sentence on explainability: "Every flagged insight links back to the
specific figures behind it — no black-box scoring."]

---

## What Makes It Unique

[2–3 bullets. Draft candidates — confirm which are actually true once built:]

- Explainability-first anomaly detection (rule-based, auditable) rather than
  an opaque LLM verdict
- PDPA-compliant by default: [no persistence / active PII masking] —
  most competing teams will likely under-deliver here
- [Anything else that ends up being a genuine differentiator after building —
  don't force a third bullet if there isn't one]

---

## Target Users

[Who specifically. E.g.: "Financial analysts and SME finance teams reviewing
quarterly/monthly reports who currently do this cross-check manually."]

---

## Technologies / Tools Used

- Frontend: [Next.js, Vercel]
- Backend: [Express, Cloud Run — confirm final]
- Extraction: [Groq — model name — + any PDF/spreadsheet parsing libraries used]
- [Any PII detection approach — regex / library / model]
- [AI coding disclosure: e.g. "Built with AI-assisted coding (Claude);
  extraction pipeline uses Groq's [model] for document parsing — see
  AI_DISCLOSURE.md in repo"]

---

## Data Privacy & PDPA Approach

[Short, direct statement — this is evidence for "Responsible and ethical
use of AI" and "Data privacy, security, and PDPA compliance" criteria.
E.g.: "Uploaded documents are processed in-memory only and are never
persisted to disk or database. Before any extracted data is displayed or
exported, a masking pass flags [IC numbers / account numbers / personal
names] for redaction. Users are shown exactly what data is used and for
what purpose before uploading."]

---

## Known Limitations (honest, per AI_DISCLOSURE pattern)

[e.g. "Vision-fallback extraction may struggle with low-quality scans.
Anomaly thresholds are currently fixed rather than industry-calibrated.
[Anything else discovered during the build — state plainly, don't hide it.]"]

---

## Links (fill in day-of)

- GitHub repo: [public URL, README confirmed present]
- Live demo: [deployed URL]
- Pitch video (≤3:00): [URL]

---

## Pitch Video Script Outline (3:00 hard limit)

| Time | Section |
|---|---|
| 0:00–0:25 | Problem — who's affected, what's painful today |
| 0:25–0:45 | Solution overview — one sentence, what it does |
| 0:45–2:15 | Live demo — upload → extract → analyze → insights → PDPA masking |
| 2:15–2:45 | What makes it unique / technical highlight worth mentioning |
| 2:45–3:00 | Close — impact statement, team credit |

[Rehearse against this with a stopwatch before the final recording —
per the hackathon-tips doc, the demo path should be planned alongside
the build, not bolted on after.]
