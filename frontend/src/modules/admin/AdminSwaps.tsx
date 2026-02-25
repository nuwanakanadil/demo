import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface Swap {
  _id: string;
  requester: { name: string; email: string };
  owner: { name: string; email: string };
  requestedItem: { title: string };
  offeredItem: { title: string };
  status: string;
  message: string;
  createdAt: string;
}

export default function AdminSwaps() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ---------------- FETCH ----------------
  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/swaps");
      setSwaps(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setSwaps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, []);

  // ---------------- FILTER ----------------
  const filteredSwaps = swaps.filter(
    (swap) =>
      swap.requester?.email
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      swap.owner?.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading)
    return <p className="text-center mt-10">Loading swaps...</p>;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">Swap Management</h1>

      {/* ================= SEARCH ================= */}
      <input
        type="text"
        placeholder="Search by email..."
        className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Requester</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSwaps.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    No swaps found
                  </td>
                </tr>
              ) : (
                filteredSwaps.map((swap) => (
                  <tr
                    key={swap._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      {swap.requester?.email}
                    </td>

                    <td className="p-4">
                      {swap.owner?.email}
                    </td>

                    <td className="p-4">
                      <Badge
                        className={
                          swap.status === "PENDING"
                            ? "bg-yellow-500 text-white"
                            : swap.status === "ACCEPTED"
                            ? "bg-green-500 text-white"
                            : swap.status === "REJECTED"
                            ? "bg-red-500 text-white"
                            : "bg-blue-500 text-white"
                        }
                      >
                        {swap.status}
                      </Badge>
                    </td>

                    <td className="p-4">
                      <Button
                        size="sm"
                        onClick={() => setSelectedSwap(swap)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ================= MODAL POPUP ================= */}
      {selectedSwap && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">

            <h2 className="text-xl font-bold">
              Swap Details
            </h2>

            <div>
              <strong>Status:</strong> {selectedSwap.status}
            </div>

            <div>
              <strong>Requester:</strong>{" "}
              {selectedSwap.requester?.name} (
              {selectedSwap.requester?.email})
            </div>

            <div>
              <strong>Owner:</strong>{" "}
              {selectedSwap.owner?.name} (
              {selectedSwap.owner?.email})
            </div>

            <div>
              <strong>Requested Item:</strong>{" "}
              {selectedSwap.requestedItem?.title}
            </div>

            <div>
              <strong>Offered Item:</strong>{" "}
              {selectedSwap.offeredItem?.title}
            </div>

            <div>
              <strong>Message:</strong>{" "}
              {selectedSwap.message || "No message"}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedSwap(null)}
              >
                Close
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
