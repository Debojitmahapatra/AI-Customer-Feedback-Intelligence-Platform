function FeedbackFilters({ filters, onChange }) {
  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <section className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:grid-cols-[1fr_180px_180px]">
      <input
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
        name="search"
        onChange={handleChange}
        placeholder="Search feedback or customer..."
        type="search"
        value={filters.search}
      />

      <select
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
        name="channel"
        onChange={handleChange}
        value={filters.channel}
      >
        <option value="">All channels</option>
        <option value="SUPPORT">Support</option>
        <option value="APP_REVIEW">App review</option>
        <option value="SURVEY">Survey</option>
        <option value="SALES">Sales</option>
        <option value="SOCIAL">Social</option>
        <option value="COMMUNITY">Community</option>
        <option value="OTHER">Other</option>
      </select>

      <select
        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
        name="status"
        onChange={handleChange}
        value={filters.status}
      >
        <option value="">All statuses</option>
        <option value="NEW">New</option>
        <option value="REVIEWED">Reviewed</option>
        <option value="ACTIONED">Actioned</option>
      </select>
    </section>
  );
}

export default FeedbackFilters;