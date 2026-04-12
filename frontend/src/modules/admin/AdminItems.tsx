import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { TablePagination } from "../../components/ui/TablePagination";
import { useToast } from "../../components/ui/ToastProvider";
import { TextSearchInput } from "../../components/ui/TextSearchInput";
import { StateDisplay } from "../../components/ui/StateDisplay";
import { AdminDialog } from "../../components/ui/AdminDialog";
import { Tag, PackageSearch, AlertTriangle, ShieldCheck, X, Image as ImageIcon, Shirt } from "lucide-react";

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

const ITEMS_PER_PAGE = 10;
const CONTROL_CLASS =
  "rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30";

export default function AdminItems() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [blockedFilter, setBlockedFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [saveViewName, setSaveViewName] = useState("");
  const [savedViews, setSavedViews] = useState<Array<{ name: string; blocked: string; category: string }>>(() => {
    try {
      const raw = localStorage.getItem("adminItemsSavedViews");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const toast = useToast();

  // ---------------- FETCH ITEMS ----------------
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/items", {
        params: {
          limit: 1000,
          ...(blockedFilter !== "" ? { blocked: blockedFilter } : {}),
          ...(categoryFilter ? { category: categoryFilter } : {}),
        },
      });
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setBlockedFilter(params.get("blocked") ?? "");
    setCategoryFilter(params.get("category") ?? "");
  }, [location.search]);

  useEffect(() => {
    fetchItems();
    setSelectedItemIds([]);
  }, [blockedFilter, categoryFilter]);

  // ---------------- BLOCK / UNBLOCK ----------------
  const toggleBlockItem = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/items/${id}/block`, {
        block: !currentStatus,
      });

      fetchItems();
      setSelectedItem(null);
      toast.success(currentStatus ? "Item unblocked" : "Item blocked", "Status was updated successfully.");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Update failed", "Could not update item status.");
    }
  };

  const bulkBlockItems = async (block: boolean) => {
    if (selectedItemIds.length === 0) return;
    try {
      await api.post("/admin/items/bulk-block", { itemIds: selectedItemIds, block });
      await fetchItems();
      setSelectedItemIds([]);
    } catch (err) {
      console.error(err);
      toast.error("Bulk action failed", "Could not update selected items.");
    }
  };

  const saveCurrentView = () => {
    setSaveViewName("");
    setShowSaveViewModal(true);
  };

  const confirmSaveCurrentView = () => {
    const name = saveViewName.trim();
    if (!name) {
      toast.info("View name required", "Please enter a name for this saved view.");
      return;
    }
    const next = [...savedViews, { name, blocked: blockedFilter, category: categoryFilter }];
    setSavedViews(next);
    localStorage.setItem("adminItemsSavedViews", JSON.stringify(next));
    setShowSaveViewModal(false);
  };

  const applySavedView = (name: string) => {
    const found = savedViews.find((v) => v.name === name);
    if (!found) return;
    const params = new URLSearchParams();
    if (found.blocked !== "") params.set("blocked", found.blocked);
    if (found.category) params.set("category", found.category);
    navigate(`/admin/items${params.toString() ? `?${params.toString()}` : ""}`);
  };

  // ---------------- FILTER ----------------
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = filteredItems.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Apparels & Items</h1>
          <p className="text-neutral-500 mt-1">Monitor, moderate, and review user-listed apparels.</p>
          {blockedFilter === "true" && (
            <p className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              Filter: Blocked items only
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* ================= SEARCH ================= */}
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex flex-wrap items-center gap-3">
            <TextSearchInput
              placeholder="Search items by title..."
              value={search}
              onChange={setSearch}
            />
            <select
              value={blockedFilter}
              onChange={(e) => {
                const value = e.target.value;
                const params = new URLSearchParams(location.search);
                if (value === "") params.delete("blocked");
                else params.set("blocked", value);
                navigate(`/admin/items${params.toString() ? `?${params.toString()}` : ""}`);
              }}
              className={CONTROL_CLASS}
            >
              <option value="">All statuses</option>
              <option value="true">Blocked</option>
              <option value="false">Active</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => {
                const value = e.target.value;
                const params = new URLSearchParams(location.search);
                if (!value) params.delete("category");
                else params.set("category", value);
                navigate(`/admin/items${params.toString() ? `?${params.toString()}` : ""}`);
              }}
              className={CONTROL_CLASS}
            >
              <option value="">All categories</option>
              <option value="TOP">Top</option>
              <option value="BOTTOM">Bottom</option>
              <option value="DRESS">Dress</option>
              <option value="OUTERWEAR">Outerwear</option>
              <option value="SHOES">Shoes</option>
              <option value="ACCESSORY">Accessory</option>
              <option value="OTHER">Other</option>
            </select>
            <Button variant="outline" onClick={saveCurrentView}>Save View</Button>
            <select
              defaultValue=""
              onChange={(e) => applySavedView(e.target.value)}
              className={CONTROL_CLASS}
            >
              <option value="">Saved views</option>
              {savedViews.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
            <Button variant="outline" disabled={selectedItemIds.length === 0} onClick={() => bulkBlockItems(true)}>Bulk Block</Button>
            <Button variant="outline" disabled={selectedItemIds.length === 0} onClick={() => bulkBlockItems(false)}>Bulk Unblock</Button>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          {loading ? (
            <StateDisplay type="loading" title="Loading items..." />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={paginatedItems.length > 0 && paginatedItems.every((i) => selectedItemIds.includes(i._id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItemIds((prev) => Array.from(new Set([...prev, ...paginatedItems.map((i) => i._id)])));
                        } else {
                          setSelectedItemIds((prev) => prev.filter((id) => !paginatedItems.some((i) => i._id === id)));
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category & Size</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <StateDisplay
                        type="empty"
                        title="No items found"
                        description="Try another search term or clear filters."
                        icon={<PackageSearch className="w-12 h-12 stroke-[1.5] text-neutral-300" />}
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => (
                    <tr key={item._id} className="hover:bg-brand-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItemIds((prev) => Array.from(new Set([...prev, item._id])));
                            } else {
                              setSelectedItemIds((prev) => prev.filter((id) => id !== item._id));
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                            {item.images?.length > 0 ? (
                              <img
                                src={item.images[0].url}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
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

        <TablePagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
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
                            <img
                              src={img.url}
                              alt="item"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
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

      {/* ================= SAVE VIEW MODAL ================= */}
      {showSaveViewModal && (
        <AdminDialog
          open={showSaveViewModal}
          onClose={() => setShowSaveViewModal(false)}
          title="Save current view"
          subtitle="Save active filters as a reusable preset."
          size="sm"
          zIndexClassName="z-[60]"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowSaveViewModal(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={confirmSaveCurrentView} className="rounded-xl">Save View</Button>
            </div>
          }
        >
          <input
            type="text"
            value={saveViewName}
            onChange={(e) => setSaveViewName(e.target.value)}
            placeholder="e.g. Blocked shoes"
            className={`w-full ${CONTROL_CLASS}`}
            autoFocus
          />
        </AdminDialog>
      )}
    </div>
  );
}
