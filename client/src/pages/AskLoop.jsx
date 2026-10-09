import { MessageCircleQuestion } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AskHistoryList from "../components/ask-loop/AskHistoryList.jsx";
import AskLoopAnswer from "../components/ask-loop/AskLoopAnswer.jsx";
import AskLoopInput from "../components/ask-loop/AskLoopInput.jsx";
import LoadingState from "../components/LoadingState.jsx";
import {
  askQuestion,
  getAskHistory,
  refreshAskHistory,
} from "../services/askLoopService.js";

const GENERIC_ERROR_MESSAGE =
  "Something went wrong while generating the answer. Please try again.";

function AskLoop() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [refreshingId, setRefreshingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [answerData, setAnswerData] = useState(null);
  const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try {
      setIsHistoryLoading(true);

      const data = await getAskHistory({
        page: 1,
        limit: 10,
      });

      setHistory(data.history);
    } catch {
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!question.trim() || isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      setAnswerData(null);

      const data = await askQuestion({
        question: question.trim(),
      });

      setAnswerData(data);

      if (data.historyId) {
        await loadHistory();
      }
    } catch {
      setErrorMessage(GENERIC_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenHistory = (historyItem) => {
    setQuestion(historyItem.question);
    setErrorMessage("");
    setAnswerData({
      question: historyItem.question,
      answer: historyItem.answer,
      citations: historyItem.citations,
      retrievedCount: historyItem.retrievedCount,
      historyId: historyItem.id,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRefreshHistory = async (historyId) => {
    try {
      setRefreshingId(historyId);
      setErrorMessage("");

      const data = await refreshAskHistory(historyId);

      setAnswerData(data);
      setQuestion(data.question);

      if (data.history) {
        setHistory((currentHistory) =>
          currentHistory.map((item) =>
            item.id === historyId ? data.history : item,
          ),
        );
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      setErrorMessage(GENERIC_ERROR_MESSAGE);
    } finally {
      setRefreshingId("");
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

      {answerData && !isLoading && (
        <AskLoopAnswer answerData={answerData} />
      )}

      <AskHistoryList
        history={history}
        isLoading={isHistoryLoading}
        onOpen={handleOpenHistory}
        onRefresh={handleRefreshHistory}
        refreshingId={refreshingId}
      />
    </div>
  );
}

export default AskLoop;