function EmptyState({ title, description }) {
  return (
    <section className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </section>
  );
}

export default EmptyState;