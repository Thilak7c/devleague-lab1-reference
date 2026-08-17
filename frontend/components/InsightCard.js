"use client";

import { useState } from "react";

const SEVERITY_STYLES = {
  high: { bg: "var(--color-high-soft)", color: "var(--color-high)", label: "High" },
  warning: { bg: "var(--color-warning-soft)", color: "var(--color-warning)", label: "Warning" },
  info: { bg: "var(--color-info-soft)", color: "var(--color-info)", label: "Info" },
};

const TYPE_LABELS = {
  variance: "Variance",
  outlier: "Outlier",
  duplicate: "Duplicate",
};

/**
 * The drill-down here is the actual explainability feature the brief
 * requires — every insight must show the source rows that triggered it,
 * not just assert a conclusion. See Insight_Object_Data_Contract.md:
 * every insight has ≥1 sourceRowId by contract; if it didn't, it
 * shouldn't have been emitted server-side.
 */
export default function InsightCard({ insight, rowsById }) {
  const [expanded, setExpanded] = useState(false);
  const severity = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;
  const sourceRows = (insight.sourceRowIds || [])
    .map((id) => rowsById?.[id])
    .filter(Boolean);

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface)",
        padding: "16px 18px",
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span
          style={{
            flexShrink: 0,
            background: severity.bg,
            color: severity.color,
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            padding: "3px 8px",
            borderRadius: 999,
            marginTop: 2,
          }}
        >
          {severity.label}
        </span>

        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.45 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-ink-muted)",
                textTransform: "uppercase",
                marginRight: 8,
              }}
            >
              {TYPE_LABELS[insight.type] || insight.type}
            </span>
            {insight.message}
          </p>

          {sourceRows.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                marginTop: 8,
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--color-accent)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {expanded ? "Hide source data ▲" : `Show source data (${sourceRows.length} row${sourceRows.length === 1 ? "" : "s"}) ▼`}
            </button>
          )}

          {expanded && sourceRows.length > 0 && (
            <div
              className="tabular"
              style={{
                marginTop: 10,
                background: "var(--color-paper)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 12px",
                fontSize: 12.5,
                overflowX: "auto",
              }}
            >
              {sourceRows.map((row) => (
                <div
                  key={row.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "4px 0",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {Object.entries(row)
                    .filter(([k]) => k !== "id")
                    .map(([k, v]) => (
                      <span key={k}>
                        <span style={{ color: "var(--color-ink-muted)" }}>{k}: </span>
                        {String(v)}
                      </span>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
