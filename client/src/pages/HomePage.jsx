import { CheckCircle2, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { checkApiHealth } from "../services/api.js";

function HomePage() {
  const [healthStatus, setHealthStatus] = useState({
    isLoading: true,
    isConnected: false,
    message: "",
  });

  useEffect(() => {
    const loadHealthStatus = async () => {
      try {
        const data = await checkApiHealth();

        setHealthStatus({
          isLoading: false,
          isConnected: data.success,
          message: data.message,
        });
      } catch {
        setHealthStatus({
          isLoading: false,
          isConnected: false,
          message: "Unable to reach the API.",
        });
      }
    };

    loadHealthStatus();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
        Day 1 foundation
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Close the loop on customer feedback.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
        LOOP will help teams organize feedback, discover customer themes, and turn
        insights into better product decisions.
      </p>

      <section className="mt-10 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-white">Backend status</h2>

        <div className="mt-4">
          {healthStatus.isLoading ? (
            <LoadingState message="Checking API connection..." />
          ) : (
            <div
              className={`flex items-start gap-3 rounded-lg p-4 ${
                healthStatus.isConnected
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-rose-400/10 text-rose-300"
              }`}
            >
              {healthStatus.isConnected ? (
                <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
              ) : (
                <WifiOff className="mt-0.5 shrink-0" size={19} />
              )}

              <div>
                <p className="font-medium">
                  {healthStatus.isConnected ? "API Connected" : "API Unavailable"}
                </p>
                <p className="mt-1 text-sm opacity-80">{healthStatus.message}</p>
                {healthStatus.isConnected && (
                  <p className="mt-1 text-sm opacity-80">Database Connected</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-8">
        <EmptyState
          title="Your feedback workspace is ready"
          description="Feedback collection, analysis, and reports will be added in later project days."
        />
      </div>
    </div>
  );
}

export default HomePage;