import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getActivitiesForAthlete,
  getGearForAthlete,
  updateActivityInDb,
  type StoredActivity,
  type StoredGear,
} from '../services/database';
import { updateActivity as updateActivityApi } from '../services/strava';
import type { SearchFilters, UpdatableActivity } from '../types/strava';

interface UseActivitiesResult {
  activities: StoredActivity[];
  filteredActivities: StoredActivity[];
  gear: StoredGear[];
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  selectAll: () => void;
  deselectAll: () => void;
  updateSelectedActivities: (updates: UpdatableActivity) => Promise<void>;
  isUpdating: boolean;
  refreshActivities: () => Promise<void>;
  activityTypes: string[];
}

const defaultFilters: SearchFilters = {
  query: '',
  activityTypes: [],
  gearIds: [],
  dateFrom: null,
  dateTo: null,
};

export function useActivities(): UseActivitiesResult {
  const { athlete, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<StoredActivity[]>([]);
  const [gear, setGear] = useState<StoredGear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  const loadActivities = useCallback(async () => {
    if (!athlete) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [loadedActivities, loadedGear] = await Promise.all([
        getActivitiesForAthlete(athlete.id),
        getGearForAthlete(athlete.id),
      ]);

      // Sort by date descending
      loadedActivities.sort(
        (a, b) => new Date(b.start_date_local).getTime() - new Date(a.start_date_local).getTime()
      );

      setActivities(loadedActivities);
      setGear(loadedGear);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, [athlete]);

  useEffect(() => {
    if (isAuthenticated && athlete) {
      loadActivities();
    } else {
      setActivities([]);
      setGear([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, athlete, loadActivities]);

  // Get unique activity types from the data
  const activityTypes = useMemo(() => {
    const types = new Set(activities.map((a) => a.type));
    return Array.from(types).sort();
  }, [activities]);

  // Filter activities based on search criteria
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Text search
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchableText = [
          activity.name,
          activity.description,
          activity.location_city,
          activity.location_state,
          activity.location_country,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Activity type filter
      if (filters.activityTypes.length > 0) {
        if (!filters.activityTypes.includes(activity.type)) {
          return false;
        }
      }

      // Gear filter
      if (filters.gearIds.length > 0) {
        if (!activity.gear_id || !filters.gearIds.includes(activity.gear_id)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom) {
        const activityDate = new Date(activity.start_date_local);
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (activityDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const activityDate = new Date(activity.start_date_local);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (activityDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }, [activities, filters]);

  // Deselect activities that are no longer visible
  useEffect(() => {
    const filteredIdSet = new Set(filteredActivities.map((a) => a.id));
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const pruned = new Set([...prev].filter((id) => filteredIdSet.has(id)));
      return pruned.size === prev.size ? prev : pruned;
    });
  }, [filteredActivities]);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredActivities.map((a) => a.id)));
  }, [filteredActivities]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const updateSelectedActivities = useCallback(
    async (updates: UpdatableActivity) => {
      if (selectedIds.size === 0 || isUpdating) return;

      setIsUpdating(true);
      setError(null);

      const errors: string[] = [];
      let successCount = 0;

      for (const id of selectedIds) {
        try {
          // Update on Strava
          const updatedActivity = await updateActivityApi(id, updates);

          // Update in local database
          await updateActivityInDb(id, updatedActivity);

          successCount++;
        } catch (err) {
          errors.push(`Activity ${id}: ${err instanceof Error ? err.message : 'Failed'}`);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Reload activities
      await loadActivities();

      if (errors.length > 0) {
        setError(`Updated ${successCount}/${selectedIds.size} activities. Errors: ${errors.join(', ')}`);
      }

      setSelectedIds(new Set());
      setIsUpdating(false);
    },
    [selectedIds, isUpdating, loadActivities]
  );

  return {
    activities,
    filteredActivities,
    gear,
    isLoading,
    error,
    filters,
    setFilters,
    selectedIds,
    setSelectedIds,
    selectAll,
    deselectAll,
    updateSelectedActivities,
    isUpdating,
    refreshActivities: loadActivities,
    activityTypes,
  };
}
