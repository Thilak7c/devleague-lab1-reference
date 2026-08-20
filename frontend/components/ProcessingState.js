// frontend/components/ProcessingState.js

"use client";

import { useEffect, useState } from "react";

// Fallback sequential messages — only used if this component is ever
// rendered WITHOUT a live `stage` prop (e.g. before page.js is wired to
// pass one, or for any future caller that doesn't have job polling).
// Once real stages are flowing in, this cycling path never runs.
const FALLBACK_STEPS = [
  "Extracting data…",
  "Checking for personal information…",
  "Analyzing trends and anomalies…",
];

// Maps raw backend stage strings (see pipeline.js / visionFallback.js /
// groqVisionExtractor.js) to human-readable labels.
const STAGE_LABELS = {
  starting: "Starting…",
  parsing: "Extracting data…",
  rasterizing: "Preparing scanned pages…",
  extracting_vision: "Reading scanned pages…",
  extracting_pages_started: "Reading scanned pages…",
  masking: "Checking for personal information…",
  analyzing: "Analyzing trends and anomalies…",
  done: "Finishing up…",
};

function labelForStage(stage) {
  if (!stage) return null;

  // "extracted_page_2_of_4" — a page finished (pages complete out of
  // order since calls now run concurrently, but this still reads fine
  // as a running completion count).
  const completedMatch = stage.match(/^extracted_page_(\d+)_of_(\d+)$/);
  if (completedMatch) {
    const [, doneCount, total] = completedMatch;
    return `Reading scanned pages (${doneCount} of ${total} done)…`;
  }

  // "extracting_page_1_of_4" — the starting marker emitted before any
  // page has completed yet.
  const startingMatch = stage.match(/^extracting_page_\d+_of_(\d+)$/);
  if (startingMatch) {
    return `Reading scanned pages (0 of ${startingMatch[1]} done)…`;
  }

  return STAGE_LABELS[stage] || "Processing…";
}

const CHIPS = [
  { symbol: "💰", className: "chip-1" },
  { symbol: "📊", className: "chip-2" },
  { symbol: "%", className: "chip-3" },
  { symbol: "🔍", className: "chip-4" },
  { symbol: "✓", className: "chip-5" },
];

export default function ProcessingState({ stage }) {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Only runs the fake cycling timer when no real stage is being fed in.
  useEffect(() => {
    if (stage) return;
    const interval = setInterval(() => {
      setFallbackIndex((i) => Math.min(i + 1, FALLBACK_STEPS.length - 1));
    }, 900);
    return () => clearInterval(interval);
  }, [stage]);

  const label = labelForStage(stage) || FALLBACK_STEPS[fallbackIndex];

  return (
    <div
      role="status"
      aria-live="polite"
      className="card-elevated"
      style={{
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      <div className="processing-visual" aria-hidden="true">
        <div className="processing-doc">
          <div className="processing-doc-line" />
          <div className="processing-doc-line" />
          <div className="processing-doc-line short" />
          <div className="processing-scanline" />
        </div>

        {CHIPS.map((chip) => (
          <div key={chip.className} className={`processing-chip ${chip.className}`}>
            {chip.symbol}
          </div>
        ))}
      </div>

      <style>{`
        .processing-visual {
          position: relative;
          width: 160px;
          height: 120px;
          margin: 0 auto 24px;
        }

        .processing-doc {
          position: absolute;
          left: 50%;
          top: 10px;
          transform: translateX(-50%);
          width: 64px;
          height: 80px;
          background: var(--color-surface);
          border: 2px solid var(--color-accent-soft);
          border-radius: 8px;
          padding: 12px 10px;
          box-shadow: 0 6px 16px rgba(79, 110, 247, 0.12);
          overflow: hidden;
        }

        .processing-doc-line {
          height: 6px;
          border-radius: 3px;
          background: var(--color-accent-soft);
          margin-bottom: 8px;
        }
        .processing-doc-line.short {
          width: 60%;
        }

        .processing-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--color-accent);
          box-shadow: 0 0 8px 1px var(--color-accent);
          animation: scan-sweep 1.8s ease-in-out infinite;
        }

        .processing-chip {
          position: absolute;
          left: 50%;
          top: 40px;
          font-size: 15px;
          line-height: 1;
          opacity: 0;
          animation: chip-pop 2.4s ease-out infinite;
        }

        .chip-1 { animation-delay: 0s;    transform: translateX(-50%); }
        .chip-2 { animation-delay: 0.45s; --chip-dx: -46px; }
        .chip-3 { animation-delay: 0.9s;  --chip-dx: 40px; }
        .chip-4 { animation-delay: 1.35s; --chip-dx: -28px; }
        .chip-5 { animation-delay: 1.8s;  --chip-dx: 34px; }

        @keyframes scan-sweep {
          0%   { top: 6px;  opacity: 0.9; }
          50%  { top: 66px; opacity: 0.9; }
          100% { top: 6px;  opacity: 0.9; }
        }

        @keyframes chip-pop {
          0% {
            opacity: 0;
            transform: translateX(calc(-50% + var(--chip-dx, 0px))) translateY(0) scale(0.6) rotate(0deg);
          }
          15% {
            opacity: 1;
            transform: translateX(calc(-50% + var(--chip-dx, 0px))) translateY(-10px) scale(1) rotate(-6deg);
          }
          80% {
            opacity: 1;
            transform: translateX(calc(-50% + var(--chip-dx, 0px))) translateY(-56px) scale(1) rotate(8deg);
          }
          100% {
            opacity: 0;
            transform: translateX(calc(-50% + var(--chip-dx, 0px))) translateY(-70px) scale(0.8) rotate(8deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .processing-scanline {
            animation: none;
            top: 36px;
            opacity: 0.6;
          }
          .processing-chip {
            animation: none;
            opacity: 0.9;
            transform: translateX(calc(-50% + var(--chip-dx, 0px))) translateY(-40px);
          }
        }
      `}</style>

      <p className="text-heading" style={{ margin: "0 0 6px", fontSize: "1.0625rem" }}>
        {label}
      </p>
      <p className="text-small" style={{ margin: 0 }}>
        This usually takes a few seconds
      </p>
    </div>
  );
}