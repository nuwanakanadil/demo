import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getAdminDashboard } from "../../api/admin.api";
import { RefreshCw, Users, ShoppingBag, Repeat, Star, LucideIcon, ShieldAlert, TrendingUp, TrendingDown, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#0F766E", "#2563EB", "#7C3AED", "#D97706"];
const AXIS_COLOR = "#64748b";
const GRID_COLOR = "#e2e8f0";

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];
const CONTROL_CLASS =
  "rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30";

type DashboardData = {
  totalUsers: number;
  totalItems: number;
  totalSwaps: number;
  totalReviews: number;
  rangeDays: number;
  trends: {
    users: { current: number; previous: number; delta: number; deltaPct: number };
    items: { current: number; previous: number; delta: number; deltaPct: number };
    swaps: { current: number; previous: number; delta: number; deltaPct: number };
    reviews: { current: number; previous: number; delta: number; deltaPct: number };
  };
  moderationQueue: {
    blockedItems: number;
    suspendedUsers: number;
  };
  swapFunnel: {
    requested: number;
    accepted: number;
    inLogistics: number;
    completed: number;
  };
  recentActivity: Array<{
    id: string;
    type: "swap" | "moderation";
    title: string;
    description: string;
    createdAt: string;
    link: string;
  }>;
};

type SummaryCard = {
  name: string;
  value: number;
  trend: { current: number; previous: number; delta: number; deltaPct: number };
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  gradientTo: string;
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedTotalMetrics, setAnimatedTotalMetrics] = useState(0);
  const [rangeDays, setRangeDays] = useState(30);

  const chartData = data
    ? [
        { name: "Users", value: data.totalUsers },
        { name: "Items", value: data.totalItems },
        { name: "Swaps", value: data.totalSwaps },
        { name: "Reviews", value: data.totalReviews },
      ]
    : [];
  const totalMetrics = chartData.reduce((sum, item) => sum + item.value, 0);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard(rangeDays);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [rangeDays]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const durationMs = 900;
    const startValue = animatedTotalMetrics;
    const endValue = totalMetrics;
    const delta = endValue - startValue;

    if (delta === 0) return;

    let frameId: number | undefined;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = Math.round(startValue + delta * eased);

      setAnimatedTotalMetrics(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [totalMetrics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-32 text-center text-neutral-500 space-y-4">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="font-medium tracking-wide">Loading platform metrics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 flex flex-col items-center text-center space-y-2">
          <span className="text-xl font-bold text-rose-700">Oops! Data missing.</span>
          <p className="text-rose-600">
            Failed to load dashboard data. Please check your connection or backend.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100"
            onClick={fetchDashboard}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const summaryCards: SummaryCard[] = [
    {
      name: "Total Users",
      value: data.totalUsers,
      trend: data.trends.users,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      gradientTo: "to-blue-50",
    },
    {
      name: "Total Items",
      value: data.totalItems,
      trend: data.trends.items,
      icon: ShoppingBag,
      color: "text-brand-600",
      bg: "bg-brand-50",
      border: "border-brand-100",
      gradientTo: "to-brand-50",
    },
    {
      name: "Total Swaps",
      value: data.totalSwaps,
      trend: data.trends.swaps,
      icon: Repeat,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      gradientTo: "to-indigo-50",
    },
    {
      name: "Total Reviews",
      value: data.totalReviews,
      trend: data.trends.reviews,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      gradientTo: "to-amber-50",
    },
  ];

  const funnelData = [
    { name: "Requested", value: data.swapFunnel.requested },
    { name: "Accepted", value: data.swapFunnel.accepted },
    { name: "In Logistics", value: data.swapFunnel.inLogistics },
    { name: "Completed", value: data.swapFunnel.completed },
  ];

  const acceptanceRate = data.swapFunnel.requested > 0
    ? Number(((data.swapFunnel.accepted / data.swapFunnel.requested) * 100).toFixed(1))
    : 0;
  const completionRate = data.swapFunnel.accepted > 0
    ? Number(((data.swapFunnel.completed / data.swapFunnel.accepted) * 100).toFixed(1))
    : 0;

  const thresholdAlerts = [
    {
      id: "blocked-items",
      active: data.moderationQueue.blockedItems >= 10,
      severity: data.moderationQueue.blockedItems >= 20 ? "high" : "medium",
      title: "Blocked items spike",
      detail: `${data.moderationQueue.blockedItems} blocked items in queue`,
      actionLabel: "Review items",
      onClick: () => navigate("/admin/items?blocked=true"),
    },
    {
      id: "suspended-users",
      active: data.moderationQueue.suspendedUsers >= 5,
      severity: data.moderationQueue.suspendedUsers >= 12 ? "high" : "medium",
      title: "Suspended users backlog",
      detail: `${data.moderationQueue.suspendedUsers} users need follow-up`,
      actionLabel: "Review users",
      onClick: () => navigate("/admin/users?status=suspended"),
    },
    {
      id: "acceptance-rate",
      active: acceptanceRate < 45,
      severity: acceptanceRate < 30 ? "high" : "medium",
      title: "Low swap acceptance",
      detail: `Acceptance rate is ${acceptanceRate}%`,
      actionLabel: "Open swaps",
      onClick: () => navigate("/admin/swaps?status=PENDING"),
    },
    {
      id: "completion-rate",
      active: completionRate < 50,
      severity: completionRate < 35 ? "high" : "medium",
      title: "Completion drop",
      detail: `Completion rate is ${completionRate}%`,
      actionLabel: "Check logistics",
      onClick: () => navigate("/admin/swaps?stage=in-logistics"),
    },
  ].filter((x) => x.active);

  const formatRelativeTime = (iso: string) => {
    const date = new Date(iso).getTime();
    const nowTs = Date.now();
    const diff = Math.max(0, nowTs - date);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleOverviewDrilldown = (name?: string) => {
    if (!name) return;
    if (name === "Users") navigate("/admin/users");
    if (name === "Items") navigate("/admin/items");
    if (name === "Swaps") navigate("/admin/swaps");
    if (name === "Reviews") navigate("/admin/reviews");
  };

  const handleFunnelDrilldown = (name?: string) => {
    if (!name) return;
    if (name === "Requested") navigate("/admin/swaps?status=PENDING");
    if (name === "Accepted") navigate("/admin/swaps?status=ACCEPTED");
    if (name === "In Logistics") navigate("/admin/swaps?stage=in-logistics");
    if (name === "Completed") navigate("/admin/swaps?status=COMPLETED");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Admin Dashboard</CardTitle>
              <p className="mt-1 text-sm text-neutral-500">Platform health and activity in one view.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-500">Range:</label>
              <select
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value))}
                className={CONTROL_CLASS}
              >
                {RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {summaryCards.map((item, index) => {
                const trendUp = item.trend.delta >= 0;
                return (
                <Card key={item.name} className="flex flex-col items-center justify-center p-6">
                  <div className={`p-3 rounded-full mb-4 ${item.bg} ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{item.name}</p>
                  <h2 className="text-4xl font-extrabold mt-2 text-gray-900">{item.value}</h2>
                  <Badge variant={index % 2 === 0 ? "success" : "warning"} className="mt-2">{item.name}</Badge>
                  <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {trendUp ? "+" : ""}{item.trend.deltaPct}%
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">vs previous {data.rangeDays} days</p>
                </Card>
              )})}
            </div>

            {/* Moderation Queue */}
            <div className="mb-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <h3 className="text-base font-semibold text-neutral-900">Moderation Queue</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => navigate("/admin/items?blocked=true")}
                  className="rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-rose-200 hover:bg-rose-50/30"
                >
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Blocked Items</p>
                  <p className="mt-1 text-2xl font-bold text-neutral-900">{data.moderationQueue.blockedItems}</p>
                </button>
                <button
                  onClick={() => navigate("/admin/users?status=suspended")}
                  className="rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-amber-200 hover:bg-amber-50/30"
                >
                  <p className="text-xs uppercase tracking-wide text-neutral-500">Suspended Users</p>
                  <p className="mt-1 text-2xl font-bold text-neutral-900">{data.moderationQueue.suspendedUsers}</p>
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="overflow-hidden border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-50/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight text-neutral-900">Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0F766E" stopOpacity={1} />
                          <stop offset="100%" stopColor="#115e59" stopOpacity={0.88} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 6" vertical={false} />
                      <XAxis dataKey="name" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(15, 118, 110, 0.06)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #dbeafe",
                          background: "rgba(255,255,255,0.98)",
                          boxShadow: "0 10px 24px -10px rgba(15,23,42,0.28)",
                        }}
                        labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                      />
                      <Bar
                        dataKey="value"
                        fill="url(#adminBarGradient)"
                        radius={[10, 10, 0, 0]}
                        barSize={34}
                        animationDuration={900}
                        animationEasing="ease-out"
                        className="cursor-pointer"
                        onClick={(entry) => handleOverviewDrilldown(entry?.name)}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-xs text-neutral-500">Tip: click a bar to open filtered details.</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-50/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight text-neutral-900">Distribution Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={98}
                          paddingAngle={3}
                          cornerRadius={8}
                          labelLine={false}
                          dataKey="value"
                          animationDuration={950}
                          animationEasing="ease-out"
                          onClick={(entry) => handleOverviewDrilldown(entry?.name)}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #dbeafe",
                            background: "rgba(255,255,255,0.98)",
                            boxShadow: "0 10px 24px -10px rgba(15,23,42,0.28)",
                          }}
                          labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={40}
                          iconType="circle"
                          wrapperStyle={{ fontSize: "12px", color: "#475569", paddingTop: "8px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Total</p>
                      <p className="text-2xl font-extrabold text-slate-900">{animatedTotalMetrics.toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">Tip: click a slice to open the related module.</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-50/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight text-neutral-900">Swap Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={funnelData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 6" vertical={false} />
                      <XAxis dataKey="name" stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={AXIS_COLOR} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #dbeafe",
                          background: "rgba(255,255,255,0.98)",
                          boxShadow: "0 10px 24px -10px rgba(15,23,42,0.28)",
                        }}
                        labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                      />
                      <Bar dataKey="value" fill="#2563EB" radius={[10, 10, 0, 0]} barSize={34} animationDuration={900} animationEasing="ease-out" className="cursor-pointer" onClick={(entry) => handleFunnelDrilldown(entry?.name)} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-xs text-neutral-500">Tip: click a funnel stage to drill into swaps.</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="overflow-hidden border border-neutral-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight text-neutral-900 inline-flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Threshold Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {thresholdAlerts.length === 0 ? (
                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">All threshold checks are healthy right now.</p>
                  ) : (
                    <div className="space-y-3">
                      {thresholdAlerts.map((alert) => (
                        <button
                          key={alert.id}
                          onClick={alert.onClick}
                          className={`w-full rounded-xl border px-4 py-3 text-left transition ${alert.severity === "high" ? "border-rose-200 bg-rose-50/50 hover:bg-rose-50" : "border-amber-200 bg-amber-50/50 hover:bg-amber-50"}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className={`text-sm font-semibold ${alert.severity === "high" ? "text-rose-800" : "text-amber-800"}`}>{alert.title}</p>
                              <p className="mt-1 text-xs text-neutral-600">{alert.detail}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700">
                              {alert.actionLabel}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="overflow-hidden border border-neutral-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight text-neutral-900 inline-flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Live Activity Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentActivity.length === 0 ? (
                    <p className="text-sm text-neutral-500">No recent events yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.recentActivity.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => navigate(item.link)}
                          className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                              <p className="mt-1 text-xs text-neutral-600 line-clamp-2">{item.description || "No description"}</p>
                            </div>
                            <span className="text-[11px] font-medium text-neutral-500 whitespace-nowrap">{formatRelativeTime(item.createdAt)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 rounded-xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-800">
              Tracking performance for the last <span className="font-semibold">{data.rangeDays} days</span>.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}