"use client";

import { useEffect, useState } from "react";

// Sequential status messages — this is intentional per PDPA_UI_Copy.md
// Section 2: showing "Checking for personal information" as a real step
// makes masking feel like part of the pipeline, not a hidden afterthought.
const STEPS = ["Extracting data…", "Checking for personal information…", "Analyzing trends and anomalies…"];

export default function ProcessingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Purely cosmetic pacing — the real work happens server-side; this
    // just gives the user a sense of progress rather than a static spinner.
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface)",
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          margin: "0 auto 20px",
          border: "3px solid var(--color-accent-soft)",
          borderTopColor: "var(--color-accent)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 16 }}>{STEPS[stepIndex]}</p>
      <p style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: 13 }}>
        This usually takes a few seconds
      </p>
    </div>
  );
}
