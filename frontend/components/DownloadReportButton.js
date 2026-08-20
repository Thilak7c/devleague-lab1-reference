// frontend/components/DownloadReportButton.js

"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import FinancialReportDocument from "../lib/pdfReport";

export default function DownloadReportButton({ result }) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
    if (!result || generating) return;
    setGenerating(true);
    try {
      const blob = await pdf(<FinancialReportDocument result={result} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (result.meta?.filename || "report").replace(/\.[^/.]+$/, "");
      a.href = url;
      a.download = `${safeName}-analysis-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Couldn't generate the PDF report. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      className="btn btn-primary"
      onClick={handleDownload}
      disabled={!result || generating}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      {generating ? (
        "Generating…"
      ) : (
        <>
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
            <path d="M12 3v12" />
            <polyline points="7 11 12 16 17 11" />
            <line x1="4" y1="20" x2="20" y2="20" />
          </svg>
          Download PDF Report
        </>
      )}
    </button>
  );
}