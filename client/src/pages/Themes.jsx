import { AlertTriangle, Filter, Tags, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import EmptyState from "../components/EmptyState.jsx";
import LoadingState from "../components/LoadingState.jsx";
import {
    getThemeSpikes,
    getThemeSummary,
    getThemeTrends,
} from "../services/themeService.js";

const getErrorMessage = (error, fallbackMessage) =>
    error.response?.data?.message || fallbackMessage;

const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

function Themes() {
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
    });
    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState("");
    const [interval, setInterval] = useState("day");
    const [trends, setTrends] = useState([]);
    const [spikes, setSpikes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
    const [message, setMessage] = useState("");

    const loadThemes = useCallback(async () => {
        try {
            setIsLoading(true);
            setMessage("");

            const data = await getThemeSummary({
                ...filters,
                limit: 50,
            });

            setThemes(data);

            setSelectedTheme((currentTheme) => {
                const themeStillExists = data.some(
                    (theme) => theme.theme === currentTheme,
                );

                return themeStillExists ? currentTheme : data[0]?.theme || "";
            });
        } catch (error) {
            setThemes([]);
            setSelectedTheme("");
            setMessage(getErrorMessage(error, "Unable to load themes."));
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const loadSpikes = useCallback(async () => {
        try {
            const data = await getThemeSpikes(filters);

            setSpikes(data);
        } catch (error) {
            setSpikes([]);
            setMessage(getErrorMessage(error, "Unable to load spike alerts."));
        }
    }, [filters]);

    const loadTrends = useCallback(async () => {
        if (!selectedTheme) {
            setTrends([]);
            return;
        }

        try {
            setIsAnalyticsLoading(true);

            const data = await getThemeTrends({
                ...filters,
                theme: selectedTheme,
                interval,
            });

            setTrends(data);
        } catch (error) {
            setTrends([]);
            setMessage(getErrorMessage(error, "Unable to load theme trends."));
        } finally {
            setIsAnalyticsLoading(false);
        }
    }, [filters, interval, selectedTheme]);

    useEffect(() => {
        loadThemes();
        loadSpikes();
    }, [loadSpikes, loadThemes]);

    useEffect(() => {
        loadTrends();
    }, [loadTrends]);

    const handleFilterChange = (event) => {
        setFilters((currentFilters) => ({
            ...currentFilters,
            [event.target.name]: event.target.value,
        }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
        });
    };

    return (
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
            <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
                    Feedback intelligence
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
                    Themes
                </h1>
                <p className="mt-3 text-slate-400">
                    Discover the topics customers mention most often.
                </p>
            </div>

            <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <Filter size={17} className="text-cyan-400" />
                    Date range
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <label className="flex-1 text-sm text-slate-400">
                        Start date
                        <input
                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400"
                            name="startDate"
                            onChange={handleFilterChange}
                            type="date"
                            value={filters.startDate}
                        />
                    </label>

                    <label className="flex-1 text-sm text-slate-400">
                        End date
                        <input
                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none transition focus:border-cyan-400"
                            name="endDate"
                            onChange={handleFilterChange}
                            type="date"
                            value={filters.endDate}
                        />
                    </label>

                    <button
                        className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-500"
                        onClick={clearFilters}
                        type="button"
                    >
                        Clear
                    </button>
                </div>
            </section>

            {message && (
                <p className="mt-6 rounded-lg bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
                    {message}
                </p>
            )}

            {!isLoading && spikes.length > 0 && (
                <section className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                        <AlertTriangle size={18} />
                        Theme spikes detected
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {spikes.map((spike) => (
                            <div
                                className="rounded-lg border border-amber-400/20 bg-slate-950/30 p-4"
                                key={spike.theme}
                            >
                                <p className="capitalize text-slate-100">{spike.theme}</p>
                                <p className="mt-2 text-sm text-slate-400">
                                    {spike.previousCount} to {spike.currentCount} mentions
                                </p>
                                <p className="mt-1 text-sm font-medium text-amber-300">
                                    {spike.changePercentage === null
                                        ? "New theme spike"
                                        : `${spike.changePercentage}% increase`}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {!isLoading && themes.length > 0 && (
                <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <div className="flex items-center gap-2 text-lg font-semibold text-white">
                                <TrendingUp size={19} className="text-cyan-400" />
                                Theme trend
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                Mentions over time for the selected theme.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <select
                                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                                onChange={(event) => setSelectedTheme(event.target.value)}
                                value={selectedTheme}
                            >
                                {themes.map((theme) => (
                                    <option key={theme.theme} value={theme.theme}>
                                        {theme.theme}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
                                onChange={(event) => setInterval(event.target.value)}
                                value={interval}
                            >
                                <option value="day">Daily</option>
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 h-72">
                        {isAnalyticsLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <LoadingState message="Loading trend..." />
                            </div>
                        ) : trends.length === 0 ? (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                No trend data is available for this theme.
                            </div>
                        ) : (
                            <ResponsiveContainer height="100%" width="100%">
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="themeTrendGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#94a3b8"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        stroke="#94a3b8"
                                        tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0f172a",
                                            border: "1px solid #334155",
                                            borderRadius: "8px",
                                        }}
                                        labelStyle={{ color: "#e2e8f0" }}
                                    />
                                    <Area
                                        dataKey="count"
                                        fill="url(#themeTrendGradient)"
                                        stroke="#22d3ee"
                                        strokeWidth={2}
                                        type="monotone"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </section>
            )}

            <section className="mt-6">
                {isLoading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <LoadingState message="Loading themes..." />
                    </div>
                ) : themes.length === 0 ? (
                    <EmptyState
                        description="Classify feedback first, or try a different date range."
                        title="No themes found"
                    />
                ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="bg-slate-900 text-xs uppercase tracking-wide text-slate-400">
                                    <tr>
                                        <th className="px-5 py-4">Theme</th>
                                        <th className="px-5 py-4 text-right">Mentions</th>
                                        <th className="px-5 py-4 text-right">Negative</th>
                                        <th className="px-5 py-4">First seen</th>
                                        <th className="px-5 py-4">Last seen</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                                    {themes.map((theme) => (
                                        <tr
                                            className="transition hover:bg-slate-800/60"
                                            key={theme.theme}
                                        >
                                            <td className="px-5 py-4 font-medium capitalize">
                                                <Link
                                                    className="inline-flex items-center gap-2 text-white transition hover:text-cyan-300"
                                                    to={`/themes/${encodeURIComponent(theme.theme)}`}
                                                >
                                                    <Tags size={16} className="text-cyan-400" />
                                                    {theme.theme}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4 text-right text-slate-200">
                                                {theme.count}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span
                                                    className={
                                                        theme.negativePercentage >= 50
                                                            ? "font-medium text-rose-300"
                                                            : "text-slate-300"
                                                    }
                                                >
                                                    {theme.negativePercentage}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-400">
                                                {formatDate(theme.firstSeen)}
                                            </td>
                                            <td className="px-5 py-4 text-slate-400">
                                                {formatDate(theme.lastSeen)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {!isLoading && themes.length > 0 && (
                <p className="mt-4 text-sm text-slate-500">
                    {themes.length} theme{themes.length === 1 ? "" : "s"} found
                </p>
            )}
        </div>
    );
}

export default Themes;