import { MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import AskLoopInput from "../components/ask-loop/AskLoopInput.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { askQuestion } from "../services/askLoopService.js";

function AskLoop() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [, setAnswerData] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim() || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const data = await askQuestion({
        question: question.trim(),
      });

      setAnswerData(data);
    } catch {
      setErrorMessage(
        "Something went wrong while generating the answer. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
          Feedback intelligence
        </p>

        <h1 className="mt-3 flex items-center gap-3 text-3xl font-bold tracking-tight text-white">
          <MessageCircleQuestion className="text-cyan-400" size={30} />
          Ask LOOP
        </h1>

        <p className="mt-3 text-slate-400">
          Ask questions about your customer feedback.
        </p>
      </div>

      <div className="mt-8">
        <AskLoopInput
          isLoading={isLoading}
          onQuestionChange={setQuestion}
          onSubmit={handleSubmit}
          question={question}
        />
      </div>

      {isLoading && (
        <div className="mt-6 flex justify-center">
          <LoadingState message="Analyzing feedback..." />
        </div>
      )}

      {errorMessage && (
        <p className="mt-6 rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default AskLoop;