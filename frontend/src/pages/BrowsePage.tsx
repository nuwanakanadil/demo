import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Item, Filters, SavedSearch } from '../types/marketplace';
import { ItemCard } from '../components/wishlist/ItemCard';
import { FilterPanel } from '../components/wishlist/FilterPanel';
import { SavedSearches } from '../components/wishlist/SavedSearches';
interface BrowsePageProps {
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
export function BrowsePage({
  items,
  wishlistIds,
  filters,
  savedSearches,
  onToggleSave,
  onFilterChange,
  onSaveSearch,
  onApplySearch,
  onDeleteSearch
}: BrowsePageProps) {
  const filteredItems = items.filter((item) => {
    if (filters.category !== 'all' && item.category !== filters.category)
    return false;
    if (filters.size !== 'all' && item.size !== filters.size) return false;
    if (filters.condition !== 'all' && item.condition !== filters.condition)
    return false;
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filter Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-4">
          <SavedSearches
            savedSearches={savedSearches}
            onApplySearch={onApplySearch}
            onDeleteSearch={onDeleteSearch} />

          <FilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onSaveSearch={onSaveSearch} />

        </div>
      </div>

      {/* Items Grid */}
      <div className="lg:col-span-3">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Browse Items
          </h2>
          <p className="text-gray-600">
            {filteredItems.length}{' '}
            {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {filteredItems.length > 0 ?
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

            <AnimatePresence>
              {filteredItems.map((item, index) =>
            <motion.div
              key={item.id}
              layout
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.9
              }}
              transition={{
                delay: index * 0.05
              }}>

                  <ItemCard
                item={item}
                isSaved={wishlistIds.includes(item.id)}
                onToggleSave={onToggleSave} />

                </motion.div>
            )}
            </AnimatePresence>
          </motion.div> :

        <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No items found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters to see more results
            </p>
            <button
            onClick={() =>
            onFilterChange({
              category: 'all',
              size: 'all',
              condition: 'all',
              dateFrom: '',
              dateTo: ''
            })
            }
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">

              Clear Filters
            </button>
          </div>
        }
      </div>
    </div>);

}
