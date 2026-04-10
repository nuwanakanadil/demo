import { useEffect, useState, useCallback } from "react";
import { Button } from "../../components/ui/Button";
import { getAdminDashboard } from "../../api/admin.api";
import { RefreshCw, Users, ShoppingBag, Repeat, Star } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#3b82f6", "#429172", "#6366f1", "#f59e0b"];

export function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch function (Reusable)
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-500 py-32 space-y-4">
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
          <p className="text-rose-600">Failed to load dashboard data. Please check your connection or backend.</p>
          <Button variant="outline" className="mt-4 border-rose-300 text-rose-700 hover:bg-rose-100" onClick={fetchDashboard}>Try Again</Button>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Users", value: data.totalUsers },
    { name: "Items", value: data.totalItems },
    { name: "Swaps", value: data.totalSwaps },
    { name: "Reviews", value: data.totalReviews },
  ];

  const summaryCards = [
    { name: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: 'border-blue-100' },
    { name: "Total Items", value: data.totalItems, icon: ShoppingBag, color: "text-brand-600", bg: "bg-brand-50", border: 'border-brand-100' },
    { name: "Total Swaps", value: data.totalSwaps, icon: Repeat, color: "text-indigo-600", bg: "bg-indigo-50", border: 'border-indigo-100' },
    { name: "Total Reviews", value: data.totalReviews, icon: Star, color: "text-amber-600", bg: "bg-amber-50", border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1">Real-time platform metrics and activity overview.</p>
        </div>

        <button 
          onClick={fetchDashboard}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-brand-200 bg-white text-brand-700 font-medium hover:bg-brand-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((item, index) => (
          <div
            key={item.name}
            className={`group rounded-3xl border ${item.border} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col relative overflow-hidden z-10`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white to-${item.bg.replace('bg-', '')} opacity-40 rounded-bl-full -z-10 transition-transform group-hover:scale-110`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${item.bg} ${item.color} shadow-inner`}>
                <item.icon className="h-6 w-6 stroke-[2.5]" />
              </div>
            </div>
            
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider mb-1">
              {item.name}
            </p>
            <h2 className="text-4xl font-black text-neutral-900 tracking-tight">
              {item.value || 0}
            </h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="rounded-3xl border border-neutral-100 bg-white shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-neutral-900">Platform Overview</h2>
            <p className="text-sm text-neutral-500">Breakdown of platform metrics by category</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#429172" radius={[8, 8, 8, 8]} barSize={48}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-3xl border border-neutral-100 bg-white shadow-sm p-8 hover:shadow-md transition-shadow">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-neutral-900">Distribution Overview</h2>
            <p className="text-sm text-neutral-500">Proportional breakdown of all entities</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
