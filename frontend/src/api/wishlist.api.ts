import api from "./axios";
import { Filters } from "../types/marketplace";

export const WISHLIST_COUNT_EVENT = "wishlist:count-updated";

export function dispatchWishlistCountChanged(count: number) {
  window.dispatchEvent(new CustomEvent<number>(WISHLIST_COUNT_EVENT, { detail: count }));
}

export interface WishlistApiItem {
  _id: string;
  title?: string;
  category?: string;
  size?: string;
  condition?: string;
  price?: number;
  createdAt?: string;
  images?: Array<{ url?: string }>;
  owner?: { _id?: string; id?: string; name?: string } | string;
  isAvailable?: boolean;
}

export interface SavedSearchApi {
  _id: string;
  name: string;
  filters: Filters;
  createdAt?: string;
}

export async function getWishlistItems(): Promise<WishlistApiItem[]> {
  const res = await api.get("/wishlist");
  return res.data?.data || [];
}

export async function addToWishlist(itemId: string) {
  const res = await api.post(`/wishlist/items/${itemId}`);
  return res.data as { success: boolean; message?: string; data?: string[] };
}

export async function removeFromWishlist(itemId: string) {
  const res = await api.delete(`/wishlist/items/${itemId}`);
  return res.data as { success: boolean; message?: string; data?: string[] };
}

export async function getSavedSearches(): Promise<SavedSearchApi[]> {
  const res = await api.get("/wishlist/searches");
  return res.data?.data || [];
}

export async function createSavedSearch(name: string, filters: Filters): Promise<SavedSearchApi> {
  const res = await api.post("/wishlist/searches", { name, filters });
  return res.data?.data;
}

export async function deleteSavedSearch(id: string) {
  const res = await api.delete(`/wishlist/searches/${id}`);
  return res.data;
}
