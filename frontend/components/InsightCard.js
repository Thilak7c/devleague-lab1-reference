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
    <div className="card" style={{ padding: "18px 20px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        {/* Severity indicator as a solid-colored bar rather than a pill —
            reads like a document annotation/flag, distinct from the
            masking badge's pill shape so the two systems never blend */}
        <div
          aria-hidden="true"
          style={{
            width: 3,
            alignSelf: "stretch",
            borderRadius: 2,
            background: severity.color,
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span
              className="badge-dot"
              style={{ background: severity.bg, color: severity.color }}
            >
              {severity.label}
            </span>
            <span className="text-micro">{TYPE_LABELS[insight.type] || insight.type}</span>
          </div>

          <p className="text-body" style={{ margin: 0 }}>
            {insight.message}
          </p>

          {sourceRows.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-small"
              style={{
                marginTop: 10,
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--color-accent)",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {expanded ? "Hide source data" : `Show source data (${sourceRows.length} row${sourceRows.length === 1 ? "" : "s"})`}
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  fontSize: 10,
                  transition: "transform 160ms var(--ease)",
                  transform: expanded ? "rotate(180deg)" : "none",
                }}
              >
                ▼
              </span>
            </button>
          )}

          {expanded && sourceRows.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              {/* Visual connector — a thin bracket tying the insight to
                  its source rows, so the drill-down reads as "here's the
                  evidence" rather than an unrelated list appearing below */}
              <div
                aria-hidden="true"
                style={{
                  width: 2,
                  background: "var(--color-border-strong)",
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
              <div
                className="text-figure"
                style={{
                  flex: 1,
                  background: "var(--color-surface-sunken)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  fontSize: 12.5,
                  overflowX: "auto",
                }}
              >
                {sourceRows.map((row) => (
                  <div key={row.id} className="divider-row" style={{ display: "flex", gap: 16, padding: "5px 0" }}>
                    {Object.entries(row)
                      .filter(([k]) => k !== "id")
                      .map(([k, v]) => (
                        <span key={k}>
                          <span style={{ color: "var(--color-ink-faint)" }}>{k}: </span>
                          {String(v)}
                        </span>
                      ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}