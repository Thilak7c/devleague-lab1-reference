/**
 * Pipeline orchestrator
 * ---------------------------------
 * This is the single function that turns "uploaded file bytes" into the
 * exact response shape defined in the locked Insight Object Data Contract
 * (see Insight_Object_Data_Contract.md / Dev League Hackathon Super Docs.md).
 *
 * Flow: parse → mask (PII) → analyze (anomalies) → assemble response
 *
 * Order matters: masking happens BEFORE analysis and BEFORE the response
 * is assembled, so:
 *   1. Anomaly detection never sees raw PII (defense in depth — even
 *      though current checks only look at numeric fields, this protects
 *      against a future check that reads vendor/text fields too)
 *   2. The response sent to the frontend never contains unmasked PII,
 *      full stop — matches the "never re-expose what was redacted"
 *      principle from the PII module itself.
 *
 * This module deliberately contains NO Express-specific code — it's a
 * pure function of (buffer, fileType) -> response object, so it can be
 * unit-tested without spinning up a server, and reused if the transport
 * layer changes.
 */

const { parseDocument } = require("./documentParser");
const { maskRows, maskText } = require("./piiMask");
const { analyzeRows } = require("./anomalyDetection");
const { extractViaVision } = require("./visionFallback");

// Error codes match the ones documented in the locked data contract.
const ErrorCodes = {
  UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  EXTRACTION_FAILED: "EXTRACTION_FAILED",
  NO_DATA_FOUND: "NO_DATA_FOUND",
};

class PipelineError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const SUPPORTED_TYPES = {
  "text/csv": "csv",
  "application/vnd.ms-excel": "csv", // some browsers send CSV as this
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/pdf": "pdf",
};

function detectFileType(originalName, mimeType) {
  if (SUPPORTED_TYPES[mimeType]) return SUPPORTED_TYPES[mimeType];
  // Fallback to extension if mimetype is generic/missing (common with
  // some browsers/OSes for CSV specifically)
  const ext = (originalName.split(".").pop() || "").toLowerCase();
  if (["csv"].includes(ext)) return "csv";
  if (["xlsx", "xls"].includes(ext)) return "xlsx";
  if (["pdf"].includes(ext)) return "pdf";
  return null;
}

/**
 * Main entry point. Takes raw file bytes + metadata, returns the full
 * contract-shaped response object, or throws a PipelineError with a
 * code the caller (Express layer) can map to the right HTTP status.
 */
async function processDocument({ buffer, originalName, mimeType, maxSizeBytes = 10 * 1024 * 1024 }) {
  if (buffer.length > maxSizeBytes) {
    throw new PipelineError(
      ErrorCodes.FILE_TOO_LARGE,
      `File exceeds the ${(maxSizeBytes / 1024 / 1024).toFixed(0)}MB limit.`
    );
  }

  const fileType = detectFileType(originalName, mimeType);
  if (!fileType) {
    throw new PipelineError(
      ErrorCodes.UNSUPPORTED_FILE_TYPE,
      "Only PDF, CSV, and XLSX files are supported."
    );
  }

  // --- Step 1: Extract ---
  let extraction;
  try {
    extraction = await parseDocument(buffer, fileType);
  } catch (err) {
    throw new PipelineError(
      ErrorCodes.EXTRACTION_FAILED,
      `Could not extract data from this file: ${err.message}`
    );
  }

  if (extraction.needsVisionFallback) {
    // Vision fallback lives in visionFallback.js by design — see that
    // module's header. If it fails for any reason (missing key, network
    // error, bad model output), we fail the same honest way the old
    // hard-stop did: a clear EXTRACTION_FAILED, never a misleading blank
    // "0 insights found" result.
    try {
      const visionResult = await extractViaVision(buffer);
      extraction = {
        rows: visionResult.rows,
        skippedCount: visionResult.skippedCount,
        extractionMethod: "vision",
        needsVisionFallback: false,
        notesText: visionResult.notesText || "",
      };
    } catch (err) {
      throw new PipelineError(
        ErrorCodes.EXTRACTION_FAILED,
        `This PDF appears to be a scanned image, and the vision fallback could not extract it: ${err.message}`
      );
    }
  }

  if (!extraction.rows || extraction.rows.length === 0) {
    throw new PipelineError(
      ErrorCodes.NO_DATA_FOUND,
      "No usable financial data rows were found in this document."
    );
  }

  // --- Step 2: Mask PII (before analysis, before response assembly) ---
  const { maskedRows, maskedCount: rowMaskedCount, matches: rowMatches } = maskRows(extraction.rows);

  // Vision-extracted documents can carry free text that isn't part of any
  // row (e.g. a "Prepared by / IC / email" notes block) — maskRows() only
  // ever sees row fields, so that text is masked separately here via the
  // same underlying rules, and folded into the same privacy summary.
  let maskedCount = rowMaskedCount;
  let matches = rowMatches;
  if (extraction.notesText) {
    const notesResult = maskText(extraction.notesText);
    maskedCount += notesResult.maskedCount;
    if (notesResult.matches.length) {
      matches = [
        ...matches,
        { field: "notes", rowId: null, matches: notesResult.matches },
      ];
    }
  }

  // --- Step 3: Analyze (runs on masked rows — amount/category/period
  // fields are untouched by masking since they're not PII, only text
  // fields like vendor/notes are ever modified) ---
  const analysis = analyzeRows(maskedRows);

  // --- Step 4: Assemble response per the locked contract ---
  return {
    meta: {
      filename: originalName,
      fileType,
      extractionMethod: extraction.extractionMethod,
      processedAt: new Date().toISOString(),
    },
    extracted: {
      rowCount: maskedRows.length,
      rows: maskedRows,
    },
    privacy: {
      maskedCount,
      // Flatten per-field match info into the flat {field, type, rowId}
      // shape the contract expects, without ever including original values.
      matches: matches.flatMap((entry) =>
        entry.matches.map((m) => ({
          field: entry.field,
          rowId: entry.rowId,
          type: m.type,
        }))
      ),
    },
    insights: analysis.insights,
    summary: analysis.summary,
  };
}

module.exports = { processDocument, PipelineError, ErrorCodes, detectFileType };
