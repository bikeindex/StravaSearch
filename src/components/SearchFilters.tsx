import { Search, X, Filter } from 'lucide-react';
import type { SearchFilters as SearchFiltersType } from '../types/strava';
import type { StoredGear } from '../services/database';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  activityTypes: string[];
  gear: StoredGear[];
  totalCount: number;
  filteredCount: number;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  activityTypes,
  gear,
  totalCount,
  filteredCount,
}: SearchFiltersProps) {
  const hasActiveFilters =
    filters.query ||
    filters.activityTypes.length > 0 ||
    filters.gearIds.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;

  const clearFilters = () => {
    onFiltersChange({
      query: '',
      activityTypes: [],
      gearIds: [],
      dateFrom: null,
      dateTo: null,
    });
  };

  const toggleActivityType = (type: string) => {
    const newTypes = filters.activityTypes.includes(type)
      ? filters.activityTypes.filter((t) => t !== type)
      : [...filters.activityTypes, type];
    onFiltersChange({ ...filters, activityTypes: newTypes });
  };

  const toggleGear = (gearId: string) => {
    const newGearIds = filters.gearIds.includes(gearId)
      ? filters.gearIds.filter((g) => g !== gearId)
      : [...filters.gearIds, gearId];
    onFiltersChange({ ...filters, gearIds: newGearIds });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
          placeholder="Search activities by name, description, or location..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent outline-none"
        />
        {filters.query && (
          <button
            onClick={() => onFiltersChange({ ...filters, query: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Filter toggle section */}
      <div className="space-y-3">
        {/* Date range */}
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>From:</span>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateFrom: e.target.value || null })
              }
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>To:</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, dateTo: e.target.value || null })
              }
              className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent outline-none"
            />
          </label>
        </div>

        {/* Activity types */}
        {activityTypes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Activity Types</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleActivityType(type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.activityTypes.includes(type)
                      ? 'bg-[#fc4c02] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gear filter */}
        {gear.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Equipment</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {gear.map((g) => (
                <button
                  key={g.id}
                  onClick={() => toggleGear(g.id)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    filters.gearIds.includes(g.id)
                      ? 'bg-[#fc4c02] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results count and clear */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-600">
          Showing {filteredCount} of {totalCount} activities
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-[#fc4c02] hover:text-[#e34402] font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
