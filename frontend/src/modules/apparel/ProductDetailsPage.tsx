import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { Star, MessageCircle, ArrowLeft } from "lucide-react";
import { getItemById } from "../../api/apparel.api";
import {
  addOwnerReview,
  getOwnerReviews,
  OwnerReview,
} from "../../api/ownerReview.api";

type ProductOwner = {
  id: string;
  name: string;
};

type ProductDetails = {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  size: string;
  condition: "New" | "Used";
  status: "available" | "unavailable";
  owner: ProductOwner;
  description: string;
};

export function ProductDetailsPage() {
  /* --------------------------------------------------
     ROUTE + NAVIGATION
     - id comes from /items/:id route
     - navigate is used for back button + opening chat page
  -------------------------------------------------- */
  const { id } = useParams();
  const navigate = useNavigate();

  /* --------------------------------------------------
     FALLBACK IMAGE
     - Used when item has no images, or the image fails to load
  -------------------------------------------------- */
  const placeholderImg = "https://placehold.co/800x800/png";

  /* --------------------------------------------------
     ITEM LOADING STATE
     - loadingItem: controls loading UI while fetching item details
     - itemError: displays an error banner if the fetch fails
  -------------------------------------------------- */
  const [loadingItem, setLoadingItem] = useState(true);
  const [itemError, setItemError] = useState<string | null>(null);

  /* --------------------------------------------------
     PRODUCT STATE (UI-FRIENDLY)
     - Initialized with placeholders so UI can render immediately
     - Updated after successful API response
  -------------------------------------------------- */
  const [product, setProduct] = useState<ProductDetails>({
    id: id || "unknown",
    name: "Loading...",
    imageUrl: placeholderImg,
    category: "Unknown",
    size: "N/A",
    condition: "Used",
    status: "available",
    owner: { id: "owner_unknown", name: "Unknown Owner" },
    description: "",
  });

  /* --------------------------------------------------
     OWNER REVIEWS STATE (REAL DATA)
     - ownerReviews: list of reviews for this owner
     - ownerAvg: average rating number
     - ownerCount: number of reviews
     - loadingReviews: loading UI for reviews section
     - reviewsError: error message banner for reviews API failures
  -------------------------------------------------- */
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [ownerReviews, setOwnerReviews] = useState<OwnerReview[]>([]);
  const [ownerAvg, setOwnerAvg] = useState(0);
  const [ownerCount, setOwnerCount] = useState(0);

  /* --------------------------------------------------
     ADD REVIEW FORM STATE
     - rating/comment: values from the user input
     - submitting: loading state for submit button
     - submitError: validation/API errors displayed above form
  -------------------------------------------------- */
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* --------------------------------------------------
     LOAD OWNER REVIEWS
     - Calls API and updates:
       • ownerReviews list
       • ownerAvg rating
       • ownerCount
     - Handles error + loading UI states
  -------------------------------------------------- */
  const loadOwnerReviews = async (ownerId: string) => {
    try {
      setReviewsError(null);
      setLoadingReviews(true);

      const res = await getOwnerReviews(ownerId);

      setOwnerReviews(res.data.reviews || []);
      setOwnerAvg(res.data.avgRating || 0);
      setOwnerCount(res.data.count || 0);
    } catch (err: any) {
      setReviewsError(
        err?.response?.data?.message || "Failed to load owner reviews"
      );
    } finally {
      setLoadingReviews(false);
    }
  };

  /* --------------------------------------------------
     LOAD ITEM DETAILS (AND THEN OWNER REVIEWS)
     - Steps:
       1) validate item id
       2) fetch item details from backend
       3) normalize data fields (title/images/availability/owner)
       4) update product UI state
       5) fetch owner reviews using ownerId
  -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      // If route param missing, show a clean error state
      if (!id) {
        setItemError("Invalid item id");
        setLoadingItem(false);
        return;
      }

      try {
        setItemError(null);
        setLoadingItem(true);

        // Fetch item from backend
        const res = await getItemById(id);
        const data = res.data;

        // Choose first image if available, otherwise fallback placeholder
        const img =
          (Array.isArray(data.images) && data.images.length > 0
            ? data.images[0].url
            : undefined) || placeholderImg;

        // Item title/name fallback handling
        const title = data.title || data.name || "Unnamed Item";

        // Availability fallback (default true if backend doesn't send)
        const isAvailable =
          typeof data.isAvailable === "boolean" ? data.isAvailable : true;

        // Owner id/name mapping supports multiple backend field formats
        const ownerId =
          data.owner?.id || data.owner?._id || data.ownerId || "owner_unknown";
        const ownerName = data.owner?.name || data.ownerName || "Unknown Owner";

        // Create UI-friendly object with consistent property names
        const nextProduct: ProductDetails = {
          id: (data.id || data._id || id) as string,
          name: title,
          imageUrl: img,
          category: data.category || "Unknown",
          size: data.size || "N/A",
          condition: (data.condition as "New" | "Used") || "Used",
          status: isAvailable ? "available" : "unavailable",
          owner: { id: ownerId, name: ownerName },
          description: data.description || "No description provided.",
        };

        // Update product UI state
        setProduct(nextProduct);

        // ✅ Load real owner reviews (if ownerId is valid)
        if (ownerId && ownerId !== "owner_unknown") {
          await loadOwnerReviews(ownerId);
        } else {
          // If owner not found, clear review UI states
          setOwnerReviews([]);
          setOwnerAvg(0);
          setOwnerCount(0);
          setLoadingReviews(false);
        }
      } catch (err: any) {
        setItemError(
          err?.response?.data?.message || "Failed to load item details"
        );
      } finally {
        setLoadingItem(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* --------------------------------------------------
     OPEN CHAT
     - Navigates to the chat page for the selected item and owner
  -------------------------------------------------- */
  const handleChat = () => {
    navigate(`/chat/${product.id}/${product.owner.id}`);
  };

  /* --------------------------------------------------
     SUBMIT OWNER REVIEW
     - Validates:
       • review comment required
       • owner must exist
     - Sends API request to store review for owner (not item)
     - Clears form after success
     - Reloads owner reviews to show new one immediately
  -------------------------------------------------- */
  const handleAddOwnerReview = async () => {
    if (!id) return;

    const clean = comment.trim();

    // Require a written review (not empty spaces)
    if (!clean) {
      setSubmitError("Please write a review.");
      return;
    }

    // Ensure owner exists (avoid submitting for unknown owner)
    if (!product.owner.id || product.owner.id === "owner_unknown") {
      setSubmitError("Owner not found for this item.");
      return;
    }

    try {
      setSubmitError(null);
      setSubmitting(true);

      // ✅ Save review for OWNER (not for item)
      await addOwnerReview(product.owner.id, product.id, rating, clean);

      // Reset form fields after successful submit
      setComment("");
      setRating(5);

      // ✅ Refresh list immediately
      await loadOwnerReviews(product.owner.id);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* --------------------------------------------------
          TOP BAR
          - Back button to item list
          - Small breadcrumb text
        -------------------------------------------------- */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/items")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-sm text-gray-500">Item details</div>
      </div>

      {/* Item error banner */}
      {itemError && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {itemError}
        </div>
      )}

      {/* --------------------------------------------------
          MAIN CONTENT
          - Loading state while item is fetched
          - Otherwise show item details layout + owner reviews
        -------------------------------------------------- */}
      {loadingItem ? (
        <div className="py-20 text-center text-gray-500">Loading details...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Item details + reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* ITEM CARD */}
            <Card className="border border-brand-100 shadow-lg overflow-hidden">
              {/* Image section */}
              <div className="w-full bg-gray-100 relative p-4 sm:p-6">
                <div className="mx-auto max-w-md sm:max-w-lg">
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // If image fails, fallback to placeholder
                        (e.currentTarget as HTMLImageElement).src =
                          placeholderImg;
                      }}
                    />
                  </div>
                </div>

                {/* Condition badge (New/Used) */}
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={product.condition === "New" ? "success" : "default"}
                  >
                    {product.condition}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Title + owner + chat button */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">
                      {product.name}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                      Owner:{" "}
                      <span className="font-medium text-gray-900">
                        {product.owner.name}
                      </span>
                    </p>
                  </div>

                  {/* Open chat with owner */}
                  <Button variant="primary" onClick={handleChat}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                </div>

                {/* Item attributes */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-medium text-gray-500">
                      Category
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {product.category}
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-medium text-gray-500">Size</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {product.size}
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-medium text-gray-500">
                      Status
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {product.status === "available"
                        ? "Available"
                        : "Unavailable"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <div className="text-xs font-medium text-gray-500">
                    Description
                  </div>
                  <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ✅ OWNER REVIEWS SECTION */}
            <Card className="border border-brand-100 shadow-lg">
              <CardContent className="p-6">
                {/* Reviews header + avg rating */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">
                      Reviews & Ratings
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Ratings for{" "}
                      <span className="font-medium text-gray-900">
                        {product.owner.name}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-brand-600" />
                    <div className="text-sm font-semibold text-gray-900">
                      {ownerAvg}
                    </div>
                    <div className="text-xs text-gray-500">({ownerCount})</div>
                  </div>
                </div>

                {/* ADD REVIEW FORM */}
                <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
                  <div className="text-sm font-semibold text-gray-900">
                    Review this owner
                  </div>

                  {/* Submit validation/API error */}
                  {submitError && (
                    <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {submitError}
                    </div>
                  )}

                  {/* Rating + textarea */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                    <div className="sm:col-span-1">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Rating
                      </div>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Good</option>
                        <option value={3}>3 - OK</option>
                        <option value={2}>2 - Bad</option>
                        <option value={1}>1 - Very bad</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="text-xs font-medium text-gray-500 mb-1">
                        Review
                      </div>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your experience with this owner..."
                        className="w-full min-h-[90px] rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleAddOwnerReview}
                      isLoading={submitting}
                      disabled={!comment.trim()}
                    >
                      Add Review
                    </Button>
                  </div>

                  {/* Helpful note to user */}
                  <div className="mt-2 text-xs text-gray-500">
                    Note: Submitting again for the same item updates your review.
                  </div>
                </div>

                {/* REVIEW LIST */}
                <div className="mt-6">
                  {/* Reviews error banner */}
                  {reviewsError && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {reviewsError}
                    </div>
                  )}

                  {/* Reviews loading / empty / list state */}
                  {loadingReviews ? (
                    <div className="py-10 text-center text-gray-500">
                      Loading reviews...
                    </div>
                  ) : ownerReviews.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">
                      No reviews yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 overflow-hidden">
                      {ownerReviews.map((r) => (
                        <div key={r.id} className="px-4 py-4 bg-white">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                {/* Reviewer name */}
                                <div className="text-sm font-semibold text-gray-900">
                                  {r.reviewer.name}
                                </div>

                                {/* Star rating */}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < r.rating
                                          ? "text-brand-600"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              {/* Which item this review is related to */}
                              <div className="mt-1 text-xs text-gray-500">
                                Related item:{" "}
                                <span className="font-medium">
                                  {r.item.title || "Item"}
                                </span>
                              </div>

                              {/* Review text */}
                              <p className="mt-2 text-sm text-gray-700">
                                {r.comment}
                              </p>
                            </div>

                            {/* Review date */}
                            <div className="shrink-0 text-xs text-gray-500">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: Owner summary card */}
          <div className="lg:col-span-1">
            <Card className="border border-brand-100 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-extrabold text-gray-900">Owner</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Contact and trust signals
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-medium text-gray-500">
                      Name
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {product.owner.name}
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                    <div className="text-xs font-medium text-gray-500">
                      Average rating
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {ownerAvg} / 5
                    </div>
                  </div>

                  {/* Quick access to chat */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleChat}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with owner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}