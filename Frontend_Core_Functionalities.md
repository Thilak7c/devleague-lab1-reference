# Frontend Core Functionalities — Lab 1 Build

Not a UI design doc — this is the list of states, flows, and data contracts
the frontend needs to handle correctly. Visual design comes after this is
agreed, since layout decisions are easier once you know what has to fit.

---

## 1. Upload

- Accept file types: `.pdf`, `.csv`, `.xlsx` (confirm final list once
  document-scope question is answered by organizers)
- Drag-and-drop **and** click-to-browse (don't rely on drag-only — flaky
  on some demo setups/projectors)
- Client-side validation before sending to backend:
  - File type check
  - File size limit (define a sane cap, e.g. 10MB, so a huge file doesn't
    hang the demo)
  - Reject empty files
- Show filename + size after selection, before submit
- Single-file upload is enough for the demo — don't build multi-file
  batch upload unless there's spare time at the end

## 2. Upload states (all four must be handled, not just the happy path)

- **Idle** — nothing uploaded yet, clear call-to-action
- **Uploading** — progress indicator (even a simple spinner is fine, just
  don't leave the user staring at nothing)
- **Processing** — this is the extraction+analysis window on the backend;
  needs its own distinct state since it may take a few seconds. Consider
  a short "what's happening" message (e.g. "Reading document…" →
  "Analyzing…") so it doesn't look frozen
- **Error** — see section 5. Never let a failed request just silently do
  nothing

## 3. Results display

Backend will return something like:
```
{
  extracted: { ...structured data... },
  insights: [
    {
      type: "variance" | "outlier" | "duplicate",
      severity: "info" | "warning" | "high",
      message: "Marketing spend up 340% vs last quarter",
      sourceRows: [ ...row refs / line items that triggered this... }
    }
  ]
}
```
(Exact shape to be finalized with Student B — flag this now so both sides
build against the same contract instead of guessing.)

Frontend needs to render:
- **Headline summary** — collapsed/top-level view: how many insights found,
  broken down by severity. This is the "3-second understanding" moment —
  a judge should get the gist without scrolling
- **Insight list** — each insight as its own card/row: message + severity
  badge + expandable drill-down
- **Drill-down / source trace** — clicking an insight shows the actual
  extracted rows/numbers that triggered it. This is the explainability
  requirement from the brief — don't skip it, it's a scored criterion
- **Empty state** — what shows if extraction succeeds but finds zero
  anomalies (this should read as a *good* result, not a broken one —
  "No anomalies detected" with a checkmark, not a blank screen)

## 4. PDPA / privacy UI

- Visible statement near the upload area: what happens to the file
  (processed in-memory, not stored, deleted after session) — this needs
  to be seen, not buried in a footer link
- If PII masking is applied, show *that it happened* — e.g. a small
  badge/note "2 fields masked for privacy" — so the judges can see the
  feature working, not just trust it happened invisibly
- No login/account creation — reinforces the "nothing persisted, nothing
  to protect" story, and removes an entire build surface

## 5. Error handling (per-scenario, not just a generic toast)

- **Unsupported file type** — clear message naming what IS supported
- **File too large** — clear message with the actual limit
- **Extraction failed** (e.g. scanned PDF with no text layer and vision
  fallback also fails, or Groq rate-limited) — message should suggest a
  next step ("try a text-based PDF" or "try again in a moment"), not just
  "Error"
- **Backend unreachable / timeout** — this is the one most likely to
  actually happen live on shared venue wifi. Needs a real fallback, not
  just a spinner that never resolves — see section 6

## 6. Demo resilience (carries over from the practice build — don't skip)

- A "Demo Mode" or cached-response fallback that can be triggered if the
  live API call fails or times out during judging, so the presenter isn't
  stuck showing an error mid-pitch
- Pre-test with the exact files you intend to demo with — same file,
  same device, same network conditions, rehearsed — per the hackathon
  tips doc, this matters more than most polish work

## 7. Explicitly out of scope for Challenge Day

- Auth / user accounts
- Persistent storage / history of past uploads
- Multi-file batch processing
- Export to PDF/Excel (nice-to-have if time allows, not core)
- Mobile-responsive layout (demo will be on a laptop/projector — don't
  spend time here unless everything else is done early)

---

## Open dependency

Insight object shape (section 3) needs to be locked with Student B before
either of you build very far — mismatched assumptions here cost the most
integration time if caught late. Suggest a 10-minute sync on this
specifically before diving into separate work.
