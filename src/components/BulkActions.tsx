import { useState } from 'react';
import { CheckSquare, Square, Edit3, Loader2, X } from 'lucide-react';
import type { StoredGear } from '../services/database';
import type { UpdatableActivity } from '../types/strava';
import { ACTIVITY_TYPES } from '../types/strava';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onUpdateSelected: (updates: UpdatableActivity) => Promise<void>;
  isUpdating: boolean;
  gear: StoredGear[];
}

export function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onUpdateSelected,
  isUpdating,
  gear,
}: BulkActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editType, setEditType] = useState<'type' | 'gear' | null>(null);
  const [selectedType, setSelectedType] = useState('');
  const [selectedGearId, setSelectedGearId] = useState('');

  const handleUpdate = async () => {
    if (editType === 'type' && selectedType) {
      await onUpdateSelected({ type: selectedType as UpdatableActivity['type'] });
    } else if (editType === 'gear') {
      // Empty string means remove gear
      await onUpdateSelected({ gear_id: selectedGearId || '' });
    }
    setShowEditModal(false);
    setEditType(null);
    setSelectedType('');
    setSelectedGearId('');
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditType(null);
    setSelectedType('');
    setSelectedGearId('');
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-lg shadow-sm p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            {selectedCount === totalCount && totalCount > 0 ? (
              <CheckSquare className="w-5 h-5 text-[#fc4c02]" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span>
              {selectedCount > 0
                ? `${selectedCount} selected`
                : `Select all (${totalCount})`}
            </span>
          </button>

          {selectedCount > 0 && (
            <button
              onClick={onDeselectAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear selection
            </button>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditType('type');
                setShowEditModal(true);
              }}
              disabled={isUpdating}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#fc4c02] text-white rounded-md hover:bg-[#e34402] transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
              Change Type
            </button>

            <button
              onClick={() => {
                setEditType('gear');
                setShowEditModal(true);
              }}
              disabled={isUpdating}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit3 className="w-4 h-4" />
              )}
              Change Gear
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editType === 'type' ? 'Change Activity Type' : 'Change Equipment'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              This will update {selectedCount} selected activit{selectedCount === 1 ? 'y' : 'ies'} on Strava.
            </p>

            {editType === 'type' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select new activity type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent outline-none"
                >
                  <option value="">Choose a type...</option>
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editType === 'gear' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select equipment
                </label>
                <select
                  value={selectedGearId}
                  onChange={(e) => setSelectedGearId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent outline-none"
                >
                  <option value="">None (remove equipment)</option>
                  {gear.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isUpdating || (editType === 'type' && !selectedType)}
                className="flex-1 px-4 py-2 bg-[#fc4c02] text-white rounded-lg hover:bg-[#e34402] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
