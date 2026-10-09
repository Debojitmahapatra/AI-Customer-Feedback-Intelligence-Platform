import { History, RefreshCw } from "lucide-react";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

function AskHistoryList({
  history,
  isLoading,
  onOpen,
  onRefresh,
  refreshingId,
}) {
  return (
    <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <History className="text-cyan-400" size={20} />
        <h2 className="text-lg font-semibold text-white">Recent questions</h2>
      </div>

      <p className="mt-2 text-sm text-slate-400">
        Saved AI-generated answers from this workspace.
      </p>

      {isLoading ? (
        <p className="mt-5 text-sm text-slate-500">Loading history...</p>
      ) : history.length === 0 ? (
        <p className="mt-5 rounded-lg bg-slate-950/60 px-4 py-4 text-sm text-slate-500">
          Successful Ask LOOP answers will appear here.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-slate-800">
          {history.map((item) => {
            const isRefreshing = refreshingId === item.id;

            return (
              <article className="py-4 first:pt-0 last:pb-0" key={item.id}>
                <div className="flex items-start justify-between gap-4">
                  <button
                    className="min-w-0 text-left"
                    onClick={() => onOpen(item)}
                    type="button"
                  >
                    <p className="line-clamp-2 font-medium text-slate-200 transition hover:text-cyan-300">
                      {item.question}
                    </p>

                    <p className="mt-2 text-xs text-slate-500">
                      {formatDate(item.updatedAt)}
                      {item.refreshCount > 0
                        ? ` · Refreshed ${item.refreshCount} time${item.refreshCount === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </button>

                  <button
                    aria-label={`Refresh answer for ${item.question}`}
                    className="shrink-0 rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isRefreshing}
                    onClick={() => onRefresh(item.id)}
                    type="button"
                  >
                    <RefreshCw
                      className={isRefreshing ? "animate-spin" : ""}
                      size={16}
                    />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AskHistoryList;