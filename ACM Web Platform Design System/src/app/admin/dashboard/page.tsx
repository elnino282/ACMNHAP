"use client";

import { useEffect, useMemo, useState } from "react";
import {
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

type DashboardStats = {
    summary: {
        totalUsers: number;
        totalFarms: number;
        totalPlots: number;
        totalSeasons: number;
    };
    userRoleCounts: Array<{ role: string; total: number }>;
    userStatusCounts: Array<{ status: string; total: number }>;
    seasonStatusCounts: Array<{ status: string; total: number }>;
    riskySeasons: Array<{
        seasonId: number;
        seasonName: string;
        farmName: string;
        plotName: string;
        status: string;
        incidentCount: number;
        overdueTaskCount: number;
        riskScore: number;
    }>;
    inventoryHealth: Array<{
        farmId: number;
        farmName: string;
        expiredCount: number;
        expiringSoonCount: number;
        totalAtRisk: number;
    }>;
};

type ApiResponse<T> = {
    status: number;
    code: string;
    message: string;
    result: T;
};

const NAV_ITEMS = [
    "Overview",
    "Farms",
    "Seasons",
    "Tasks",
    "Inventory",
    "Incidents",
    "Reports",
];

const PIE_COLORS = ["#1B4332", "#2D6A4F", "#40916C", "#74C69D", "#B7E4C7"];

const mockStats: DashboardStats = {
    summary: {
        totalUsers: 1284,
        totalFarms: 214,
        totalPlots: 962,
        totalSeasons: 487,
    },
    userRoleCounts: [
        { role: "ADMIN", total: 12 },
        { role: "FARMER", total: 1078 },
        { role: "EXPERT", total: 194 },
    ],
    userStatusCounts: [
        { status: "ACTIVE", total: 1201 },
        { status: "INACTIVE", total: 83 },
    ],
    seasonStatusCounts: [
        { status: "PLANNED", total: 98 },
        { status: "ACTIVE", total: 176 },
        { status: "COMPLETED", total: 186 },
        { status: "CANCELLED", total: 27 },
    ],
    riskySeasons: [
        {
            seasonId: 41,
            seasonName: "Dry Season 2025",
            farmName: "North Ridge Farm",
            plotName: "Plot A-12",
            status: "ACTIVE",
            incidentCount: 6,
            overdueTaskCount: 4,
            riskScore: 10,
        },
        {
            seasonId: 33,
            seasonName: "Wet Season 2024",
            farmName: "Green Valley",
            plotName: "Plot B-03",
            status: "ACTIVE",
            incidentCount: 4,
            overdueTaskCount: 3,
            riskScore: 7,
        },
        {
            seasonId: 58,
            seasonName: "Autumn Trial 2024",
            farmName: "Sunrise Acres",
            plotName: "Plot C-07",
            status: "PLANNED",
            incidentCount: 2,
            overdueTaskCount: 4,
            riskScore: 6,
        },
        {
            seasonId: 27,
            seasonName: "Highland Crop 2024",
            farmName: "Riverbend Farm",
            plotName: "Plot D-21",
            status: "ACTIVE",
            incidentCount: 3,
            overdueTaskCount: 2,
            riskScore: 5,
        },
        {
            seasonId: 16,
            seasonName: "Early Spring 2024",
            farmName: "Meadow Plains",
            plotName: "Plot E-02",
            status: "COMPLETED",
            incidentCount: 1,
            overdueTaskCount: 3,
            riskScore: 4,
        },
    ],
    inventoryHealth: [
        {
            farmId: 7,
            farmName: "Green Valley",
            expiredCount: 6,
            expiringSoonCount: 12,
            totalAtRisk: 18,
        },
        {
            farmId: 3,
            farmName: "North Ridge Farm",
            expiredCount: 2,
            expiringSoonCount: 9,
            totalAtRisk: 11,
        },
        {
            farmId: 11,
            farmName: "Sunrise Acres",
            expiredCount: 0,
            expiringSoonCount: 5,
            totalAtRisk: 5,
        },
    ],
};

async function fetchDashboardStats(): Promise<DashboardStats> {
    const response = await fetch("/api/admin/dashboard-stats", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
    }

    const payload = (await response.json()) as ApiResponse<DashboardStats> | DashboardStats;
    return "result" in payload ? payload.result : payload;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const data = await fetchDashboardStats();
                if (active) {
                    setStats(data);
                    setNote(null);
                }
            } catch (error) {
                if (active) {
                    setStats(mockStats);
                    setNote("Live data unavailable. Showing demo metrics.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        load();
        return () => {
            active = false;
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Loading dashboard...
                </div>
            </div>
        );
    }

    const data = stats ?? mockStats;
    const summary = data.summary ?? {
        totalUsers: 0,
        totalFarms: 0,
        totalPlots: 0,
        totalSeasons: 0,
    };

    const userDistribution = useMemo(
        () =>
            (data.userRoleCounts || []).map((item) => ({
                name: item.role,
                value: item.total,
            })),
        [data.userRoleCounts],
    );

    const seasonStatus = useMemo(
        () =>
            (data.seasonStatusCounts || []).map((item) => ({
                status: item.status,
                total: item.total,
            })),
        [data.seasonStatusCounts],
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F7F8F2] via-white to-[#E9F3E6] text-slate-900">
            <div className="flex">
                <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:justify-between lg:sticky lg:top-0 lg:h-screen bg-white/80 backdrop-blur border-r border-slate-200/70 px-6 py-8">
                    <div className="space-y-10">
                        <div>
                            <div className="text-xs tracking-[0.3em] uppercase text-emerald-600 font-semibold">
                                Admin Core
                            </div>
                            <div className="mt-3 text-lg font-semibold text-slate-900">
                                Agriculture Ops
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                                System monitoring center
                            </p>
                        </div>

                        <nav className="space-y-2 text-sm">
                            {NAV_ITEMS.map((item, index) => (
                                <div
                                    key={item}
                                    className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                                        index === 0
                                            ? "bg-emerald-50 text-emerald-800 font-semibold"
                                            : "text-slate-600 hover:bg-slate-100/70"
                                    }`}
                                >
                                    <span>{item}</span>
                                    {index === 0 && (
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-700">
                                            Live
                                        </span>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                        <div className="font-semibold">Daily Snapshot</div>
                        <p className="mt-1 text-emerald-800/80">
                            Review risk signals and expiring inventory.
                        </p>
                    </div>
                </aside>

                <main className="flex-1 px-6 py-8 lg:px-10">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                                Admin Dashboard
                            </p>
                            <h1 className="text-3xl font-semibold text-slate-900">
                                Agriculture Management System
                            </h1>
                            <p className="mt-2 text-slate-600">
                                Real-time visibility into farms, seasons, and operational risk.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300">
                                Export Report
                            </button>
                            <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
                                Review Alerts
                            </button>
                        </div>
                    </div>

                    {note && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                            {note}
                        </div>
                    )}

                    <nav className="mt-6 flex gap-2 overflow-x-auto text-sm lg:hidden">
                        {NAV_ITEMS.map((item, index) => (
                            <span
                                key={item}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 ${
                                    index === 0
                                        ? "bg-emerald-600 text-white"
                                        : "bg-white text-slate-600 border border-slate-200"
                                }`}
                            >
                                {item}
                            </span>
                        ))}
                    </nav>

                    <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                            { label: "Total Users", value: summary.totalUsers },
                            { label: "Total Farms", value: summary.totalFarms },
                            { label: "Total Plots", value: summary.totalPlots },
                            { label: "Total Seasons", value: summary.totalSeasons },
                        ].map((card) => (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm"
                            >
                                <div className="text-sm text-slate-500">{card.label}</div>
                                <div className="mt-3 text-2xl font-semibold text-slate-900">
                                    {Number(card.value || 0).toLocaleString()}
                                </div>
                                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-emerald-600">
                                    Live
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="mt-8 grid gap-6 xl:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm xl:col-span-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Season Status
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Current distribution of season lifecycles
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={seasonStatus} margin={{ left: 0, right: 16 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                        <XAxis dataKey="status" tick={{ fill: "#475569", fontSize: 12 }} />
                                        <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#2D6A4F" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
                            <h2 className="text-lg font-semibold text-slate-900">
                                User Distribution
                            </h2>
                            <p className="text-sm text-slate-500">
                                Role balance across the platform
                            </p>
                            <div className="mt-6 h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={userDistribution}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={3}
                                        >
                                            {userDistribution.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${entry.name}`}
                                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 grid gap-6 xl:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Top 5 Risky Seasons
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Incident and overdue task exposure
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium">Season</th>
                                            <th className="px-3 py-2 text-left font-medium">Farm</th>
                                            <th className="px-3 py-2 text-left font-medium">Incidents</th>
                                            <th className="px-3 py-2 text-left font-medium">Overdue</th>
                                            <th className="px-3 py-2 text-left font-medium">Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.riskySeasons?.length ? (
                                            data.riskySeasons.map((season) => (
                                                <tr
                                                    key={season.seasonId}
                                                    className="border-t border-slate-200/70"
                                                >
                                                    <td className="px-3 py-2">
                                                        <div className="font-semibold text-slate-900">
                                                            {season.seasonName}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {season.plotName}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-600">
                                                        {season.farmName}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-600">
                                                        {season.incidentCount}
                                                    </td>
                                                    <td className="px-3 py-2 text-slate-600">
                                                        {season.overdueTaskCount}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                                                season.riskScore >= 8
                                                                    ? "bg-red-100 text-red-700"
                                                                    : season.riskScore >= 5
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : "bg-emerald-100 text-emerald-700"
                                                            }`}
                                                        >
                                                            {season.riskScore}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    className="px-3 py-6 text-center text-slate-500"
                                                    colSpan={5}
                                                >
                                                    No risky seasons found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Expiring Inventory
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Items reaching expiry within 7 days
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-100 text-slate-600">
                                        <tr>
                                            <th className="px-3 py-2 text-left font-medium">Farm</th>
                                            <th className="px-3 py-2 text-left font-medium">Expiring</th>
                                            <th className="px-3 py-2 text-left font-medium">Expired</th>
                                            <th className="px-3 py-2 text-left font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.inventoryHealth?.length ? (
                                            data.inventoryHealth.map((item) => {
                                                const rowClass =
                                                    item.expiredCount > 0
                                                        ? "bg-red-50 text-red-900"
                                                        : item.expiringSoonCount > 0
                                                        ? "bg-amber-50 text-amber-900"
                                                        : "bg-emerald-50 text-emerald-900";

                                                return (
                                                    <tr
                                                        key={item.farmId}
                                                        className={`border-t border-slate-200/70 ${rowClass}`}
                                                    >
                                                        <td className="px-3 py-2 font-semibold">
                                                            {item.farmName}
                                                        </td>
                                                        <td className="px-3 py-2">{item.expiringSoonCount}</td>
                                                        <td className="px-3 py-2">{item.expiredCount}</td>
                                                        <td className="px-3 py-2">{item.totalAtRisk}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td
                                                    className="px-3 py-6 text-center text-slate-500"
                                                    colSpan={4}
                                                >
                                                    No expiring inventory detected.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
