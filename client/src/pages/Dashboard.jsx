import { ArrowRight, LogOut, Tags } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getThemeSummary } from "../services/themeService.js";

function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [themes, setThemes] = useState([]);
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);

  useEffect(() => {
    const loadTopThemes = async () => {
      try {
        const data = await getThemeSummary({ limit: 5 });

        setThemes(data);
      } catch {
        setThemes([]);
      } finally {
        setIsLoadingThemes(false);
      }
    };

    loadTopThemes();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
            Authenticated workspace
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Welcome to LOOP
          </h1>
          <p className="mt-3 text-slate-400">
            Your feedback intelligence workspace.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-400 hover:text-rose-300"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>

      <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Account</h2>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="mt-1 font-medium text-slate-200">{user.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-1 font-medium text-slate-200">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="mt-1 font-medium text-cyan-300">{user.role}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Tags className="text-cyan-400" size={20} />
              <h2 className="text-lg font-semibold text-white">Top Themes</h2>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Most frequently mentioned customer topics.
            </p>
          </div>

          <Link
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
            to="/themes"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoadingThemes ? (
          <div className="flex min-h-40 items-center justify-center">
            <LoadingState message="Loading themes..." />
          </div>
        ) : themes.length === 0 ? (
          <p className="mt-6 rounded-lg bg-slate-950/60 px-4 py-5 text-sm text-slate-400">
            No classified feedback is available yet.
          </p>
        ) : (
          <div className="mt-6 divide-y divide-slate-800">
            {themes.map((theme, index) => (
              <Link
                className="flex items-center justify-between gap-4 py-4 transition hover:bg-slate-800/40"
                key={theme.theme}
                to={`/themes/${encodeURIComponent(theme.theme)}`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-semibold text-cyan-300">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium capitalize text-slate-100">
                      {theme.theme}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {theme.count} mention{theme.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <span
                  className={
                    theme.negativePercentage >= 50
                      ? "text-sm font-medium text-rose-300"
                      : "text-sm text-slate-400"
                  }
                >
                  {theme.negativePercentage}% negative
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;