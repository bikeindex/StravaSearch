import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useActivities } from './hooks/useActivities';
import { Header } from './components/Header';
import { SearchFilters } from './components/SearchFilters';
import { ActivityList } from './components/ActivityList';
import { LoginPage } from './components/LoginPage';
import { SettingsModal } from './components/SettingsModal';
import { InitialSyncPrompt } from './components/InitialSyncPrompt';
import { Loader2 } from 'lucide-react';

function Dashboard() {
  const [showSettings, setShowSettings] = useState(false);
  const { syncState } = useAuth();
  const {
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
    refreshActivities,
    activityTypes,
  } = useActivities();

  // Refresh activities when settings modal closes (in case of sync)
  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
    refreshActivities();
  }, [refreshActivities]);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, [setSelectedIds]);

  // Auto-refresh activities periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshActivities();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshActivities]);

  // Show initial sync prompt if no sync has been done
  if (!syncState?.isInitialSyncComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onOpenSettings={() => setShowSettings(true)} />
        <InitialSyncPrompt />
        <SettingsModal isOpen={showSettings} onClose={handleCloseSettings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          activityTypes={activityTypes}
          gear={gear}
          totalCount={activities.length}
          filteredCount={filteredActivities.length}
        />

        <ActivityList
          activities={filteredActivities}
          gear={gear}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onUpdateSelected={updateSelectedActivities}
          isUpdating={isUpdating}
        />
      </main>

      <SettingsModal isOpen={showSettings} onClose={handleCloseSettings} />
    </div>
  );
}

export default function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#fc4c02] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}
