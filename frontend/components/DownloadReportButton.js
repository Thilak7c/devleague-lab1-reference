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
    <button className="btn btn-primary" onClick={handleDownload} disabled={!result || generating}>
      {generating ? "Generating…" : "Download PDF Report"}
    </button>
  );
}