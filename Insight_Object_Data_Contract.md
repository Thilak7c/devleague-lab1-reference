# Insight Object Data Contract — LOCKED

**Status: this is the agreed contract.** Both frontend (Student A) and
analysis (Student B) build against this exact shape. If either side needs
a change, flag it to Thilak before changing — this is the one thing that
causes the most integration pain if it drifts silently.

---

## Endpoint

`POST /api/process`

Request: `multipart/form-data` with a single file field named `file`.

Response: `200 OK`, JSON body as below. Errors use the shape in the
"Error responses" section.

---

## Full response shape

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
      {
        "id": "row_1",
        "category": "Marketing",
        "period": "Q2 2026",
        "amount": 198000,
        "vendor": "Global Supplies Sdn Bhd"
      }
    ]
  },
  "privacy": {
    "maskedCount": 2,
    "matches": [
      { "field": "vendor", "type": "EMAIL", "rowId": "row_7" }
    ]
  },
  "insights": [
    {
      "id": "insight_1",
      "type": "variance",
      "severity": "high",
      "message": "Marketing spend up 340% vs last quarter (threshold: 50%)",
      "sourceRowIds": ["row_1", "row_2"],
      "metric": {
        "current": 198000,
        "previous": 45000,
        "changePercent": 340,
        "threshold": 50
      }
    }
  ],
  "summary": {
    "totalInsights": 3,
    "bySeverity": { "high": 1, "warning": 1, "info": 1 }
  }
}
```

---

## Field-by-field notes

### `meta`
- `extractionMethod`: `"text"` | `"spreadsheet"` | `"vision"` — lets the
  frontend show a small "extracted via OCR fallback" note if relevant
  (transparency point for the rubric).

### `extracted.rows`
- Every row MUST have a stable `id` string — this is what `sourceRowIds`
  in insights reference. Without stable IDs, drill-down can't link an
  insight back to its source data.
- Beyond `id`, row shape is intentionally loose (`category`, `period`,
  `amount`, `vendor` etc. are examples, not a strict schema) — different
  report types will have different columns. Frontend should render
  whatever keys exist generically (e.g. a simple key-value row), not
  assume a fixed column set.

### `privacy`
- `maskedCount`: total across the whole document — this is what powers
  the "X fields masked for privacy" badge in the UI (see Frontend Core
  Functionalities doc, section 4).
- `matches`: does NOT include the original unmasked value — only type and
  location. Never send the original PII value to the frontend, even
  redacted-in-place; the point of masking is that it never leaves the
  masking step.

### `insights[]`
- `type`: one of `"variance"` | `"outlier"` | `"duplicate"` — extend this
  enum only by team agreement, since frontend styling/icons key off it.
- `severity`: one of `"info"` | `"warning"` | `"high"` — drives badge
  color in the dashboard.
- `message`: MUST be a complete, human-readable sentence — this is
  displayed as-is, no frontend string-building from raw numbers.
- `sourceRowIds`: array of `id`s from `extracted.rows` — this is what
  powers the drill-down/explainability feature. Every insight MUST have
  at least one source row; an insight with no traceable source is not
  explainable and shouldn't be emitted.
- `metric`: optional, free-form object with the actual numbers behind the
  insight (for a more detailed drill-down view if Student A wants to show
  it). Not required for MVP — `message` alone is enough to render a
  working insight card.

### `summary`
- Precomputed server-side so the frontend doesn't need to recount
  `insights[]` itself — one less place for a bug to hide.

---

## Error responses

All errors use this shape, `4xx`/`5xx` status as appropriate:

```json
{
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "Only PDF, CSV, and XLSX files are supported."
  }
}
```

Known `code` values to handle explicitly in the frontend (see Frontend
Core Functionalities doc, section 5):
- `UNSUPPORTED_FILE_TYPE`
- `FILE_TOO_LARGE`
- `EXTRACTION_FAILED` — text extraction and vision fallback (if
  applicable) both failed
- `NO_DATA_FOUND` — extraction succeeded but found no usable rows

---

## What's explicitly NOT in this contract (deferred / out of scope)

- Pagination of rows (assume a single response is fine at hackathon scale)
- Streaming/partial results
- Any persistence-related fields (no document ID, no "saved" state) —
  matches the no-persistence PDPA approach

---

## Minimal example both sides can build against today

A trimmed valid response — useful as fixture data for frontend dev before
the real backend is ready:

```json
{
  "meta": {
    "filename": "sample.csv",
    "fileType": "csv",
    "extractionMethod": "spreadsheet",
    "processedAt": "2026-08-22T09:00:00Z"
  },
  "extracted": {
    "rowCount": 2,
    "rows": [
      { "id": "row_1", "category": "Marketing", "amount": 198000, "period": "Q2" },
      { "id": "row_2", "category": "Marketing", "amount": 45000, "period": "Q1" }
    ]
  },
  "privacy": { "maskedCount": 0, "matches": [] },
  "insights": [
    {
      "id": "insight_1",
      "type": "variance",
      "severity": "high",
      "message": "Marketing spend up 340% vs last quarter (threshold: 50%)",
      "sourceRowIds": ["row_1", "row_2"]
    }
  ],
  "summary": { "totalInsights": 1, "bySeverity": { "high": 1, "warning": 0, "info": 0 } }
}
```

Student A: use this exact JSON as a hardcoded fixture to build the
dashboard UI against right now, before the backend exists.
Student B: your anomaly detection function's output just needs to map
into the `insights[]` array shape above — the detection logic itself is
independent of this contract.
