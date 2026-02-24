import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkIcon, XIcon, ChevronDownIcon } from 'lucide-react';
import { SavedSearch } from '../../types/marketplace';

interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  onApplySearch: (search: SavedSearch) => void;
  onDeleteSearch: (id: string) => void;
}

export function SavedSearches({
  savedSearches,
  onApplySearch,
  onDeleteSearch,
}: SavedSearchesProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (savedSearches.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <BookmarkIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">Saved Searches ({savedSearches.length})</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 top-full z-20 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
            >
              <div className="border-b border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-700">Your Saved Searches</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {savedSearches.map((search) => (
                  <div
                    key={search.id}
                    className="group border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => {
                          onApplySearch(search);
                          setIsOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <p className="mb-1 font-medium text-gray-900">{search.name}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {search.filters.category !== 'all' && (
                            <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                              {search.filters.category}
                            </span>
                          )}
                          {search.filters.size !== 'all' && (
                            <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-700">
                              Size {search.filters.size}
                            </span>
                          )}
                          {search.filters.condition !== 'all' && (
                            <span className="rounded bg-teal-100 px-2 py-1 text-teal-700">
                              {search.filters.condition}
                            </span>
                          )}
                          {(search.filters.dateFrom || search.filters.dateTo) && (
                            <span className="rounded bg-lime-100 px-2 py-1 text-lime-700">
                              {search.filters.dateFrom || 'Any'} to {search.filters.dateTo || 'Any'}
                            </span>
                          )}
                        </div>
                      </button>

                      <button
                        onClick={() => onDeleteSearch(search.id)}
                        className="rounded p-1 opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-50"
                        aria-label="Delete saved search"
                      >
                        <XIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
