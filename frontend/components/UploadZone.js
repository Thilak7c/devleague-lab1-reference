"use client";

import { useState, useRef, useCallback } from "react";

const ACCEPTED_TYPES = ".pdf,.csv,.xlsx";
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Renders the idle and uploading states. Processing and error states are
 * handled by sibling components (ProcessingState, ErrorState) so each
 * state stays a focused, independently reasoned-about piece — see
 * Frontend_Core_Functionalities.md Section 2 for why all four states are
 * treated as first-class, not just the happy path.
 */
export default function UploadZone({ onFileSelected, status }) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const inputRef = useRef(null);

  const validateAndSubmit = useCallback(
    (file) => {
      setValidationError(null);
      if (!file) return;

      const ext = file.name.split(".").pop().toLowerCase();
      if (!["pdf", "csv", "xlsx"].includes(ext)) {
        setValidationError("Only PDF, CSV, and XLSX files are supported.");
        return;
      }
      if (file.size === 0) {
        setValidationError("This file appears to be empty.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setValidationError("File is too large. Please use a file under 10MB.");
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      validateAndSubmit(file);
    },
    [validateAndSubmit]
  );

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      validateAndSubmit(file);
      e.target.value = ""; // allow re-selecting the same file after an error
    },
    [validateAndSubmit]
  );

  const isBusy = status === "uploading";

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isBusy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isBusy) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isBusy) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={!isBusy ? handleDrop : undefined}
        style={{
          border: `2px dashed ${isDragging ? "var(--color-accent)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-lg)",
          background: isDragging ? "var(--color-accent-soft)" : "var(--color-surface)",
          padding: "56px 32px",
          textAlign: "center",
          cursor: isBusy ? "default" : "pointer",
          transition: "border-color 120ms ease, background 120ms ease",
          opacity: isBusy ? 0.6 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleInputChange}
          style={{ display: "none" }}
          disabled={isBusy}
        />

        <div style={{ fontSize: 32, marginBottom: 12 }} aria-hidden="true">
          📄
        </div>
        <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 16 }}>
          {isBusy ? "Uploading…" : "Drop a financial report here"}
        </p>
        <p style={{ margin: 0, color: "var(--color-ink-muted)", fontSize: 14 }}>
          {isBusy ? "Please wait" : "or click to browse — PDF, CSV, or XLSX, up to 10MB"}
        </p>
      </div>

      {validationError && (
        <p
          role="alert"
          style={{
            marginTop: 12,
            padding: "10px 14px",
            background: "var(--color-high-soft)",
            color: "var(--color-high)",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
          }}
        >
          {validationError}
        </p>
      )}
    </div>
  );
}
