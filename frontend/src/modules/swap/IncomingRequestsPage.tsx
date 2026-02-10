import React, { useEffect, useState } from "react";
import { SwapRequest } from "../../types";
import { SwapRequestCard } from "../../components/SwapRequestCard";
import { Inbox } from "lucide-react";
import { getIncomingSwaps, acceptSwap, rejectSwap } from "../../api/swap.api";

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
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r))
      );
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to accept request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSwap(id);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
      );
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to reject request");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">
        Loading incoming requests…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Inbox className="h-8 w-8 text-brand-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Incoming Requests</h1>
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
          <p className="text-gray-500">No incoming requests yet.</p>
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
