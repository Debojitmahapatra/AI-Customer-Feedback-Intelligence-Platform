import { BarChart3, Lightbulb, MessageSquareText, PanelLeft, RotateCcw } from "lucide-react";

const navigationItems = [
  { label: "Overview", icon: PanelLeft, active: true },
  { label: "Feedback", icon: MessageSquareText },
  { label: "Insights", icon: Lightbulb },
  { label: "Reports", icon: BarChart3 },
];

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 lg:flex">
      <aside className="border-b border-slate-800 bg-slate-900/60 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
            <RotateCcw size={20} strokeWidth={3} />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-white">LOOP</p>
            <p className="text-xs text-slate-400">Feedback intelligence</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:overflow-visible">
          {navigationItems.map(({ label, icon: Icon, active }) => (
            <button
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-cyan-400/10 font-medium text-cyan-300"
                  : "cursor-not-allowed text-slate-500"
              }`}
              disabled={!active}
              key={label}
              type="button"
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

export default AppLayout;