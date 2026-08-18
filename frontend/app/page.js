"use client";

import { useState, useCallback } from "react";
import UploadZone from "../components/UploadZone";
import StagedFile from "../components/StagedFile";
import StepTracker from "../components/StepTracker";
import ProcessingState from "../components/ProcessingState";
import ErrorState from "../components/ErrorState";
import ResultsDashboard from "../components/ResultsDashboard";
import PrivacyNotice from "../components/PrivacyNotice";
import DownloadReportButton from "../components/DownloadReportButton";
import Toast from "../components/Toast";
import Confetti from "../components/Confetti";
import { processDocument, ApiError, ErrorCodes } from "../lib/api";
import { DEMO_MODE_RESPONSE } from "../lib/demoModeData";

const STATUS = {
  IDLE: "idle",
  STAGED: "staged",
  PROCESSING: "processing",
  RESULTS: "results",
  ERROR: "error",
};

const STEPS = ["Upload document", "Extract & mask", "Review insights"];

const PAGE_TITLES = {
  [STATUS.IDLE]: "Upload a report",
  [STATUS.STAGED]: "Ready to analyze",
  [STATUS.PROCESSING]: "Analyzing…",
  [STATUS.RESULTS]: "Results",
  [STATUS.ERROR]: "Something went wrong",
};

function currentStepIndex(status) {
  if (status === STATUS.PROCESSING) return 1;
  if (status === STATUS.RESULTS) return 2;
  if (status === STATUS.ERROR) return 1;
  return 0; // IDLE and STAGED are both "step 1: upload"
}

export default function HomePage() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [stagedFile, setStagedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const handleFileValidated = useCallback((file) => {
    setStagedFile(file);
    setStatus(STATUS.STAGED);
  }, []);

  const handleChooseDifferentFile = useCallback(() => {
    setStagedFile(null);
    setStatus(STATUS.IDLE);
  }, []);

  const runAnalysis = useCallback(async (file) => {
    setStatus(STATUS.PROCESSING);
    setError(null);
    setShowDownload(false);

    try {
      const data = await processDocument(file);
      setResult(data);
      setStatus(STATUS.RESULTS);
      setShowConfetti(true);
      setShowToast(true);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : ErrorCodes.NETWORK_ERROR;
      setError({ code, message: err.message });
      setStatus(STATUS.ERROR);
    }
  }, []);

  const handleProceedToAnalyze = useCallback(() => {
    if (stagedFile) runAnalysis(stagedFile);
  }, [stagedFile, runAnalysis]);

  const handleUseDemoMode = useCallback(() => {
    setResult(DEMO_MODE_RESPONSE);
    setStatus(STATUS.RESULTS);
    setShowConfetti(true);
    setShowToast(true);
  }, []);

  // Clicking the brand mark resets the whole flow — the only reset
  // control now that a standalone "Analyze another" button has been
  // removed, per request.
  const handleReset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setStagedFile(null);
    setResult(null);
    setError(null);
    setShowConfetti(false);
    setShowToast(false);
    setShowDownload(false);
  }, []);

  const activeStep = currentStepIndex(status);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <button
          onClick={handleReset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div className="brand-mark" aria-hidden="true">FA</div>
          <div>
            <div className="brand-name">Financial Report Analysis</div>
            <div className="text-micro" style={{ marginTop: 2 }}>Lab 1 · DevLeague 2026</div>
          </div>
        </button>

        <div className="sidebar-section">
          <p className="text-micro" style={{ margin: "0 0 12px" }}>How your data is handled</p>
          <div className="trust-list">
            <TrustFact icon="🧠" text="Processed in memory only — never saved to disk" />
            <TrustFact icon="🔒" text="Personal info auto-detected and masked" />
            <TrustFact icon="⏳" text="Nothing persists after your session ends" />
          </div>
        </div>

        <div className="sidebar-footer sidebar-section">
          <p className="text-micro" style={{ margin: 0 }}>DevLeague 2026 · Xsolla × Curine Academy</p>
        </div>
      </aside>

      <main className="app-main">
        <div className="app-header">
          <h1 className="text-heading" style={{ margin: 0 }}>{PAGE_TITLES[status]}</h1>
          {status === STATUS.RESULTS && result && showDownload && (
            <div className="anim-scale-in">
              <DownloadReportButton result={result} />
            </div>
          )}
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 80px", width: "100%" }}>
          <StepTracker steps={STEPS} activeIndex={activeStep} />

          {status === STATUS.IDLE && (
            <>
              <p className="text-body" style={{ margin: "0 0 24px", color: "var(--color-ink-muted)", maxWidth: 480 }}>
                Upload a financial report to get AI-assisted extraction with explainable,
                rule-based insights — every finding traces back to the source data.
              </p>
              <PrivacyNotice />
              <UploadZone onFileSelected={handleFileValidated} status={status} />
            </>
          )}

          {status === STATUS.STAGED && stagedFile && (
            <StagedFile
              file={stagedFile}
              onProceed={handleProceedToAnalyze}
              onChooseDifferent={handleChooseDifferentFile}
            />
          )}

          {status === STATUS.PROCESSING && <ProcessingState />}

          {status === STATUS.ERROR && (
            <ErrorState
              code={error?.code}
              message={error?.message}
              onRetry={handleReset}
              onUseDemoMode={handleUseDemoMode}
            />
          )}

          {status === STATUS.RESULTS && result && <ResultsDashboard result={result} />}
        </div>
      </main>

      {showConfetti && (
        <Confetti
          onDone={() => {
            setShowConfetti(false);
            setShowDownload(true);
          }}
        />
      )}
      {showToast && (
        <Toast message="Analysis complete — insights are ready" onDone={() => setShowToast(false)} />
      )}
    </div>
  );
}

function TrustFact({ icon, text }) {
  return (
    <div className="trust-item">
      <span aria-hidden="true" style={{ fontSize: 14, lineHeight: 1.3 }}>{icon}</span>
      <span className="text-small">{text}</span>
    </div>
  );
}