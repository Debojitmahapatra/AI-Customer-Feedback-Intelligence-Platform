import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  deleteFeedback,
  getFeedbackById,
  updateFeedback,
} from "../services/feedbackService.js";

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

const formatChannel = (channel) =>
  channel
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (dateValue) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateValue));

function FeedbackDetails() {
  const { feedbackId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const canManageFeedback = ["ADMIN", "ANALYST"].includes(user.role);

  const loadFeedback = useCallback(async () => {
    try {
      setIsLoading(true);

      const feedbackData = await getFeedbackById(feedbackId);

      setFeedback(feedbackData);
      setFormData({
        content: feedbackData.content,
        channel: feedbackData.channel,
        customerLabel: feedbackData.customerLabel,
        status: feedbackData.status,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to load feedback."),
      });
    } finally {
      setIsLoading(false);
    }
  }, [feedbackId]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const updatedFeedback = await updateFeedback(feedbackId, formData);

      setFeedback(updatedFeedback);
      setFormData({
        content: updatedFeedback.content,
        channel: updatedFeedback.channel,
        customerLabel: updatedFeedback.customerLabel,
        status: updatedFeedback.status,
      });
      setIsEditing(false);
      setMessage({ type: "success", text: "Feedback updated successfully." });
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to update feedback."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this feedback?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteFeedback(feedbackId);
      navigate("/inbox");
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to delete feedback."),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading feedback..." />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
        <button
          className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400"
          onClick={() => navigate("/inbox")}
          type="button"
        >
          <ArrowLeft size={17} />
          Back to Inbox
        </button>
        <p className="mt-8 rounded-lg bg-rose-400/10 p-4 text-rose-300">
          {message.text || "Feedback was not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <button
        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-cyan-300"
        onClick={() => navigate("/inbox")}
        type="button"
      >
        <ArrowLeft size={17} />
        Back to Inbox
      </button>

      <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
            {formatChannel(feedback.channel)}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Feedback details
          </h1>
        </div>

        {canManageFeedback && !isEditing && (
          <div className="flex gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              <Pencil size={17} />
              Edit
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 px-4 py-2.5 text-sm font-medium text-rose-300"
              onClick={handleDelete}
              type="button"
            >
              <Trash2 size={17} />
              Delete
            </button>
          </div>
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

      {isEditing ? (
        <form
          className="mt-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900/60 p-6"
          onSubmit={handleSave}
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Feedback content
            </span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
              name="content"
              onChange={handleChange}
              required
              value={formData.content}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-200">Channel</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                name="channel"
                onChange={handleChange}
                value={formData.channel}
              >
                <option value="SUPPORT">Support</option>
                <option value="APP_REVIEW">App review</option>
                <option value="SURVEY">Survey</option>
                <option value="SALES">Sales</option>
                <option value="SOCIAL">Social</option>
                <option value="COMMUNITY">Community</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Status</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                name="status"
                onChange={handleChange}
                value={formData.status}
              >
                <option value="NEW">New</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ACTIONED">Actioned</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">
              Customer label
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
              name="customerLabel"
              onChange={handleChange}
              type="text"
              value={formData.customerLabel}
            />
          </label>

          <div className="flex gap-3">
            <button
              className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </button>
            <button
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200"
              onClick={() => setIsEditing(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <p className="whitespace-pre-wrap text-base leading-7 text-slate-200">
            {feedback.content}
          </p>

          <dl className="mt-8 grid gap-5 border-t border-slate-800 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Customer</dt>
              <dd className="mt-1 font-medium text-slate-200">
                {feedback.customerLabel || "Anonymous"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="mt-1 font-medium text-cyan-300">{feedback.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Channel</dt>
              <dd className="mt-1 font-medium text-slate-200">
                {formatChannel(feedback.channel)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Created at</dt>
              <dd className="mt-1 font-medium text-slate-200">
                {formatDate(feedback.createdAt)}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}

export default FeedbackDetails;