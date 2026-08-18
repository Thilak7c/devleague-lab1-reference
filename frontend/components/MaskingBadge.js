"use client";

import { useState } from "react";

// This component's priority was raised 16 Aug after organizers confirmed
// PDPA is part of the judging criteria, not pass/fail (see Super Docs
// Section 4/5) — actively demonstrating masking is now a scoring factor,
// so this badge should always render prominently, not be treated as
// optional polish.
export default function MaskingBadge({ maskedCount, matches = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (maskedCount === 0) {
    return (
      <div
        className="badge"
        style={{
          background: "var(--color-success-soft)",
          color: "var(--color-success)",
          marginBottom: 16,
        }}
      >
        <span aria-hidden="true">✓</span> No personal information detected in this document
      </div>
    );
  }

  const distinctTypes = [...new Set(matches.map((m) => m.type))];
  const typeLabels = {
    IC: "Malaysian IC Number",
    PHONE: "Phone Number",
    EMAIL: "Email Address",
    ACCOUNT: "Bank Account Number",
    NAME: "Labelled Personal Name",
  };

  return (
    <div
      className="card"
      style={{
        display: "inline-block",
        background: "var(--color-accent-soft)",
        borderColor: "var(--color-accent-soft)",
        borderRadius: "var(--radius-md)",
        padding: "10px 16px",
        marginBottom: 16,
      }}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-small"
        style={{
          background: "none",
          border: "none",
          padding: 0,
          color: "var(--color-accent-ink)",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span aria-hidden="true">🔒</span>
        {maskedCount} field{maskedCount === 1 ? "" : "s"} masked for privacy
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            transition: "transform 160ms var(--ease)",
            transform: expanded ? "rotate(180deg)" : "none",
            fontSize: 10,
          }}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: 10 }}>
          <p className="text-small" style={{ margin: "0 0 6px", color: "var(--color-accent-ink)" }}>
            Types of information detected and masked:
          </p>
          <ul
            className="text-small"
            style={{ margin: 0, paddingLeft: 20, color: "var(--color-accent-ink)", display: "flex", flexDirection: "column", gap: 4 }}
          >
            {distinctTypes.map((type) => (
              <li key={type}>{typeLabels[type] || type}</li>
            ))}
          </ul>
          <p className="text-small" style={{ margin: "8px 0 0", opacity: 0.75, color: "var(--color-accent-ink)" }}>
            Original values are never stored or displayed — only the type of information found.
          </p>
        </div>
      )}
    </div>
  );
}