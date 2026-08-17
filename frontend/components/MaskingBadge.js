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
      <div style={badgeStyle("var(--color-success-soft)", "var(--color-success)")}>
        ✓ No personal information detected in this document
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
    <div style={badgeStyle("var(--color-accent-soft)", "var(--color-accent-ink)")}>
      <button
        onClick={() => setExpanded((v) => !v)}
        style={{
          background: "none",
          border: "none",
          padding: 0,
          color: "inherit",
          font: "inherit",
          fontWeight: 600,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        🔒 {maskedCount} field{maskedCount === 1 ? "" : "s"} masked for privacy {expanded ? "▲" : "▼"}
      </button>

      {expanded && (
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 400 }}>
          <p style={{ margin: "0 0 6px" }}>Types of information detected and masked:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {distinctTypes.map((type) => (
              <li key={type}>{typeLabels[type] || type}</li>
            ))}
          </ul>
          <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
            Original values are never stored or displayed — only the type of information found.
          </p>
        </div>
      )}
    </div>
  );
}

function badgeStyle(bg, color) {
  return {
    display: "inline-block",
    background: bg,
    color,
    borderRadius: "var(--radius-md)",
    padding: "10px 14px",
    fontSize: 13.5,
    fontWeight: 600,
    marginBottom: 16,
  };
}
