import React from "react";
import { SwapRequest } from "../types";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ArrowRight, CheckCircle, XCircle, Flag } from "lucide-react";

interface SwapRequestCardProps {
  request: SwapRequest;
  type: "incoming" | "outgoing";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const fallbackImg = "https://placehold.co/120x120/png?text=Item";

function StatusBadge({ status }: { status: SwapRequest["status"] }) {
  switch (status) {
    case "accepted":
      return <Badge variant="success">Accepted</Badge>;
    case "rejected":
      return <Badge variant="error">Rejected</Badge>;
    case "completed":
      return <Badge variant="success">Completed</Badge>;
    case "cancelled":
      return <Badge variant="default">Cancelled</Badge>;
    default:
      return <Badge variant="warning">Pending</Badge>;
  }
}

export function SwapRequestCard({
  request,
  type,
  onAccept,
  onReject,
  onComplete,
}: SwapRequestCardProps) {
  const isPending = request.status === "pending";
  const isAccepted = request.status === "accepted";

  const subtitle =
    type === "incoming"
      ? `From: ${request.requesterName}`
      : `To: Owner of ${request.requestedItemName}`;

  const offeredImg = request.offeredItemImageUrl || fallbackImg;
  const requestedImg = request.requestedItemImageUrl || fallbackImg;

  return (
    <Card className="border border-neutral-200 bg-white overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
            <StatusBadge status={request.status} />
          </div>

          <div className="text-sm font-semibold text-gray-900">{subtitle}</div>
        </div>

        {/* Items */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Offered */}
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-white border border-neutral-200 shrink-0">
              <img
                src={offeredImg}
                alt={request.offeredItemName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImg;
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">
                Offered Item
              </div>
              <div className="text-sm font-extrabold text-brand-700 truncate">
                {request.offeredItemName}
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="rounded-full bg-neutral-100 border border-neutral-200 p-2">
              <ArrowRight className="h-5 w-5 text-gray-500" />
            </div>
          </div>

          {/* Requested */}
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="h-14 w-14 rounded-lg overflow-hidden bg-white border border-neutral-200 shrink-0">
              <img
                src={requestedImg}
                alt={request.requestedItemName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImg;
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wide text-gray-500">
                Requested Item
              </div>
              <div className="text-sm font-extrabold text-brand-700 truncate">
                {request.requestedItemName}
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {request.message && (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-3 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Message:</span>{" "}
            <span className="text-gray-700">{request.message}</span>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {type === "incoming" && isPending && (
        <CardFooter className="bg-neutral-50 p-4 flex justify-end gap-2 border-t border-neutral-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReject?.(request.id)}
            className="text-red-700 border border-red-200 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>

          <Button variant="primary" size="sm" onClick={() => onAccept?.(request.id)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept Swap
          </Button>
        </CardFooter>
      )}

      {type === "incoming" && isAccepted && (
        <CardFooter className="bg-neutral-50 p-4 flex justify-end gap-2 border-t border-neutral-200">
          <Button variant="primary" size="sm" onClick={() => onComplete?.(request.id)}>
            <Flag className="h-4 w-4 mr-2" />
            Complete Swap
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
