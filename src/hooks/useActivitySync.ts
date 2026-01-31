import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllActivities,
  getAthleteGear,
} from '../services/strava';
import {
  saveActivities,
  saveGear,
  getSyncState,
  updateSyncState,
  getActivitiesForAthlete,
  type SyncState,
} from '../services/database';

interface SyncProgress {
  loaded: number;
  total: number | null;
  status: string;
}

interface UseActivitySyncResult {
  isSyncing: boolean;
  progress: SyncProgress | null;
  error: string | null;
  syncAll: () => Promise<void>;
  syncRecent: () => Promise<void>;
}

export function useActivitySync(): UseActivitySyncResult {
  const { athlete, refreshSyncState } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncAll = useCallback(async () => {
    if (!athlete || isSyncing) return;

    setIsSyncing(true);
    setError(null);
    setProgress({ loaded: 0, total: null, status: 'Starting sync...' });

    try {
      // Sync gear first
      setProgress({ loaded: 0, total: null, status: 'Syncing gear...' });
      const gear = await getAthleteGear();
      await saveGear(gear, athlete.id);

      // Sync all activities
      setProgress({ loaded: 0, total: null, status: 'Downloading activities...' });

      const activities = await getAllActivities((loaded, total) => {
        setProgress({
          loaded,
          total,
          status: `Downloaded ${loaded} activities...`,
        });
      });

      // Save to database
      setProgress({
        loaded: activities.length,
        total: activities.length,
        status: 'Saving to local database...',
      });

      await saveActivities(activities, athlete.id);

      // Update sync state
      const oldestActivity = activities.length > 0
        ? activities.reduce((oldest, act) =>
            new Date(act.start_date) < new Date(oldest.start_date) ? act : oldest
          )
        : null;

      const syncState: SyncState = {
        athleteId: athlete.id,
        lastSyncedAt: Date.now(),
        oldestActivityDate: oldestActivity?.start_date || null,
        isInitialSyncComplete: true,
      };

      await updateSyncState(syncState);
      await refreshSyncState();

      setProgress({
        loaded: activities.length,
        total: activities.length,
        status: `Sync complete! ${activities.length} activities downloaded.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [athlete, isSyncing, refreshSyncState]);

  const syncRecent = useCallback(async () => {
    if (!athlete || isSyncing) return;

    setIsSyncing(true);
    setError(null);
    setProgress({ loaded: 0, total: null, status: 'Checking for new activities...' });

    try {
      // Get the most recent activity date from the database
      const existingActivities = await getActivitiesForAthlete(athlete.id);
      let afterDate: number | undefined;

      if (existingActivities.length > 0) {
        const mostRecent = existingActivities.reduce((newest, act) =>
          new Date(act.start_date) > new Date(newest.start_date) ? act : newest
        );
        afterDate = new Date(mostRecent.start_date).getTime();
      }

      // Sync gear
      setProgress({ loaded: 0, total: null, status: 'Syncing gear...' });
      const gear = await getAthleteGear();
      await saveGear(gear, athlete.id);

      // Get new activities
      setProgress({ loaded: 0, total: null, status: 'Checking for new activities...' });

      const newActivities = await getAllActivities((loaded, total) => {
        setProgress({
          loaded,
          total,
          status: `Found ${loaded} new activities...`,
        });
      }, afterDate);

      if (newActivities.length > 0) {
        setProgress({
          loaded: newActivities.length,
          total: newActivities.length,
          status: 'Saving new activities...',
        });

        await saveActivities(newActivities, athlete.id);
      }

      // Update sync state
      const currentSyncState = await getSyncState(athlete.id);
      await updateSyncState({
        ...currentSyncState!,
        lastSyncedAt: Date.now(),
      });
      await refreshSyncState();

      setProgress({
        loaded: newActivities.length,
        total: newActivities.length,
        status: newActivities.length > 0
          ? `Sync complete! ${newActivities.length} new activities added.`
          : 'Already up to date!',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [athlete, isSyncing, refreshSyncState]);

  return {
    isSyncing,
    progress,
    error,
    syncAll,
    syncRecent,
  };
}
