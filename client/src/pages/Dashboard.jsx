import {
  AlertTriangle,
  ArrowRight,
  Bot,
  FileText,
  Inbox,
  Sparkles,
  Tags,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getFeedback } from "../services/feedbackService.js";
import {
  getThemeSpikes,
  getThemeSummary,
  getThemeTrends,
} from "../services/themeService.js";

const sentimentColors = {
  positive: "#34d399",
  neutral: "#94a3b8",
  negative: "#fb7185",
};

const getSentimentBadgeClass = (sentiment) => {
  if (sentiment === "negative") {
    return "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20";
  }

  if (sentiment === "positive") {
    return "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20";
  }

  return "bg-slate-400/10 text-slate-300 ring-1 ring-slate-400/20";
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

function MetricCard({ label, value, description, icon: Icon, tone = "cyan" }) {
  const tones = {
    cyan: "border-cyan-400/20 bg-cyan-400/5 text-cyan-300",
    rose: "border-rose-400/20 bg-rose-400/5 text-rose-300",
    amber: "border-amber-400/20 bg-amber-400/5 text-amber-300",
    emerald: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
  };

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <span className={`rounded-lg border p-2.5 ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
    </article>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [themes, setThemes] = useState([]);
  const [spikes, setSpikes] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [themeTrends, setThemeTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const [themeData, spikeData, feedbackData, trendData] =
          await Promise.all([
            getThemeSummary({ limit: 6 }),
            getThemeSpikes(),
            getFeedback({ page: 1, limit: 5 }),
            getThemeTrends({ interval: "day" }),
          ]);

        setThemes(themeData);
        setSpikes(spikeData);
        setRecentFeedback(feedbackData.feedback);
        setTotalFeedback(feedbackData.pagination.totalItems);
        setThemeTrends(trendData);
      } catch {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const highestRiskTheme = useMemo(() => {
    if (themes.length === 0) {
      return null;
    }

    return [...themes]
      .filter((theme) => theme.count >= 2)
      .sort(
        (firstTheme, secondTheme) =>
          secondTheme.negativePercentage - firstTheme.negativePercentage,
      )[0];
  }, [themes]);

  const sentimentData = useMemo(() => {
    const totals = themes.reduce(
      (result, theme) => ({
        positive: result.positive + theme.positive,
        neutral: result.neutral + theme.neutral,
        negative: result.negative + theme.negative,
      }),
      { positive: 0, neutral: 0, negative: 0 },
    );

    return [
      { name: "Positive", value: totals.positive, color: sentimentColors.positive },
      { name: "Neutral", value: totals.neutral, color: sentimentColors.neutral },
      { name: "Negative", value: totals.negative, color: sentimentColors.negative },
    ].filter((item) => item.value > 0);
  }, [themes]);

  const trendData = useMemo(() => {
    const groupedByDate = new Map();

    themeTrends.forEach((item) => {
      const current = groupedByDate.get(item.date) || {
        date: item.date,
        mentions: 0,
      };

      current.mentions += item.count;
      groupedByDate.set(item.date, current);
    });

    return [...groupedByDate.values()];
  }, [themeTrends]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading dashboard intelligence..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-6">
          <h1 className="text-xl font-semibold text-white">
            Dashboard data could not be loaded
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
            Feedback intelligence
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Welcome back, {user.name}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Monitor customer sentiment, emerging issues, and the themes that
            need attention.
          </p>
        </div>

        <Link
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          to="/ask"
        >
          <Bot size={18} />
          Ask LOOP
        </Link>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total feedback"
          value={totalFeedback}
          description="Feedback records in this workspace"
          icon={Inbox}
        />
        <MetricCard
          label="Top theme"
          value={themes[0]?.theme || "No data"}
          description={
            themes[0]
              ? `${themes[0].count} mentions across customer feedback`
              : "Classify feedback to see themes"
          }
          icon={Tags}
          tone="emerald"
        />
        <MetricCard
          label="Highest-risk theme"
          value={highestRiskTheme?.theme || "No risk found"}
          description={
            highestRiskTheme
              ? `${highestRiskTheme.negativePercentage}% negative sentiment`
              : "Not enough classified feedback yet"
          }
          icon={AlertTriangle}
          tone="rose"
        />
        <MetricCard
          label="Emerging issues"
          value={spikes.length}
          description="Theme spikes detected in the recent period"
          icon={TrendingUp}
          tone="amber"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-5">
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 xl:col-span-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Theme sentiment breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Sentiment distribution for the most-mentioned themes.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200"
              to="/themes"
            >
              View themes <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-6 h-80">
            {themes.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No classified feedback is available yet.
              </p>
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <BarChart
                  data={themes}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 10, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} stroke="#1e293b" />
                  <XAxis
                    allowDecimals={false}
                    stroke="#64748b"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    type="number"
                  />
                  <YAxis
                    dataKey="theme"
                    stroke="#64748b"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    type="category"
                    width={95}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#f8fafc" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="positive"
                    fill={sentimentColors.positive}
                    name="Positive"
                    stackId="sentiment"
                  />
                  <Bar
                    dataKey="neutral"
                    fill={sentimentColors.neutral}
                    name="Neutral"
                    stackId="sentiment"
                  />
                  <Bar
                    dataKey="negative"
                    fill={sentimentColors.negative}
                    name="Negative"
                    radius={[0, 4, 4, 0]}
                    stackId="sentiment"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold text-white">
            Sentiment signal
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Across the top customer-feedback themes.
          </p>

          <div className="mt-4 h-56">
            {sentimentData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No sentiment data available.
              </p>
            ) : (
              <ResponsiveContainer height="100%" width="100%">
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={sentimentData}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={4}
                  >
                    {sentimentData.map((item) => (
                      <Cell fill={item.color} key={item.name} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            {sentimentData.map((item) => (
              <div
                className="rounded-lg bg-slate-950/50 px-3 py-2 text-center"
                key={item.name}
              >
                <p className="text-lg font-semibold text-white">{item.value}</p>
                <p className="text-xs" style={{ color: item.color }}>
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Feedback-topic trend
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Daily customer-theme mentions. A rising line means more customer
              feedback is being classified into themes.
            </p>
          </div>
          <TrendingUp className="text-cyan-300" size={22} />
        </div>

        <div className="mt-6 h-72">
          {trendData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-slate-500">
              Not enough feedback data to show a trend yet.
            </p>
          ) : (
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#64748b"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  dataKey="mentions"
                  fill="url(#trendGradient)"
                  name="Theme mentions"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Emerging issues
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Themes with a significant recent increase.
              </p>
            </div>
            <AlertTriangle className="text-amber-300" size={21} />
          </div>

          <div className="mt-5 space-y-3">
            {spikes.length === 0 ? (
              <p className="rounded-lg bg-slate-950/50 px-4 py-5 text-sm text-slate-500">
                No major feedback spikes detected right now.
              </p>
            ) : (
              spikes.map((spike) => (
                <Link
                  className="flex items-center justify-between gap-4 rounded-lg border border-amber-400/15 bg-amber-400/5 p-4 transition hover:border-amber-300/40"
                  key={spike.theme}
                  to={`/themes/${encodeURIComponent(spike.theme)}`}
                >
                  <div>
                    <p className="font-medium capitalize text-white">
                      {spike.theme}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {spike.currentCount} recent mentions vs{" "}
                      {spike.previousCount} previously
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-amber-300">
                    {spike.changePercentage === null
                      ? "New spike"
                      : `+${spike.changePercentage}%`}
                  </span>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent feedback
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest feedback received in this workspace.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200"
              to="/inbox"
            >
              Inbox <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5 divide-y divide-slate-800">
            {recentFeedback.length === 0 ? (
              <p className="rounded-lg bg-slate-950/50 px-4 py-5 text-sm text-slate-500">
                No feedback has been added yet.
              </p>
            ) : (
              recentFeedback.map((feedback) => (
                <Link
                  className="block py-4 transition hover:bg-slate-800/40"
                  key={feedback.id}
                  to={`/inbox/${feedback.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="line-clamp-2 text-sm leading-6 text-slate-200">
                      {feedback.content}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getSentimentBadgeClass(
                        feedback.sentiment,
                      )}`}
                    >
                      {feedback.sentiment || "pending"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>{feedback.channel}</span>
                    <span>•</span>
                    <span>{formatDate(feedback.createdAt)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          className="group rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 transition hover:border-cyan-300/50"
          to="/ask"
        >
          <Bot className="text-cyan-300" size={22} />
          <h2 className="mt-4 font-semibold text-white">Ask LOOP</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Ask AI what customers are saying about a problem or feature.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-cyan-300">
            Ask a question <ArrowRight size={16} />
          </span>
        </Link>

        <Link
          className="group rounded-xl border border-violet-400/20 bg-violet-400/5 p-5 transition hover:border-violet-300/50"
          to="/reports"
        >
          <FileText className="text-violet-300" size={22} />
          <h2 className="mt-4 font-semibold text-white">VoC reports</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Generate an AI-supported Voice-of-Customer report with evidence.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-300">
            View reports <ArrowRight size={16} />
          </span>
        </Link>

        <Link
          className="group rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-5 transition hover:border-emerald-300/50"
          to="/inbox"
        >
          <Sparkles className="text-emerald-300" size={22} />
          <h2 className="mt-4 font-semibold text-white">Manage feedback</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review feedback, update status, and reclassify AI results.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-300">
            Open inbox <ArrowRight size={16} />
          </span>
        </Link>
      </section>
    </div>
  );
}

export default Dashboard;