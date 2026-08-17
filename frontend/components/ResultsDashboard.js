"use client";

import MaskingBadge from "./MaskingBadge";
import VisionDisclosure from "./VisionDisclosure";
import InsightCard from "./InsightCard";


export default function ResultsDashboard({ result, onReset }) {
  const { meta, extracted, privacy, insights, summary, _isDemoMode } = result;
  const rowsById = Object.fromEntries((extracted.rows || []).map((r) => [r.id, r]));

  return (
    <div>
      {_isDemoMode && (
        <div
          style={{
            background: "var(--color-warning-soft)",
            color: "var(--color-warning)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Demo Mode — showing a saved example result
        </div>
      )}

      {/* Headline summary — the 3-second understanding moment. A judge
          should get the gist here without scrolling, per
          Frontend_Core_Functionalities.md Section 3. */}
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface)",
          padding: "24px 28px",
          marginBottom: 20,
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 13, color: "var(--color-ink-muted)" }}>
              {meta.filename}
              {meta.extractionMethod === "vision" && " · read via AI-assisted image extraction"}
            </p>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 }}>
              {summary.totalInsights === 0
                ? "No anomalies detected"
                : `${summary.totalInsights} insight${summary.totalInsights === 1 ? "" : "s"} found`}
            </h2>
          </div>
          <button
            onClick={onReset}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Analyze another
          </button>
        </div>

        {summary.totalInsights > 0 && (
          <div style={{ display: "flex", gap: 20 }}>
            <SeverityStat label="High" count={summary.bySeverity.high} color="var(--color-high)" />
            <SeverityStat label="Warning" count={summary.bySeverity.warning} color="var(--color-warning)" />
            <SeverityStat label="Info" count={summary.bySeverity.info} color="var(--color-info)" />
          </div>
        )}
      </div>

      <MaskingBadge maskedCount={privacy.maskedCount} matches={privacy.matches} />
      <VisionDisclosure extractionMethod={meta.extractionMethod} />

      {/* Insight list, or the honest empty state — per
          Frontend_Core_Functionalities.md Section 3: zero anomalies
          should read as a good result, not a broken screen. */}
      {summary.totalInsights === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface)",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">
            ✓
          </div>
          <p style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: 14 }}>
            We reviewed {extracted.rowCount} line items and found nothing unusual.
          </p>
        </div>
      ) : (
        <div>
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} rowsById={rowsById} />
          ))}
        </div>
      )}
    </div>
  );
}

function SeverityStat({ label, count, color }) {
  return (
    <div>
      <p className="tabular" style={{ margin: 0, fontSize: 20, fontWeight: 700, color }}>
        {count}
      </p>
      <p style={{ margin: 0, fontSize: 12, color: "var(--color-ink-muted)" }}>{label}</p>
    </div>
  );
}
