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

  // ✅ NEW (for edit feature)
  showEdit?: boolean;
  onEdit?: () => void;
}

export function ApparelCard({
  item,
  onRequestSwap,
  showOwner = true,
  showEdit = false,
  onEdit,
}: ApparelCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
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

      {/* ✅ Footer actions */}
      {(onRequestSwap || showEdit) && (
        <CardFooter className="p-4 pt-0 mt-auto">
          {showEdit && onEdit ? (
            <Button className="w-full" variant="outline" onClick={onEdit}>
              Edit
            </Button>
          ) : onRequestSwap ? (
            <Button
              className="w-full"
              onClick={() => onRequestSwap(item)}
              disabled={item.status !== "available"}
            >
              {item.status === "available" ? "Request Swap" : "Unavailable"}
            </Button>
          ) : null}
        </CardFooter>
      )}
    </Card>
  );
}
