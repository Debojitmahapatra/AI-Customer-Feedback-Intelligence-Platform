import { BarChart3, Inbox, Lightbulb,MessageCircleQuestion, RotateCcw, Users, Layers3} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", icon: BarChart3, to: "/dashboard" },
  { label: "Feedback Inbox", icon: Inbox, to: "/inbox" },
  { label: "Themes", icon: Layers3, to: "/themes" },
  { label: "Ask LOOP", icon: MessageCircleQuestion, to: "/ask" },
  { label: "Members", icon: Users, to: "/members" },
];

const placeholderItems = [{ label: "Insights", icon: Lightbulb }];

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
          {navigationItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-cyan-400/10 font-medium text-cyan-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`
              }
              key={label}
              to={to}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {placeholderItems.map(({ label, icon: Icon }) => (
            <span
              className="flex shrink-0 cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600"
              key={label}
            >
              <Icon size={18} />
              {label}
            </span>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

export default AppLayout;