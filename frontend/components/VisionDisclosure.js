"use client";

// Copy sourced directly from PDPA_UI_Copy.md Section 4 — kept in sync
// with that document. Renders only when extractionMethod === "vision",
// i.e. the document went through the Groq vision-fallback path.
export default function VisionDisclosure({ extractionMethod }) {
  if (extractionMethod !== "vision") return null;

  return (
    <div
      className="callout"
      style={{
        background: "var(--color-accent-soft)",
        borderColor: "var(--color-accent-soft)",
        color: "var(--color-accent-ink)",
        marginBottom: 16,
      }}
    >
      <p className="text-small" style={{ margin: 0, color: "inherit" }}>
        <span aria-hidden="true">🤖</span> This document was processed using AI-assisted image
        reading, since it appears to be a scanned document without extractable text. Data accuracy
        may vary slightly compared to text-based documents.
      </p>
    </div>
  );
}