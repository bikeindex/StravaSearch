import { useAuth } from '../contexts/AuthContext';
import { useActivitySync } from '../hooks/useActivitySync';
import { formatTimeAgo } from '../utils/formatters';
import { RefreshCw, LogOut, User, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { athlete, syncState, logout } = useAuth();
  const { isSyncing, syncRecent, progress } = useActivitySync();

  return (
    <header className="bg-[#fc4c02] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Strava Search</h1>
          </div>

          <div className="flex items-center gap-4">
            {syncState && (
              <span className="text-sm text-white/80 hidden sm:block">
                Last synced: {formatTimeAgo(new Date(syncState.lastSyncedAt).toISOString())}
              </span>
            )}

            <button
              onClick={syncRecent}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors disabled:opacity-50"
              title="Sync recent activities"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? progress?.status || 'Syncing...' : 'Sync'}
              </span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-white/20 rounded-md transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {athlete && (
              <div className="flex items-center gap-2">
                {athlete.profile_medium ? (
                  <img
                    src={athlete.profile_medium}
                    alt={athlete.firstname}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 p-1 bg-white/20 rounded-full" />
                )}
                <span className="hidden md:block font-medium">
                  {athlete.firstname} {athlete.lastname}
                </span>
              </div>
            )}

            <button
              onClick={logout}
              className="p-2 hover:bg-white/20 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
