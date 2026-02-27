import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, HeartIcon } from 'lucide-react';
import { Item, Filters, SavedSearch } from '../types/marketplace';
import { ItemCard } from '../components/wishlist/ItemCard';
import { FilterPanel } from '../components/wishlist/FilterPanel';
import { SavedSearches } from '../components/wishlist/SavedSearches';

interface WishlistPageProps {
  items: Item[];
  wishlistIds: string[];
  filters: Filters;
  savedSearches: SavedSearch[];
  onToggleSave: (id: string) => void;
  onFilterChange: (filters: Filters) => void;
  onSaveSearch: () => void;
  onApplySearch: (search: SavedSearch) => void;
  onDeleteSearch: (id: string) => void;
}

export function WishlistPage({
  items,
  wishlistIds,
  filters,
  savedSearches,
  onToggleSave,
  onFilterChange,
  onSaveSearch,
  onApplySearch,
  onDeleteSearch,
}: WishlistPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const wishlistItems = items.filter((item) => wishlistIds.includes(item.id));
  const filteredByFilters = wishlistItems.filter((item) => {
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.size !== 'all' && item.size !== filters.size) return false;
    if (filters.condition !== 'all' && item.condition !== filters.condition) return false;

    if (filters.dateFrom || filters.dateTo) {
      if (!item.createdAt) return false;
      const itemDate = new Date(item.createdAt);
      if (Number.isNaN(itemDate.getTime())) return false;

      if (filters.dateFrom) {
        const from = new Date(`${filters.dateFrom}T00:00:00`);
        if (itemDate < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(`${filters.dateTo}T23:59:59`);
        if (itemDate > to) return false;
      }
    }

    return true;
  });

  const filteredItems = filteredByFilters.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removedByFilters = wishlistItems.length - filteredByFilters.length;
  const removedBySearch = filteredByFilters.length - filteredItems.length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-4">
          <SavedSearches
            savedSearches={savedSearches}
            onApplySearch={onApplySearch}
            onDeleteSearch={onDeleteSearch}
          />
          <FilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onSaveSearch={onSaveSearch}
          />
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="mb-6 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-700">
                {filteredItems.length} of {wishlistItems.length}{' '}
                {wishlistItems.length === 1 ? 'item' : 'items'} shown
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-rose-200 bg-white/70 px-3 py-1 text-rose-700">
                Saved: {wishlistItems.length}
              </span>
              <span className="rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-amber-700">
                Filtered out: {Math.max(0, removedByFilters)}
              </span>
              <span className="rounded-full border border-blue-200 bg-white/70 px-3 py-1 text-blue-700">
                Search hidden: {Math.max(0, removedBySearch)}
              </span>
            </div>
          </div>
        </div>

        {wishlistItems.length > 0 ? (
          <>
            <div className="mb-6">
              <div className="relative max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search saved items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            {filteredItems.length > 0 ? (
              <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ItemCard item={item} isSaved={true} onToggleSave={onToggleSave} showPrice={false} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <SearchIcon className="h-8 w-8 text-amber-700" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">No items match your filters</h3>
                <p className="mb-6 text-gray-600">Try adjusting your filters or search term</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    onFilterChange({
                      category: 'all',
                      size: 'all',
                      condition: 'all',
                      dateFrom: '',
                      dateTo: '',
                    });
                  }}
                  className="rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-dashed border-rose-200 bg-gradient-to-b from-rose-50 to-white py-20 text-center"
          >
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
              <HeartIcon className="h-10 w-10 text-rose-500" />
            </div>
            <h3 className="mb-3 text-2xl font-semibold text-gray-900">Your wishlist is empty</h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600">
              Start saving items you love by clicking the heart icon on any item while browsing.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
