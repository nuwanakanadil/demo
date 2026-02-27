import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApparelCard } from "../../components/ApparelCard";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Apparel, ApparelApi, mapApparelApiToUi } from "../../types";
import { Search, Filter, RefreshCw } from "lucide-react";
import api from "../../api/axios";
import {
  addToWishlist,
  dispatchWishlistCountChanged,
  getWishlistItems,
  removeFromWishlist,
} from "../../api/wishlist.api";

interface BrowsePageProps {
  onRequestSwap: (item: Apparel) => void;
  currentUserId: string | null;
  onEditItem: (itemId: string) => void;
}

export function BrowsePage({
  onRequestSwap,
  currentUserId,
  onEditItem,
}: BrowsePageProps) {
  const navigate = useNavigate();

  const [items, setItems] = useState<Apparel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistBusyId, setWishlistBusyId] = useState<string | null>(null);

  const categories = [
    "All",
    "Tops",
    "Bottoms",
    "Outerwear",
    "Shoes",
    "Accessories",
  ];

  const fetchItems = async () => {
    try {
      setError(null);
      setLoading(true);

      const [itemsRes, wishlistRes] = await Promise.all([
        api.get("/items", {
          params: {
            page: 1,
            limit: 50,
            available: "true",
          },
        }),
        getWishlistItems(),
      ]);

      const apiItems: ApparelApi[] = itemsRes.data?.items || [];
      const uiItems: Apparel[] = apiItems.map(mapApparelApiToUi);
      const ids = (wishlistRes || []).map((w) => w._id).filter(Boolean);

      setItems(uiItems);
      setWishlistIds(ids);
      dispatchWishlistCountChanged(ids.length);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  const handleToggleWishlist = async (item: Apparel) => {
    if (!currentUserId || wishlistBusyId) return;

    const isOwner = item.ownerId === currentUserId;
    const isSaved = wishlistIds.includes(item.id);

    // Keep unsave allowed; block only first-time save of own item
    if (isOwner && !isSaved) return;

    const previous = wishlistIds;
    const next = isSaved
      ? previous.filter((id) => id !== item.id)
      : [...previous, item.id];

    setWishlistIds(next);
    dispatchWishlistCountChanged(next.length);
    setWishlistBusyId(item.id);
    setError(null);

    try {
      if (isSaved) {
        const res = await removeFromWishlist(item.id);
        if (Array.isArray(res?.data)) {
          setWishlistIds(res.data);
          dispatchWishlistCountChanged(res.data.length);
        }
      } else {
        const res = await addToWishlist(item.id);
        if (Array.isArray(res?.data)) {
          setWishlistIds(res.data);
          dispatchWishlistCountChanged(res.data.length);
        }
      }
    } catch (err: any) {
      setWishlistIds(previous);
      dispatchWishlistCountChanged(previous.length);
      setError(err?.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistBusyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Apparel</h1>
          <p className="text-gray-600 mt-1">Find your next favorite piece</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchItems}
            className="whitespace-nowrap"
            isLoading={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="py-20 text-center text-gray-500">Loading items...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isOwner = !!currentUserId && item.ownerId === currentUserId;
              const isSaved = wishlistIds.includes(item.id);

              return (
                <ApparelCard
                  key={item.id}
                  item={item}
                  onRequestSwap={onRequestSwap}
                  showEdit={isOwner}
                  onEdit={() => onEditItem(item.id)}

                  isWishlisted={isSaved}
                  onToggleWishlist={handleToggleWishlist}
                  wishlistDisabled={Boolean(isOwner && !isSaved)}
                  wishlistLoading={wishlistBusyId === item.id}

                  onOpenDetails={() => navigate(`/items/${item.id}`)}

                />
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <Filter className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>

              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No items found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters.
              </p>

            </div>
          )}
        </>
      )}
    </div>
  );
}
