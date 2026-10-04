import { Send } from "lucide-react";

const exampleQuestions = [
  "What are customers complaining about the most?",
  "Why did negative feedback increase recently?",
  "What are customers saying about the dashboard?",
  "Which issues appear most often?",
];

function AskLoopInput({
  isLoading,
  onQuestionChange,
  onSubmit,
  question,
}) {
  const canSubmit = question.trim().length > 0 && !isLoading;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
      <form onSubmit={onSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">
            Your question
          </span>

          <textarea
            className="mt-3 min-h-32 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            disabled={isLoading}
            maxLength={500}
            onChange={(event) => onQuestionChange(event.target.value)}
            placeholder="Ask something about your customer feedback..."
            required
            value={question}
          />
        </label>

        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Ask LOOP uses only feedback from your workspace.</span>
          <span>{question.length}/500</span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSubmit}
            type="submit"
          >
            <Send size={17} />
            {isLoading ? "Analyzing feedback..." : "Ask LOOP"}
          </button>
        </div>
      </form>

      <div className="mt-7 border-t border-slate-800 pt-5">
        <p className="text-sm font-medium text-slate-300">Try asking</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {exampleQuestions.map((exampleQuestion) => (
            <button
              className="rounded-full border border-slate-700 px-3 py-1.5 text-left text-xs text-slate-400 transition hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed"
              disabled={isLoading}
              key={exampleQuestion}
              onClick={() => onQuestionChange(exampleQuestion)}
              type="button"
            >
              {exampleQuestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AskLoopInput;