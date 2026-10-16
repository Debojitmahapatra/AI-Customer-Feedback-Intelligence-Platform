const escapeCsvCell = (value) => {
  const text = String(value ?? "").replace(/\r?\n/g, " ").trim();

  /*
   * Prevent spreadsheet formula injection when a CSV is opened in Excel or
   * another spreadsheet application.
   */
  const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;

  return `"${safeText.replace(/"/g, '""')}"`;
};

const addRow = (rows, values) => {
  rows.push(values.map(escapeCsvCell).join(","));
};

const formatDate = (date) =>
  date ? new Date(date).toISOString().slice(0, 10) : "";

const joinEvidenceIds = (item) => item.evidenceFeedbackIds.join(" | ");

export const createReportCsv = (report) => {
  const rows = [];

  addRow(rows, ["Voice of Customer Report"]);
  addRow(rows, ["Title", report.title]);
  addRow(rows, [
    "Date range",
    `${formatDate(report.dateRange.startDate)} to ${formatDate(report.dateRange.endDate)}`,
  ]);
  addRow(rows, ["Generated at", new Date(report.createdAt).toISOString()]);
  addRow(rows, []);

  addRow(rows, ["Executive summary"]);
  addRow(rows, [report.executiveSummary]);
  addRow(rows, []);

  addRow(rows, ["Sentiment overview"]);
  addRow(rows, ["Sentiment", "Count", "Percentage"]);
  addRow(rows, [
    "Positive",
    report.statistics.sentiment.positive.count,
    report.statistics.sentiment.positive.percentage,
  ]);
  addRow(rows, [
    "Neutral",
    report.statistics.sentiment.neutral.count,
    report.statistics.sentiment.neutral.percentage,
  ]);
  addRow(rows, [
    "Negative",
    report.statistics.sentiment.negative.count,
    report.statistics.sentiment.negative.percentage,
  ]);
  addRow(rows, []);

  addRow(rows, ["Top themes"]);
  addRow(rows, [
    "Theme",
    "Mentions",
    "Negative count",
    "Negative percentage",
  ]);

  report.statistics.topThemes.forEach((theme) => {
    addRow(rows, [
      theme.theme,
      theme.count,
      theme.negativeCount,
      theme.negativePercentage,
    ]);
  });

  addRow(rows, []);

  const addNarrativeSection = (title, items) => {
    addRow(rows, [title]);
    addRow(rows, ["Title", "Description", "Evidence feedback IDs"]);

    items.forEach((item) => {
      addRow(rows, [
        item.title,
        item.description,
        joinEvidenceIds(item),
      ]);
    });

    addRow(rows, []);
  };

  addNarrativeSection("Key findings", report.keyFindings);
  addNarrativeSection("Positive highlights", report.positiveHighlights);
  addNarrativeSection("Recommendations", report.recommendations);

  addRow(rows, ["Limitations"]);
  report.limitations.forEach((limitation) => {
    addRow(rows, [limitation]);
  });

  return `\uFEFF${rows.join("\r\n")}`;
};

export const getReportExportFilename = (reportId) =>
  `voice-of-customer-report-${reportId}.csv`;