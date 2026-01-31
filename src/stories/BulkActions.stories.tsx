import type { Meta, StoryObj } from '@storybook/react';
import { BulkActions } from '../components/BulkActions';
import { mockGear } from './mocks';

const meta = {
  title: 'Components/BulkActions',
  component: BulkActions,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelectAll: { action: 'selectAll' },
    onDeselectAll: { action: 'deselectAll' },
    onUpdateSelected: { action: 'updateSelected' },
  },
} satisfies Meta<typeof BulkActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoneSelected: Story = {
  args: {
    selectedCount: 0,
    totalCount: 150,
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
    gear: mockGear,
  },
};

export const SomeSelected: Story = {
  args: {
    selectedCount: 12,
    totalCount: 150,
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
    gear: mockGear,
  },
};

export const AllSelected: Story = {
  args: {
    selectedCount: 150,
    totalCount: 150,
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
    gear: mockGear,
  },
};

export const Updating: Story = {
  args: {
    selectedCount: 12,
    totalCount: 150,
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: true,
    gear: mockGear,
  },
};

export const NoGear: Story = {
  args: {
    selectedCount: 5,
    totalCount: 50,
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onUpdateSelected: async () => {},
    isUpdating: false,
    gear: [],
  },
};
