import { useState } from "react";

const initialFormData = {
  content: "",
  channel: "SUPPORT",
  customerLabel: "",
};

function FeedbackForm({ isSubmitting, onCancel, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit(formData);
    setFormData(initialFormData);
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Create feedback</h2>
      <p className="mt-1 text-sm text-slate-400">
        Add customer feedback to your workspace inbox.
      </p>

      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">
            Feedback content
          </span>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
            name="content"
            onChange={handleChange}
            placeholder="Describe the customer feedback..."
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
            <span className="text-sm font-medium text-slate-200">
              Customer label
            </span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
              name="customerLabel"
              onChange={handleChange}
              placeholder="Customer 001"
              type="text"
              value={formData.customerLabel}
            />
          </label>
        </div>

        <div className="flex gap-3">
          <button
            className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating..." : "Create Feedback"}
          </button>

          <button
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default FeedbackForm;