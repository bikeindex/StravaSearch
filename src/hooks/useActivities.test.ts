import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useActivities } from './useActivities';

const mockAthlete = { id: 12345 };
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    athlete: mockAthlete,
    isAuthenticated: true,
  }),
}));

const activityBase = {
  start_date: '2024-01-15T12:30:00Z',
  start_date_local: '2024-01-15T07:30:00Z',
  distance: 1000,
  moving_time: 600,
  elapsed_time: 600,
  total_elevation_gain: 0,
  timezone: '',
  utc_offset: 0,
  achievement_count: 0,
  kudos_count: 0,
  comment_count: 0,
  athlete_count: 1,
  photo_count: 0,
  trainer: false,
  commute: false,
  manual: false,
  private: false,
  visibility: 'everyone' as const,
  flagged: false,
  average_speed: 1,
  max_speed: 2,
  has_heartrate: false,
  heartrate_opt_out: false,
  display_hide_heartrate_option: false,
  pr_count: 0,
  total_photo_count: 0,
  has_kudoed: false,
  athleteId: 12345,
  syncedAt: Date.now(),
};

vi.mock('../services/database', () => ({
  getActivitiesForAthlete: vi.fn(async () => [
    { ...activityBase, id: 1, name: 'Run 1', type: 'Run', sport_type: 'Run' },
    { ...activityBase, id: 2, name: 'Ride 1', type: 'Ride', sport_type: 'Ride' },
    { ...activityBase, id: 3, name: 'Swim 1', type: 'Swim', sport_type: 'Swim' },
  ]),
  getGearForAthlete: vi.fn(async () => []),
  updateActivityInDb: vi.fn(),
}));

describe('useActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deselects activities that are filtered out', async () => {
    const { result } = renderHook(() => useActivities());

    await waitFor(() => {
      expect(result.current.filteredActivities.length).toBe(3);
    });

    // Select the Run (1) and the Ride (2)
    act(() => {
      result.current.setSelectedIds(new Set([1, 2]));
    });
    expect(result.current.selectedIds).toEqual(new Set([1, 2]));

    // Filter to only Rides — Run should be deselected
    act(() => {
      result.current.setFilters((prev) => ({ ...prev, activityTypes: ['Ride'] }));
    });

    await waitFor(() => {
      expect(result.current.selectedIds).toEqual(new Set([2]));
    });
  });

  it('deselects all when no selected activities match filter', async () => {
    const { result } = renderHook(() => useActivities());

    await waitFor(() => {
      expect(result.current.filteredActivities.length).toBe(3);
    });

    act(() => {
      result.current.setSelectedIds(new Set([1]));
    });

    // Filter to only Swims — Run should be deselected
    act(() => {
      result.current.setFilters((prev) => ({ ...prev, activityTypes: ['Swim'] }));
    });

    await waitFor(() => {
      expect(result.current.selectedIds).toEqual(new Set());
    });
  });

  it('keeps selection when filtered activities still include selected', async () => {
    const { result } = renderHook(() => useActivities());

    await waitFor(() => {
      expect(result.current.filteredActivities.length).toBe(3);
    });

    act(() => {
      result.current.setSelectedIds(new Set([1]));
    });

    // Filter to Runs — selection should remain
    act(() => {
      result.current.setFilters((prev) => ({ ...prev, activityTypes: ['Run'] }));
    });

    await waitFor(() => {
      expect(result.current.filteredActivities.length).toBe(1);
    });
    expect(result.current.selectedIds).toEqual(new Set([1]));
  });
});
