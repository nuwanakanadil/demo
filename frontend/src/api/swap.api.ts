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

// Map backend status -> UI status
function mapStatus(status: SwapApi["status"]): SwapRequest["status"] {
  if (status === "ACCEPTED") return "accepted";
  if (status === "REJECTED") return "rejected";
  return "pending";
}

// Map backend Swap -> UI SwapRequest
export function mapSwapApiToUi(s: SwapApi): SwapRequest {
  return {
    id: s._id,

    requesterId: s.requester?._id || "",
    requesterName: s.requester?.name || "Unknown",

    ownerId: s.owner?._id || "",

    requestedItemId: s.requestedItem?._id || "",
    requestedItemName: s.requestedItem?.title || "Item",

    offeredItemId: s.offeredItem?._id || "",
    offeredItemName: s.offeredItem?.title || "Item",

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

// ✅ Return UI-ready array
export async function getIncomingSwaps(): Promise<SwapRequest[]> {
  const res = await api.get("/swaps/incoming");
  const list: SwapApi[] = res.data?.data ?? [];
  return list.map(mapSwapApiToUi);
}

// ✅ Return UI-ready array
export async function getOutgoingSwaps(): Promise<{ success: boolean; data: SwapRequest[] }> {
  const res = await api.get("/swaps/outgoing");
  return res.data;
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
