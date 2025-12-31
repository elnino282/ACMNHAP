import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SeasonHeader } from './SeasonHeader';
import { SeasonFilters } from './SeasonFilters';
import { SeasonTable } from './SeasonTable';
import { Season, SeasonStatus, FilterState } from '../types';
import { DEFAULT_PAGINATION } from '../constants';

interface SeasonListViewProps {
  // Data
  paginatedSeasons: Season[];
  filteredSeasons: Season[];
  selectedSeasons: string[];
  uniqueCrops: string[];
  uniqueYears: string[];

  // Filters & Search
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rows: number) => void;
  totalPages: number;

  // Handlers
  handleSelectAll: (checked: boolean) => void;
  handleSelectSeason: (seasonId: string, checked: boolean) => void;
  handleViewDetails: (season: Season) => void;
  handleDeleteSeason: (seasonId: string) => void;
  handleDuplicate: (season: Season) => void;
  handleExportCSV: () => void;
  onNewSeason: () => void;
  onCloseSeason: (season: Season) => void;

  // Helpers
  getStatusColor: (status: SeasonStatus) => string;
  getStatusLabel: (status: SeasonStatus) => string;
  formatDateRange: (startDate: string, endDate: string) => string;
  calculateProgress: (startDate: string, endDate: string) => number;
}

export function SeasonListView({
  paginatedSeasons,
  filteredSeasons,
  selectedSeasons,
  uniqueCrops,
  uniqueYears,
  filters,
  setFilters,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  rowsPerPage,
  setRowsPerPage,
  totalPages,
  handleSelectAll,
  handleSelectSeason,
  handleViewDetails,
  handleDeleteSeason,
  handleDuplicate,
  handleExportCSV,
  onNewSeason,
  onCloseSeason,
  getStatusColor,
  getStatusLabel,
  formatDateRange,
  calculateProgress,
}: SeasonListViewProps) {
  return (
    <>
      <SeasonHeader
        viewMode="list"
        selectedSeason={null}
        onNewSeason={onNewSeason}
        onExport={handleExportCSV}
        onBack={() => { }}
        onCloseSeason={() => { }}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        formatDateRange={formatDateRange}
      />

      <SeasonFilters
        filters={filters}
        setFilters={setFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        uniqueCrops={uniqueCrops}
        uniqueYears={uniqueYears}
      />

      <SeasonTable
        seasons={paginatedSeasons}
        selectedSeasons={selectedSeasons}
        onSelectAll={handleSelectAll}
        onSelectSeason={handleSelectSeason}
        onViewDetails={handleViewDetails}
        onDelete={handleDeleteSeason}
        onDuplicate={handleDuplicate}
        onCloseSeason={onCloseSeason}
        getStatusColor={getStatusColor}
        getStatusLabel={getStatusLabel}
        formatDateRange={formatDateRange}
        calculateProgress={calculateProgress}
      />
    </>
  );
}

