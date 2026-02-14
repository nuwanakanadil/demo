import api from "./axios";
import { SwapRequest } from "../types";

export interface SwapApi {
  _id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  message?: string;
  createdAt: string;

  requester: { _id: string; name: string; email?: string };
  owner: { _id: string; name: string; email?: string };

  requestedItem: any; // populated Apparel
  offeredItem: any;   // populated Apparel
}

function mapStatus(status: SwapApi["status"]): SwapRequest["status"] {
  switch (status) {
    case "ACCEPTED":
      return "accepted";
    case "REJECTED":
      return "rejected";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending";
  }
}

function pickImage(item: any): string | undefined {
  return item?.images?.[0]?.url || item?.imageUrl || undefined;
}

export function mapSwapApiToUi(s: SwapApi): SwapRequest {
  return {
    id: s._id,

    requesterId: s.requester?._id || "",
    requesterName: s.requester?.name || "Unknown",

    ownerId: s.owner?._id || "",

    requestedItemId: s.requestedItem?._id || "",
    requestedItemName: s.requestedItem?.title || "Item",
    requestedItemImageUrl: pickImage(s.requestedItem),

    offeredItemId: s.offeredItem?._id || "",
    offeredItemName: s.offeredItem?.title || "Item",
    offeredItemImageUrl: pickImage(s.offeredItem),

    status: mapStatus(s.status),
    message: s.message || "",
    createdAt: s.createdAt,
  };
}

export async function createSwapRequest(payload: {
  requestedItemId: string;
  offeredItemId: string;
  message?: string;
}) {
  const res = await api.post("/swaps", payload);
  return res.data;
}

export async function getIncomingSwaps(): Promise<SwapRequest[]> {
  const res = await api.get("/swaps/incoming");
  const list: SwapApi[] = res.data?.data ?? [];
  return list.map(mapSwapApiToUi);
}

export async function getOutgoingSwaps(): Promise<SwapRequest[]> {
  const res = await api.get("/swaps/outgoing");
  const list: SwapApi[] = res.data?.data ?? [];
  return list.map(mapSwapApiToUi);
}

export async function acceptSwap(id: string) {
  const res = await api.put(`/swaps/${id}/accept`);
  return res.data;
}

export async function rejectSwap(id: string) {
  const res = await api.put(`/swaps/${id}/reject`);
  return res.data;
}

export async function completeSwap(id: string) {
  const res = await api.put(`/swaps/${id}/complete`);
  return res.data;
}

/**
 * ✅ History:
 * - First try backend: GET /swaps/history
 * - If not available, fallback: merge incoming+outgoing and filter out "pending"
 */
export async function getSwapHistory(): Promise<SwapRequest[]> {
  try {
    const res = await api.get("/swaps/history");
    const list: SwapApi[] = res.data?.data ?? [];
    return list.map(mapSwapApiToUi);
  } catch {
    const [incoming, outgoing] = await Promise.all([getIncomingSwaps(), getOutgoingSwaps()]);
    const merged = [...incoming, ...outgoing];

    // unique by id
    const map = new Map<string, SwapRequest>();
    merged.forEach((x) => map.set(x.id, x));

    // history = not pending
    return Array.from(map.values()).filter((x) => x.status !== "pending");
  }
}
