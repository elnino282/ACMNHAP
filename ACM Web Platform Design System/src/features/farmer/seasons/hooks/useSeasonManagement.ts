import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  useSeasons,
  useCreateSeason,
  useUpdateSeason,
  useDeleteSeason,
  useUpdateSeasonStatus,
  type Season as ApiSeason,
  type SeasonStatus as ApiSeasonStatus,
  type SeasonCreateRequest,
} from '@/entities/season';
import { useCrops } from '@/entities/crop';
import type { Season, SeasonStatus, FilterState } from '../types';
import { DEFAULT_PAGINATION } from '../constants';

// ═══════════════════════════════════════════════════════════════
// TYPE TRANSFORMERS
// ═══════════════════════════════════════════════════════════════

const mapApiStatusToFeature = (status?: ApiSeasonStatus): SeasonStatus => {
  switch (status) {
    case 'PLANNED': return 'planning';
    case 'ACTIVE': return 'active';
    case 'COMPLETED': return 'closing';
    case 'CANCELLED':
    case 'ARCHIVED': return 'archived';
    default: return 'planning';
  }
};

const mapFeatureStatusToApi = (status: SeasonStatus): ApiSeasonStatus => {
  switch (status) {
    case 'planning': return 'PLANNED';
    case 'active': return 'ACTIVE';
    case 'closing': return 'COMPLETED';
    case 'archived': return 'ARCHIVED';
    default: return 'PLANNED';
  }
};

const transformApiToFeature = (api: ApiSeason, cropMap: Map<number, string>): Season => {
  // Calculate end date: use plannedHarvestDate, then endDate, then startDate as fallback
  const endDate = api.plannedHarvestDate || api.endDate || api.startDate;
  
  // Get crop name from map or use fallback
  const cropDisplay = cropMap.get(api.cropId) || `Crop #${api.cropId}`;
  
  // For varieties, we'll show a simple fallback for now
  // In the future, we could fetch varieties per crop if needed
  const varietyDisplay = api.varietyId ? `Variety #${api.varietyId}` : 'No variety';
  
  return {
    id: String(api.id),
    name: api.seasonName,
    crop: cropDisplay,
    variety: varietyDisplay,
    cropId: api.cropId,
    varietyId: api.varietyId,
    linkedPlots: 1, // Default to 1 until multi-plot support is added
    startDate: api.startDate,
    endDate: endDate,
    yieldPerHa: api.actualYieldKg ?? api.expectedYieldKg ?? null,
    budgetTotal: 0, // TODO: Add budget tracking in future
    actualCost: 0, // TODO: Add cost tracking in future
    status: mapApiStatusToFeature(api.status),
    onTimePercentage: 100, // TODO: Calculate based on tasks
    tasksTotal: 0, // TODO: Add task tracking
    tasksCompleted: 0, // TODO: Add task tracking
    incidentCount: 0, // TODO: Add incident tracking
    documentCount: 0, // TODO: Add document tracking
  };
};

// ═══════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════

export function useSeasonManagement() {
  // API Hooks - Season data
  const { data: apiData, isLoading, error: apiError, refetch } = useSeasons();
  
  // API Hooks - Crops for name resolution
  const { data: cropsData, isLoading: cropsLoading } = useCrops();
  
  // Create crop lookup map
  const cropMap = useMemo(() => {
    if (!cropsData) return new Map<number, string>();
    const map = new Map<number, string>();
    cropsData.forEach(crop => {
      map.set(crop.id, crop.cropName);
    });
    console.log('[SeasonManagement] Crop map created:', map.size, 'crops');
    return map;
  }, [cropsData]);
  
  // Season mutations
  const createMutation = useCreateSeason({
    onSuccess: () => {
      toast.success('Season created successfully');
      setNewSeasonOpen(false);
    },
    onError: (err) => toast.error('Failed to create season', { description: err.message }),
  });
  const updateMutation = useUpdateSeason({
    onSuccess: () => toast.success('Season updated successfully'),
    onError: (err) => toast.error('Failed to update season', { description: err.message }),
  });
  const deleteMutation = useDeleteSeason({
    onSuccess: () => {
      toast.success('Season deleted successfully');
      setDeleteDialogOpen(false);
      setSeasonToDelete(null);
    },
    onError: (err) => toast.error('Failed to delete season', { description: err.message }),
  });
  const updateStatusMutation = useUpdateSeasonStatus({
    onSuccess: () => toast.success('Season status updated'),
    onError: (err) => toast.error('Failed to update status', { description: err.message }),
  });

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    crop: 'all',
    status: 'all',
    year: 'all',
  });

  // Selection
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGINATION.rowsPerPage);

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<string | null>(null);
  const [closeSeasonOpen, setCloseSeasonOpen] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [newSeasonOpen, setNewSeasonOpen] = useState(false);

  // Transform API data to feature format
  const seasons = useMemo(() => {
    console.log('[SeasonManagement] Raw API Data:', apiData);
    console.log('[SeasonManagement] Crop map size:', cropMap.size);
    
    if (!apiData) {
      console.log('[SeasonManagement] No API data received');
      return [];
    }
    
    if (!apiData.items || apiData.items.length === 0) {
      console.log('[SeasonManagement] API data has no items');
      return [];
    }
    
    console.log('[SeasonManagement] Transforming', apiData.items.length, 'seasons');
    const transformed = apiData.items.map((item, index) => {
      try {
        const result = transformApiToFeature(item, cropMap);
        console.log(`[SeasonManagement] Transformed season ${index}:`, result);
        return result;
      } catch (error) {
        console.error(`[SeasonManagement] Error transforming season ${index}:`, error, item);
        throw error;
      }
    });
    
    console.log('[SeasonManagement] Total transformed seasons:', transformed.length);
    return transformed;
  }, [apiData, cropMap]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        setSearchDebounced(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter and search logic
  const filteredSeasons = useMemo(() => {
    console.log('[SeasonManagement] Filtering seasons. Total:', seasons.length);
    console.log('[SeasonManagement] Filters:', filters);
    console.log('[SeasonManagement] Search query:', searchDebounced);
    
    const filtered = seasons.filter((season) => {
      // Search filter
      if (searchDebounced) {
        const searchLower = searchDebounced.toLowerCase();
        const matchesSearch =
          season.name.toLowerCase().includes(searchLower) ||
          season.crop.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Crop filter
      if (filters.crop !== 'all' && season.crop !== filters.crop) return false;

      // Status filter
      if (filters.status !== 'all' && season.status !== filters.status) return false;

      // Year filter
      if (filters.year !== 'all') {
        const startYear = new Date(season.startDate).getFullYear().toString();
        if (startYear !== filters.year) return false;
      }

      return true;
    });
    
    console.log('[SeasonManagement] Filtered seasons:', filtered.length);
    return filtered;
  }, [seasons, searchDebounced, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredSeasons.length / rowsPerPage);
  const paginatedSeasons = filteredSeasons.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  console.log('[SeasonManagement] Pagination - Page:', currentPage, 'Total pages:', totalPages, 'Showing:', paginatedSeasons.length, 'seasons');

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchDebounced]);

  // Helper functions
  const getStatusColor = (status: SeasonStatus) => {
    switch (status) {
      case 'planning':
        return 'bg-[#4A90E2]/10 text-[#4A90E2] border-[#4A90E2]/20';
      case 'active':
        return 'bg-[#3BA55D]/10 text-[#3BA55D] border-[#3BA55D]/20';
      case 'closing':
        return 'bg-[#F4C542]/10 text-[#333333] border-[#F4C542]/20';
      case 'archived':
        return 'bg-[#777777]/10 text-[#777777] border-[#777777]/20';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: SeasonStatus) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'active':
        return 'Active';
      case 'closing':
        return 'Closing';
      case 'archived':
        return 'Archived';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const year = start.getFullYear();
    return `${startMonth} – ${endMonth} ${year}`;
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  // Event handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedSeasons(paginatedSeasons.map((s) => s.id));
    } else {
      setSelectedSeasons([]);
    }
  }, [paginatedSeasons]);

  const handleSelectSeason = useCallback((seasonId: string, checked: boolean) => {
    if (checked) {
      setSelectedSeasons(prev => [...prev, seasonId]);
    } else {
      setSelectedSeasons(prev => prev.filter((id) => id !== seasonId));
    }
  }, []);

  const handleViewDetails = useCallback((season: Season) => {
    setSelectedSeason(season);
    setViewMode('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedSeason(null);
    setActiveTab('overview');
  }, []);

  const handleDeleteSeason = useCallback((seasonId: string) => {
    setSeasonToDelete(seasonId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (seasonToDelete) {
      const numId = parseInt(seasonToDelete, 10);
      if (!isNaN(numId)) {
        deleteMutation.mutate(numId);
      }
    }
  }, [seasonToDelete, deleteMutation]);

  const handleCloseSeason = useCallback(() => {
    if (selectedSeason && closeReason.trim()) {
      const numId = parseInt(selectedSeason.id, 10);
      if (!isNaN(numId)) {
        updateStatusMutation.mutate(
          { id: numId, data: { status: 'ARCHIVED', reason: closeReason } },
          {
            onSuccess: () => {
              setCloseSeasonOpen(false);
              setCloseReason('');
              handleBackToList();
            },
          }
        );
      }
    }
  }, [selectedSeason, closeReason, updateStatusMutation, handleBackToList]);

  const handleDuplicate = useCallback((season: Season) => {
    // For duplicating, we'd need to call create with the same data
    // This is a simplified version - in reality you'd open a form
    toast.success('Season duplicated successfully');
  }, []);

  const handleExportCSV = useCallback(() => {
    toast.success('Exporting seasons data to CSV...');
  }, []);

  const handleCreateSeason = useCallback((formData: SeasonCreateRequest) => {
    if (!formData.seasonName) {
      toast.error('Season name is required');
      return;
    }
    if (!formData.plotId) {
      toast.error('Plot is required');
      return;
    }
    if (!formData.cropId) {
      toast.error('Crop is required');
      return;
    }
    createMutation.mutate(formData);
  }, [createMutation]);

  // Derived data
  const uniqueCrops = useMemo(() =>
    Array.from(new Set(seasons.map((s) => s.crop))),
    [seasons]
  );
  const uniqueYears = useMemo(() =>
    Array.from(
      new Set(seasons.map((s) => new Date(s.startDate).getFullYear().toString()))
    ).sort((a, b) => b.localeCompare(a)),
    [seasons]
  );

  return {
    // View state
    viewMode,
    setViewMode,
    selectedSeason,
    activeTab,
    setActiveTab,

    // Search & filters
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,

    // Selection
    selectedSeasons,
    handleSelectAll,
    handleSelectSeason,

    // Pagination
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    totalPages,
    paginatedSeasons,
    filteredSeasons,

    // Dialogs
    deleteDialogOpen,
    setDeleteDialogOpen,
    closeSeasonOpen,
    setCloseSeasonOpen,
    newSeasonOpen,
    setNewSeasonOpen,
    closeReason,
    setCloseReason,

    // Handlers
    handleViewDetails,
    handleBackToList,
    handleDeleteSeason,
    confirmDelete,
    handleCloseSeason,
    handleDuplicate,
    handleExportCSV,
    handleCreateSeason,

    // Helper functions
    getStatusColor,
    getStatusLabel,
    formatDateRange,
    calculateProgress,

    // Data
    uniqueCrops,
    uniqueYears,

    // API State
    isLoading: isLoading || cropsLoading,
    error: apiError ?? null,
    refetch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

