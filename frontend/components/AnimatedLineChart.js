// frontend/components/AnimatedLineChart.js

"use client";

import { useEffect, useRef, useState } from "react";

const VIEW_W = 560;
const VIEW_H = 200;
const PAD_X = 24;
const PAD_TOP = 20;
const PAD_BOTTOM = 32;
const PAD_BOTTOM_ROTATED = 46; // extra room for angled x-axis labels

// Below this pixel spacing between adjacent points, permanent on-point
// value labels are dropped (they physically cannot avoid overlapping at
// this density) — the value is still available via native <title> hover.
const MIN_LABEL_SPACING = 46;
const MAX_LABEL_CHARS = 10;

function truncateLabel(label) {
  if (!label) return "";
  return label.length > MAX_LABEL_CHARS ? `${label.slice(0, MAX_LABEL_CHARS - 1)}…` : label;
}

export default function AnimatedLineChart({ data, valueFormatter, lineColor = "var(--color-accent)" }) {
  const [drawn, setDrawn] = useState(false);
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(0);
  const uid = useRef(`lc-${Math.random().toString(36).slice(2, 9)}`);

  const max = Math.max(...data.map((d) => d.value), 1);
  const plotW = VIEW_W - PAD_X * 2;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  // Once points are packed tighter than MIN_LABEL_SPACING, rotate the
  // x-axis labels and drop the permanent value labels — both are pure
  // legibility responses to density, not data changes.
  const isCrowded = stepX < MIN_LABEL_SPACING && data.length > 1;
  const padBottom = isCrowded ? PAD_BOTTOM_ROTATED : PAD_BOTTOM;
  const plotH = VIEW_H - PAD_TOP - padBottom;

  const points = data.map((d, i) => ({
    x: PAD_X + stepX * i,
    y: PAD_TOP + plotH - (d.value / max) * plotH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)} ` +
        `L ${points[0].x.toFixed(1)} ${(PAD_TOP + plotH).toFixed(1)} Z`
      : "";

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [linePath]);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDrawn(true);
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [pathLength]);

  return (
    <div style={{ width: "100%" }}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        <defs>
          <linearGradient id={`${uid.current}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor === "var(--color-accent)" ? "#4F6EF7" : lineColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={lineColor === "var(--color-accent)" ? "#4F6EF7" : lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={PAD_X}
          y1={PAD_TOP + plotH}
          x2={VIEW_W - PAD_X}
          y2={PAD_TOP + plotH}
          stroke="var(--color-border)"
          strokeWidth="1"
        />

        <path
          d={areaPath}
          fill={`url(#${uid.current}-fill)`}
          style={{
            opacity: drawn ? 1 : 0,
            transition: "opacity 0.6s ease",
            transitionDelay: "0.7s",
          }}
        />

        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: drawn ? 0 : pathLength,
            transition: "stroke-dashoffset 1.1s cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        />

        {points.map((p, i) => (
          <g key={p.label}>
            <title>{`${p.label}: ${valueFormatter ? valueFormatter(p.value) : p.value}`}</title>

            <circle
              cx={p.x}
              cy={p.y}
              r={drawn ? 4 : 0}
              fill="var(--color-surface)"
              stroke={lineColor}
              strokeWidth="2.5"
              style={{
                transition: "r 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transitionDelay: `${0.15 + (i / Math.max(points.length - 1, 1)) * 1.0}s`,
              }}
            />

            {/* Permanent value label — only rendered when points have
                enough breathing room to not collide with their neighbors. */}
            {!isCrowded && (
              <text
                x={p.x}
                y={p.y - 12}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="var(--color-ink)"
                style={{
                  opacity: drawn ? 1 : 0,
                  transition: "opacity 0.3s ease",
                  transitionDelay: `${0.3 + (i / Math.max(points.length - 1, 1)) * 1.0}s`,
                }}
              >
                {valueFormatter ? valueFormatter(p.value) : p.value}
              </text>
            )}

            <text
              x={p.x}
              y={VIEW_H - padBottom + (isCrowded ? 14 : 22)}
              textAnchor={isCrowded ? "end" : "middle"}
              fontSize="10"
              fill="var(--color-ink-muted)"
              transform={isCrowded ? `rotate(-40 ${p.x} ${VIEW_H - padBottom + 14})` : undefined}
            >
              {truncateLabel(p.label)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}