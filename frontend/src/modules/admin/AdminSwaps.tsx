import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

interface Swap {
  _id: string;
  requester: string;
  owner: string;
  status: string;
  createdAt: string;
}

export default function AdminSwaps() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/swaps");

      const swapData = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setSwaps(swapData);
    } catch (err) {
      console.error(err);
      setError("Failed to load swaps");
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading swaps...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Swap Management</h1>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Requester</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {swaps.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center">
                    No swaps found
                  </td>
                </tr>
              ) : (
                swaps.map((swap) => (
                  <tr key={swap._id} className="border-t">
                    <td className="p-4">{swap.requester}</td>
                    <td className="p-4">{swap.owner}</td>
                    <td className="p-4">
                      <Badge>{swap.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
