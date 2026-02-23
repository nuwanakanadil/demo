import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";
import { SwapSummaryCard } from "../../components/Delevery/SwapSummaryCard";
import { MethodSelector } from "../../components/Delevery/MethodSelector";
import { MeetupForm } from "../../components/Delevery/MeetupForm";
import { DeliveryForm } from "../../components/Delevery/DeliveryForm";
import { StatusProgress } from "../../components/Delevery/StatusProgress";
import { CompletionButton } from "../../components/Delevery/CompletionButton";
import { Button } from "../../components/Delevery/ui/Button";
import {
  completeSwap,
  getSwapLogistics,
  saveSwapLogistics,
  SwapApi,
  LogisticsStatus,
} from "../../api/swap.api";
import { getMe } from "../../api/auth.api";

type LogisticsMethod = "MEETUP" | "DELIVERY";

function getLogisticsStatus(swap: SwapApi | null): LogisticsStatus {
  if (!swap) return "PENDING";
  if (swap.status === "COMPLETED") return "DONE";
  return swap.logistics?.status || "PENDING";
}

function formatLastUpdated(date?: string) {
  if (!date) return "Not updated yet";
  return new Date(date).toLocaleString();
}

function toDateAndTime(meetupAt?: string) {
  if (!meetupAt) return { date: "", time: "" };
  const dt = new Date(meetupAt);
  if (Number.isNaN(dt.getTime())) return { date: "", time: "" };
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const min = String(dt.getMinutes()).padStart(2, "0");
  return { date: `${yyyy}-${mm}-${dd}`, time: `${hh}:${min}` };
}

export function SwapLogisticsPage() {
  const navigate = useNavigate();
  const { id: swapId } = useParams();

  const [swap, setSwap] = useState<SwapApi | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: "user" | "admin" } | null>(null);
  const [method, setMethod] = useState<LogisticsMethod>("MEETUP");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isParticipant = useMemo(() => {
    if (!swap || !currentUser) return false;
    return swap.owner?._id === currentUser.id || swap.requester?._id === currentUser.id;
  }, [swap, currentUser]);

  const canEditLogistics =
    Boolean(swap) &&
    swap?.status === "ACCEPTED" &&
    isParticipant &&
    currentUser?.role !== "admin";

  const canComplete =
    Boolean(swap) &&
    swap?.status === "ACCEPTED" &&
    isParticipant &&
    currentUser?.role !== "admin";

  useEffect(() => {
    if (!swapId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [me, swapData] = await Promise.all([getMe(), getSwapLogistics(swapId)]);
        setCurrentUser({ id: me.user.id, role: me.user.role });
        setSwap(swapData);
        setMethod((swapData.logistics?.method || "MEETUP") as LogisticsMethod);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load swap logistics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [swapId]);

  const handleMeetupSave = async (data: { location: string; date: string; time: string }) => {
    if (!swapId) return;
    try {
      setSaving(true);
      setError(null);
      const meetupAt = new Date(`${data.date}T${data.time}`).toISOString();
      const updated = await saveSwapLogistics(swapId, {
        method: "MEETUP",
        meetupLocation: data.location,
        meetupAt,
      });
      setSwap(updated);
      setMethod("MEETUP");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save meetup details");
    } finally {
      setSaving(false);
    }
  };

  const handleDeliverySave = async (data: { provider: string; tracking?: string; deliveryAddress?: string; phoneNumber?: string }) => {
    if (!swapId) return;
    try {
      setSaving(true);
      setError(null);
      const updated = await saveSwapLogistics(swapId, {
        method: "DELIVERY",
        deliveryOption: data.provider,
        trackingRef: data.tracking,
        deliveryAddress: data.deliveryAddress,
        phoneNumber: data.phoneNumber,
      });
      setSwap(updated);
      setMethod("DELIVERY");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save delivery details");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!swapId) return;
    try {
      setSaving(true);
      setError(null);
      await completeSwap(swapId);
      const updated = await getSwapLogistics(swapId);
      setSwap(updated);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to complete swap");
    } finally {
      setSaving(false);
    }
  };

  if (!swapId) {
    return <div className="p-8 text-red-700">Swap id is required.</div>;
  }

  if (loading) {
    return <div className="p-8 text-gray-600">Loading logistics...</div>;
  }

  if (error && !swap) {
    return (
      <div className="p-8">
        <p className="text-red-700 mb-3">{error}</p>
        <Button variant="secondary" onClick={() => navigate("/swaps/incoming")}>
          Back
        </Button>
      </div>
    );
  }

  if (!swap) return null;

  const meetupInit = toDateAndTime(swap.logistics?.meetupAt);
  const logisticsStatus = getLogisticsStatus(swap);
  const savedMethod = swap.logistics?.method as LogisticsMethod | undefined;
  const isMethodLocked = Boolean(savedMethod);

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Swap Logistics</h1>
          <p className="text-gray-600 mt-2">
            Logistics can be managed after a swap is accepted.
          </p>
          {currentUser?.role === "admin" && (
            <p className="text-sm text-amber-700 mt-2">Admin view is read-only.</p>
          )}
          {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SwapSummaryCard
              itemA={{
                name: swap.offeredItem?.title || "Your item",
                owner: swap.requester?.name || "Unknown",
                image: swap.offeredItem?.images?.[0]?.url || "/image.png",
              }}
              itemB={{
                name: swap.requestedItem?.title || "Their item",
                owner: swap.owner?.name || "Unknown",
                image: swap.requestedItem?.images?.[0]?.url || "/image.png",
              }}
              status={swap.status}
            />

            <div className="flex justify-center">
              <MethodSelector
                selected={method}
                disabled={!canEditLogistics || isMethodLocked}
                onChange={(m) => {
                  if (canEditLogistics) setMethod(m);
                }}
              />
            </div>
            {isMethodLocked && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                Logistics method is locked as <strong>{savedMethod}</strong>. You can edit details, but cannot switch method.
              </div>
            )}

            {swap.status !== "ACCEPTED" && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
                This workflow becomes editable only when swap status is ACCEPTED.
              </div>
            )}

            <AnimatePresence mode="wait">
              {method === "MEETUP" ? (
                <MeetupForm
                  key="meetup"
                  onSave={handleMeetupSave}
                  disabled={!canEditLogistics}
                  initialData={{
                    location: swap.logistics?.meetupLocation || "",
                    date: meetupInit.date,
                    time: meetupInit.time,
                  }}
                />
              ) : (
                <DeliveryForm
                  key="delivery"
                  onSave={handleDeliverySave}
                  disabled={!canEditLogistics}
                  initialData={{
                    provider: swap.logistics?.deliveryOption || "",
                    tracking: swap.logistics?.trackingRef,
                    deliveryAddress: swap.logistics?.deliveryAddress || "",
                    phoneNumber: swap.logistics?.phoneNumber || "",
                  }}
                />
              )}
            </AnimatePresence>

            {!canEditLogistics && (
              <div className="text-sm text-gray-500">
                You can view logistics details, but editing is restricted.
              </div>
            )}
          </div>

          <div className="space-y-6">
            <StatusProgress
              currentStatus={logisticsStatus}
              lastUpdatedBy={swap.logistics?.lastUpdatedBy?.name || "System"}
              lastUpdatedAt={formatLastUpdated(swap.logistics?.lastUpdatedAt)}
            />

            {canComplete && logisticsStatus !== "DONE" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CompletionButton onComplete={handleComplete} />
              </motion.div>
            )}

            {(logisticsStatus === "DONE" || swap.status === "COMPLETED") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
              >
                <h3 className="text-xl font-semibold text-green-700 mb-2">Swap Completed</h3>
                <p className="text-sm text-gray-600">
                  Both parties can review the completed logistics details above.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-4 right-4 rounded-md bg-gray-900 text-white px-4 py-2 text-sm">
          Saving...
        </div>
      )}
    </div>
  );
}
