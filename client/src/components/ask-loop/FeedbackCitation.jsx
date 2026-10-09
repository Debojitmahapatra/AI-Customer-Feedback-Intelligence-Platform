import { ArrowUpRight, Tags } from "lucide-react";
import { Link } from "react-router-dom";

const sentimentStyles = {
  negative: "bg-rose-400/10 text-rose-300",
  neutral: "bg-slate-400/10 text-slate-300",
  positive: "bg-emerald-400/10 text-emerald-300",
};

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
      }).format(new Date(date))
    : "-";

function FeedbackCitation({ citation }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-cyan-300">
          Feedback #{citation.feedbackId.slice(-6)}
        </p>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            sentimentStyles[citation.sentiment] || sentimentStyles.neutral
          }`}
        >
          {citation.sentiment || "Unclassified"}
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap leading-6 text-slate-200">
        "{citation.content}"
      </p>

      {citation.reason && (
        <p className="mt-4 border-l-2 border-cyan-400/60 pl-3 text-sm text-slate-400">
          {citation.reason}
        </p>
      )}

      {citation.themes?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {citation.themes.map((theme) => (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-300"
              key={theme}
            >
              <Tags size={12} />
              {theme}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-500">{formatDate(citation.createdAt)}</p>

        <Link
          className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
          to={`/inbox/${citation.feedbackId}`}
        >
          View feedback
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}

export default FeedbackCitation;