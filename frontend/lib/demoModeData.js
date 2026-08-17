/**
 * Demo Mode fallback data
 * ---------------------------------
 * If the live backend is unreachable or times out during judging (venue
 * wifi, Cloud Run cold start, etc.), the UI can fall back to this canned
 * response so the presenter isn't stuck showing an error mid-pitch.
 *
 * This is NOT fabricated for show — it's the exact response shape
 * verified end-to-end against demo_report_main.csv in Section 9.5 of the
 * Super Docs (real pipeline run, real numbers). Using genuine output
 * here means the "demo mode" story stays honest if a judge asks.
 */

export const DEMO_MODE_RESPONSE = {
  meta: {
    filename: "demo_report_main.csv",
    fileType: "csv",
    extractionMethod: "spreadsheet",
    processedAt: new Date().toISOString(),
  },
  extracted: {
    rowCount: 19,
    rows: [], // intentionally omitted for the fallback — dashboard only needs insights/summary/privacy to render the headline view
  },
  privacy: {
    maskedCount: 7,
    matches: [
      { field: "notes", rowId: "row_2", type: "NAME" },
      { field: "notes", rowId: "row_11", type: "NAME" },
      { field: "notes", rowId: "row_12", type: "EMAIL" },
      { field: "notes", rowId: "row_13", type: "EMAIL" },
      { field: "notes", rowId: "row_18", type: "NAME" },
      { field: "notes", rowId: "row_18", type: "IC" },
      { field: "notes", rowId: "row_19", type: "NAME" },
    ],
  },
  insights: [
    {
      id: "insight_1",
      type: "variance",
      severity: "high",
      message: "Marketing spend up 340% from Q1 2026 to Q2 2026 (threshold: 50%)",
      sourceRowIds: ["row_1", "row_2"],
      metric: {
        category: "Marketing",
        previousPeriod: "Q1 2026",
        currentPeriod: "Q2 2026",
        previous: 45000,
        current: 198000,
        changePercent: 340,
        threshold: 50,
      },
    },
    {
      id: "insight_2",
      type: "outlier",
      severity: "high",
      message:
        "Unusual Vendor Sdn Bhd in Office Supplies is unusually above the category norm (RM8,500 vs typical RM510)",
      sourceRowIds: ["row_11"],
      metric: {
        category: "Office Supplies",
        value: 8500,
        categoryMedian: 510,
      },
    },
    {
      id: "insight_3",
      type: "duplicate",
      severity: "warning",
      message: 'Possible duplicate entry: "Global Consulting Partners" appears twice with matching amount (RM12,450)',
      sourceRowIds: ["row_12", "row_13"],
      metric: {
        vendor: "Global Consulting Partners",
        amount: 12450,
      },
    },
  ],
  summary: {
    totalInsights: 3,
    bySeverity: { high: 2, warning: 1, info: 0 },
  },
  _isDemoMode: true, // internal flag only — never sent to/from the real API, used by the UI to show a "Demo Mode" indicator
};
