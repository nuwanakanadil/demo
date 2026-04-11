import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Navbar } from "../../components/ui/Navbar";
import { Footer } from "../../layout/Footer";
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
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <Input placeholder="Search stats..." className="mt-2" />
          </CardHeader>
          <CardContent>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {summaryCards.map((item, index) => (
                <Card key={item.name} className="flex flex-col items-center justify-center p-6">
                  <div className={`p-3 rounded-full mb-4 ${item.bg} ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{item.name}</p>
                  <h2 className="text-4xl font-extrabold mt-2 text-gray-900">{item.value}</h2>
                  <Badge variant={index % 2 === 0 ? "success" : "warning"} className="mt-2">{item.name}</Badge>
                </Card>
              ))}
            </div>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#429172" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Distribution Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
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
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
