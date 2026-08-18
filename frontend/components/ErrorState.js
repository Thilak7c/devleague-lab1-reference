"use client";

import { ErrorCodes, friendlyErrorMessage } from "../lib/api";

export default function ErrorState({ code, message, onRetry, onUseDemoMode }) {
  const isNetworkIssue = code === ErrorCodes.NETWORK_ERROR;

  return (
    <div
      role="alert"
      className="card-elevated"
      style={{
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          margin: "0 auto 18px",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-high-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        ⚠️
      </div>
      <p className="text-heading" style={{ margin: "0 0 6px" }}>
        {isNetworkIssue ? "Couldn't reach the server" : "Couldn't process this document"}
      </p>
      <p
        className="text-small"
        style={{ margin: "0 0 22px", maxWidth: 420, marginInline: "auto" }}
      >
        {friendlyErrorMessage(code, message)}
      </p>

      {/* Reinforces the no-persistence PDPA story even in the failure path
          — per PDPA_UI_Copy.md Section 5, a user shouldn't have to wonder
          whether a failed upload left something behind. */}
      <p className="text-micro" style={{ margin: "0 0 24px", letterSpacing: "0.02em" }}>
        No data from this file has been stored.
      </p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={onRetry} className="btn btn-secondary">
          Try again
        </button>

        {/* Demo resilience — per Frontend_Core_Functionalities.md Section 6:
            if the live call fails (e.g. venue wifi during judging), offer a
            path that doesn't leave the presenter stuck on an error screen. */}
        {isNetworkIssue && onUseDemoMode && (
          <button onClick={onUseDemoMode} className="btn btn-primary">
            View Demo Mode
          </button>
        )}
      </div>
    </div>
  );
}