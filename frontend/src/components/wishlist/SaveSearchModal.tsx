import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, SaveIcon } from 'lucide-react';
import { Filters } from '../../types/marketplace';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentFilters: Filters;
}

export function SaveSearchModal({
  isOpen,
  onClose,
  onSave,
  currentFilters,
}: SaveSearchModalProps) {
  const [searchName, setSearchName] = useState('');

  const handleSave = () => {
    if (searchName.trim()) {
      onSave(searchName.trim());
      setSearchName('');
      onClose();
    }
  };

  const hasActiveFilters =
    currentFilters.category !== 'all' ||
    currentFilters.size !== 'all' ||
    currentFilters.condition !== 'all' ||
    Boolean(currentFilters.dateFrom) ||
    Boolean(currentFilters.dateTo);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Save Search</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                aria-label="Close modal"
              >
                <XIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {!hasActiveFilters ? (
              <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm text-orange-800">
                  No filters are currently active. Apply some filters before saving a search.
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-gray-600">
                  Give your search a name to quickly access these filters later.
                </p>

                <div className="mb-6">
                  <label htmlFor="search-name" className="mb-2 block text-sm font-medium text-gray-700">
                    Search Name
                  </label>
                  <input
                    id="search-name"
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="e.g., Recent winter finds"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                </div>

                <div className="mb-6 rounded-lg bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Active Filters:</p>
                  <div className="space-y-1 text-sm text-gray-600">
                    {currentFilters.category !== 'all' && (
                      <p>
                        - Category: <span className="font-medium capitalize">{currentFilters.category}</span>
                      </p>
                    )}
                    {currentFilters.size !== 'all' && (
                      <p>
                        - Size: <span className="font-medium">{currentFilters.size}</span>
                      </p>
                    )}
                    {currentFilters.condition !== 'all' && (
                      <p>
                        - Condition: <span className="font-medium">{currentFilters.condition}</span>
                      </p>
                    )}
                    {(currentFilters.dateFrom || currentFilters.dateTo) && (
                      <p>
                        - Date: <span className="font-medium">{currentFilters.dateFrom || 'Any'} to {currentFilters.dateTo || 'Any'}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!searchName.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <SaveIcon className="h-4 w-4" />
                    Save Search
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
