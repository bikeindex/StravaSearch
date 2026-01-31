import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ActivityList } from '../components/ActivityList';
import { mockActivities, mockGear } from './mocks';

const meta = {
  title: 'Components/ActivityList',
  component: ActivityList,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActivityList>;

export default meta;
type Story = StoryObj<typeof meta>;

const ActivityListWrapper = (args: React.ComponentProps<typeof ActivityList>) => {
  const [selectedIds, setSelectedIds] = useState(args.selectedIds);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(args.activities.map((a) => a.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <ActivityList
        {...args}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ActivityListWrapper {...args} />,
  args: {
    activities: mockActivities,
    gear: mockGear,
    isLoading: false,
    selectedIds: new Set(),
    onToggleSelect: () => {},
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
  },
};

export const Loading: Story = {
  render: (args) => <ActivityListWrapper {...args} />,
  args: {
    activities: [],
    gear: mockGear,
    isLoading: true,
    selectedIds: new Set(),
    onToggleSelect: () => {},
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
  },
};

export const Empty: Story = {
  render: (args) => <ActivityListWrapper {...args} />,
  args: {
    activities: [],
    gear: mockGear,
    isLoading: false,
    selectedIds: new Set(),
    onToggleSelect: () => {},
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
  },
};

export const WithSelections: Story = {
  render: (args) => <ActivityListWrapper {...args} />,
  args: {
    activities: mockActivities,
    gear: mockGear,
    isLoading: false,
    selectedIds: new Set([1001, 1002]),
    onToggleSelect: () => {},
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
  },
};

export const Updating: Story = {
  render: (args) => <ActivityListWrapper {...args} />,
  args: {
    activities: mockActivities,
    gear: mockGear,
    isLoading: false,
    selectedIds: new Set([1001, 1002, 1003]),
    onToggleSelect: () => {},
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: true,
  },
};

// Generate many activities for pagination testing
const manyActivities = Array.from({ length: 75 }, (_, i) => ({
  ...mockActivities[i % mockActivities.length],
  id: 2000 + i,
  name: `Activity ${i + 1} - ${mockActivities[i % mockActivities.length].name}`,
}));

export const ManyActivities: Story = {
  render: (args) => <ActivityListWrapper {...args} />,
  args: {
    activities: manyActivities,
    gear: mockGear,
    isLoading: false,
    selectedIds: new Set(),
    onToggleSelect: () => {},
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
  },
};
