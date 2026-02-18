import api from "./axios";
import { SwapRequest } from "../types";

export type LogisticsMethod = "MEETUP" | "DELIVERY";
export type LogisticsStatus = "PENDING" | "SCHEDULED" | "IN_TRANSIT" | "DONE";

export interface SwapApiItem {
  _id: string;
  title?: string;
  images?: Array<{ url?: string }>;
}

export interface SwapApi {
  _id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  message?: string;
  createdAt: string;
  requester: { _id: string; name: string; email?: string };
  owner: { _id: string; name: string; email?: string };
  requestedItem: SwapApiItem;
  offeredItem: SwapApiItem;
  logistics?: {
    method?: LogisticsMethod;
    meetupLocation?: string;
    meetupAt?: string;
    deliveryOption?: string;
    trackingRef?: string;
    deliveryAddress?: string;
    phoneNumber?: string;
    status?: LogisticsStatus;
    lastUpdatedBy?: { _id?: string; name?: string };
    lastUpdatedAt?: string;
  };
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

export async function getSwapLogistics(swapId: string): Promise<SwapApi> {
  const res = await api.get(`/swaps/${swapId}/logistics`);
  return res.data?.data;
}

export async function saveSwapLogistics(
  swapId: string,
  payload:
    | { method: "MEETUP"; meetupLocation: string; meetupAt: string }
    | {
        method: "DELIVERY";
        deliveryOption: string;
        trackingRef?: string;
        deliveryAddress?: string;
        phoneNumber?: string;
      }
) {
  const res = await api.put(`/swaps/${swapId}/logistics`, payload);
  return res.data?.data as SwapApi;
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
