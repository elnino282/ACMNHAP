import { useHarvestManagement } from "./hooks/useHarvestManagement";
import { HarvestHeader } from "./components/HarvestHeader";
import { HarvestKPICards } from "./components/HarvestKPICards";
import { HarvestTable } from "./components/HarvestTable";
import { HarvestCharts } from "./components/HarvestCharts";
import { QuickActionsPanel } from "./components/QuickActionsPanel";
import { AddBatchDialog } from "./components/AddBatchDialog";
import { HarvestDetailsDrawer } from "./components/HarvestDetailsDrawer";
import { toast } from "sonner";

export function HarvestManagement() {
    const {
        // State
        selectedSeason,
        setSelectedSeason,
        isAddBatchOpen,
        setIsAddBatchOpen,
        selectedBatch,
        isDetailsDrawerOpen,
        setIsDetailsDrawerOpen,
        batches,
        formData,
        setFormData,

        // Computed values
        filteredBatches,
        totalHarvested,
        lotsCount,
        avgGrade,
        avgMoisture,
        yieldVsPlan,
        dailyTrend,
        gradeDistribution,
        summaryStats,

        // Utilities
        getStatusBadge,
        getGradeBadge,

        // Handlers
        handleAddBatch,
        handleDeleteBatch,
        resetForm,
        handleViewDetails,
        handleQuickAction,
        handleExport,
        handlePrint,
    } = useHarvestManagement();

    const handleDrawerAction = (action: string, batch: typeof selectedBatch) => {
        if (!batch) return;

        if (action === "qr") {
            toast.success("Generating QR Code", {
                description: `QR for ${batch.batchId}`,
            });
        } else if (action === "handover") {
            toast.success("Printing Handover Note", {
                description: `For batch ${batch.batchId}`,
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F8F4]">
            <div className="max-w-[1920px] mx-auto p-6">
                <HarvestHeader
                    selectedSeason={selectedSeason}
                    onSeasonChange={setSelectedSeason}
                    onAddBatch={() => {
                        resetForm();
                        setIsAddBatchOpen(true);
                    }}
                />

                <HarvestKPICards
                    totalHarvested={totalHarvested}
                    lotsCount={lotsCount}
                    avgGrade={avgGrade}
                    avgMoisture={avgMoisture}
                    yieldVsPlan={yieldVsPlan}
                />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    <div className="space-y-6">
                        <HarvestTable
                            batches={filteredBatches}
                            totalBatches={batches.length}
                            onViewDetails={handleViewDetails}
                            onDeleteBatch={handleDeleteBatch}
                            onExport={handleExport}
                            onPrint={handlePrint}
                            getStatusBadge={getStatusBadge}
                            getGradeBadge={getGradeBadge}
                        />

                        <HarvestCharts
                            dailyTrend={dailyTrend}
                            gradeDistribution={gradeDistribution}
                        />
                    </div>

                    <QuickActionsPanel
                        onQuickAction={handleQuickAction}
                        summaryStats={summaryStats}
                    />
                </div>
            </div>

            <AddBatchDialog
                open={isAddBatchOpen}
                onOpenChange={setIsAddBatchOpen}
                formData={formData}
                onFormChange={setFormData}
                onSubmit={handleAddBatch}
                onCancel={() => {
                    setIsAddBatchOpen(false);
                    resetForm();
                }}
            />

            <HarvestDetailsDrawer
                batch={selectedBatch}
                open={isDetailsDrawerOpen}
                onOpenChange={setIsDetailsDrawerOpen}
                onAction={handleDrawerAction}
                getStatusBadge={getStatusBadge}
                getGradeBadge={getGradeBadge}
            />
        </div>
    );
}
