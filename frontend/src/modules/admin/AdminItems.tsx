import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  isBlocked: boolean;
  createdAt: string;
  images: {
    url: string;
    public_id: string;
  }[];
}

export default function AdminItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ---------------- FETCH ITEMS ----------------
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/items");
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ---------------- BLOCK / UNBLOCK ----------------
  const toggleBlockItem = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/items/${id}/block`, {
        block: !currentStatus,
      });

      fetchItems();
      setSelectedItem(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // ---------------- FILTER ----------------
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <p className="text-center mt-10">Loading items...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Items</h1>

      {/* ================= SEARCH ================= */}
      <input
        type="text"
        placeholder="Search items..."
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
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{item.title}</td>

                    <td className="p-4">{item.category}</td>

                    <td className="p-4">
                      <Badge
                        className={
                          item.isBlocked
                            ? "bg-red-500 text-white"
                            : "bg-green-500 text-white"
                        }
                      >
                        {item.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </td>

                    <td className="p-4 flex gap-2">
                      <Button size="sm" onClick={() => setSelectedItem(item)}>
                        View
                      </Button>

                      <Button
                        size="sm"
                        variant={item.isBlocked ? "primary" : "danger"}
                        onClick={() =>
                          toggleBlockItem(item._id, item.isBlocked)
                        }
                      >
                        {item.isBlocked ? "Unblock" : "Block"}
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
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold">Item Details</h2>

            <div>
              <strong>Title:</strong> {selectedItem.title}
            </div>
            <div>
              <strong>Description:</strong> {selectedItem.description}
            </div>
            <div>
              <strong>Category:</strong> {selectedItem.category}
            </div>
            <div>
              <strong>Size:</strong> {selectedItem.size}
            </div>
            <div>
              <strong>Condition:</strong> {selectedItem.condition}
            </div>
            {selectedItem.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {selectedItem.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt="item"
                    className="w-full h-40 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div>
              <strong>Status:</strong>{" "}
              {selectedItem.isBlocked ? "Blocked" : "Active"}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant={selectedItem.isBlocked ? "primary" : "danger"}
                onClick={() =>
                  toggleBlockItem(selectedItem._id, selectedItem.isBlocked)
                }
              >
                {selectedItem.isBlocked ? "Unblock" : "Block"}
              </Button>

              <Button variant="ghost" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
