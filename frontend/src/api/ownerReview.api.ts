import api from "./axios";

/* --------------------------------------------------
   OWNER REVIEW TYPE
   - Represents a single review written for an owner
   - id: unique review ID
   - rating: numeric rating (1–5)
   - comment: review text
   - createdAt: timestamp of submission
   - reviewer: user who wrote the review
   - item: item related to this review
-------------------------------------------------- */
export type OwnerReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: { id: string; name: string };
  item: { id: string; title: string };
};

/* --------------------------------------------------
   OWNER REVIEW SUMMARY TYPE
   - Used when fetching all reviews for an owner
   - avgRating: calculated average rating
   - count: total number of reviews
   - reviews: list of individual reviews
-------------------------------------------------- */
export type OwnerReviewSummary = {
  avgRating: number;
  count: number;
  reviews: OwnerReview[];
};

/* --------------------------------------------------
   GET OWNER REVIEWS
   - Calls backend:
       GET /users/:ownerId/reviews
   - Returns:
       • average rating
       • review count
       • full review list
   - Used in ProductDetailsPage to display
     owner reputation + review history
-------------------------------------------------- */
export async function getOwnerReviews(ownerId: string) {
  const res = await api.get(`/users/${ownerId}/reviews`);
  return res.data as { success: boolean; data: OwnerReviewSummary };
}

/* --------------------------------------------------
   ADD OWNER REVIEW
   - Calls backend:
       POST /users/:ownerId/reviews
   - Sends:
       • itemId (which item this review relates to)
       • rating (1–5)
       • comment (text review)
   - Backend should:
       • prevent duplicate reviews per item per user
       • update existing review if user submits again
       • recalculate owner average rating
-------------------------------------------------- */
export async function addOwnerReview(
  ownerId: string,
  itemId: string,
  rating: number,
  comment: string
) {
  const res = await api.post(`/users/${ownerId}/reviews`, {
    itemId,
    rating,
    comment,
  });

  return res.data as { success: boolean; data: OwnerReview };
}