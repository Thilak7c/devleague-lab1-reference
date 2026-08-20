// frontend/components/StepTracker.js

"use client";

export default function StepTracker({ steps, activeIndex }) {
  return (
    <div className="step-track">
      {steps.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
          <div className="step-track-item">
            <span className={`step-track-dot${i < activeIndex ? " complete" : i === activeIndex ? " active" : ""}`}>
              {i < activeIndex ? "✓" : i + 1}
            </span>
            <span className={`step-track-label${i === activeIndex ? " active" : ""}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="step-track-connector">
              <div className={`step-track-connector-fill${i < activeIndex ? " complete" : ""}`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}