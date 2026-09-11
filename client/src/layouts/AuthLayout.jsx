import { RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10">
      <section className="w-full max-w-md">
        <Link className="mb-8 flex items-center justify-center gap-3" to="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
            <RotateCcw size={22} strokeWidth={3} />
          </span>
          <span className="text-2xl font-bold tracking-tight text-white">LOOP</span>
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/30 sm:p-8">
          {children}
        </div>
      </section>
    </main>
  );
}

export default AuthLayout;