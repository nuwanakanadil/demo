import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";
import { TablePagination } from "../../components/ui/TablePagination";
import { TextSearchInput } from "../../components/ui/TextSearchInput";
import { StateDisplay } from "../../components/ui/StateDisplay";
import { AdminDialog } from "../../components/ui/AdminDialog";
import { Star, MessagesSquare, Trash2, UserCircle, PackageSearch } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  revieweeId: {
    _id: string;
    name: string;
    email: string;
  };
  reviewerId: {
    _id: string;
    name: string;
    email: string;
  };
  itemId: {
    _id: string;
    title: string;
    images?: { url: string; public_id: string }[];
  } | null;
}

const ITEMS_PER_PAGE = 10;

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // ---------------- FETCH REVIEWS ----------------
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reviews?limit=1000");
      setReviews(res.data?.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load reviews", err);
      setError("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ---------------- DELETE WITH CONFIRM ----------------
  const deleteReview = async (id: string) => {
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // ---------------- FILTER ----------------
  const filteredReviews = reviews.filter(
    (review) =>
      review.itemId?.title?.toLowerCase().includes(search.toLowerCase()) ||
      review.reviewerId?.email?.toLowerCase().includes(search.toLowerCase()) ||
      review.revieweeId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedReviews = filteredReviews.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">User Reviews</h1>
          <p className="text-neutral-500 mt-1">Moderate user-to-user feedback and system ratings.</p>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl flex items-center justify-center">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        {/* ================= SEARCH BAR ================= */}
        <div className="p-6 border-b border-neutral-100 bg-neutral-50/50">
          <TextSearchInput
            placeholder="Search by item name or email..."
            value={search}
            onChange={setSearch}
            className="max-w-md min-w-0"
          />
        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-x-auto">
          {loading ? (
            <StateDisplay type="loading" title="Loading reviews..." />
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Linked Item</th>
                  <th className="px-6 py-4">Reviewer</th>
                  <th className="px-6 py-4">Reviewee</th>
                  <th className="px-6 py-4">Feedback</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <StateDisplay
                        type="empty"
                        title="No reviews found"
                        description="Try another search term."
                        icon={<MessagesSquare className="w-12 h-12 stroke-[1.5] text-neutral-300" />}
                        className="py-0"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedReviews.map((review) => (
                    <tr key={review._id} className="hover:bg-brand-50/50 transition-colors group">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {review.itemId?.images?.[0] ? (
                            <img 
                              src={review.itemId.images[0].url} 
                              alt={review.itemId?.title || "Item"} 
                              loading="lazy"
                              decoding="async"
                              className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200">
                              <PackageSearch className="w-5 h-5 text-neutral-400" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-neutral-900 max-w-[150px] truncate">
                              {review.itemId?.title || "No Item Data"}
                            </span>
                            {!review.itemId?.title && (
                              <span className="text-[10px] text-neutral-400 font-medium">Deleted or missing</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <UserCircle className="w-5 h-5 text-neutral-300" />
                          <span className="font-medium text-neutral-900 max-w-[150px] truncate">{review.reviewerId?.name || "Unknown"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-neutral-600">
                          <UserCircle className="w-5 h-5 text-brand-300" />
                          <span className="font-medium text-neutral-900 max-w-[150px] truncate">{review.revieweeId?.name || "Unknown"}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} />
                            ))}
                            <span className="ml-2 font-bold text-neutral-900">{review.rating}.0</span>
                          </div>
                          <p className="text-xs text-neutral-500 italic line-clamp-2 max-w-xs block">
                            "{review.comment}"
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="danger"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 shadow-sm p-2 h-auto rounded-xl"
                          onClick={() => setDeleteTargetId(review._id)}
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
          totalItems={filteredReviews.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {deleteTargetId && (
        <AdminDialog
          open={Boolean(deleteTargetId)}
          onClose={() => setDeleteTargetId(null)}
          title="Delete review"
          subtitle="This action cannot be undone."
          tone="danger"
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteTargetId(null)} className="rounded-xl">Cancel</Button>
              <Button
                variant="danger"
                className="rounded-xl"
                onClick={async () => {
                  await deleteReview(deleteTargetId);
                  setDeleteTargetId(null);
                }}
              >
                Delete
              </Button>
            </div>
          }
        >
          <p className="text-sm text-neutral-600">Are you sure you want to permanently remove this review?</p>
        </AdminDialog>
      )}
    </div>
  );
}
