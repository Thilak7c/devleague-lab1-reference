"use client";

import { ErrorCodes, friendlyErrorMessage } from "../lib/api";

export default function ErrorState({ code, message, onRetry, onUseDemoMode }) {
  const isNetworkIssue = code === ErrorCodes.NETWORK_ERROR;

  return (
    <div
      role="alert"
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface)",
        padding: "40px 32px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 12 }} aria-hidden="true">
        ⚠️
      </div>
      <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 16 }}>
        {isNetworkIssue ? "Couldn't reach the server" : "Couldn't process this document"}
      </p>
      <p style={{ margin: "0 0 24px", color: "var(--color-ink-muted)", fontSize: 14, maxWidth: 420, marginInline: "auto" }}>
        {friendlyErrorMessage(code, message)}
      </p>

      {/* Reinforces the no-persistence PDPA story even in the failure path
          — per PDPA_UI_Copy.md Section 5, a user shouldn't have to wonder
          whether a failed upload left something behind. */}
      <p style={{ margin: "0 0 24px", fontSize: 12, color: "var(--color-ink-muted)" }}>
        No data from this file has been stored.
      </p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={onRetry}
          style={{
            padding: "10px 20px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Try again
        </button>

        {/* Demo resilience — per Frontend_Core_Functionalities.md Section 6:
            if the live call fails (e.g. venue wifi during judging), offer a
            path that doesn't leave the presenter stuck on an error screen. */}
        {isNetworkIssue && onUseDemoMode && (
          <button
            onClick={onUseDemoMode}
            style={{
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "var(--color-accent)",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            View Demo Mode
          </button>
        )}
      </div>
    </div>
  );
}
