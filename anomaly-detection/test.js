const { analyzeRows, THRESHOLDS } = require("./anomalyDetection");

console.log("=".repeat(70));
console.log("ANOMALY DETECTION TEST");
console.log(`Thresholds in use: ${JSON.stringify(THRESHOLDS)}`);
console.log("=".repeat(70));

// --- Test 1: Variance — Marketing spend spikes hard, Ops stays flat ---
console.log("\n--- Test 1: Variance detection ---");
const varianceRows = [
  { id: "r1", category: "Marketing", period: "Q1 2026", amount: 45000, vendor: "AdCo" },
  { id: "r2", category: "Marketing", period: "Q2 2026", amount: 198000, vendor: "AdCo" },
  { id: "r3", category: "Operations", period: "Q1 2026", amount: 30000, vendor: "OpsSupplier" },
  { id: "r4", category: "Operations", period: "Q2 2026", amount: 31500, vendor: "OpsSupplier" },
];
const result1 = analyzeRows(varianceRows);
printResult(result1);
assert(
  result1.insights.some((i) => i.type === "variance" && i.metric.category === "Marketing"),
  "Should flag Marketing variance"
);
assert(
  !result1.insights.some((i) => i.type === "variance" && i.metric.category === "Operations"),
  "Should NOT flag Operations (only 5% change, below 50% threshold)"
);

// --- Test 2: Outlier — one vendor way above the rest in the same category ---
console.log("\n--- Test 2: Outlier detection ---");
const outlierRows = [
  { id: "r1", category: "Office Supplies", period: "Q2 2026", amount: 500, vendor: "Vendor A" },
  { id: "r2", category: "Office Supplies", period: "Q2 2026", amount: 480, vendor: "Vendor B" },
  { id: "r3", category: "Office Supplies", period: "Q2 2026", amount: 510, vendor: "Vendor C" },
  { id: "r4", category: "Office Supplies", period: "Q2 2026", amount: 495, vendor: "Vendor D" },
  { id: "r5", category: "Office Supplies", period: "Q2 2026", amount: 8500, vendor: "Vendor E (suspicious)" },
];
const result2 = analyzeRows(outlierRows);
printResult(result2);
assert(
  result2.insights.some((i) => i.type === "outlier" && i.sourceRowIds.includes("r5")),
  "Should flag Vendor E as an outlier"
);
assert(
  !result2.insights.some((i) => i.type === "outlier" && i.sourceRowIds.includes("r1")),
  "Should NOT flag Vendor A (normal value)"
);

// --- Test 3: Duplicate — same vendor, same amount, entered twice ---
console.log("\n--- Test 3: Duplicate detection ---");
const duplicateRows = [
  { id: "r1", category: "IT", period: "Q2 2026", amount: 12450, vendor: "CloudHost Services" },
  { id: "r2", category: "IT", period: "Q2 2026", amount: 12450, vendor: "CloudHost Services" },
  { id: "r3", category: "IT", period: "Q2 2026", amount: 2200, vendor: "Software License Co" },
];
const result3 = analyzeRows(duplicateRows);
printResult(result3);
assert(
  result3.insights.some((i) => i.type === "duplicate"),
  "Should flag the duplicate CloudHost entry"
);

// --- Test 4: Clean data — nothing should be flagged ---
console.log("\n--- Test 4: Clean data (no anomalies expected) ---");
const cleanRows = [
  { id: "r1", category: "Rent", period: "Q1 2026", amount: 10000, vendor: "Landlord Inc" },
  { id: "r2", category: "Rent", period: "Q2 2026", amount: 10200, vendor: "Landlord Inc" },
  { id: "r3", category: "Utilities", period: "Q1 2026", amount: 1500, vendor: "PowerCo" },
  { id: "r4", category: "Utilities", period: "Q2 2026", amount: 1600, vendor: "PowerCo" },
];
const result4 = analyzeRows(cleanRows);
printResult(result4);
assert(result4.insights.length === 0, "Clean data should produce zero insights");

// --- Test 5: Malformed row (missing/invalid amount) shouldn't crash ---
console.log("\n--- Test 5: Malformed row handling ---");
const malformedRows = [
  { id: "r1", category: "Marketing", period: "Q1 2026", amount: 45000, vendor: "AdCo" },
  { id: "r2", category: "Marketing", period: "Q2 2026", amount: "not a number", vendor: "AdCo" },
  { id: "r3", category: "Marketing", period: "Q2 2026" }, // missing amount entirely
];
const result5 = analyzeRows(malformedRows);
printResult(result5);
assert(result5.skippedRowCount === 2, "Should report 2 skipped malformed rows");

console.log("\n" + "=".repeat(70));
console.log("ALL ASSERTIONS PASSED");
console.log("=".repeat(70));

// --- helpers ---
function printResult(result) {
  console.log(`Insights found: ${result.summary.totalInsights}`, result.summary.bySeverity);
  result.insights.forEach((i) => console.log(`  [${i.severity}/${i.type}] ${i.message}`));
  if (result.skippedRowCount) console.log(`  (skipped ${result.skippedRowCount} malformed rows)`);
}

function assert(condition, description) {
  if (!condition) {
    console.error(`\n❌ ASSERTION FAILED: ${description}`);
    process.exit(1);
  }
  console.log(`  ✓ ${description}`);
}
