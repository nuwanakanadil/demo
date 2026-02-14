import React, { useEffect, useState } from "react";
import { SwapRequest } from "../../types";
import { SwapRequestCard } from "../../components/SwapRequestCard";
import { Send } from "lucide-react";
import { getOutgoingSwaps } from "../../api/swap.api";

export function MyRequestsPage() {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const list = await getOutgoingSwaps();
      setRequests(list);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load outgoing requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Send className="h-8 w-8 text-brand-600 mr-3" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Requests</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track the swaps you requested from other users.
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
        <div className="py-16 text-center text-gray-500">Loading your swap requests…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-14 bg-neutral-50 rounded-xl border border-neutral-200">
          <p className="text-gray-600 font-medium">You haven’t sent any swap requests yet.</p>
          <p className="text-sm text-gray-500 mt-1">Go to Browse Items and request a swap.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <SwapRequestCard key={req.id} request={req} type="outgoing" />
          ))}
        </div>
      )}
    </div>
  );
}
