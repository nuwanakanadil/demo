import api from "./axios";

export type OwnerReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: { id: string; name: string };
  item: { id: string; title: string };
};

export type OwnerReviewSummary = {
  avgRating: number;
  count: number;
  reviews: OwnerReview[];
};

export async function getOwnerReviews(ownerId: string) {
  const res = await api.get(`/users/${ownerId}/reviews`);
  return res.data as { success: boolean; data: OwnerReviewSummary };
}

export async function addOwnerReview(
  ownerId: string,
  itemId: string,
  rating: number,
  comment: string
) {
  const res = await api.post(`/users/${ownerId}/reviews`, { itemId, rating, comment });
  return res.data as { success: boolean; data: OwnerReview };
}
