// frontend/components/RotatingChart.js

"use client";

import { useEffect, useState } from "react";

const CHART_TYPES = ["line", "bar", "donut"];
const ROTATE_INTERVAL_MS = 3800;
const FADE_MS = 350;

function LineChartSVG({ data, valueFormatter, accent }) {
  const w = 480;
  const h = 220;
  const padX = 32;
  const padY = 24;
  const max = Math.max(...data.map((d) => d.value));
  const min = Math.min(0, Math.min(...data.map((d) => d.value)));
  const range = max - min || 1;
  const stepX = (w - padX * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = h - padY - ((d.value - min) / range) * (h - padY * 2);
    return { x, y, d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="rotchart-line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#rotchart-line-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 1000,
          strokeDashoffset: 1000,
          animation: "rotchart-draw 1.1s ease forwards",
        }}
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill={accent} />
          <text x={p.x} y={h - 4} textAnchor="middle" fontSize="10" fill="var(--color-ink-faint, #94a3b8)">
            {p.d.label}
          </text>
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="var(--color-ink-muted, #64748b)">
            {valueFormatter ? valueFormatter(p.d.value) : p.d.value}
          </text>
        </g>
      ))}
      <style>{`
        @keyframes rotchart-draw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

function BarChartSVG({ data, valueFormatter, accent }) {
  const w = 480;
  const h = 220;
  const padX = 32;
  const padY = 24;
  const max = Math.max(...data.map((d) => d.value));
  const barGap = 18;
  const barW = (w - padX * 2 - barGap * (data.length - 1)) / data.length;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {data.map((d, i) => {
        const barH = (d.value / max) * (h - padY * 2);
        const x = padX + i * (barW + barGap);
        const y = h - padY - barH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={h - padY}
              width={barW}
              height={0}
              rx="4"
              fill={accent}
              opacity={i === data.length - 1 ? 1 : 0.55 + i * 0.12}
              style={{
                animation: `rotchart-grow-${i} 0.7s ease forwards`,
                animationDelay: `${i * 80}ms`,
              }}
            />
            <text x={x + barW / 2} y={h - 4} textAnchor="middle" fontSize="10" fill="var(--color-ink-faint, #94a3b8)">
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize="10" fill="var(--color-ink-muted, #64748b)">
              {valueFormatter ? valueFormatter(d.value) : d.value}
            </text>
            <style>{`
              @keyframes rotchart-grow-${i} {
                from { y: ${h - padY}; height: 0; }
                to { y: ${y}; height: ${barH}; }
              }
            `}</style>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChartSVG({ data, valueFormatter, accent }) {
  const size = 220;
  const r = 78;
  const stroke = 26;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((sum, d) => sum + Math.abs(d.value), 0) || 1;

  const shades = [1, 0.75, 0.5, 0.3];
  let offsetAcc = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-surface-sunken, #eef1f8)" strokeWidth={stroke} />
        {data.map((d, i) => {
          const fraction = Math.abs(d.value) / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const rotation = (offsetAcc / total) * 360 - 90;
          offsetAcc += Math.abs(d.value);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={accent}
              strokeOpacity={shades[i % shades.length]}
              strokeWidth={stroke}
              strokeDasharray={`0 ${circumference}`}
              transform={`rotate(${rotation} ${cx} ${cy})`}
              style={{
                animation: `rotchart-arc-${i} 0.9s ease forwards`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          );
        })}
        <style>{`
          ${data
            .map(
              (d, i) => `
            @keyframes rotchart-arc-${i} {
              to { stroke-dasharray: ${(Math.abs(d.value) / total) * circumference} ${circumference}; }
            }
          `
            )
            .join("\n")}
        `}</style>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: accent,
                opacity: shades[i % shades.length],
                flexShrink: 0,
              }}
            />
            <span className="text-small" style={{ color: "var(--color-ink-muted, #64748b)" }}>
              {d.label}
            </span>
            <span className="text-small" style={{ marginLeft: "auto", color: "var(--color-ink-faint, #94a3b8)" }}>
              {valueFormatter ? valueFormatter(d.value) : d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RotatingChart({ data, valueFormatter, accent = "var(--color-accent, #4F6EF7)" }) {
  const [typeIndex, setTypeIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTypeIndex((i) => (i + 1) % CHART_TYPES.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const currentType = CHART_TYPES[typeIndex];

  return (
    <div style={{ minHeight: 220 }}>
      <div
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        {currentType === "line" && <LineChartSVG data={data} valueFormatter={valueFormatter} accent={accent} />}
        {currentType === "bar" && <BarChartSVG data={data} valueFormatter={valueFormatter} accent={accent} />}
        {currentType === "donut" && <DonutChartSVG data={data} valueFormatter={valueFormatter} accent={accent} />}
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12 }}>
        {CHART_TYPES.map((t, i) => (
          <span
            key={t}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i === typeIndex ? accent : "var(--color-surface-sunken, #dde3f0)",
              transition: "background 250ms ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}