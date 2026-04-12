import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ApparelCard } from "../../components/ApparelCard";
import { deleteItem, getMyItems } from "../../api/apparel.api";
import { Apparel, ApparelApi, mapApparelApiToUi } from "../../types";

export function MyItemsSection() {
  const navigate = useNavigate();

  /* --------------------------------------------------
     ITEMS STATE
     - items: UI-ready list of items posted by the current user
     - loading: shows spinner/loading text while fetching from API
     - error: shows API failure message
  -------------------------------------------------- */
  const [items, setItems] = useState<Apparel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
     DELETE MODAL STATE
     - deleteOpen: controls visibility of confirmation modal
     - deleteId: stores which item is selected to delete
     - deleting: disables buttons + shows loading on delete confirm
  -------------------------------------------------- */
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* --------------------------------------------------
     LOAD MY ITEMS
     - Calls API to fetch the current user's items
     - Converts backend response format (ApparelApi) into UI format (Apparel)
     - Sets loading + error states properly for user feedback
  -------------------------------------------------- */
  const loadMyItems = async () => {
    try {
      // reset any previous error
      setError(null);

      // show loading state
      setLoading(true);

      // request user's items from backend
      const res = await getMyItems();

      // ensure response is treated as ApparelApi[] safely
      const apiItems = (res.data || []) as unknown as ApparelApi[];

      // map API models to UI models for consistent frontend display
      const uiItems = apiItems.map(mapApparelApiToUi);

      // update UI list
      setItems(uiItems);
    } catch (err: any) {
      // show backend message if exists, otherwise fallback text
      setError(err?.response?.data?.message || "Failed to load your items");
    } finally {
      // stop loading state
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     INITIAL LOAD
     - Runs once when component mounts
     - Fetches current user's items automatically
  -------------------------------------------------- */
  useEffect(() => {
    loadMyItems();
  }, []);

  /* --------------------------------------------------
     OPEN DELETE MODAL
     - Stores the selected item id
     - Opens the confirmation modal
  -------------------------------------------------- */
  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  /* --------------------------------------------------
     CLOSE DELETE MODAL
     - Prevents closing while deleting is in progress
     - Resets deleteId so next delete is clean
  -------------------------------------------------- */
  const closeDelete = () => {
    if (deleting) return;
    setDeleteOpen(false);
    setDeleteId(null);
  };

  /* --------------------------------------------------
     CONFIRM DELETE
     - Calls backend delete endpoint for the selected item
     - Closes the modal
     - Reloads the user's items so UI updates instantly
  -------------------------------------------------- */
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);

      // API call to permanently delete the item
      await deleteItem(deleteId);

      // close modal after successful delete
      closeDelete();

      // refresh list so removed item disappears from UI
      await loadMyItems();
    } catch (err: any) {
      // show backend error if available
      setError(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  let content: React.ReactNode;

  if (loading) {
    content = <div className="py-10 text-center text-neutral-500">Loading your items...</div>;
  } else if (items.length === 0) {
    content = <div className="py-10 text-center text-neutral-500">No items yet.</div>;
  } else {
    content = (
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* --------------------------------------------------
            ITEM CARDS
            - Each ApparelCard shows item details
            - showEdit/showDelete enable action buttons on card
            - onEdit: navigate to edit page
            - onDelete: open delete confirmation modal
            - onOpenDetails: navigate to item detail page
          -------------------------------------------------- */}
        {items.map((item) => (
          <div key={item.id} className="mx-auto w-full max-w-[280px]">
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
    );
  }

  return (
    <div className="rounded-[28px] border border-white/75 bg-gradient-to-b from-white/90 to-neutral-50/80 p-5 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.22)] backdrop-blur-sm">
      {/* --------------------------------------------------
          HEADER
          - Title + subtitle
          - Refresh button to manually reload the item list
        -------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-neutral-900">My Items</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Manage your posted items
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="sm:self-start"
          onClick={loadMyItems}
          isLoading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* --------------------------------------------------
          ERROR BANNER
          - Displays any load/delete API errors
        -------------------------------------------------- */}
      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 shadow-[0_10px_30px_-24px_rgba(190,18,60,0.35)]">
          {error}
        </div>
      )}

      {/* --------------------------------------------------
          CONTENT STATES
          - Loading state
          - Empty state
          - Items grid (when items exist)
        -------------------------------------------------- */}
      {content}

      {/* --------------------------------------------------
          DELETE MODAL
          - Opens when user clicks delete on an item
          - Confirms permanent deletion (irreversible)
          - Backdrop click closes modal (unless deleting)
        -------------------------------------------------- */}
      {deleteOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close delete item dialog"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={closeDelete}
          />

          <div className="relative w-full max-w-md rounded-[28px] border border-white/80 bg-white/95 p-6 shadow-[0_30px_100px_-44px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <h3 className="text-base font-extrabold text-neutral-900">
              Delete this item?
            </h3>

            <p className="mt-2 text-sm text-neutral-600">
              This will permanently remove the item.
              <br />
              <span className="text-red-700 font-semibold">
                This cannot be undone.
              </span>
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={closeDelete}
                disabled={deleting}
              >
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