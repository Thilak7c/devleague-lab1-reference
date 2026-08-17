/**
 * Express server — /api/process endpoint
 * ---------------------------------
 * Thin HTTP layer over pipeline.js. Keeps all actual logic in pipeline.js
 * (framework-agnostic, unit-testable) — this file only handles: receiving
 * the upload, calling the pipeline, mapping errors to HTTP status codes,
 * and shaping the JSON response/error per the locked contract.
 */
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { processDocument, PipelineError, ErrorCodes } = require("./pipeline");

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


// In-memory storage only — file bytes never touch disk, matches the
// no-persistence PDPA story documented in the Super Docs.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — keep in sync with pipeline's maxSizeBytes default
});

const ERROR_STATUS_MAP = {
  [ErrorCodes.UNSUPPORTED_FILE_TYPE]: 400,
  [ErrorCodes.FILE_TOO_LARGE]: 413,
  [ErrorCodes.EXTRACTION_FAILED]: 422,
  [ErrorCodes.NO_DATA_FOUND]: 422,
};

app.post("/api/process", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: ErrorCodes.UNSUPPORTED_FILE_TYPE,
        message: "No file was uploaded. Expected a 'file' field in the form data.",
      },
    });
  }

  try {
    const result = await processDocument({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });
    return res.status(200).json(result);
  } catch (err) {
    if (err instanceof PipelineError) {
      const status = ERROR_STATUS_MAP[err.code] || 500;
      return res.status(status).json({
        error: { code: err.code, message: err.message },
      });
    }

    // Unexpected error — don't leak internals to the client, but log
    // server-side for debugging during the build.
    console.error("Unexpected error in /api/process:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong while processing the document.",
      },
    });
  }
});

// Multer-specific errors (e.g. file-size limit exceeded) arrive via its
// own error-handling middleware pattern, not a thrown PipelineError.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: { code: ErrorCodes.FILE_TOO_LARGE, message: "File exceeds the 10MB limit." },
    });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Something went wrong." },
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

module.exports = app; // exported for supertest-based integration testing
