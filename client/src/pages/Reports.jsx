import { FileText, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { generateReport, getReports } from "../services/reportService.js";

const toDateInputValue = (date) => date.toISOString().slice(0, 10);

const getDateDaysAgo = (days) => {
  const date = new Date();

  date.setDate(date.getDate() - days);

  return toDateInputValue(date);
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  "Unable to generate the report. Please try again.";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(date));

function Reports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("Voice of Customer Report");
  const [startDate, setStartDate] = useState(getDateDaysAgo(30));
  const [endDate, setEndDate] = useState(toDateInputValue(new Date()));
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const canGenerate = ["ADMIN", "ANALYST"].includes(user.role);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);

      const data = await getReports({
        page: 1,
        limit: 20,
      });

      setReports(data.reports);
    } catch {
      setReports([]);
      setMessage("Unable to load saved reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const applyPreset = (days) => {
    setStartDate(getDateDaysAgo(days));
    setEndDate(toDateInputValue(new Date()));
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (isGenerating) {
      return;
    }

    try {
      setIsGenerating(true);
      setMessage("");

      const report = await generateReport({
        title: title.trim(),
        startDate,
        endDate,
      });

      await loadReports();
      navigate(`/reports/${report.id}`);
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
          Feedback intelligence
        </p>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
          <FileText className="text-cyan-400" size={30} />
          Voice of Customer Reports
        </h1>
        <p className="mt-3 text-slate-400">
          Generate evidence-based summaries of customer feedback and trends.
        </p>
      </div>

      {message && (
        <p className="mt-6 rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {message}
        </p>
      )}

      {canGenerate && (
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-white">Generate report</h2>

          <form className="mt-5" onSubmit={handleGenerate}>
            <label className="block text-sm text-slate-400">
              Report title
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400"
                maxLength={150}
                onChange={(event) => setTitle(event.target.value)}
                required
                value={title}
              />
            </label>

            <div className="mt-5">
              <p className="text-sm text-slate-400">Quick ranges</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300"
                  onClick={() => applyPreset(7)}
                  type="button"
                >
                  Last 7 days
                </button>
                <button
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300"
                  onClick={() => applyPreset(30)}
                  type="button"
                >
                  Last 30 days
                </button>
                <button
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-cyan-400/60 hover:text-cyan-300"
                  onClick={() => applyPreset(90)}
                  type="button"
                >
                  Last 90 days
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm text-slate-400">
                Start date
                <input
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400"
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  type="date"
                  value={startDate}
                />
              </label>

              <label className="text-sm text-slate-400">
                End date
                <input
                  className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-400"
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                  type="date"
                  value={endDate}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  isGenerating ||
                  !title.trim() ||
                  !startDate ||
                  !endDate ||
                  startDate > endDate
                }
                type="submit"
              >
                <Plus size={17} />
                {isGenerating
                  ? "Generating your Voice-of-Customer report..."
                  : "Generate report"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">Saved reports</h2>

        {isLoading ? (
          <div className="mt-6 flex min-h-40 items-center justify-center">
            <LoadingState message="Loading saved reports..." />
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              description="Generate the first report when enough feedback is available."
              title="No saved reports"
            />
          </div>
        ) : (
          <div className="mt-5 divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
            {reports.map((report) => (
              <Link
                className="block p-5 transition hover:bg-slate-800/60"
                key={report.id}
                to={`/reports/${report.id}`}
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-medium text-slate-100">
                      {report.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {formatDate(report.dateRange.startDate)} -{" "}
                      {formatDate(report.dateRange.endDate)}
                    </p>
                  </div>

                  <div className="text-sm text-slate-500 sm:text-right">
                    <p>{report.totalFeedback} feedback items</p>
                    <p className="mt-1">
                      Created {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Reports;