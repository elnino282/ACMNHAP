import { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useTasksBySeason, useCreateTask, useUpdateTaskStatus, useDeleteTask, type Task as ApiTask, type TaskStatus as ApiTaskStatus } from '@/entities/task';
import { useOptionalSeason } from '@/shared/contexts';
import type { Task, TaskStatus, ViewMode, FilterState } from '../types';
import { STATUS_LABELS } from '../constants';

/**
 * Transform API task to feature task format
 */
const transformApiToFeature = (apiTask: ApiTask): Task => ({
  id: String(apiTask.id),
  title: apiTask.title,
  type: 'scouting',
  crop: 'Current Crop',
  plot: 'Plot A',
  assignee: 'Current User',
  assigneeInitials: 'CU',
  dueDate: apiTask.dueDate ?? apiTask.plannedDate ?? '',
  status: mapApiStatusToFeature(apiTask.status),
  notes: apiTask.notes ?? '',
  attachments: 0,
  priority: 'medium',
});

const mapApiStatusToFeature = (status?: string): TaskStatus => {
  switch (status) {
    case 'PENDING': return 'todo';
    case 'IN_PROGRESS': return 'in-progress';
    case 'DONE': return 'completed';
    default: return 'todo';
  }
};

const mapFeatureStatusToApi = (status: TaskStatus): ApiTaskStatus => {
  switch (status) {
    case 'todo': return 'PENDING';
    case 'in-progress': return 'IN_PROGRESS';
    case 'paused': return 'PENDING';
    case 'completed': return 'DONE';
    default: return 'PENDING';
  }
};

export function useTaskWorkspace() {
  const seasonContext = useOptionalSeason();
  const seasonId = seasonContext?.selectedSeasonId ?? 0;

  // API Hooks - all require seasonId
  const { data: apiTasksData, isLoading: apiLoading, error: apiError, refetch } = useTasksBySeason(seasonId, undefined, { enabled: seasonId > 0 });
  const createMutation = useCreateTask(seasonId, {
    onSuccess: () => { toast.success('Task created'); setCreateTaskOpen(false); },
    onError: (err) => toast.error('Failed to create task', { description: err.message }),
  });
  const updateStatusMutation = useUpdateTaskStatus(seasonId, {
    onSuccess: () => toast.success('Task status updated'),
    onError: (err) => toast.error('Failed to update', { description: err.message }),
  });
  const deleteMutation = useDeleteTask(seasonId, {
    onSuccess: () => toast.success('Task deleted'),
    onError: (err) => toast.error('Failed to delete', { description: err.message }),
  });

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [calendarMode, setCalendarMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [filters, setFilters] = useState<FilterState>({ status: 'all', type: 'all', assignee: 'all', plot: 'all' });
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);

  // Transformed data - no mock fallback
  const tasks = useMemo(() => {
    return apiTasksData?.items?.map(transformApiToFeature) ?? [];
  }, [apiTasksData]);

  const isLoading = seasonId > 0 ? apiLoading : false;
  const error = seasonId > 0 ? apiError : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) setSearchDebounced(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    if (searchDebounced) {
      const s = searchDebounced.toLowerCase();
      if (!task.title.toLowerCase().includes(s) && !task.plot.toLowerCase().includes(s) && !task.crop.toLowerCase().includes(s)) return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.type !== 'all' && task.type !== filters.type) return false;
    if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false;
    if (filters.plot !== 'all' && task.plot !== filters.plot) return false;
    return true;
  }), [tasks, searchDebounced, filters]);

  const handleTaskMove = useCallback((taskId: string, newStatus: TaskStatus) => {
    const id = parseInt(taskId, 10);
    if (!isNaN(id) && seasonId > 0) {
      updateStatusMutation.mutate({ id, data: { status: mapFeatureStatusToApi(newStatus) } });
    } else {
      toast.success(`Task moved to ${STATUS_LABELS[newStatus]}`);
    }
  }, [seasonId, updateStatusMutation]);

  const handleBulkComplete = useCallback(() => {
    selectedTasks.forEach(taskId => {
      const id = parseInt(taskId, 10);
      if (!isNaN(id) && seasonId > 0) updateStatusMutation.mutate({ id, data: { status: 'DONE' } });
    });
    toast.success(`${selectedTasks.length} tasks completed`);
    setSelectedTasks([]);
  }, [selectedTasks, seasonId, updateStatusMutation]);

  const handleDeleteTask = useCallback((taskId: string) => {
    const id = parseInt(taskId, 10);
    if (!isNaN(id) && seasonId > 0) deleteMutation.mutate(id);
    else toast.success('Task deleted');
  }, [seasonId, deleteMutation]);

  const handleSelectAll = useCallback((checked: boolean) => setSelectedTasks(checked ? filteredTasks.map(t => t.id) : []), [filteredTasks]);
  const handleSelectTask = useCallback((taskId: string, checked: boolean) => setSelectedTasks(prev => checked ? [...prev, taskId] : prev.filter(id => id !== taskId)), []);
  const handleReassign = useCallback(() => { toast.success(`${selectedTasks.length} tasks reassigned`); setReassignOpen(false); setSelectedTasks([]); }, [selectedTasks]);
  const handleCreateTask = useCallback((data: { title: string; plannedDate: string; dueDate: string; description?: string }) => {
    if (!seasonId) {
      toast.error('Select a season', { description: 'Pick a season to create tasks.' });
      return;
    }
    if (!data.title) {
      toast.error('Task title is required');
      return;
    }
    if (!data.dueDate) {
      toast.error('Due date is required');
      return;
    }
    const plannedDate = data.plannedDate || data.dueDate;
    createMutation.mutate({
      title: data.title,
      plannedDate,
      dueDate: data.dueDate,
      description: data.description,
    });
  }, [seasonId, createMutation]);

  const uniqueAssignees = useMemo(() => [...new Set(tasks.map(t => t.assignee))], [tasks]);
  const uniquePlots = useMemo(() => [...new Set(tasks.map(t => t.plot))], [tasks]);
  const activeFilterCount = useMemo(() => [filters.status, filters.type, filters.assignee, filters.plot].filter(f => f !== 'all').length, [filters]);

  return {
    seasonId, hasSeasonContext: !!seasonContext,
    viewMode, setViewMode, calendarMode, setCalendarMode, currentDate, setCurrentDate,
    searchQuery, setSearchQuery, filters, setFilters, activeFilterCount,
    selectedTasks, setSelectedTasks,
    filterDrawerOpen, setFilterDrawerOpen, createTaskOpen, setCreateTaskOpen, reassignOpen, setReassignOpen,
    tasks, filteredTasks, uniqueAssignees, uniquePlots,
    isLoading, error: error ?? null, refetch,
    handleTaskMove, handleBulkComplete, handleDeleteTask, handleSelectAll, handleSelectTask, handleReassign, handleCreateTask,
    isCreating: createMutation.isPending, isUpdating: updateStatusMutation.isPending, isDeleting: deleteMutation.isPending,
  };
}
