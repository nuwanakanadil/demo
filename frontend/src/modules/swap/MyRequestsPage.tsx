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

      const res = await getOutgoingSwaps(); // backend response: { success, data: [...] }
      const list: SwapRequest[] = res.data || [];

      setRequests(list);
    } catch (err: any) {
      console.error("Failed to load outgoing swaps", err);
      setError(err?.response?.data?.message || "Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading your swap requests…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Send className="h-8 w-8 text-brand-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}{" "}
          <button className="underline font-medium ml-2" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">You haven’t sent any swap requests yet.</p>
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
