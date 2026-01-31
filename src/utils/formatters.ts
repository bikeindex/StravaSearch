import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDistanceMiles(meters: number): string {
  const miles = meters / 1609.344;
  return `${miles.toFixed(2)} mi`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatPace(metersPerSecond: number, activityType: string): string {
  if (metersPerSecond === 0) return '-';

  // For running/walking, show min/km
  if (['Run', 'Walk', 'Hike', 'VirtualRun'].includes(activityType)) {
    const secondsPerKm = 1000 / metersPerSecond;
    const minutes = Math.floor(secondsPerKm / 60);
    const seconds = Math.round(secondsPerKm % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
  }

  // For cycling, show km/h
  const kmPerHour = metersPerSecond * 3.6;
  return `${kmPerHour.toFixed(1)} km/h`;
}

export function formatSpeed(metersPerSecond: number): string {
  const kmPerHour = metersPerSecond * 3.6;
  return `${kmPerHour.toFixed(1)} km/h`;
}

export function formatElevation(meters: number): string {
  return `${Math.round(meters)} m`;
}

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy');
}

export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMM d, yyyy h:mm a');
}

export function formatTimeAgo(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateForInput(dateString: string | null): string {
  if (!dateString) return '';
  const date = parseISO(dateString);
  return format(date, 'yyyy-MM-dd');
}

export function getActivityIcon(activityType: string): string {
  const icons: Record<string, string> = {
    Run: '🏃',
    VirtualRun: '🏃',
    Ride: '🚴',
    VirtualRide: '🚴',
    EBikeRide: '🚴',
    Swim: '🏊',
    Walk: '🚶',
    Hike: '🥾',
    AlpineSki: '⛷️',
    BackcountrySki: '⛷️',
    NordicSki: '⛷️',
    Snowboard: '🏂',
    Kayaking: '🚣',
    Rowing: '🚣',
    Canoeing: '🛶',
    StandUpPaddling: '🏄',
    Surfing: '🏄',
    Kitesurf: '🪁',
    Windsurf: '🏄',
    Yoga: '🧘',
    WeightTraining: '🏋️',
    Workout: '💪',
    Crossfit: '💪',
    RockClimbing: '🧗',
    IceSkate: '⛸️',
    InlineSkate: '🛼',
    Soccer: '⚽',
    Golf: '⛳',
    Skateboard: '🛹',
  };

  return icons[activityType] || '🏅';
}

export function formatCalories(calories: number): string {
  return `${Math.round(calories)} cal`;
}

export function formatHeartRate(bpm: number): string {
  return `${Math.round(bpm)} bpm`;
}
