import { SaveIcon } from 'lucide-react';
import { Filters } from '../../types/marketplace';

interface FilterPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onSaveSearch: () => void;
}

export function FilterPanel({ filters, onFilterChange, onSaveSearch }: FilterPanelProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={onSaveSearch}
          className="flex items-center gap-2 rounded-lg bg-green-700 px-3 py-1.5 text-sm text-white transition-colors hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <SaveIcon className="h-4 w-4" />
          Save Search
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="clothing">Clothing</option>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        <div>
          <label htmlFor="size" className="mb-2 block text-sm font-medium text-gray-700">
            Size
          </label>
          <select
            id="size"
            value={filters.size}
            onChange={(e) => updateFilter('size', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Sizes</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="UK 7">UK 7</option>
            <option value="UK 8">UK 8</option>
            <option value="UK 9">UK 9</option>
            <option value="UK 10">UK 10</option>
            <option value="One Size">One Size</option>
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="mb-2 block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            id="condition"
            value={filters.condition}
            onChange={(e) => updateFilter('condition', e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Date Range</label>
          <div className="space-y-3">
            <div>
              <label htmlFor="dateFrom" className="text-xs text-gray-600">From</label>
              <input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="text-xs text-gray-600">To</label>
              <input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            onFilterChange({
              category: 'all',
              size: 'all',
              condition: 'all',
              dateFrom: '',
              dateTo: '',
            })
          }
          className="w-full rounded-lg border border-green-800 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-green-700"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}
