import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

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
            Your account is authenticated.
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
    </div>
  );
}

export default Dashboard;