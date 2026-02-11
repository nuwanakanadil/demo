import React from "react";
import { Apparel } from "../types";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Ruler, Tag, User } from "lucide-react";

interface ApparelCardProps {
  item: Apparel;
  onRequestSwap?: (item: Apparel) => void;
  showOwner?: boolean;

  showEdit?: boolean;
  onEdit?: () => void;

  onOpenDetails?: () => void;

  // ✅ NEW
  showDelete?: boolean;
  onDelete?: () => void;
}

export function ApparelCard({
  item,
  onRequestSwap,
  showOwner = true,
  showEdit = false,
  onEdit,
  onOpenDetails,

  // ✅ NEW
  showDelete = false,
  onDelete,
}: ApparelCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
      <button type="button" onClick={onOpenDetails} className="text-left">
        <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge variant={item.condition === "New" ? "success" : "default"}>
              {item.condition}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {item.name}
            </h3>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-2 text-gray-400" />
              <span>Size: {item.size}</span>
            </div>

            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2 text-gray-400" />
              <span>{item.category}</span>
            </div>

            {showOwner && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span>{item.ownerName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </button>

      {/* ✅ Footer actions */}
      {(onRequestSwap || showEdit || showDelete) && (
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="w-full flex gap-2">
            {showEdit && onEdit && (
              <Button className="w-full" variant="outline" onClick={onEdit}>
                Update
              </Button>
            )}

            {showDelete && onDelete && (
              <Button
                className="w-full border border-red-200 text-red-700 hover:bg-red-50"
                variant="ghost"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}

            {!showEdit && !showDelete && onRequestSwap && (
              <Button
                className="w-full"
                onClick={() => onRequestSwap(item)}
                disabled={item.status !== "available"}
              >
                {item.status === "available" ? "Request Swap" : "Unavailable"}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

