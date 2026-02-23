import React, { useEffect, useMemo, useState } from "react";
import { SwapRequest } from "../../types";
import { SwapRequestCard } from "../../components/SwapRequestCard";
import { History } from "lucide-react";
import { getSwapHistory } from "../../api/swap.api";

export function HistoryPage() {
  const [history, setHistory] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const list = await getSwapHistory();
      setHistory(list);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load swap history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const s = { completed: 0, accepted: 0, rejected: 0, cancelled: 0 };
    history.forEach((h) => {
      if (h.status === "completed") s.completed++;
      if (h.status === "accepted") s.accepted++;
      if (h.status === "rejected") s.rejected++;
      if (h.status === "cancelled") s.cancelled++;
    });
    return s;
  }, [history]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
          <History className="h-8 w-8 text-brand-600 mr-3" />
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Swap History</h1>
            <p className="text-sm text-gray-600 mt-1">
              Your completed and resolved swaps (no pending requests here).
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

      {/* Stats pills */}
      {!loading && history.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
            Completed: {stats.completed}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
            Accepted: {stats.accepted}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100">
            Rejected: {stats.rejected}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-50 text-neutral-700 border border-neutral-200">
            Cancelled: {stats.cancelled}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}{" "}
          <button className="underline font-medium ml-2" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-500">Loading swap history…</div>
      ) : history.length === 0 ? (
        <div className="text-center py-14 bg-neutral-50 rounded-xl border border-neutral-200">
          <p className="text-gray-600 font-medium">No history yet.</p>
          <p className="text-sm text-gray-500 mt-1">
            When swaps get accepted/rejected/completed, they show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((req) => (
            <SwapRequestCard key={req.id} request={req} type="outgoing" />
          ))}
        </div>
      )}
    </div>
  );
}
