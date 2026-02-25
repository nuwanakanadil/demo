import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminDashboard();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  if (!data) {
    return (
      <p className="p-6 text-red-500 font-semibold">
        Failed to load dashboard data
      </p>
    );
  }

  // Convert API data → chart format
  const chartData = [
    { name: "Users", value: data.totalUsers },
    { name: "Items", value: data.totalItems },
    { name: "Swaps", value: data.totalSwaps },
    { name: "Reviews", value: data.totalReviews },
  ];

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-green-700">
        Admin Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {chartData.map((item) => (
          <Card
            key={item.name}
            className="shadow-md border-l-4 border-green-600"
          >
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 text-sm uppercase tracking-wide">
                {item.name}
              </p>
              <h2 className="text-3xl font-bold text-green-600 mt-2">
                {item.value}
              </h2>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <Card className="shadow-md">
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
                <Bar dataKey="value" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
