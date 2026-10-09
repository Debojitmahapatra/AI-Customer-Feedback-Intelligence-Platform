import { MessageSquareText, Sparkles } from "lucide-react";
import EmptyState from "../EmptyState.jsx";
import FeedbackCitation from "./FeedbackCitation.jsx";

function AskLoopAnswer({ answerData }) {
  if (answerData.retrievedCount === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          description={answerData.answer}
          title="Not enough feedback"
        />
      </div>
    );
  }

  return (
    <section className="mt-8">
      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
          <Sparkles size={18} />
          Answer
        </div>

        <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-slate-100">
          {answerData.answer}
        </p>

        <p className="mt-5 text-xs text-slate-500">
          Based on {answerData.retrievedCount} relevant feedback item
          {answerData.retrievedCount === 1 ? "" : "s"} from your workspace.
        </p>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2">
          <MessageSquareText className="text-cyan-400" size={20} />
          <h2 className="text-xl font-semibold text-white">
            Based on feedback
          </h2>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          These feedback records support the answer above.
        </p>

        {answerData.citations.length === 0 ? (
          <p className="mt-5 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-4 text-sm text-slate-400">
            No individual feedback citations were returned for this answer.
          </p>
        ) : (
          <div className="mt-5 grid gap-4">
            {answerData.citations.map((citation) => (
              <FeedbackCitation
                citation={citation}
                key={citation.feedbackId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AskLoopAnswer;