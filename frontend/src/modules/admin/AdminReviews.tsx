import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

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
  };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // ---------------- FETCH REVIEWS ----------------
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reviews");
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review? This cannot be undone."
    );

    if (!confirmDelete) return;

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
      review.itemId?.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      review.reviewerId?.email
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      review.revieweeId?.email
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading)
    return <p className="text-center mt-10">Loading reviews...</p>;

  if (error)
    return (
      <p className="text-center text-red-500 mt-10">{error}</p>
    );

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Owner Reviews Management
      </h1>

      {/* ================= SEARCH BAR ================= */}
      <input
        type="text"
        placeholder="Search by item or email..."
        className="px-4 py-2 border rounded-lg w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= TABLE ================= */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Reviewer</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center">
                    No reviews found
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      {review.itemId?.title || "N/A"}
                    </td>

                    <td className="p-4">
                      {review.revieweeId?.name || "Unknown"}
                    </td>

                    <td className="p-4">
                      {review.reviewerId?.name || "Unknown"}
                    </td>

                    <td className="p-4">
                      ⭐ {review.rating}
                    </td>

                    <td className="p-4">
                      {review.comment}
                    </td>

                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          deleteReview(review._id)
                        }
                      >
                        Delete
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
