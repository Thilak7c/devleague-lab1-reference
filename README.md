# Rentap AI — DevLeague 2026 Lab 1 Reference Build

**⚠️ This is a reference/prep repo, not the hackathon submission.**
Everything here was built and tested before Challenge Day so we have a
proven design to build from fast on Aug 22. The actual submission will be
a fresh repo with real commits made live during the 09:30–16:30 build
window — organizers check commit history for that.

Use this repo to read code, copy patterns, and understand the architecture
before Saturday. Don't push straight from this repo into the submission repo.

## Challenge

Lab 1 — AI-Powered Financial Report Analysis (Powered by Experian)
Extract data from PDFs/spreadsheets → detect trends/anomalies →
present insights on a dashboard, with PDPA-compliant handling.

**Product name:** Rentap AI

## Architecture

- **Frontend:** Next.js (`frontend/`) — upload UI, dashboard, results
- **Backend:** Express on Cloud Run (`backend-pipeline/`) — extraction → PII masking → anomaly detection → API response
- **Data contract:** `Insight_Object_Data_Contract.md` — locked, read this first, it's what connects frontend and backend

## Team scopes for Challenge Day

### Student A — Ingest & Frontend
- Read: `Frontend_Core_Functionalities.md`, `Insight_Object_Data_Contract.md`
- Reference code: `frontend/` (all 4 states, dashboard, insight cards, drill-down)
- Build on the day: upload UI, results dashboard, visual polish pass
- Also own: the "first 3 seconds" wow-moment UX

### Student B — Analysis, PDPA & Disclosure
- Read: `AI_DISCLOSURE.md`, `PDPA_UI_Copy.md`, `Insight_Object_Data_Contract.md`
- Reference code: `anomaly-detection/`, `pii-masking/`
- Build on the day: anomaly detection wiring, PII masking wiring, AI_DISCLOSURE.md, PDPA UI copy
- Also own: rubric line-by-line check before submission

### Thilak — Integration Lead
- Pipeline wiring, Cloud Run + Vercel deploy, final integration testing
- Reference code: `backend-pipeline/`, `vision-fallback/`

## Sample/test data

`sample-data/` — synthetic CSV/XLSX/PDF files covering the demo path,
including a scanned-PDF vision-fallback test case. Safe to use for local
dev; not the real submission's data (no organizer dataset was provided).

## Running locally

Backend: `cd backend-pipeline && npm install && npm start` (port 8080)
Frontend: `cd frontend && npm install && cp .env.local.example .env.local && npm run dev`

## Submission logistics

- Submit deadline: Aug 22, 16:30 sharp — no late submissions
- Required: public GitHub repo, live demo link, pitch video (≤3 min), Project Description
- Judging weights: Technical Execution 25%, Problem & Lab Alignment 20%, Innovation & Creativity 20%, Impact & Potential 20%, UX & Design 15%