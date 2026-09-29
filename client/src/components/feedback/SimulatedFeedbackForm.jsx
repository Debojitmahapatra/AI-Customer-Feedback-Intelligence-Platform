import { useState } from "react";
import { createSimulatedFeedback } from "../../services/feedbackService.js";

const initialFormData = {
  content: "",
  channel: "APP_REVIEW",
  customerLabel: "",
};

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

function SimulatedFeedbackForm({ onComplete, onClose }) {
  const [formData, setFormData] = useState(initialFormData);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await createSimulatedFeedback(formData);
      setFormData(initialFormData);
      await onComplete();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Unable to send simulated feedback."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Simulate Channel Feedback</h2>
      <p className="mt-1 text-sm text-slate-400">
        Send a test feedback event from a simulated external source.
      </p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
          name="content"
          onChange={handleChange}
          placeholder="Simulated customer feedback..."
          required
          value={formData.content}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <select
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
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

          <input
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
            name="customerLabel"
            onChange={handleChange}
            placeholder="Simulated Customer"
            type="text"
            value={formData.customerLabel}
          />
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
            {errorMessage}
          </p>
        )}

        <div className="flex gap-3">
          <button
            className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Sending..." : "Send Feedback"}
          </button>
          <button
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default SimulatedFeedbackForm;