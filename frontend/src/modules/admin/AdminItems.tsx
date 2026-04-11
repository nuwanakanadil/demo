import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { Search, Tag, PackageSearch, AlertTriangle, ShieldCheck, X, Image as ImageIcon, Shirt } from "lucide-react";

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
      const res = await api.get("/admin/items?limit=1000");
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Apparels & Items</h1>
          <p className="text-neutral-500 mt-1">Monitor, moderate, and review user-listed apparels.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* ================= SEARCH ================= */}
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search items by title..."
              className="pl-12 pr-4 py-3 w-full bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow shadow-sm outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category & Size</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-neutral-400 space-y-2">
                        <PackageSearch className="w-12 h-12 stroke-[1.5]" />
                        <p className="text-base font-medium">No items found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-brand-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                            {item.images?.length > 0 ? (
                              <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-neutral-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900">{item.title}</p>
                            <p className="text-neutral-500 text-xs line-clamp-1 max-w-[200px]">{item.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="text-neutral-700 font-medium">{item.category}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-md">
                          <Shirt className="w-3 h-3" />
                          {item.size || "Free Size"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          item.isBlocked
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {item.isBlocked ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          {item.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="px-4 py-2 text-sm font-medium text-brand-600 bg-brand-50 border border-transparent rounded-lg hover:bg-brand-100 hover:border-brand-200 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= MODAL POPUP ================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
          
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50 shrink-0">
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <PackageSearch className="w-6 h-6 text-brand-500" />
                Item Details
              </h2>
              <button onClick={() => setSelectedItem(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-2 hover:bg-neutral-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Images column */}
                  <div className="w-full md:w-1/2 space-y-3">
                    {selectedItem.images?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 aspect-square">
                        {selectedItem.images.map((img, index) => (
                          <div key={index} className={`rounded-2xl overflow-hidden border border-neutral-100 bg-neutral-50 ${index === 0 ? 'col-span-2 row-span-2 aspect-[4/3]' : 'aspect-square'}`}>
                            <img src={img.url} alt="item" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] rounded-2xl bg-neutral-100 flex items-center justify-center border border-neutral-200">
                        <ImageIcon className="w-12 h-12 text-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Details column */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-neutral-900 leading-tight">{selectedItem.title}</h3>
                      <p className="text-neutral-500 mt-2 text-sm leading-relaxed">{selectedItem.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">Category</p>
                        <p className="font-semibold text-neutral-800">{selectedItem.category}</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">Size</p>
                        <p className="font-semibold text-neutral-800">{selectedItem.size}</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 col-span-2">
                        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider mb-1">Condition</p>
                        <p className="font-semibold text-neutral-800">{selectedItem.condition}</p>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${selectedItem.isBlocked ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                       <span className="text-sm font-semibold text-neutral-600">Current Status:</span>
                       <span className={`font-bold ${selectedItem.isBlocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                         {selectedItem.isBlocked ? "Blocked by Admin" : "Active / Verified"}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3 shrink-0">
              <Button variant="ghost" onClick={() => setSelectedItem(null)} className="rounded-xl">
                Done
              </Button>
              <Button
                variant={selectedItem.isBlocked ? "primary" : "danger"}
                className={`rounded-xl flex items-center gap-2 ${selectedItem.isBlocked ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}
                onClick={() => toggleBlockItem(selectedItem._id, selectedItem.isBlocked)}
              >
                {selectedItem.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                {selectedItem.isBlocked ? "Unblock Item" : "Block Item"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
