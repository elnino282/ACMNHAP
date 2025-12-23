export type SeasonStatus = 'planning' | 'active' | 'closing' | 'archived';

export interface Season {
  id: string;
  name: string;
  crop: string;
  variety: string;
  cropId?: number;
  varietyId?: number | null;
  linkedPlots: number;
  startDate: string;
  endDate: string;
  yieldPerHa: number | null;
  budgetTotal: number;
  actualCost: number;
  status: SeasonStatus;
  onTimePercentage: number;
  tasksTotal: number;
  tasksCompleted: number;
  incidentCount: number;
  documentCount: number;
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'task' | 'expense' | 'incident' | 'season';
}

export interface FilterState {
  crop: string;
  status: string;
  year: string;
}

