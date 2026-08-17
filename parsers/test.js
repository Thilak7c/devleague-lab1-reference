const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { parseDocument, normalizeColumnName, coerceAmount } = require("./documentParser");

console.log("=".repeat(70));
console.log("DOCUMENT PARSER TEST");
console.log("=".repeat(70));

async function main() {
  // --- Test 1: CSV parsing ---
  console.log("\n--- Test 1: CSV parsing ---");
  const csvContent = `Category,Period,Amount (RM),Vendor
Marketing,Q1 2026,45000,AdCo
Marketing,Q2 2026,198000,AdCo
Operations,Q1 2026,30000,OpsSupplier
Operations,Q2 2026,31500,OpsSupplier
IT,Q2 2026,"12,450.00",CloudHost Services`;
  const csvBuffer = Buffer.from(csvContent, "utf-8");
  const csvResult = await parseDocument(csvBuffer, "csv");
  console.log(`Rows extracted: ${csvResult.rows.length}, skipped: ${csvResult.skippedCount}`);
  console.log(JSON.stringify(csvResult.rows, null, 2));
  assert(csvResult.rows.length === 5, "CSV: should extract 5 rows");
  assert(csvResult.rows[0].amount === 45000, "CSV: first amount should be 45000");
  assert(csvResult.rows[4].amount === 12450, "CSV: comma-in-quotes amount should parse to 12450");
  assert(csvResult.rows[0].id === "row_1", "CSV: rows should have sequential ids");

  // --- Test 2: CSV with a malformed row (bad amount) ---
  console.log("\n--- Test 2: CSV with malformed amount ---");
  const csvMalformed = `Category,Period,Amount,Vendor
Marketing,Q1 2026,45000,AdCo
Marketing,Q2 2026,N/A,AdCo`;
  const malformedResult = await parseDocument(Buffer.from(csvMalformed, "utf-8"), "csv");
  console.log(`Rows extracted: ${malformedResult.rows.length}, skipped: ${malformedResult.skippedCount}`);
  assert(malformedResult.rows.length === 1, "Malformed CSV: should keep only 1 valid row");
  assert(malformedResult.skippedCount === 1, "Malformed CSV: should count 1 skipped row");

  // --- Test 3: XLSX parsing ---
  console.log("\n--- Test 3: XLSX parsing ---");
  const wsData = [
    ["Category", "Period", "Amount", "Vendor"],
    ["Marketing", "Q1 2026", 45000, "AdCo"],
    ["Marketing", "Q2 2026", 198000, "AdCo"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  const xlsxResult = await parseDocument(xlsxBuffer, "xlsx");
  console.log(`Rows extracted: ${xlsxResult.rows.length}, skipped: ${xlsxResult.skippedCount}`);
  console.log(JSON.stringify(xlsxResult.rows, null, 2));
  assert(xlsxResult.rows.length === 2, "XLSX: should extract 2 rows");
  assert(xlsxResult.rows[1].amount === 198000, "XLSX: second amount should be 198000");

  // --- Test 4: Column alias normalization ---
  console.log("\n--- Test 4: Column normalization ---");
  assert(normalizeColumnName("Amount (RM)") === "amount", "Should normalize 'Amount (RM)' to 'amount'");
  assert(normalizeColumnName("Supplier Name") === "vendor", "Should normalize 'Supplier Name' to 'vendor'");
  assert(normalizeColumnName("Cost Category") === "category", "Should normalize 'Cost Category' to 'category'");
  assert(normalizeColumnName("Random Column") === "random column", "Unrecognized column should pass through lowercased");

  // --- Test 5: coerceAmount edge cases ---
  console.log("\n--- Test 5: coerceAmount edge cases ---");
  assert(coerceAmount("RM12,450.00") === 12450, "Should strip RM and commas");
  assert(coerceAmount("$1,000") === 1000, "Should strip $ and commas");
  assert(coerceAmount("N/A") === null, "Should return null for non-numeric");
  assert(coerceAmount("") === null, "Should return null for empty string");
  assert(coerceAmount(500) === 500, "Should pass through numbers unchanged");

  // --- Test 6: PDF parsing (text-based, delimited-style lines) ---
  console.log("\n--- Test 6: PDF parsing (text layer, tab-delimited style) ---");
  // Tests the real production extractRowsFromText() directly (exported
  // for testing) against representative text — this is what pdf-parse
  // would hand back from a real text-layer PDF's .text field.
  const { parseDocument: _pd, ...parserModule } = require("./documentParser");
  const { rows: pdfRows, skippedCount: pdfSkipped } = parserModule.extractRowsFromText(
    `QUARTERLY EXPENSE REPORT
Marketing, Q1 2026, RM45,000.00
Marketing, Q2 2026, RM198,000.00
Operations, Q1 2026, RM30,000.00
This is just a prose sentence, not a data row.
Total Marketing Spend .......... RM243,000.00`
  );
  console.log(JSON.stringify(pdfRows, null, 2));
  console.log(`(skipped: ${pdfSkipped})`);
  assert(pdfRows.length >= 3, "PDF text heuristic: should extract at least 3 delimited rows");
  assert(
    pdfRows.some((r) => r.category === "Marketing" && r.amount === 45000),
    "PDF text heuristic: should correctly parse comma-formatted amount RM45,000.00 as 45000"
  );
  assert(
    pdfRows.some((r) => r.category.includes("Total Marketing Spend") && r.amount === 243000),
    "PDF text heuristic: should extract dot-leader style row"
  );

  console.log("\n" + "=".repeat(70));
  console.log("ALL ASSERTIONS PASSED");
  console.log("=".repeat(70));
}

function assert(condition, description) {
  if (!condition) {
    console.error(`\n❌ ASSERTION FAILED: ${description}`);
    process.exit(1);
  }
  console.log(`  ✓ ${description}`);
}

main().catch((err) => {
  console.error("Test run failed:", err);
  process.exit(1);
});
