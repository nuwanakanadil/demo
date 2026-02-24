import { useEffect, useMemo, useState } from "react";
import { Item, Filters, SavedSearch } from "../types/marketplace";
import { WishlistPage } from "./WishlistPage";
import { SaveSearchModal } from "../components/wishlist/SaveSearchModal";
import { getMe } from "../api/auth.api";
import {
  addToWishlist,
  createSavedSearch,
  dispatchWishlistCountChanged,
  deleteSavedSearch,
  getSavedSearches,
  getWishlistItems,
  removeFromWishlist,
  WishlistApiItem,
} from "../api/wishlist.api";

type ApiOwner = {
  _id?: string;
  id?: string;
  name?: string;
};

type ApiItem = {
  _id?: string;
  id?: string;
  title?: string;
  category?: string;
  size?: string;
  condition?: string;
  images?: Array<{ url?: string }>;
  owner?: string | ApiOwner;
  isAvailable?: boolean;
  price?: number;
  createdAt?: string;
};

const DEFAULT_FILTERS: Filters = {
  category: "all",
  size: "all",
  condition: "all",
  dateFrom: "",
  dateTo: "",
};

function normalizeFilters(input?: Partial<Filters>): Filters {
  return {
    category: input?.category || "all",
    size: input?.size || "all",
    condition: input?.condition || "all",
    dateFrom: input?.dateFrom || "",
    dateTo: input?.dateTo || "",
  };
}

function mapCategoryToMarketplace(category?: string): Item["category"] {
  switch (category) {
    case "SHOES":
      return "shoes";
    case "ACCESSORY":
      return "accessories";
    default:
      return "clothing";
  }
}

function mapConditionToMarketplace(condition?: string): Item["condition"] {
  switch (condition) {
    case "NEW":
      return "New";
    case "LIKE_NEW":
      return "Like New";
    case "FAIR":
    case "WORN":
      return "Fair";
    case "GOOD":
    default:
      return "Good";
  }
}

function mapItemFromApi(
  item: ApiItem | WishlistApiItem | null | undefined,
  currentUserId: string
): Item | null {
  if (!item) return null;
  const itemId = item._id || ("id" in item ? item.id : undefined);
  if (!itemId) return null;

  const ownerObj = typeof item.owner === "string" ? { _id: item.owner } : item.owner;
  const ownerId = ownerObj?._id || ownerObj?.id || "";

  return {
    id: itemId,
    title: item.title || "Untitled item",
    category: mapCategoryToMarketplace(item.category),
    size: item.size || "N/A",
    condition: mapConditionToMarketplace(item.condition),
    price: Number(item.price ?? 0),
    createdAt: item.createdAt,
    owner: ownerObj?.name || "Unknown",
    imageUrl: item.images?.[0]?.url || "/image.png",
    isOwn: ownerId === currentUserId,
    isCompleted: item.isAvailable === false,
  };
}

function uniqueById(items: Item[]): Item[] {
  const seen = new Set<string>();
  const out: Item[] = [];

  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }

  return out;
}

export function WishlistHubPage() {
  const [wishlistItems, setWishlistItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemLookup = useMemo(() => {
    const map = new Map<string, Item>();
    for (const item of wishlistItems) map.set(item.id, item);
    return map;
  }, [wishlistItems]);

  useEffect(() => {
    let isMounted = true;

    const loadWishlist = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [meRes, wishlistRes, searchesRes] = await Promise.all([
          getMe(),
          getWishlistItems(),
          getSavedSearches(),
        ]);

        const currentUserId = meRes?.user?.id || "";

        const mappedWishlist = (wishlistRes || [])
          .filter((item) => Boolean(item))
          .map((item) => mapItemFromApi(item, currentUserId))
          .filter((item: Item | null): item is Item => Boolean(item));

        const mappedSearches: SavedSearch[] = (searchesRes || []).map((s) => ({
          id: s._id,
          name: s.name,
          filters: normalizeFilters(s.filters),
        }));

        if (!isMounted) return;
        setWishlistItems(mappedWishlist);
        setWishlistIds(mappedWishlist.map((i) => i.id));
        dispatchWishlistCountChanged(mappedWishlist.length);
        setSavedSearches(mappedSearches);
      } catch (err: any) {
        if (!isMounted) return;
        setLoadError(err?.response?.data?.message || "Failed to load wishlist data");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadWishlist();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleSave = async (id: string) => {
    if (actionLoading) return;

    const item = itemLookup.get(id);
    const isSaved = wishlistIds.includes(id);
    if (item?.isOwn && !isSaved) return;
    setActionLoading(true);
    setLoadError(null);

    try {
      if (isSaved) {
        const res = await removeFromWishlist(id);
        if (Array.isArray(res?.data)) {
          setWishlistIds(res.data);
          dispatchWishlistCountChanged(res.data.length);
        } else {
          const next = wishlistIds.filter((itemId) => itemId !== id);
          setWishlistIds(next);
          dispatchWishlistCountChanged(next.length);
        }
        setWishlistItems((prev) => prev.filter((wishlistItem) => wishlistItem.id !== id));
      } else {
        const res = await addToWishlist(id);
        if (Array.isArray(res?.data)) {
          setWishlistIds(res.data);
          dispatchWishlistCountChanged(res.data.length);
        } else {
          const next = wishlistIds.includes(id) ? wishlistIds : [...wishlistIds, id];
          setWishlistIds(next);
          dispatchWishlistCountChanged(next.length);
        }
        if (item) {
          setWishlistItems((prev) => uniqueById([item, ...prev]));
        }
      }
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || "Failed to update wishlist.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSearch = async (name: string) => {
    try {
      const created = await createSavedSearch(name, filters);
      setSavedSearches((prev) => [
        {
          id: created._id,
          name: created.name,
          filters: normalizeFilters(created.filters),
        },
        ...prev,
      ]);
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || "Failed to save search.");
    }
  };

  const handleApplySearch = (search: SavedSearch) => {
    setFilters(normalizeFilters(search.filters));
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      await deleteSavedSearch(id);
      setSavedSearches((prev) => prev.filter((search) => search.id !== id));
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || "Failed to delete saved search.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">
            Loading wishlist...
          </div>
        )}

        {!isLoading && loadError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {loadError}
          </div>
        )}

        {!isLoading && (
          <WishlistPage
            items={wishlistItems}
            wishlistIds={wishlistIds}
            filters={filters}
            savedSearches={savedSearches}
            onToggleSave={handleToggleSave}
            onFilterChange={setFilters}
            onSaveSearch={() => setIsModalOpen(true)}
            onApplySearch={handleApplySearch}
            onDeleteSearch={handleDeleteSearch}
          />
        )}
      </main>

      <SaveSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSearch}
        currentFilters={filters}
      />
    </div>
  );
}
