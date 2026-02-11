import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ApparelCard } from "../../components/ApparelCard";
import { deleteItem, getMyItems } from "../../api/apparel.api";
import { Apparel, ApparelApi, mapApparelApiToUi } from "../../types";

export function MyItemsSection() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Apparel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMyItems = async () => {
    try {
      setError(null);
      setLoading(true);

      const res = await getMyItems();
      const apiItems = (res.data || []) as unknown as ApparelApi[];
      const uiItems = apiItems.map(mapApparelApiToUi);

      setItems(uiItems);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load your items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyItems();
  }, []);

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await deleteItem(deleteId);
      closeDelete();
      await loadMyItems();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-xl border border-brand-100 bg-white shadow-lg p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">My Items</h2>
          <p className="mt-1 text-xs text-gray-600">
            Manage your posted items
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadMyItems} isLoading={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-gray-500">
          Loading your items...
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No items yet.
        </div>
      ) : (
        <div className="mt-6 grid 
                        grid-cols-2 
                        sm:grid-cols-3 
                        lg:grid-cols-4 
                        xl:grid-cols-5 
                        gap-4">
          {items.map((item) => (
            <div key={item.id} className="max-w-[240px] mx-auto w-full">
              <ApparelCard
                item={item}
                showOwner={false}
                showEdit
                showDelete
                onEdit={() => navigate(`/items/${item.id}/edit`)}
                onDelete={() => openDelete(item.id)}
                onOpenDetails={() => navigate(`/items/${item.id}`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeDelete} />

          <div className="relative w-full max-w-md rounded-2xl border border-brand-100 bg-white shadow-2xl p-6">
            <h3 className="text-base font-extrabold text-gray-900">
              Delete this item?
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              This will permanently remove the item.
              <br />
              <span className="text-red-700 font-semibold">
                This cannot be undone.
              </span>
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={closeDelete} disabled={deleting}>
                Cancel
              </Button>

              <Button
                variant="ghost"
                className="border border-red-200 text-red-700 hover:bg-red-50"
                onClick={confirmDelete}
                isLoading={deleting}
              >
                Yes, delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
