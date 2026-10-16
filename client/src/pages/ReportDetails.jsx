import { ArrowLeft, FileText, Lightbulb, Tags, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { getReportById, downloadReportCsv} from "../services/reportService.js";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));

const NarrativeSection = ({ items, title }) => (
  <section className="mt-8">
    <h2 className="text-xl font-semibold text-white">{title}</h2>

    {items.length === 0 ? (
      <p className="mt-4 text-sm text-slate-500">
        No evidence-supported items were identified.
      </p>
    ) : (
      <div className="mt-4 grid gap-4">
        {items.map((item) => (
          <article
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
            key={`${title}-${item.title}`}
          >
            <h3 className="font-medium text-slate-100">{item.title}</h3>
            <p className="mt-3 leading-6 text-slate-300">
              {item.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.evidenceFeedbackIds.map((feedbackId) => (
                <Link
                  className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/20"
                  key={feedbackId}
                  to={`/inbox/${feedbackId}`}
                >
                  Feedback #{feedbackId.slice(-6)}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
);

function ReportDetails() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage("");

      const data = await getReportById(reportId);

      setReport(data);
    } catch {
      setReport(null);
      setMessage("Unable to load this report.");
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError("");

      const csvBlob = await downloadReportCsv(reportId);
      const downloadUrl = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `voice-of-customer-report-${reportId}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      setExportError("Unable to export this report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading report..." />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-300"
          to="/reports"
        >
          <ArrowLeft size={17} />
          Back to reports
        </Link>

        <div className="mt-8">
          <EmptyState
            description={message || "This report was not found."}
            title="Report unavailable"
          />
        </div>
      </div>
    );
  }

  const { sentiment, topThemes } = report.statistics;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
        to="/reports"
      >
        <ArrowLeft size={17} />
        Back to reports
      </Link>

      <div className="mt-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
          Voice of Customer Report
        </p>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
          <FileText className="text-cyan-400" size={29} />
          {report.title}
        </h1>
        <p className="mt-3 text-slate-400">
          {formatDate(report.dateRange.startDate)} -{" "}
          {formatDate(report.dateRange.endDate)}
        </p>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isExporting}
          onClick={handleExport}
          type="button"
        >
          <Download size={17} />
          {isExporting ? "Preparing CSV..." : "Export CSV"}
        </button>

        {exportError && (
          <p className="text-sm text-rose-300">{exportError}</p>
        )}
      </div>

      <section className="mt-8 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-cyan-300">
          Executive summary
        </h2>
        <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-100">
          {report.executiveSummary}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Key statistics</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Feedback analyzed</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {report.statistics.totalFeedback}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Positive</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">
              {sentiment.positive.percentage}%
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {sentiment.positive.count} items
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Neutral</p>
            <p className="mt-2 text-2xl font-bold text-slate-200">
              {sentiment.neutral.percentage}%
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {sentiment.neutral.count} items
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <p className="text-sm text-slate-400">Negative</p>
            <p className="mt-2 text-2xl font-bold text-rose-300">
              {sentiment.negative.percentage}%
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {sentiment.negative.count} items
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-2">
          <Tags className="text-cyan-400" size={20} />
          <h2 className="text-xl font-semibold text-white">Top themes</h2>
        </div>

        {topThemes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No classified themes were available.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[580px] text-left text-sm">
                <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-4">Theme</th>
                    <th className="px-5 py-4 text-right">Mentions</th>
                    <th className="px-5 py-4 text-right">Negative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                  {topThemes.map((theme) => (
                    <tr key={theme.theme}>
                      <td className="px-5 py-4 capitalize text-slate-100">
                        {theme.theme}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-300">
                        {theme.count}
                      </td>
                      <td className="px-5 py-4 text-right text-rose-300">
                        {theme.negativeCount} ({theme.negativePercentage}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <NarrativeSection items={report.keyFindings} title="Key findings" />
      <NarrativeSection
        items={report.positiveHighlights}
        title="Positive highlights"
      />
      <NarrativeSection
        items={report.recommendations}
        title="Recommendations"
      />

      <section className="mt-8 rounded-xl border border-amber-400/20 bg-amber-400/5 p-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="text-amber-300" size={19} />
          <h2 className="text-lg font-semibold text-amber-200">Limitations</h2>
        </div>

        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
          {report.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ReportDetails;