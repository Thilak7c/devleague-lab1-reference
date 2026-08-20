// frontend/lib/api.js

/**
 * API client for /api/process (job-based, with live progress polling)
 * ---------------------------------
 * Matches the locked Insight Object Data Contract exactly for the final
 * result shape (see Insight_Object_Data_Contract.md / Super Docs Section
 * 7). Kept separate from UI components so the fetch/error/polling logic
 * is testable and reusable independent of any specific component.
 *
 * ARCHITECTURE CHANGE: processDocument() now does two things instead of
 * one — (1) POST the file and get back a jobId, (2) poll
 * GET /api/status/:jobId until the job reaches a terminal state. An
 * optional onProgress(stage) callback fires on every poll tick with the
 * backend's raw stage string, so the caller (ProcessingState) can show
 * a live label. Callers that don't pass onProgress are unaffected —
 * behavior degrades gracefully to "just wait for the final result."
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const POLL_INTERVAL_MS = 1000;

// Mirrors the error codes documented in the contract — used by the UI to
// pick the right message per Frontend_Core_Functionalities.md Section 5.
export const ErrorCodes = {
  UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  EXTRACTION_FAILED: "EXTRACTION_FAILED",
  NO_DATA_FOUND: "NO_DATA_FOUND",
  NETWORK_ERROR: "NETWORK_ERROR", // client-side only — backend unreachable/timeout
};

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const FRIENDLY_MESSAGES = {
  [ErrorCodes.UNSUPPORTED_FILE_TYPE]: "Only PDF, CSV, and XLSX files are supported.",
  [ErrorCodes.FILE_TOO_LARGE]: "This file is too large. Please try a file under 10MB.",
  [ErrorCodes.EXTRACTION_FAILED]:
    "We couldn't read this document. If it's a scanned PDF, try a text-based version instead.",
  [ErrorCodes.NO_DATA_FOUND]: "No usable financial data was found in this document.",
  [ErrorCodes.NETWORK_ERROR]: "Couldn't reach the server. Check your connection and try again.",
};

export function friendlyErrorMessage(code, fallback) {
  return FRIENDLY_MESSAGES[code] || fallback || "Something went wrong. Please try again.";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Uploads a file, then polls until the job finishes. Returns the parsed
 * contract-shaped response. Throws ApiError on any failure — caller is
 * responsible for catching and routing to the appropriate UI error state.
 *
 * @param {File} file
 * @param {Object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @param {(stage: string) => void} [opts.onProgress] - called on every
 *   poll tick with the backend's raw stage string (e.g. "parsing",
 *   "extracted_page_2_of_4"). Optional — safe to omit.
 */
export async function processDocument(file, { signal, onProgress } = {}) {
  const formData = new FormData();
  formData.append("file", file);

  let startResponse;
  try {
    startResponse = await fetch(`${API_BASE}/api/process`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err; // let caller handle cancellation distinctly
    throw new ApiError(ErrorCodes.NETWORK_ERROR, "Could not reach the server.");
  }

  let startBody;
  try {
    startBody = await startResponse.json();
  } catch {
    throw new ApiError(ErrorCodes.NETWORK_ERROR, "Received an invalid response from the server.");
  }

  if (!startResponse.ok) {
    const code = startBody?.error?.code || ErrorCodes.NETWORK_ERROR;
    throw new ApiError(code, startBody?.error?.message);
  }

  const { jobId } = startBody;
  if (!jobId) {
    throw new ApiError(ErrorCodes.NETWORK_ERROR, "Server did not return a job ID.");
  }

  return pollUntilDone(jobId, { signal, onProgress });
}

async function pollUntilDone(jobId, { signal, onProgress }) {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (signal?.aborted) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }

    let response;
    try {
      response = await fetch(`${API_BASE}/api/status/${jobId}`, { signal });
    } catch (err) {
      if (err.name === "AbortError") throw err;
      throw new ApiError(ErrorCodes.NETWORK_ERROR, "Lost connection while checking progress.");
    }

    let body;
    try {
      body = await response.json();
    } catch {
      throw new ApiError(ErrorCodes.NETWORK_ERROR, "Received an invalid status response from the server.");
    }

    if (!response.ok) {
      const code = body?.error?.code || ErrorCodes.NETWORK_ERROR;
      throw new ApiError(code, body?.error?.message);
    }

    if (body.stage && onProgress) onProgress(body.stage);

    if (body.status === "done") {
      return body.result; // full contract-shaped response
    }
    if (body.status === "error") {
      throw new ApiError(body.error?.code || ErrorCodes.EXTRACTION_FAILED, body.error?.message);
    }

    await sleep(POLL_INTERVAL_MS);
  }
}