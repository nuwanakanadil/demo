import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface Swap {
  _id: string;
  requester: { name: string; email: string };
  owner: { name: string; email: string };
  requestedItem: {
    title: string;
    description: string;
    images: {
      url: string;
      public_id: string;
    }[];
  };
  offeredItem: {
    title: string;
    description: string;
    images: {
      url: string;
      public_id: string;
    }[];
  };
  status: string;
  message: string;
  createdAt: string;
}

export default function AdminSwaps() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ---------------- FETCH SWAPS ----------------
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

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search by email..."
        className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* TABLE */}
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
                            ? "bg-green-600 text-white"
                            : swap.status === "REJECTED"
                            ? "bg-red-600 text-white"
                            : "bg-blue-600 text-white"
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

      {/* MODAL */}
      {selectedSwap && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">

          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-2xl font-bold">
                Swap Details
              </h2>

              <Badge
                className={
                  selectedSwap.status === "PENDING"
                    ? "bg-yellow-500 text-white px-3 py-1"
                    : selectedSwap.status === "ACCEPTED"
                    ? "bg-green-600 text-white px-3 py-1"
                    : selectedSwap.status === "REJECTED"
                    ? "bg-red-600 text-white px-3 py-1"
                    : "bg-blue-600 text-white px-3 py-1"
                }
              >
                {selectedSwap.status}
              </Badge>
            </div>

            {/* USERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold mb-2">
                  Requester
                </h3>
                <p><strong>Name:</strong> {selectedSwap.requester.name}</p>
                <p><strong>Email:</strong> {selectedSwap.requester.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold mb-2">
                  Owner
                </h3>
                <p><strong>Name:</strong> {selectedSwap.owner.name}</p>
                <p><strong>Email:</strong> {selectedSwap.owner.email}</p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Requested */}
              <div className="border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold">
                  Requested Item
                </h3>

                <p><strong>Title:</strong> {selectedSwap.requestedItem?.title}</p>
                <p><strong>Description:</strong> {selectedSwap.requestedItem?.description}</p>

                {selectedSwap.requestedItem?.images?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSwap.requestedItem.images.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt="requested"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Offered */}
              <div className="border rounded-xl p-4 space-y-3">
                <h3 className="font-semibold">
                  Offered Item
                </h3>

                <p><strong>Title:</strong> {selectedSwap.offeredItem?.title}</p>
                <p><strong>Description:</strong> {selectedSwap.offeredItem?.description}</p>

                {selectedSwap.offeredItem?.images?.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSwap.offeredItem.images.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt="offered"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGE */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">
                Message
              </h3>
              <p>{selectedSwap.message || "No message provided"}</p>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setSelectedSwap(null)}>
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
