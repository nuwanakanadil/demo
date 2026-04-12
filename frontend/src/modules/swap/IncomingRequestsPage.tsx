import React, { useEffect, useState } from "react";
import { SwapRequest } from "../../types";
import { SwapRequestCard } from "../../components/SwapRequestCard";
import { Inbox } from "lucide-react";
import { getIncomingSwaps, acceptSwap, rejectSwap, completeSwap } from "../../api/swap.api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/ToastProvider";
import { Button } from "../../components/ui/Button";
import { StateDisplay } from "../../components/ui/StateDisplay";

export function IncomingRequestsPage() {
  const navigate = useNavigate();
  const toast = useToast();
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
      toast.success("Swap accepted", "Requester has been notified.");
    } catch (e: any) {
      toast.error("Failed to accept request", e?.response?.data?.message || "Please try again.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSwap(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
      toast.info("Swap rejected", "Requester has been notified.");
    } catch (e: any) {
      toast.error("Failed to reject request", e?.response?.data?.message || "Please try again.");
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeSwap(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "completed" } : r)));
      toast.success("Swap completed", "Great! The swap is now closed.");
    } catch (e: any) {
      toast.error("Failed to complete swap", e?.response?.data?.message || "Please try again.");
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

        <Button variant="ghost" size="sm" onClick={load}>
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/70">
          <StateDisplay
            type="error"
            title="Could not load incoming requests"
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
        <StateDisplay type="loading" title="Loading incoming requests..." />
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/75">
          <StateDisplay
            type="empty"
            title="No incoming requests yet"
            description="When someone requests your items, it appears here."
          />
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
              onOpenLogistics={(id) => navigate(`/swaps/${id}/logistics`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
