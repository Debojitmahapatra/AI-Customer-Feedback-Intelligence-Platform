const formatChannel = (channel) =>
  channel
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

const formatDate = (dateValue) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));

function FeedbackTable({ feedback, onView }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full min-w-[780px] text-left text-sm">
        <thead className="border-b border-slate-800 text-slate-500">
          <tr>
            <th className="px-6 py-4 font-medium">Customer</th>
            <th className="px-6 py-4 font-medium">Content</th>
            <th className="px-6 py-4 font-medium">Channel</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium">Created at</th>
            <th className="px-6 py-4 text-right font-medium">Actions</th>
          </tr>
        </thead>

        <tbody>
          {feedback.map((item) => (
            <tr className="border-b border-slate-800 last:border-0" key={item.id}>
              <td className="max-w-36 px-6 py-4 text-slate-300">
                {item.customerLabel || "Anonymous"}
              </td>
              <td className="max-w-xs px-6 py-4 text-slate-200">
                <p className="line-clamp-2">{item.content}</p>
              </td>
              <td className="px-6 py-4 text-slate-400">
                {formatChannel(item.channel)}
              </td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-cyan-300">
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400">
                {formatDate(item.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className="rounded-md px-2 py-1.5 text-sm font-medium text-cyan-400 transition hover:bg-cyan-400/10 hover:text-cyan-300"
                  onClick={() => onView(item.id)}
                  type="button"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FeedbackTable;