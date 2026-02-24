import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";

interface Item {
  _id: string;
  title: string;
  category: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/items");

      const itemsData = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setItems(itemsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleBlockItem = async (id: string) => {
    try {
      await axios.patch(`/api/admin/items/${id}`);
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10">Loading items...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manage Items</h1>

      <input
        type="text"
        placeholder="Search items..."
        className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
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
                  <tr key={item._id} className="border-t">
                    <td className="p-4">{item.title}</td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4">
                      {item.isBlocked ? (
                        <Badge className="bg-red-500 text-white">Blocked</Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white">Active</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant={item.isBlocked ? "primary" : "danger"}
                        onClick={() => toggleBlockItem(item._id)}
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
    </div>
  );
}
