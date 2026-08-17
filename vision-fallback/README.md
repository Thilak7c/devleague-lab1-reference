# Vision Fallback — UNFINISHED, read before using

Status as of last session (see Session_Summary_Continuation.md):

- `pdfRasterize.js` — ✅ DONE, genuinely tested against a real generated
  PDF using pdftoppm (poppler-utils). Confirmed working.
- `groqVisionExtractor.js` — 🟡 WRITTEN BUT NOT TESTED AT ALL. Not even
  with a mock. Do not trust this file to run without errors until it has
  a real test pass. No network access to api.groq.com or a Groq API key
  was available when this was written.

Also NOT done yet:
- Wiring either of these into `backend-pipeline/pipeline.js` — the main
  pipeline currently just throws EXTRACTION_FAILED when a scanned PDF is
  detected; it does not call this module at all yet.
- Testing the live Groq API call with a real key — must happen early on
  Challenge Day, budget real time for this, it may not work first try.

See Session_Summary_Continuation.md for full context on where this was
left off.
