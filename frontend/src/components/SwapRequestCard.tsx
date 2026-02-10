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

  // ✅ new (for owner side after accepted)
  onComplete?: (id: string) => void;
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
  const isRejected = request.status === "rejected";

  const getStatusBadge = (status: SwapRequest["status"]) => {
    switch (status) {
      case "accepted":
        return <Badge variant="success">Accepted</Badge>;
      case "rejected":
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <span className="text-sm text-gray-500">
              {new Date(request.createdAt).toLocaleDateString()}
            </span>
            {getStatusBadge(request.status)}
          </div>

          <div className="text-sm font-medium text-gray-900">
            {type === "incoming"
              ? `From: ${request.requesterName}`
              : `To: Owner of ${request.requestedItemName}`}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 my-6">
          <div className="text-center md:text-right flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Offered Item
            </p>
            <p className="font-semibold text-lg text-brand-700">
              {request.offeredItemName}
            </p>
          </div>

          <div className="flex items-center justify-center bg-gray-50 rounded-full p-2">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>

          <div className="text-center md:text-left flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Requested Item
            </p>
            <p className="font-semibold text-lg text-brand-700">
              {request.requestedItemName}
            </p>
          </div>
        </div>

        {request.message && (
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 italic mb-4">
            "{request.message}"
          </div>
        )}
      </CardContent>

      {/* ✅ Incoming + Pending: Accept/Reject */}
      {type === "incoming" && isPending && (
        <CardFooter className="bg-gray-50 p-4 flex justify-end space-x-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReject?.(request.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* ✅ Incoming + Accepted: Complete button */}
      {type === "incoming" && isAccepted && (
        <CardFooter className="bg-gray-50 p-4 flex justify-end space-x-3 border-t border-gray-100">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete?.(request.id)}
          >
            <Flag className="h-4 w-4 mr-2" />
            Complete Swap
          </Button>
        </CardFooter>
      )}

      {/* Optional: Incoming + Rejected (no actions) */}
      {type === "incoming" && isRejected && (
        <CardFooter className="bg-gray-50 p-4 flex justify-end border-t border-gray-100">
          <span className="text-sm text-gray-500">No action required</span>
        </CardFooter>
      )}
    </Card>
  );
}
