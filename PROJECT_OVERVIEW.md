# AI-Powered Financial Report Analysis
### DevLeague 2026 — Lab 1 — Powered by Experian

---

## The Problem

Financial teams drown in reports spread across PDFs, spreadsheets, and formats.
Manual review is slow, error-prone, and doesn't scale — trends and risks hide
in the noise until it's too late to act on them.

---

## Our Solution

Upload a financial report (CSV, XLSX, or PDF — including scanned PDFs) and get:

- **Extracted, structured data** from whatever format it came in
- **Explainable anomaly detection** — every insight traces back to real source rows
- **PII automatically masked** before anything is displayed or exported
- **A clear dashboard** — 3-second headline summary, drill-down detail

No black-box AI summaries. Every flagged insight shows exactly which rows
and numbers triggered it.

---

## How It Works
1. **Extract** — spreadsheets parsed directly; text PDFs parsed directly;
   scanned/image PDFs go through an AI vision fallback
2. **Mask** — PII (IC numbers, emails, phone numbers, names) detected and
   masked before it ever reaches analysis or the frontend
3. **Analyze** — rule-based checks: period-over-period variance, statistical
   outliers (median/MAD, not naive z-scores), duplicate entries
4. **Present** — dashboard with severity-ranked insights, each with
   drill-down to the exact source rows

---

## What Makes This Different

- **Explainability-first, not LLM-black-box.** Every insight is traceable
  and defensible — no "trust the AI" summaries.
- **PDPA-compliant by design.** No persistence beyond the session, active
  PII masking, visibly demonstrated in the UI — not just claimed in text.
- **Handles the hard case.** Scanned/image PDFs work too, via AI vision
  extraction — not just clean spreadsheets.
- **Statistically robust.** Outlier detection uses median absolute deviation,
  which doesn't get skewed by the very outlier it's trying to catch.

---

## Tech Stack

- **Frontend:** Next.js, deployed on Vercel
- **Backend:** Node.js/Express, deployed on Google Cloud Run
- **Vision fallback:** Groq API for scanned-document extraction
- **Parsing:** papaparse (CSV), SheetJS (XLSX), pdf-parse (text PDF), poppler/pdftoppm (scanned PDF rasterization)

---

## Data Privacy (PDPA)

- No document persistence — processed in-memory, per session only
- Automatic PII detection and masking (names, IC numbers, emails, phone,
  account numbers) before display or export
- Clear "how we use your data" messaging in the UI
- Masking is actively demonstrated, not just asserted

---

## Team

- **Thilak** — Integration Lead: pipeline, deployment, integration testing
- **Student A** — Ingest & Frontend: upload UX, dashboard, visual design
- **Student B** — Analysis & Compliance: anomaly detection, PII masking, AI disclosure
