import type { StoredActivity, StoredGear } from '../services/database';
import {
  formatDistance,
  formatDuration,
  formatPace,
  formatDate,
  formatElevation,
  getActivityIcon,
} from '../utils/formatters';
import { MapPin, Clock, TrendingUp, Activity, Zap, Heart } from 'lucide-react';

interface ActivityCardProps {
  activity: StoredActivity;
  gear: StoredGear[];
  isSelected: boolean;
  onToggleSelect: () => void;
}

export function ActivityCard({
  activity,
  gear,
  isSelected,
  onToggleSelect,
}: ActivityCardProps) {
  const activityGear = gear.find((g) => g.id === activity.gear_id);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all hover:shadow-md ${
        isSelected ? 'border-[#fc4c02]' : 'border-transparent'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <label className="flex items-center mt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 text-[#fc4c02] border-gray-300 rounded focus:ring-[#fc4c02]"
            />
          </label>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <span className="text-xs font-medium text-gray-500 uppercase">
                {activity.type}
              </span>
              <span className="text-xs text-gray-400">
                {formatDate(activity.start_date_local)}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 truncate">
              <a
                href={`https://www.strava.com/activities/${activity.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#fc4c02]"
              >
                {activity.name}
              </a>
            </h3>

            {(activity.location_city || activity.location_state) && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {[activity.location_city, activity.location_state]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            )}

            {activity.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">{formatDistance(activity.distance)}</div>
              <div className="text-xs text-gray-500">Distance</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">{formatDuration(activity.moving_time)}</div>
              <div className="text-xs text-gray-500">Time</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">
                {formatPace(activity.average_speed, activity.type)}
              </div>
              <div className="text-xs text-gray-500">Pace/Speed</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium">
                {formatElevation(activity.total_elevation_gain)}
              </div>
              <div className="text-xs text-gray-500">Elevation</div>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
          {activity.average_heartrate && (
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span>{Math.round(activity.average_heartrate)} bpm avg</span>
            </div>
          )}

          {activity.calories && (
            <span>{Math.round(activity.calories)} cal</span>
          )}

          {activityGear && (
            <span className="px-2 py-0.5 bg-gray-100 rounded-full">
              {activityGear.name}
            </span>
          )}

          {activity.kudos_count > 0 && (
            <span>👍 {activity.kudos_count}</span>
          )}

          {activity.pr_count > 0 && (
            <span className="text-[#fc4c02] font-medium">
              🏆 {activity.pr_count} PR{activity.pr_count > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
