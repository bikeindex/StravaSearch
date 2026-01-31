import { useState, useCallback } from 'react';
import { ActivityCard } from './ActivityCard';
import { BulkActions } from './BulkActions';
import type { StoredActivity, StoredGear } from '../services/database';
import type { UpdatableActivity } from '../types/strava';
import { Loader2 } from 'lucide-react';

interface ActivityListProps {
  activities: StoredActivity[];
  gear: StoredGear[];
  isLoading: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpdateSelected: (updates: UpdatableActivity) => Promise<void>;
  isUpdating: boolean;
}

const PAGE_SIZE = 50;

export function ActivityList({
  activities,
  gear,
  isLoading,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onUpdateSelected,
  isUpdating,
}: ActivityListProps) {
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const displayedActivities = activities.slice(0, displayCount);
  const hasMore = displayCount < activities.length;

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + PAGE_SIZE, activities.length));
  }, [activities.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#fc4c02] animate-spin" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No activities found</p>
        <p className="text-sm mt-1">
          Try adjusting your filters or sync your activities from Strava
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BulkActions
        selectedCount={selectedIds.size}
        totalCount={activities.length}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onUpdateSelected={onUpdateSelected}
        isUpdating={isUpdating}
        gear={gear}
      />

      <div className="space-y-3">
        {displayedActivities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            gear={gear}
            isSelected={selectedIds.has(activity.id)}
            onToggleSelect={() => onToggleSelect(activity.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Load more ({activities.length - displayCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
