import type { Activity } from './types';

// Note: MOCK_SEASONS and MOCK_ACTIVITIES removed - now using entity API hooks

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'closing', label: 'Closing' },
  { value: 'archived', label: 'Archived' },
];

export const CROP_OPTIONS = [
  { value: 'corn', label: 'Corn' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'soybean', label: 'Soybean' },
  { value: 'rice', label: 'Rice' },
  { value: 'tomato', label: 'Tomato' },
];

export const DEFAULT_PAGINATION = {
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 25, 50],
};

// Type export for Activity to ensure it's still available
export type { Activity };
