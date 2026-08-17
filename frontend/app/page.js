"use client";

import { useState, useCallback } from "react";
import UploadZone from "../components/UploadZone";
import ProcessingState from "../components/ProcessingState";
import ErrorState from "../components/ErrorState";
import ResultsDashboard from "../components/ResultsDashboard";
import PrivacyNotice from "../components/PrivacyNotice";
import { processDocument, ApiError, ErrorCodes } from "../lib/api";
import { DEMO_MODE_RESPONSE } from "../lib/demoModeData";

// Explicit states rather than boolean flags — matches
// Frontend_Core_Functionalities.md Section 2: every state is handled
// deliberately, not inferred from a combination of loading/error booleans.
const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  RESULTS: "results",
  ERROR: "error",
};

export default function HomePage() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelected = useCallback(async (file) => {
    setStatus(STATUS.UPLOADING);
    setError(null);

    const processingTimer = setTimeout(() => setStatus(STATUS.PROCESSING), 300);

    try {
      const data = await processDocument(file);
      clearTimeout(processingTimer);   // cancel it — we're done, don't let it fire late
      setResult(data);
      setStatus(STATUS.RESULTS);
    } catch (err) {
      clearTimeout(processingTimer);   // same for the error path
      const code = err instanceof ApiError ? err.code : ErrorCodes.NETWORK_ERROR;
      setError({ code, message: err.message });
      setStatus(STATUS.ERROR);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setResult(null);
    setError(null);
  }, []);

  const handleUseDemoMode = useCallback(() => {
    setResult(DEMO_MODE_RESPONSE);
    setStatus(STATUS.RESULTS);
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px" }}>
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
          }}
        >
          Lab 1 · Financial Report Analysis
        </p>
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          Upload a report. See what matters.
        </h1>
      </header>

      {status === STATUS.IDLE && (
        <>
          <PrivacyNotice />
          <UploadZone onFileSelected={handleFileSelected} status={status} />
        </>
      )}

      {status === STATUS.UPLOADING && <UploadZone onFileSelected={handleFileSelected} status={status} />}

      {status === STATUS.PROCESSING && <ProcessingState />}

      {status === STATUS.ERROR && (
        <ErrorState
          code={error?.code}
          message={error?.message}
          onRetry={handleReset}
          onUseDemoMode={handleUseDemoMode}
        />
      )}

      {status === STATUS.RESULTS && result && <ResultsDashboard result={result} onReset={handleReset} />}
    </main>
  );
}
