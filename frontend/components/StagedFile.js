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

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={onProceed}>
          Proceed to Analyse File
        </button>
        <button className="btn btn-text" onClick={onChooseDifferent}>
          Choose a different file
        </button>
      </div>
    </div>
  );
}