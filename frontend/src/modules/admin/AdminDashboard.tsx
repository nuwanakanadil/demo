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
      <div className="p-8 text-center text-gray-500 py-20">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          Failed to load dashboard data. Please try again.
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
    { name: "Total Users", value: data.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Total Items", value: data.totalItems, icon: ShoppingBag, color: "text-brand-600", bg: "bg-brand-100" },
    { name: "Total Swaps", value: data.totalSwaps, icon: Repeat, color: "text-indigo-600", bg: "bg-indigo-100" },
    { name: "Total Reviews", value: data.totalReviews, icon: Star, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Platform metrics and overview</p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((item, index) => (
          <div
            key={item.name}
            className="rounded-xl border border-brand-100 bg-white shadow-lg p-6 flex flex-col items-center justify-center hover:shadow-xl transition-shadow"
          >
            <div className={`p-3 rounded-full mb-4 ${item.bg} ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">
              {item.name}
            </p>
            <h2 className={`text-4xl font-extrabold mt-2 text-gray-900`}>
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="rounded-xl border border-brand-100 bg-white shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-gray-900">Platform Overview</h2>
            <p className="text-sm text-gray-500">Breakdown of platform metrics by category</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#429172" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-xl border border-brand-100 bg-white shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-gray-900">Distribution Overview</h2>
            <p className="text-sm text-gray-500">Proportional breakdown of all entities</p>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
