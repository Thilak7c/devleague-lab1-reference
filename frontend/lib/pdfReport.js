import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const COLORS = {
  ink: "#16181D",
  inkMuted: "#6B7280",
  inkFaint: "#9CA3AF",
  border: "#E7E8EC",
  surfaceSunken: "#F1F2F5",
  accent: "#4F6EF7",
  accentSoft: "#EBEFFE",
  high: "#E0553F",
  highSoft: "#FCEBE8",
  warning: "#E0932E",
  warningSoft: "#FDF3E4",
  info: "#6B7280",
  infoSoft: "#F1F2F5",
  success: "#2FA36B",
};

const SEVERITY_META = {
  high: { label: "High", color: COLORS.high, bg: COLORS.highSoft },
  warning: { label: "Warning", color: COLORS.warning, bg: COLORS.warningSoft },
  info: { label: "Info", color: COLORS.info, bg: COLORS.infoSoft },
};

const TYPE_LABELS = {
  variance: "Variance",
  outlier: "Outlier",
  duplicate: "Duplicate",
};

const PII_TYPE_LABELS = {
  IC: "Malaysian IC Number",
  PHONE: "Phone Number",
  EMAIL: "Email Address",
  ACCOUNT: "Bank Account Number",
  NAME: "Labelled Personal Name",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: COLORS.ink,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },

  // Header band
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandMark: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: 700,
    textAlign: "center",
    paddingTop: 6,
  },
  brandName: { fontSize: 10, fontWeight: 700 },
  eyebrow: { fontSize: 7.5, color: COLORS.inkFaint, textTransform: "uppercase", letterSpacing: 0.6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginTop: 12, marginBottom: 20 },

  // Title block
  reportTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  reportMeta: { fontSize: 8.5, color: COLORS.inkMuted, marginBottom: 2 },

  // Section
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 22,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Executive summary stat grid
  statGrid: { flexDirection: "row", gap: 10, marginTop: 4 },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 10,
  },
  statLabel: { fontSize: 7.5, color: COLORS.inkMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontFamily: "Courier", fontSize: 18, fontWeight: 500 },
  statCaption: { fontSize: 7.5, color: COLORS.inkFaint, marginTop: 3 },

  // Insight block
  insightBlock: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  insightTopRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  severityChip: { fontSize: 7, fontWeight: 700, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 7, textTransform: "uppercase" },
  typeLabel: { fontSize: 7.5, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: 0.3 },
  insightMessage: { fontSize: 9.5, lineHeight: 1.4, marginBottom: 8 },

  sourceTable: { backgroundColor: COLORS.surfaceSunken, borderRadius: 4, padding: 8 },
  sourceHeaderText: { fontSize: 7, color: COLORS.inkFaint, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 },
  sourceRow: {
    flexDirection: "row",
    fontFamily: "Courier",
    fontSize: 8,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sourceCell: { marginRight: 14 },
  sourceCellLabel: { color: COLORS.inkFaint },

  // Generic table (masking log)
  table: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, overflow: "hidden" },
  tableHeaderRow: { flexDirection: "row", backgroundColor: COLORS.surfaceSunken, paddingVertical: 6, paddingHorizontal: 10 },
  tableHeaderCell: { fontSize: 7.5, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: 0.3 },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tableCell: { fontSize: 8.5 },

  emptyNote: { fontSize: 9, color: COLORS.inkMuted, fontStyle: "italic" },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: COLORS.inkFaint },
});

function SeverityChip({ severity }) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.info;
  return (
    <Text style={[styles.severityChip, { color: meta.color, backgroundColor: meta.bg }]}>
      {meta.label}
    </Text>
  );
}

function ExecutiveSummary({ summary, privacy }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Executive Summary</Text>
      <View style={styles.statGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>High Severity</Text>
          <Text style={[styles.statValue, { color: COLORS.high }]}>{summary.bySeverity.high || 0}</Text>
          <Text style={styles.statCaption}>needs review first</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Warning</Text>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{summary.bySeverity.warning || 0}</Text>
          <Text style={styles.statCaption}>worth a second look</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Info</Text>
          <Text style={[styles.statValue, { color: COLORS.info }]}>{summary.bySeverity.info || 0}</Text>
          <Text style={styles.statCaption}>minor, for awareness</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Fields Masked</Text>
          <Text style={[styles.statValue, { color: COLORS.accent }]}>{privacy.maskedCount}</Text>
          <Text style={styles.statCaption}>PII protected</Text>
        </View>
      </View>
    </View>
  );
}

function InsightDetail({ insight, rowsById }) {
  const sourceRows = (insight.sourceRowIds || []).map((id) => rowsById?.[id]).filter(Boolean);
  return (
    <View style={styles.insightBlock} wrap={false}>
      <View style={styles.insightTopRow}>
        <SeverityChip severity={insight.severity} />
        <Text style={styles.typeLabel}>{TYPE_LABELS[insight.type] || insight.type}</Text>
      </View>
      <Text style={styles.insightMessage}>{insight.message}</Text>

      {sourceRows.length > 0 && (
        <View style={styles.sourceTable}>
          <Text style={styles.sourceHeaderText}>
            Source data ({sourceRows.length} row{sourceRows.length === 1 ? "" : "s"})
          </Text>
          {sourceRows.map((row) => (
            <View key={row.id} style={styles.sourceRow}>
              {Object.entries(row)
                .filter(([k]) => k !== "id")
                .map(([k, v]) => (
                  <Text key={k} style={styles.sourceCell}>
                    <Text style={styles.sourceCellLabel}>{k}: </Text>
                    {String(v)}
                  </Text>
                ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function MaskingLog({ privacy }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Privacy &amp; PII Masking Log</Text>
      {privacy.maskedCount === 0 ? (
        <Text style={styles.emptyNote}>No personal information was detected in this document.</Text>
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableHeaderCell, { flex: 1.4 }]}>Field</Text>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Type</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Row</Text>
          </View>
          {privacy.matches.map((m, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 1.4 }]}>{m.field}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{PII_TYPE_LABELS[m.type] || m.type}</Text>
              <Text style={[styles.tableCell, { flex: 1, fontFamily: "Courier", fontSize: 7.5 }]}>
                {m.rowId || "—"}
              </Text>
            </View>
          ))}
        </View>
      )}
      <Text style={{ fontSize: 7.5, color: COLORS.inkFaint, marginTop: 8 }}>
        Original values are never stored or displayed in this report — only the type of information found and its source location.
      </Text>
    </View>
  );
}

export default function FinancialReportDocument({ result }) {
  const { meta, extracted, privacy, insights, summary } = result;
  const rowsById = Object.fromEntries((extracted.rows || []).map((r) => [r.id, r]));
  const generatedAt = new Date().toLocaleString("en-MY", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <Document
      title={`Financial Report Analysis — ${meta.filename}`}
      author="Financial Report Analysis Tool — DevLeague 2026 Lab 1"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.brandRow}>
            <Text style={styles.brandMark}>FA</Text>
            <Text style={styles.brandName}>Financial Report Analysis</Text>
          </View>
          <Text style={styles.eyebrow}>Lab 1 · DevLeague 2026</Text>
        </View>
        <View style={styles.divider} />

        <Text style={styles.reportTitle}>Analysis Report</Text>
        <Text style={styles.reportMeta}>Source document: {meta.filename}</Text>
        <Text style={styles.reportMeta}>
          Extraction method: {meta.extractionMethod === "vision" ? "AI-assisted image reading (scanned document)" : "Direct text extraction"}
        </Text>
        <Text style={styles.reportMeta}>Generated: {generatedAt}</Text>

        <ExecutiveSummary summary={summary} privacy={privacy} />

        <Text style={styles.sectionTitle}>Detailed Findings</Text>
        {insights.length === 0 ? (
          <Text style={styles.emptyNote}>
            We reviewed {extracted.rowCount} line items and found nothing unusual.
          </Text>
        ) : (
          insights.map((insight) => (
            <InsightDetail key={insight.id} insight={insight} rowsById={rowsById} />
          ))
        )}

        <MaskingLog privacy={privacy} />

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by AI-assisted analysis. All figures should be independently verified before use in decision-making.
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}