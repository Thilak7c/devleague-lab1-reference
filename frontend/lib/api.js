/**
 * API client for /api/process
 * ---------------------------------
 * Thin wrapper, matches the locked Insight Object Data Contract exactly
 * (see Insight_Object_Data_Contract.md / Super Docs Section 7). Kept
 * separate from UI components so the fetch/error logic is testable and
 * reusable independent of any specific component.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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

/**
 * Uploads a file and returns the parsed contract-shaped response.
 * Throws ApiError on any failure — caller is responsible for catching
 * and routing to the appropriate UI error state.
 */
export async function processDocument(file, { signal } = {}) {
  const formData = new FormData();
  formData.append("file", file);

  let response;
  try {
    response = await fetch(`${API_BASE}/api/process`, {
      method: "POST",
      body: formData,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err; // let caller handle cancellation distinctly
    throw new ApiError(ErrorCodes.NETWORK_ERROR, "Could not reach the server.");
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new ApiError(ErrorCodes.NETWORK_ERROR, "Received an invalid response from the server.");
  }

  if (!response.ok) {
    const code = body?.error?.code || ErrorCodes.NETWORK_ERROR;
    const message = body?.error?.message;
    throw new ApiError(code, message);
  }

  return body; // full contract-shaped response: { meta, extracted, privacy, insights, summary }
}
