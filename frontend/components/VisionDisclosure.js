"use client";

// Copy sourced directly from PDPA_UI_Copy.md Section 4 — kept in sync
// with that document. Renders only when extractionMethod === "vision",
// i.e. the document went through the Groq vision-fallback path.
export default function VisionDisclosure({ extractionMethod }) {
  if (extractionMethod !== "vision") return null;

  return (
    <div
      style={{
        background: "var(--color-accent-soft)",
        border: "1px solid var(--color-accent-soft)",
        borderRadius: "var(--radius-md)",
        padding: "10px 16px",
        marginBottom: 16,
        fontSize: 13.5,
        color: "var(--color-accent-ink)",
      }}
    >
      <p style={{ margin: 0 }}>
        🤖 This document was processed using AI-assisted image reading, since it appears to be a
        scanned document without extractable text. Data accuracy may vary slightly compared to
        text-based documents.
      </p>
    </div>
  );
}
