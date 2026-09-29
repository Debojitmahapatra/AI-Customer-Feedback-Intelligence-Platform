import { Inbox as InboxIcon, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import FeedbackFilters from "../components/feedback/FeedbackFilters.jsx";
import FeedbackForm from "../components/feedback/FeedbackForm.jsx";
import FeedbackTable from "../components/feedback/FeedbackTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { createFeedback, getFeedback } from "../services/feedbackService.js";

const initialFilters = {
  search: "",
  channel: "",
  status: "",
};

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

function Inbox() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [feedback, setFeedback] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const canManageFeedback = ["ADMIN", "ANALYST"].includes(user.role);

  const loadFeedback = useCallback(
    async (requestedPage = page) => {
      try {
        setIsLoading(true);

        const data = await getFeedback({
          page: requestedPage,
          limit: 20,
          ...filters,
        });

        setFeedback(data.feedback);
        setPagination(data.pagination);
      } catch (error) {
        setFeedback([]);
        setPagination(null);
        setMessage({
          type: "error",
          text: getErrorMessage(error, "Unable to load feedback."),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [filters, page],
  );

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleFiltersChange = (newFilters) => {
    setMessage({ type: "", text: "" });
    setFilters(newFilters);
    setPage(1);
  };

  const handleCreateFeedback = async (formData) => {
    setMessage({ type: "", text: "" });
    setIsSubmitting(true);

    try {
      await createFeedback(formData);

      setIsCreating(false);
      setPage(1);
      setMessage({ type: "success", text: "Feedback created successfully." });
      await loadFeedback(1);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to create feedback."),
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (nextPage) => {
    if (!pagination || nextPage < 1 || nextPage > pagination.totalPages) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
            Customer feedback
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Feedback Inbox
          </h1>
          <p className="mt-3 text-slate-400">
            Review and manage feedback from your workspace.
          </p>
        </div>

        {canManageFeedback && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            onClick={() => setIsCreating((isOpen) => !isOpen)}
            type="button"
          >
            <Plus size={18} />
            Create Feedback
          </button>
        )}
      </div>

      {message.text && (
        <p
          className={`mt-6 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {message.text}
        </p>
      )}

      {isCreating && canManageFeedback && (
        <div className="mt-8">
          <FeedbackForm
            isSubmitting={isSubmitting}
            onCancel={() => setIsCreating(false)}
            onSubmit={handleCreateFeedback}
          />
        </div>
      )}

      <div className="mt-8">
        <FeedbackFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      <section className="mt-6">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoadingState message="Loading feedback..." />
          </div>
        ) : feedback.length === 0 ? (
          <EmptyState
            description="Try changing the filters, or create the first feedback item."
            title="No feedback found"
          />
        ) : (
          <>
            <FeedbackTable
              feedback={feedback}
              onView={(feedbackId) => {
                window.location.assign(`/inbox/${feedbackId}`);
              }}
            />

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  type="button"
                >
                  Previous
                </button>

                <p className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </p>

                <button
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  type="button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {!isLoading && feedback.length > 0 && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <InboxIcon size={16} />
          {pagination?.totalItems || 0} feedback item
          {pagination?.totalItems === 1 ? "" : "s"} found
        </p>
      )}
    </div>
  );
}

export default Inbox;