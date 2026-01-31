import { describe, it, expect } from 'vitest';
import {
  formatDistance,
  formatDistanceMiles,
  formatDuration,
  formatPace,
  formatSpeed,
  formatElevation,
  formatDate,
  formatDateTime,
  formatCalories,
  formatHeartRate,
  getActivityIcon,
} from './formatters';

describe('formatDistance', () => {
  it('formats meters under 1000 as meters', () => {
    expect(formatDistance(500)).toBe('500 m');
    expect(formatDistance(999)).toBe('999 m');
  });

  it('formats meters over 1000 as kilometers', () => {
    expect(formatDistance(1000)).toBe('1.00 km');
    expect(formatDistance(5234.5)).toBe('5.23 km');
    expect(formatDistance(42195)).toBe('42.20 km');
  });
});

describe('formatDistanceMiles', () => {
  it('converts meters to miles', () => {
    expect(formatDistanceMiles(1609.344)).toBe('1.00 mi');
    expect(formatDistanceMiles(42195)).toBe('26.22 mi');
  });
});

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(30)).toBe('30s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(3599)).toBe('59m 59s');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
    expect(formatDuration(3661)).toBe('1h 1m');
    expect(formatDuration(7200)).toBe('2h 0m');
  });
});

describe('formatPace', () => {
  it('returns dash for zero speed', () => {
    expect(formatPace(0, 'Run')).toBe('-');
  });

  it('formats running pace as min/km', () => {
    // 3.33 m/s = 5:00 /km
    expect(formatPace(3.33, 'Run')).toBe('5:00 /km');
    expect(formatPace(3.33, 'Walk')).toBe('5:00 /km');
    expect(formatPace(3.33, 'Hike')).toBe('5:00 /km');
  });

  it('formats cycling speed as km/h', () => {
    // 10 m/s = 36 km/h
    expect(formatPace(10, 'Ride')).toBe('36.0 km/h');
  });
});

describe('formatSpeed', () => {
  it('converts m/s to km/h', () => {
    expect(formatSpeed(10)).toBe('36.0 km/h');
    expect(formatSpeed(2.78)).toBe('10.0 km/h');
  });
});

describe('formatElevation', () => {
  it('rounds to nearest meter', () => {
    expect(formatElevation(100.4)).toBe('100 m');
    expect(formatElevation(100.6)).toBe('101 m');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    expect(formatDate('2024-01-15T12:30:00Z')).toBe('Jan 15, 2024');
  });
});

describe('formatDateTime', () => {
  it('formats ISO date string with time', () => {
    const result = formatDateTime('2024-01-15T12:30:00Z');
    expect(result).toContain('Jan 15, 2024');
  });
});

describe('formatCalories', () => {
  it('rounds calories', () => {
    expect(formatCalories(523.7)).toBe('524 cal');
    expect(formatCalories(100)).toBe('100 cal');
  });
});

describe('formatHeartRate', () => {
  it('rounds heart rate', () => {
    expect(formatHeartRate(145.5)).toBe('146 bpm');
    expect(formatHeartRate(120)).toBe('120 bpm');
  });
});

describe('getActivityIcon', () => {
  it('returns correct emoji for known activity types', () => {
    expect(getActivityIcon('Run')).toBe('🏃');
    expect(getActivityIcon('Ride')).toBe('🚴');
    expect(getActivityIcon('Swim')).toBe('🏊');
    expect(getActivityIcon('Hike')).toBe('🥾');
    expect(getActivityIcon('Yoga')).toBe('🧘');
  });

  it('returns default emoji for unknown types', () => {
    expect(getActivityIcon('Unknown')).toBe('🏅');
    expect(getActivityIcon('')).toBe('🏅');
  });
});
