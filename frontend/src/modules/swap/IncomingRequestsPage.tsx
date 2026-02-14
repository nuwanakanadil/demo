import React, { useEffect, useState } from "react";
import { SwapRequest } from "../../types";
import { SwapRequestCard } from "../../components/SwapRequestCard";
import { Inbox } from "lucide-react";
import { getIncomingSwaps, acceptSwap, rejectSwap, completeSwap } from "../../api/swap.api";

export function IncomingRequestsPage() {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await getIncomingSwaps();
      setRequests(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load incoming requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await acceptSwap(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)));
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to accept request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSwap(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to reject request");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeSwap(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r)));
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to complete swap");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Inbox className="h-8 w-8 text-brand-600 mr-3" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Incoming Requests</h1>
            <p className="text-sm text-gray-600 mt-1">
              Accept, reject, and complete swaps for your items.
            </p>
          </div>
        </div>

        <button
          className="text-sm font-semibold text-brand-600 hover:text-brand-500"
          onClick={load}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}{" "}
          <button className="underline font-medium ml-2" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading incoming requests…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-14 bg-neutral-50 rounded-xl border border-neutral-200">
          <p className="text-gray-600 font-medium">No incoming requests yet.</p>
          <p className="text-sm text-gray-500 mt-1">When someone requests your items, it appears here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <SwapRequestCard
              key={req.id}
              request={req}
              type="incoming"
              onAccept={handleAccept}
              onReject={handleReject}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
