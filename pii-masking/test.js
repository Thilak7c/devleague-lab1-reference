const { detectPII, maskText, maskRows } = require("./piiMask");

// --- Fake financial report snippets (nothing real, purely illustrative) ---

const samples = [
  {
    name: "Report header with prepared-by name",
    text: `QUARTERLY EXPENSE REPORT - Q2 2026
Prepared by: Ahmad Faizal bin Hassan
Reviewed by: Siti Aminah
Contact: finance@acmecorp.com.my`,
  },
  {
    name: "Employee record with IC and account number",
    text: `Employee: Tan Wei Ling
IC Number: 990101-14-5566
Bank Account: 1234 5678 9012
Phone: 012-3456789`,
  },
  {
    name: "Plain financial data, no PII expected",
    text: `Marketing spend increased from RM45,000 to RM198,000 quarter-over-quarter,
a 340% increase against a 50% variance threshold. Revenue grew 12% in the
same period. No anomalies detected in Operations category.`,
  },
  {
    name: "Mixed - vendor line item with contact email",
    text: `Vendor: Global Supplies Sdn Bhd
Invoice #INV-2026-0442
Amount: RM12,450.00
Contact: procurement@globalsupplies.com
Account Holder: Lim Chee Keong`,
  },
  {
    name: "Edge case - numbers that look like accounts but are just line-item codes",
    text: `Line Item Code: 4500123456
Cost Center: 7788990011
Total: RM3,200.50`,
  },
];

console.log("=".repeat(70));
console.log("PII DETECTION TEST — text snippets");
console.log("=".repeat(70));

for (const sample of samples) {
  console.log(`\n--- ${sample.name} ---`);
  console.log("ORIGINAL:\n" + sample.text);

  const found = detectPII(sample.text);
  console.log(`\nDETECTED (${found.length}):`);
  if (found.length === 0) {
    console.log("  (none)");
  } else {
    found.forEach((m) =>
      console.log(`  [${m.type}] "${m.value}" @ ${m.start}-${m.end}`)
    );
  }

  const { maskedText, maskedCount } = maskText(sample.text);
  console.log(`\nMASKED (${maskedCount} redacted):\n` + maskedText);
  console.log("-".repeat(70));
}

// --- Structured row test (simulating extracted spreadsheet data) ---

console.log("\n" + "=".repeat(70));
console.log("PII DETECTION TEST — structured rows (simulated spreadsheet extract)");
console.log("=".repeat(70));

const rows = [
  { vendor: "Global Supplies Sdn Bhd", amount: 12450.0, note: "Contact: procurement@globalsupplies.com" },
  { vendor: "Office Essentials", amount: 890.5, note: "Approved by: Nurul Izzah" },
  { vendor: "CloudHost Services", amount: 2200.0, note: "Recurring monthly charge" },
];

const { maskedRows, maskedCount, matches } = maskRows(rows);
console.log("\nORIGINAL ROWS:");
console.log(JSON.stringify(rows, null, 2));
console.log(`\nMASKED ROWS (${maskedCount} fields redacted):`);
console.log(JSON.stringify(maskedRows, null, 2));
console.log("\nMATCH SUMMARY (for UI 'X fields masked' badge):");
console.log(JSON.stringify(matches, null, 2));

console.log("\n" + "=".repeat(70));
console.log("Done. Review above for false positives/negatives before trusting this.");
console.log("=".repeat(70));
