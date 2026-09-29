import { useState } from "react";
import { importCsv } from "../../services/feedbackService.js";

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

function CsvImport({ onComplete, onClose }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Choose a CSV file before uploading.");

      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const importResult = await importCsv(file);

      setResult(importResult);
      await onComplete(importResult);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to import CSV."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-lg font-semibold text-white">Import CSV</h2>
      <p className="mt-1 text-sm text-slate-400">
        Required columns: content, channel, customer_label, created_at.
      </p>

      {!result ? (
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <input
            accept=".csv,text/csv"
            className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-100 hover:file:bg-slate-700"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            type="file"
          />

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
              {isSubmitting ? "Uploading..." : "Upload CSV"}
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
      ) : (
        <div className="mt-5">
          <h3 className="font-medium text-emerald-300">CSV Import Completed</h3>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Total Rows</dt>
              <dd className="mt-1 font-semibold text-white">{result.totalRows}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Imported</dt>
              <dd className="mt-1 font-semibold text-emerald-300">
                {result.importedRows}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Failed</dt>
              <dd className="mt-1 font-semibold text-rose-300">
                {result.failedRows}
              </dd>
            </div>
          </dl>

          {result.failures.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-medium text-slate-200">Failed rows</h4>
              <ul className="mt-2 space-y-1 text-sm text-rose-300">
                {result.failures.map((failure) => (
                  <li key={`${failure.row}-${failure.reason}`}>
                    Row {failure.row} — {failure.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            className="mt-6 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200"
            onClick={onClose}
            type="button"
          >
            Done
          </button>
        </div>
      )}
    </section>
  );
}

export default CsvImport;