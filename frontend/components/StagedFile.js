// frontend/components/StagedFile.js

"use client";

export default function StagedFile({ file, onProceed, onChooseDifferent }) {
  const sizeLabel =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;

  return (
    <div className="card-elevated anim-fade-up" style={{ padding: "40px 32px", textAlign: "center" }}>
      <div className="staged-file-icon" style={{ margin: "0 auto 16px" }} aria-hidden="true">
        📄
      </div>
      <p className="text-heading" style={{ margin: "0 0 4px" }}>{file.name}</p>
      <p className="text-small" style={{ margin: "0 0 24px" }}>{sizeLabel} · ready to analyze</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <button className="btn btn-text" onClick={onChooseDifferent}>
          Choose a different file
        </button>
        <button
          className="btn btn-primary"
          onClick={onProceed}
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          Proceed to Analyse File
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}