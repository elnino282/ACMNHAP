import { useSeasonManagement } from './hooks/useSeasonManagement';
import { SeasonListView } from './components/SeasonListView';
import { SeasonDetailView } from './components/SeasonDetailView';
import { DeleteSeasonDialog } from './components/DeleteSeasonDialog';
import { CloseSeasonDialog } from './components/CloseSeasonDialog';
import { NewSeasonDialog } from './components/NewSeasonDialog';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SeasonManagement() {
  const {
    // View state
    viewMode,
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
    isLoading,
    error,
    refetch,
    isDeleting,
    isCreating,
  } = useSeasonManagement();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#4A90E2]" />
          <p className="text-[#333333]/70">Loading seasons...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-[#E74C3C]" />
          <h2 className="text-xl font-semibold text-[#333333]">Failed to Load Seasons</h2>
          <p className="text-[#333333]/70">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F4] pb-20">
      {viewMode === 'list' ? (
        <SeasonListView
          paginatedSeasons={paginatedSeasons}
          filteredSeasons={filteredSeasons}
          selectedSeasons={selectedSeasons}
          uniqueCrops={uniqueCrops}
          uniqueYears={uniqueYears}
          filters={filters}
          setFilters={setFilters}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          totalPages={totalPages}
          handleSelectAll={handleSelectAll}
          handleSelectSeason={handleSelectSeason}
          handleViewDetails={handleViewDetails}
          handleDeleteSeason={handleDeleteSeason}
          handleDuplicate={handleDuplicate}
          handleExportCSV={handleExportCSV}
          onNewSeason={() => setNewSeasonOpen(true)}
          onCloseSeason={(season) => {
            handleViewDetails(season);
            setCloseSeasonOpen(true);
          }}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          formatDateRange={formatDateRange}
          calculateProgress={calculateProgress}
        />
      ) : (
        selectedSeason && (
          <SeasonDetailView
            season={selectedSeason}
            activities={[]} // Activities would come from field-log entity in future
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBack={handleBackToList}
            onCloseSeason={() => setCloseSeasonOpen(true)}
            handleExportCSV={handleExportCSV}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
            formatDateRange={formatDateRange}
          />
        )
      )}

      <DeleteSeasonDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      <CloseSeasonDialog
        open={closeSeasonOpen}
        onOpenChange={setCloseSeasonOpen}
        closeReason={closeReason}
        setCloseReason={setCloseReason}
        onConfirm={handleCloseSeason}
      />

      <NewSeasonDialog
        open={newSeasonOpen}
        onOpenChange={setNewSeasonOpen}
        onSubmit={handleCreateSeason}
        isSubmitting={isCreating}
      />
    </div>
  );
}

