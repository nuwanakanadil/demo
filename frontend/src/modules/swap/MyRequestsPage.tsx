import React, { useEffect, useState } from "react";
import { SwapRequest } from "../../types";
import { SwapRequestCard } from "../../components/SwapRequestCard";
import { Send } from "lucide-react";
import { getOutgoingSwaps } from "../../api/swap.api";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { StateDisplay } from "../../components/ui/StateDisplay";

export function MyRequestsPage() {
  const navigate = useNavigate();
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

        <Button variant="ghost" size="sm" onClick={load}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/70">
          <StateDisplay
            type="error"
            title="Could not load your requests"
            description={error}
            className="py-6"
            action={
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            }
          />
        </div>
      )}

      {loading ? (
        <StateDisplay type="loading" title="Loading your swap requests..." />
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/75">
          <StateDisplay
            type="empty"
            title="You haven't sent any swap requests yet"
            description="Go to Browse Items and request a swap."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <SwapRequestCard
              key={req.id}
              request={req}
              type="outgoing"
              onOpenLogistics={(id) => navigate(`/swaps/${id}/logistics`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
