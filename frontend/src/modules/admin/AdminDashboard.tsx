import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { getAdminDashboard } from "../../api/admin.api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
      <div className="p-6">
        <p className="text-lg font-medium text-gray-600">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-semibold">
          Failed to load dashboard data
        </p>
      </div>
    );
  }

  const chartData = [
    { name: "Users", value: data.totalUsers },
    { name: "Items", value: data.totalItems },
    { name: "Swaps", value: data.totalSwaps },
    { name: "Reviews", value: data.totalReviews },
  ];

  return (
    <div className="p-6 space-y-8">

      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-700">
          Admin Dashboard
        </h1>

        <Button onClick={fetchDashboard}>
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {chartData.map((item) => (
          <Card
            key={item.name}
            className="shadow-lg hover:shadow-xl transition duration-300 border-t-4 border-green-600"
          >
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 text-sm uppercase tracking-wide">
                {item.name}
              </p>
              <h2 className="text-4xl font-bold text-green-600 mt-3">
                {item.value}
              </h2>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-700 text-xl font-semibold">
            Platform Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
