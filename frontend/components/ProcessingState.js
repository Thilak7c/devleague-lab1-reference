"use client";

import { useEffect, useState } from "react";

// Sequential status messages — this is intentional per PDPA_UI_Copy.md
// Section 2: showing "Checking for personal information" as a real step
// makes masking feel like part of the pipeline, not a hidden afterthought.
const STEPS = ["Extracting data…", "Checking for personal information…", "Analyzing trends and anomalies…"];

export default function ProcessingState() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="card-elevated"
      style={{
        padding: "56px 32px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          margin: "0 auto 22px",
          border: "3px solid var(--color-accent-soft)",
          borderTopColor: "var(--color-accent)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 18 }} aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i <= stepIndex ? "var(--color-accent)" : "var(--color-border-strong)",
              transition: "background 200ms var(--ease)",
            }}
          />
        ))}
      </div>

      <p className="text-heading" style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>
        {STEPS[stepIndex]}
      </p>
      <p className="text-small" style={{ margin: 0 }}>
        This usually takes a few seconds
      </p>
    </div>
  );
}