// backend-pipeline/server.js

/**
 * Express server — /api/process + /api/status/:jobId
 * ---------------------------------
 * Thin HTTP layer over pipeline.js. Keeps all actual logic in pipeline.js
 * (framework-agnostic, unit-testable) — this file only handles: receiving
 * the upload, running the pipeline, tracking job progress, mapping errors,
 * and shaping the JSON response/error per the locked contract.
 *
 * ARCHITECTURE CHANGE (job-based polling for live progress):
 * POST /api/process now returns 202 { jobId } immediately instead of
 * waiting for the full pipeline to finish. The actual processDocument()
 * call runs after the response is sent, with its onProgress callback
 * updating an in-memory job record. The frontend polls
 * GET /api/status/:jobId to get live stage updates and, eventually, the
 * final result or error. This is what makes labels like "Reading scanned
 * pages (2 of 4 done)…" possible — a single held-open request/response
 * can't report incremental stages the way polling can.
 *
 * This means: any test that previously asserted on the direct response
 * body of POST /api/process (expecting the full contract-shaped result)
 * will now break, since that endpoint only ever returns { jobId }. Tests
 * need to poll /api/status/:jobId until status is "done" or "error".
 *
 * CORS: allowed origin(s) come from the ALLOWED_ORIGIN env var (comma-
 * separated for multiple), so the same image works against local dev
 * and the deployed Vercel frontend without a code change — just update
 * the env var on Cloud Run if the frontend URL changes.
 */
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const { processDocument, PipelineError, ErrorCodes } = require("./pipeline");

const app = express();

// Falls back to localhost:3000 if ALLOWED_ORIGIN isn't set, so local dev
// keeps working with zero config. In Cloud Run, set ALLOWED_ORIGIN to the
// real Vercel URL (comma-separate if you need more than one, e.g. a
// preview URL alongside the production one).
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use((req, res, next) => {
  const requestOrigin = req.header("Origin");
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// In-memory storage only — file bytes never touch disk, matches the
// no-persistence PDPA story documented in the Super Docs.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — keep in sync with pipeline's maxSizeBytes default
});

// In-memory job store for progress polling. Same lifetime as everything
// else in this no-persistence design — wiped on redeploy/cold start,
// which is fine since a job only needs to live for the ~1-2 minutes a
// single analysis takes, not across sessions.
const jobs = new Map();

// Terminal jobs (done/error) are deleted a few minutes after completion
// so the map doesn't grow unbounded over a long demo/judging day. Not a
// correctness requirement — Cloud Run cold starts wipe this anyway — just
// cheap hygiene.
const JOB_TTL_MS = 5 * 60 * 1000;
function scheduleJobCleanup(jobId) {
  const timer = setTimeout(() => jobs.delete(jobId), JOB_TTL_MS);
  timer.unref?.(); // don't let this timer alone keep the process alive
}

app.post("/api/process", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: ErrorCodes.UNSUPPORTED_FILE_TYPE,
        message: "No file was uploaded. Expected a 'file' field in the form data.",
      },
    });
  }

  const jobId = crypto.randomUUID();
  jobs.set(jobId, { status: "processing", stage: "starting", result: null, error: null });

  // Respond immediately with the job ID — do NOT await processDocument
  // here, or we're back to a single blocking request.
  res.status(202).json({ jobId });

  processDocument({
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    onProgress: (stage) => {
      const job = jobs.get(jobId);
      if (job) job.stage = stage;
    },
  })
    .then((result) => {
      jobs.set(jobId, { status: "done", stage: "done", result, error: null });
      scheduleJobCleanup(jobId);
    })
    .catch((err) => {
      if (err instanceof PipelineError) {
        jobs.set(jobId, {
          status: "error",
          stage: "error",
          result: null,
          error: { code: err.code, message: err.message },
        });
      } else {
        console.error("Unexpected error in /api/process job:", err);
        jobs.set(jobId, {
          status: "error",
          stage: "error",
          result: null,
          error: {
            code: "INTERNAL_ERROR",
            message: "Something went wrong while processing the document.",
          },
        });
      }
      scheduleJobCleanup(jobId);
    });
});

app.get("/api/status/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({
      error: { code: "JOB_NOT_FOUND", message: "This job does not exist or has expired." },
    });
  }
  return res.status(200).json(job); // { status, stage, result, error }
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