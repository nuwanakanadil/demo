/* ================================
 * USER TYPES
 * ================================ */
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

/* ================================
 * UI TYPES (used by components)
 * ================================ */
export interface Apparel {
  id: string;
  name: string;
  size: string;
  condition: "New" | "Like New" | "Good" | "Fair";
  category: "Tops" | "Bottoms" | "Outerwear" | "Shoes" | "Accessories";
  imageUrl: string; // UI uses single image
  ownerId: string;
  ownerName: string;
  status: "available" | "swapped" | "pending";
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  requestedItemId: string;
  requestedItemName: string;
  offeredItemId: string;
  offeredItemName: string;

  // ✅ updated
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";

  message?: string;
  createdAt: string;
}

/* ================================
 * BACKEND / API TYPES
 * (MongoDB models)
 * ================================ */
export type ApparelCategoryApi =
  | "TOP"
  | "BOTTOM"
  | "DRESS"
  | "OUTERWEAR"
  | "SHOES"
  | "ACCESSORY"
  | "OTHER";

export type ApparelConditionApi = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "WORN";

export interface ApparelApiImage {
  url: string;
  public_id: string;
}

export interface ApparelApiOwner {
  _id: string;
  name?: string;
  email?: string;
}

export interface ApparelApi {
  _id: string;
  title: string;
  description?: string;
  category: ApparelCategoryApi;
  size: string;
  condition: ApparelConditionApi;
  images: ApparelApiImage[]; // ✅ Cloudinary objects
  owner: string | ApparelApiOwner;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/* ================================
 * MAPPERS (API → UI)
 * ================================ */
const categoryFromApi: Record<ApparelCategoryApi, Apparel["category"]> = {
  TOP: "Tops",
  BOTTOM: "Bottoms",
  DRESS: "Tops", // UI does not have Dress yet
  OUTERWEAR: "Outerwear",
  SHOES: "Shoes",
  ACCESSORY: "Accessories",
  OTHER: "Tops",
};

const conditionFromApi: Record<ApparelConditionApi, Apparel["condition"]> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  WORN: "Fair", // UI fallback
};

/**
 * Convert backend ApparelApi → UI Apparel
 */
export function mapApparelApiToUi(item: ApparelApi): Apparel {
  const ownerObj = typeof item.owner === "string" ? { _id: item.owner } : item.owner;

  return {
    id: item._id,
    name: item.title,
    size: item.size,
    condition: conditionFromApi[item.condition] || "Good",
    category: categoryFromApi[item.category] || "Tops",

    // ✅ Cloudinary image object → url
    imageUrl: item.images?.[0]?.url || "",

    ownerId: ownerObj._id,
    ownerName: ownerObj.name || "Unknown",

    status: item.isAvailable ? "available" : "pending",
  };
}
