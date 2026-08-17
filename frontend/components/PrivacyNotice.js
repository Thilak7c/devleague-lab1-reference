"use client";

import { useState } from "react";

// Copy sourced directly from PDPA_UI_Copy.md Section 1 — kept in sync
// with that document; if the copy changes, update both places.
export default function PrivacyNotice() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "var(--color-accent-soft)",
        border: "1px solid var(--color-accent-soft)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        marginBottom: 20,
        fontSize: 13.5,
      }}
    >
      <p style={{ margin: 0, color: "var(--color-accent-ink)" }}>
        🔒 Your document is processed in memory only and is never saved to a database. Personal
        information (like ID numbers or names) is automatically detected and masked before
        anything is shown to you.{" "}
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--color-accent-ink)",
            fontWeight: 600,
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "inherit",
          }}
        >
          {expanded ? "Show less" : "Learn more"}
        </button>
      </p>

      {expanded && (
        <ul style={{ margin: "12px 0 0", paddingLeft: 20, color: "var(--color-accent-ink)" }}>
          <li>Your file is processed entirely in memory — never written to disk or a database.</li>
          <li>Once you close this page or the session ends, your document and its data are gone.</li>
          <li>
            Before any extracted data is displayed, we scan for personal information (ID numbers,
            account numbers, names, emails, phone numbers) and automatically mask it.
          </li>
          <li>
            We do not share your document or its contents with any third party, except for the
            extraction step itself in cases where a scanned document requires AI-assisted reading.
          </li>
          <li>No account, login, or personal profile is required to use this tool.</li>
        </ul>
      )}
    </div>
  );
}
