function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <span
        aria-label="Loading"
        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400"
      />
      <span>{message}</span>
    </div>
  );
}

export default LoadingState;