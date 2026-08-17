const request = require("supertest");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const app = require("./server");

async function buildSamplePDF() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 320]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const lines = [
    "QUARTERLY EXPENSE REPORT",
    "Prepared by: Ahmad Faizal bin Hassan",
    "Marketing, Q1 2026, RM45,000.00",
    "Marketing, Q2 2026, RM198,000.00",
    "Operations, Q1 2026, RM30,000.00",
    "Operations, Q2 2026, RM31,500.00",
  ];
  lines.forEach((line, i) => page.drawText(line, { x: 20, y: 280 - i * 20, size: 11, font }));
  return Buffer.from(await doc.save());
}

async function buildBlankPDF() {
  const doc = await PDFDocument.create();
  doc.addPage([400, 300]);
  return Buffer.from(await doc.save());
}

let failures = 0;
function assert(condition, description) {
  if (condition) {
    console.log(`  ✓ ${description}`);
  } else {
    console.error(`  ❌ FAILED: ${description}`);
    failures += 1;
  }
}

async function main() {
  console.log("=".repeat(70));
  console.log("INTEGRATION TEST — real HTTP requests against /api/process");
  console.log("=".repeat(70));

  // --- Test 1: health check ---
  console.log("\n--- Test 1: health check ---");
  const health = await request(app).get("/health");
  assert(health.status === 200, "GET /health returns 200");

  // --- Test 2: valid CSV upload, full happy path ---
  console.log("\n--- Test 2: valid CSV upload ---");
  const csvContent = `Category,Period,Amount,Vendor
Marketing,Q1 2026,45000,AdCo
Marketing,Q2 2026,198000,AdCo
Operations,Q1 2026,30000,OpsSupplier
Operations,Q2 2026,31500,OpsSupplier
IT,Q2 2026,12450,CloudHost Services
IT,Q2 2026,12450,CloudHost Services`;

  const csvRes = await request(app)
    .post("/api/process")
    .attach("file", Buffer.from(csvContent, "utf-8"), { filename: "report.csv", contentType: "text/csv" });

  console.log(JSON.stringify(csvRes.body, null, 2));
  assert(csvRes.status === 200, "CSV upload returns 200");
  assert(csvRes.body.meta.extractionMethod === "spreadsheet", "extractionMethod is 'spreadsheet'");
  assert(csvRes.body.extracted.rowCount === 6, "extracted 6 rows");
  assert(csvRes.body.insights.some((i) => i.type === "variance"), "found a variance insight");
  assert(csvRes.body.insights.some((i) => i.type === "duplicate"), "found a duplicate insight (CloudHost x2)");
  assert(
    csvRes.body.insights.every((i) => i.sourceRowIds && i.sourceRowIds.length > 0),
    "every insight has at least one sourceRowId (explainability requirement)"
  );
  assert(csvRes.body.summary.totalInsights === csvRes.body.insights.length, "summary.totalInsights matches insights array length");

  // --- Test 3: CSV with PII in a text field gets masked ---
  console.log("\n--- Test 3: CSV with PII in vendor/note field ---");
  const csvWithPII = `Category,Period,Amount,Vendor
Marketing,Q1 2026,45000,Contact: procurement@globalsupplies.com
Marketing,Q2 2026,198000,AdCo`;
  const piiRes = await request(app)
    .post("/api/process")
    .attach("file", Buffer.from(csvWithPII, "utf-8"), { filename: "report2.csv", contentType: "text/csv" });

  console.log(JSON.stringify(piiRes.body.privacy, null, 2));
  console.log("Row 1 vendor field:", piiRes.body.extracted.rows[0].vendor);
  assert(piiRes.body.privacy.maskedCount >= 1, "at least 1 field masked");
  assert(piiRes.body.privacy.matches[0].rowId !== undefined, "privacy.matches includes rowId");
  assert(piiRes.body.privacy.matches[0].rowId !== null, "rowId is populated (not null) since rows have ids");
  assert(
    !JSON.stringify(piiRes.body).includes("procurement@globalsupplies.com"),
    "original email does NOT appear anywhere in the response (never re-expose redacted PII)"
  );
  assert(
    piiRes.body.extracted.rows[0].vendor.includes("[REDACTED:EMAIL]"),
    "vendor field shows the redaction placeholder"
  );

  // --- Test 4: real PDF, text-layer extraction ---
  console.log("\n--- Test 4: real PDF upload (text layer) ---");
  const pdfBuffer = await buildSamplePDF();
  const pdfRes = await request(app)
    .post("/api/process")
    .attach("file", pdfBuffer, { filename: "report.pdf", contentType: "application/pdf" });

  console.log(JSON.stringify(pdfRes.body, null, 2));
  assert(pdfRes.status === 200, "PDF upload returns 200");
  assert(pdfRes.body.meta.extractionMethod === "text", "extractionMethod is 'text'");
  assert(pdfRes.body.extracted.rowCount === 4, "extracted 4 rows from PDF");
  assert(
    pdfRes.body.insights.some((i) => i.type === "variance" && i.metric.category === "Marketing"),
    "found Marketing variance insight from PDF data"
  );

  // --- Test 5: scanned/blank PDF should return a clear error, not a false empty result ---
  console.log("\n--- Test 5: blank/scanned PDF ---");
  const blankPdfBuffer = await buildBlankPDF();
  const blankRes = await request(app)
    .post("/api/process")
    .attach("file", blankPdfBuffer, { filename: "scanned.pdf", contentType: "application/pdf" });

  console.log(JSON.stringify(blankRes.body, null, 2));
  assert(blankRes.status === 422, "blank PDF returns 422 (extraction failed, not silently empty)");
  assert(blankRes.body.error.code === "EXTRACTION_FAILED", "error code is EXTRACTION_FAILED");

  // --- Test 6: unsupported file type ---
  console.log("\n--- Test 6: unsupported file type ---");
  const badRes = await request(app)
    .post("/api/process")
    .attach("file", Buffer.from("not a real file"), { filename: "malware.exe", contentType: "application/octet-stream" });

  assert(badRes.status === 400, "unsupported file type returns 400");
  assert(badRes.body.error.code === "UNSUPPORTED_FILE_TYPE", "error code is UNSUPPORTED_FILE_TYPE");

  // --- Test 7: no file attached ---
  console.log("\n--- Test 7: no file attached ---");
  const noFileRes = await request(app).post("/api/process");
  assert(noFileRes.status === 400, "no file returns 400");

  // --- Test 8: CSV with no valid data rows ---
  console.log("\n--- Test 8: CSV with no usable data ---");
  const emptyCsv = `Category,Period,Amount,Vendor\nMarketing,Q1 2026,N/A,AdCo`;
  const emptyRes = await request(app)
    .post("/api/process")
    .attach("file", Buffer.from(emptyCsv, "utf-8"), { filename: "empty.csv", contentType: "text/csv" });

  assert(emptyRes.status === 422, "no-usable-data CSV returns 422");
  assert(emptyRes.body.error.code === "NO_DATA_FOUND", "error code is NO_DATA_FOUND");

  console.log("\n" + "=".repeat(70));
  if (failures === 0) {
    console.log("ALL INTEGRATION TESTS PASSED");
  } else {
    console.log(`${failures} TEST(S) FAILED`);
    process.exitCode = 1;
  }
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});
