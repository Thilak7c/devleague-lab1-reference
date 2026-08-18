"use client";

import { useState, Fragment } from "react";
import VisionDisclosure from "./VisionDisclosure";
import Modal from "./Modal";

const SEVERITY_META = {
  high: { label: "High severity", icon: "⛔", bg: "var(--color-high-soft)", color: "var(--color-high)", caption: "needs review first" },
  warning: { label: "Warning", icon: "⚠️", bg: "var(--color-warning-soft)", color: "var(--color-warning)", caption: "worth a second look" },
  info: { label: "Info", icon: "ℹ️", bg: "var(--color-info-soft)", color: "var(--color-info)", caption: "minor, for awareness" },
};

const TYPE_LABELS = {
  variance: "Variance",
  outlier: "Outlier",
  duplicate: "Duplicate",
};

const PII_TYPE_LABELS = {
  IC: "Malaysian IC Number",
  PHONE: "Phone Number",
  EMAIL: "Email Address",
  ACCOUNT: "Bank Account Number",
  NAME: "Labelled Personal Name",
};

export default function ResultsDashboard({ result, onReset }) {
  const { meta, extracted, privacy, insights, summary, _isDemoMode } = result;
  const rowsById = Object.fromEntries((extracted.rows || []).map((r) => [r.id, r]));
  const [activeModal, setActiveModal] = useState(null); // "high" | "warning" | "info" | "masked" | null

  const insightsBySeverity = (sev) => insights.filter((i) => i.severity === sev);

  return (
    <div>
      {_isDemoMode && (
        <div
          className="badge text-small"
          style={{
            background: "var(--color-warning-soft)",
            color: "var(--color-warning)",
            marginBottom: 16,
            display: "flex",
            width: "fit-content",
            marginInline: "auto",
          }}
        >
          Demo Mode — showing a saved example result
        </div>
      )}

      {/* Headline — the 3-second understanding moment */}
      <div style={{ marginBottom: 24 }}>
        <p className="text-small" style={{ margin: "0 0 6px" }}>
          {meta.filename}
          {meta.extractionMethod === "vision" && " · read via AI-assisted image extraction"}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <h2 className="text-hero" style={{ margin: 0, color: "var(--color-ink)" }}>
          {summary.totalInsights === 0
            ? "No anomalies detected"
            : `${summary.totalInsights} insight${summary.totalInsights === 1 ? "" : "s"} found`}
        </h2>
          <button onClick={onReset} className="btn btn-secondary">
            Analyze another
          </button>
        </div>
      </div>

      {/* Stat cards — click any card to see its records in a table */}
      {summary.totalInsights > 0 && (
        <div className="stat-grid">
          {Object.entries(SEVERITY_META).map(([sev, meta_]) => (
            <button key={sev} className="stat-card" onClick={() => setActiveModal(sev)}>
              <div className="stat-card-top">
                <span className="text-small" style={{ fontWeight: 600 }}>{meta_.label}</span>
                <span className="stat-icon" style={{ background: meta_.bg, color: meta_.color }} aria-hidden="true">
                  {meta_.icon}
                </span>
              </div>
              <div>
                <p className="text-figure" style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, lineHeight: 1, color: "var(--color-ink)" }}>
                  {summary.bySeverity[sev] || 0}
                </p>
                <p className="text-small" style={{ margin: "4px 0 0" }}>{meta_.caption}</p>
              </div>
            </button>
          ))}

          <button className="stat-card" onClick={() => setActiveModal("masked")}>
            <div className="stat-card-top">
              <span className="text-small" style={{ fontWeight: 600 }}>Fields masked</span>
              <span className="stat-icon" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent-ink)" }} aria-hidden="true">
                🔒
              </span>
            </div>
            <div>
              <p className="text-figure" style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, lineHeight: 1, color: "var(--color-ink)" }}>
                {privacy.maskedCount}
              </p>
              <p className="text-small" style={{ margin: "4px 0 0" }}>PII protected</p>
            </div>
          </button>
        </div>
      )}

      <VisionDisclosure extractionMethod={meta.extractionMethod} />

      {summary.totalInsights === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <div
            aria-hidden="true"
            style={{
              width: 48, height: 48, margin: "0 auto 14px", borderRadius: "50%",
              background: "var(--color-success-soft)", display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 22, color: "var(--color-success)",
            }}
          >
            ✓
          </div>
          <p className="text-body" style={{ margin: 0, color: "var(--color-ink-muted)" }}>
            We reviewed {extracted.rowCount} line items and found nothing unusual.
            {privacy.maskedCount === 0 && " No personal information was detected either."}
          </p>
        </div>
      )}

      {/* ---- Severity modals ---- */}
      {["high", "warning", "info"].includes(activeModal) && (
        <Modal
          title={SEVERITY_META[activeModal].label}
          subtitle={`${insightsBySeverity(activeModal).length} insight${insightsBySeverity(activeModal).length === 1 ? "" : "s"}`}
          onClose={() => setActiveModal(null)}
        >
          <InsightTable insights={insightsBySeverity(activeModal)} rowsById={rowsById} emptyLabel={`No ${activeModal} insights.`} />
        </Modal>
      )}

      {/* ---- Masked fields modal ---- */}
      {activeModal === "masked" && (
        <Modal
          title="Fields masked for privacy"
          subtitle={`${privacy.maskedCount} field${privacy.maskedCount === 1 ? "" : "s"} detected and masked`}
          onClose={() => setActiveModal(null)}
        >
          {privacy.maskedCount === 0 ? (
            <p className="text-body" style={{ color: "var(--color-ink-muted)" }}>No personal information detected in this document.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="text-micro">Field</th>
                  <th className="text-micro">Type</th>
                  <th className="text-micro">Row</th>
                </tr>
              </thead>
              <tbody>
                {privacy.matches.map((m, i) => (
                  <tr key={i}>
                    <td className="text-small">{m.field}</td>
                    <td className="text-small">{PII_TYPE_LABELS[m.type] || m.type}</td>
                    <td className="text-figure" style={{ fontSize: 12.5 }}>{m.rowId || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-small" style={{ marginTop: 14, opacity: 0.75 }}>
            Original values are never stored or displayed — only the type of information found.
          </p>
        </Modal>
      )}
    </div>
  );
}

function InsightTable({ insights, rowsById, emptyLabel }) {
  const [expandedId, setExpandedId] = useState(null);

  if (insights.length === 0) {
    return <p className="text-body" style={{ color: "var(--color-ink-muted)" }}>{emptyLabel}</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="text-micro">Type</th>
          <th className="text-micro">Message</th>
        </tr>
      </thead>
      <tbody>
        {insights.map((insight) => {
          const sourceRows = (insight.sourceRowIds || []).map((id) => rowsById?.[id]).filter(Boolean);
          const isExpanded = expandedId === insight.id;
          return (
            <Fragment key={insight.id}>
              <tr
                className="table-row-clickable"
                onClick={() => setExpandedId(isExpanded ? null : insight.id)}
              >
                <td className="text-small" style={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                  {TYPE_LABELS[insight.type] || insight.type}
                </td>
                <td className="text-small" style={{ color: "var(--color-ink)" }}>
                  {insight.message}
                  {sourceRows.length > 0 && (
                    <span className="text-small" style={{ color: "var(--color-accent)", marginLeft: 8, fontWeight: 600 }}>
                      {isExpanded ? "Hide rows ▲" : "View rows ▼"}
                    </span>
                  )}
                </td>
              </tr>
              {isExpanded && sourceRows.length > 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: 0 }}>
                    <div className="text-figure" style={{ background: "var(--color-surface-sunken)", borderRadius: "var(--radius-sm)", padding: "10px 12px", margin: "0 0 10px", fontSize: 12.5, overflowX: "auto" }}>
                      {sourceRows.map((row) => (
                        <div key={row.id} className="divider-row" style={{ display: "flex", gap: 16, padding: "5px 0" }}>
                          {Object.entries(row).filter(([k]) => k !== "id").map(([k, v]) => (
                            <span key={k}>
                              <span style={{ color: "var(--color-ink-faint)" }}>{k}: </span>
                              {String(v)}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}