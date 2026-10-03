import { ArrowLeft, MessageSquare, Tags } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { getThemeDetails } from "../services/themeService.js";

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString() : "-";

function ThemeDetails() {
  const { theme } = useParams();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadThemeDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setMessage("");

      const result = await getThemeDetails(theme, {
        page,
        limit: 20,
      });

      setData(result);
    } catch (error) {
      setData(null);
      setMessage(getErrorMessage(error, "Unable to load theme details."));
    } finally {
      setIsLoading(false);
    }
  }, [page, theme]);

  useEffect(() => {
    loadThemeDetails();
  }, [loadThemeDetails]);

  const feedback = data?.feedback;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-cyan-300"
        to="/themes"
      >
        <ArrowLeft size={17} />
        Back to Themes
      </Link>

      {message && (
        <p className="mt-6 rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {message}
        </p>
      )}

      {isLoading ? (
        <div className="flex min-h-80 items-center justify-center">
          <LoadingState message="Loading theme details..." />
        </div>
      ) : !data ? (
        <EmptyState
          description="The theme may not exist in this workspace."
          title="Theme not found"
        />
      ) : (
        <>
          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
              Theme drill-down
            </p>
            <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold capitalize tracking-tight text-white">
              <Tags className="text-cyan-400" size={27} />
              {data.theme}
            </h1>
          </div>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">Total mentions</p>
              <p className="mt-2 text-2xl font-bold text-white">{data.count}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">Negative feedback</p>
              <p className="mt-2 text-2xl font-bold text-rose-300">
                {data.negativePercentage}%
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">First seen</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatDate(data.firstSeen)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-sm text-slate-400">Last seen</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatDate(data.lastSeen)}
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
              <MessageSquare className="text-cyan-400" size={20} />
              Related feedback
            </h2>

            {feedback?.items.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  description="No matching feedback is available."
                  title="No feedback found"
                />
              </div>
            ) : (
              <>
                <div className="mt-5 divide-y divide-slate-800 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
                  {feedback?.items.map((item) => (
                    <Link
                      className="block p-5 transition hover:bg-slate-800/60"
                      key={item.id}
                      to={`/inbox/${item.id}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-cyan-300">
                          {item.channel}
                        </p>
                        <p
                          className={`text-xs font-semibold uppercase ${
                            item.sentiment === "negative"
                              ? "text-rose-300"
                              : item.sentiment === "positive"
                                ? "text-emerald-300"
                                : "text-slate-400"
                          }`}
                        >
                          {item.sentiment || "Unclassified"}
                        </p>
                      </div>

                      <p className="mt-3 line-clamp-2 text-slate-200">
                        {item.content}
                      </p>

                      <p className="mt-3 text-xs text-slate-500">
                        {item.customerLabel || "Anonymous"} ·{" "}
                        {formatDate(item.createdAt)}
                      </p>
                    </Link>
                  ))}
                </div>

                {feedback?.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={feedback.page === 1}
                      onClick={() => setPage((currentPage) => currentPage - 1)}
                      type="button"
                    >
                      Previous
                    </button>

                    <p className="text-sm text-slate-400">
                      Page {feedback.page} of {feedback.totalPages}
                    </p>

                    <button
                      className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={feedback.page === feedback.totalPages}
                      onClick={() => setPage((currentPage) => currentPage + 1)}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default ThemeDetails;