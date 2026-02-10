import React, { useEffect, useState } from "react";
import { Apparel } from "../../types";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { ArrowLeftRight } from "lucide-react";
import { createSwapRequest } from "../../api/swap.api";
import { getMyItems } from "../../api/items.api"; // you should already have /items/me/mine API

interface RequestSwapPageProps {
  targetItem: Apparel;
  onCancel: () => void;
  onSubmit: () => void;
}

export function RequestSwapPage({ targetItem, onCancel, onSubmit }: RequestSwapPageProps) {
  const [myItems, setMyItems] = useState<Apparel[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMyItems, setLoadingMyItems] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ load my items from backend (only available items)
  useEffect(() => {
    (async () => {
      try {
        setLoadingMyItems(true);
        const res = await getMyItems();
        // res.data should be array already, depending on your controller response shape
        const items: Apparel[] = res.data || res;
        setMyItems(items.filter((i) => i.status === "available"));
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load your items");
      } finally {
        setLoadingMyItems(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await createSwapRequest({
        requestedItemId: targetItem.id,
        offeredItemId: selectedOfferId,
        message: message.trim() || undefined,
      });

      onSubmit();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to send swap request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onCancel} className="mb-6">
        ← Back to Browse
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Propose a Swap</CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
            {/* Target Item */}
            <div className="flex-1 w-full">
              <p className="text-sm font-medium text-gray-500 mb-2 text-center">You Want</p>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={targetItem.imageUrl}
                  alt={targetItem.name}
                  className="w-full h-48 object-cover rounded-md mb-3"
                />
                <h3 className="font-bold text-gray-900">{targetItem.name}</h3>
                <p className="text-sm text-gray-600">Size: {targetItem.size}</p>
                <p className="text-sm text-gray-600">Owner: {targetItem.ownerName}</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="bg-brand-100 p-3 rounded-full">
                <ArrowLeftRight className="h-6 w-6 text-brand-600" />
              </div>
            </div>

            {/* Offer Item */}
            <div className="flex-1 w-full">
              <p className="text-sm font-medium text-gray-500 mb-2 text-center">You Offer</p>

              {loadingMyItems ? (
                <div className="text-center text-gray-500 text-sm py-10">Loading your items…</div>
              ) : myItems.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-10">
                  You don’t have any available items to offer.
                </div>
              ) : (
                <div className="space-y-3">
                  {myItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedOfferId(item.id)}
                      className={`cursor-pointer border rounded-lg p-3 flex items-center gap-3 transition-all ${
                        selectedOfferId === item.id
                          ? "border-brand-500 ring-2 ring-brand-500 ring-opacity-20 bg-brand-50"
                          : "border-gray-200 hover:border-brand-300"
                      }`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.condition}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                rows={3}
                placeholder="Hi! I'd love to swap my item for yours..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!selectedOfferId || isSubmitting || loadingMyItems || myItems.length === 0}
              isLoading={isSubmitting}
            >
              Send Swap Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
