import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface Review {
  _id: string;
  reviewer: string;
  comment: string;
  rating: number;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/reviews");

      const reviewData = Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      setReviews(reviewData);
    } catch (err) {
      console.error(err);
      setError("Failed to load reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id: string) => {
    try {
      await axios.delete(`/api/admin/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading reviews...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Review Management</h1>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Reviewer</th>
                <th className="p-4">Comment</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="border-t">
                    <td className="p-4">{review.reviewer}</td>
                    <td className="p-4">{review.comment}</td>
                    <td className="p-4">{review.rating}</td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteReview(review._id)}
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
