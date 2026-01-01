import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { ReportsHeader } from './components/ReportsHeader';
import { ReportsFilterCard, type ReportFilters } from './components/ReportsFilterCard';
import { ReportsSummaryCards, type SummaryStats } from './components/ReportsSummaryCards';
import {
    ReportsChartTabs,
    type YieldDataItem,
    type CostDataItem,
    type RevenueDataItem,
    type ProfitDataItem,
} from './components/ReportsChartTabs';
import {
    adminReportsApi,
    adminFarmApi,
    adminPlotApi,
    adminCropApi,
    reportsKeys,
    type ReportFilterParams,
} from '@/services/api.admin';

// Default filter values (UI state - allows 'all')
const DEFAULT_FILTERS: ReportFilters = {
    fromDate: '',
    toDate: '',
    farmId: 'all',
    plotId: 'all',
    seasonId: 'all',
    cropId: 'all',
    groupBy: 'season',
    farmerId: 'all',
};

// Convert UI filters to API params (removes 'all', only sends numbers)
const toApiParams = (ui: ReportFilters, year: number): ReportFilterParams => ({
    year,
    ...(ui.cropId !== 'all' && { cropId: parseInt(ui.cropId) }),
    ...(ui.farmId !== 'all' && { farmId: parseInt(ui.farmId) }),
    ...(ui.plotId !== 'all' && { plotId: parseInt(ui.plotId) }),
});

export const ReportsAnalytics: React.FC = () => {
    // Filter state: draft (UI) and applied (sent to API)
    const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
    const [activeTab, setActiveTab] = useState<'yield' | 'cost' | 'revenue' | 'profit'>('yield');

    // Get current year for default queries
    const currentYear = new Date().getFullYear();

    // Build API params from applied filters (only applied, not draft)
    const apiParams = useMemo(() => toApiParams(appliedFilters, currentYear), [appliedFilters, currentYear]);

    // ═══════════════════════════════════════════════════════════════
    // DROPDOWN DATA QUERIES
    // ═══════════════════════════════════════════════════════════════

    const { data: farmsData } = useQuery({
        queryKey: ['adminFarms'],
        queryFn: () => adminFarmApi.list(),
        staleTime: 1000 * 60 * 10,
    });

    const { data: plotsData } = useQuery({
        queryKey: ['adminPlots', appliedFilters.farmId],
        queryFn: () => adminPlotApi.list({
            farmId: appliedFilters.farmId !== 'all' ? parseInt(appliedFilters.farmId) : undefined
        }),
        staleTime: 1000 * 60 * 10,
    });

    const { data: cropsData } = useQuery({
        queryKey: ['adminCrops'],
        queryFn: () => adminCropApi.list(),
        staleTime: 1000 * 60 * 10,
    });

    // Transform dropdown data
    const farmOptions = useMemo(() =>
        farmsData?.data?.content?.map((f: { id: number; name: string }) => ({
            value: f.id.toString(),
            label: f.name
        })) ?? [],
        [farmsData]
    );

    const plotOptions = useMemo(() =>
        plotsData?.data?.content?.map((p: { id: number; plotName: string }) => ({
            value: p.id.toString(),
            label: p.plotName
        })) ?? [],
        [plotsData]
    );

    const cropOptions = useMemo(() =>
        cropsData?.data?.map((c: { id: number; cropName: string }) => ({
            value: c.id.toString(),
            label: c.cropName
        })) ?? [],
        [cropsData]
    );

    // ═══════════════════════════════════════════════════════════════
    // REPORT DATA QUERIES
    // ═══════════════════════════════════════════════════════════════

    const {
        data: yieldReport,
        isLoading: yieldLoading,
        refetch: refetchYield
    } = useQuery({
        queryKey: reportsKeys.yield(apiParams),
        queryFn: () => adminReportsApi.getYieldReport(apiParams),
        staleTime: 1000 * 60 * 5,
    });

    const {
        data: costReport,
        isLoading: costLoading,
        refetch: refetchCost
    } = useQuery({
        queryKey: reportsKeys.cost(apiParams),
        queryFn: () => adminReportsApi.getCostReport(apiParams),
        staleTime: 1000 * 60 * 5,
    });

    const {
        data: revenueReport,
        isLoading: revenueLoading,
        refetch: refetchRevenue
    } = useQuery({
        queryKey: reportsKeys.revenue(apiParams),
        queryFn: () => adminReportsApi.getRevenueReport(apiParams),
        staleTime: 1000 * 60 * 5,
    });

    const {
        data: profitReport,
        isLoading: profitLoading,
        refetch: refetchProfit
    } = useQuery({
        queryKey: reportsKeys.profit(apiParams),
        queryFn: () => adminReportsApi.getProfitReport(apiParams),
        staleTime: 1000 * 60 * 5,
    });

    const isLoading = yieldLoading || costLoading || revenueLoading || profitLoading;

    // ═══════════════════════════════════════════════════════════════
    // COMPUTED DATA
    // ═══════════════════════════════════════════════════════════════

    // Summary statistics (calculated from totals, not avg of avgs)
    const summaryStats: SummaryStats = useMemo(() => {
        const totalYield = yieldReport?.reduce((s, i) => s + (i.actualYieldKg ?? 0), 0) ?? 0;
        const totalCost = costReport?.reduce((s, i) => s + (i.totalExpense ?? 0), 0) ?? 0;
        const totalRevenue = revenueReport?.reduce((s, i) => s + (i.totalRevenue ?? 0), 0) ?? 0;

        // Cost/kg from totals (not avg of per-season costPerKg)
        const costPerKg = totalYield > 0 ? totalCost / totalYield : null;

        // Profit calculations
        const grossProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : null;

        return {
            totalYield: Math.round(totalYield),
            totalCost: Math.round(totalCost),
            costPerKg: costPerKg != null ? Math.round(costPerKg * 1000) / 1000 : null,
            totalRevenue: Math.round(totalRevenue),
            grossProfit: Math.round(grossProfit),
            profitMargin: profitMargin != null ? Math.round(profitMargin * 10) / 10 : null,
        };
    }, [yieldReport, costReport, revenueReport]);

    // Yield chart data
    const yieldData: YieldDataItem[] = useMemo(() => {
        if (!yieldReport) return [];

        return yieldReport.map(item => ({
            group: item.seasonName || `Season ${item.seasonId}`,
            expected: item.expectedYieldKg ?? 0,
            actual: item.actualYieldKg ?? 0,
            varianceKg: (item.actualYieldKg ?? 0) - (item.expectedYieldKg ?? 0),
            variancePercent: item.variancePercent ?? 0,
        }));
    }, [yieldReport]);

    // Cost chart data
    const costData: CostDataItem[] = useMemo(() => {
        if (!costReport) return [];

        return costReport.map(item => ({
            group: item.seasonName || `Season ${item.seasonId}`,
            totalCost: item.totalExpense ?? 0,
            costPerKg: item.costPerKg ?? 0,
        }));
    }, [costReport]);

    // Revenue chart data
    const revenueData: RevenueDataItem[] = useMemo(() => {
        if (!revenueReport) return [];

        return revenueReport.map(item => {
            const revenue = item.totalRevenue ?? 0;
            const matchingCost = costReport?.find(c => c.seasonId === item.seasonId);
            const cost = matchingCost ? (matchingCost.totalExpense ?? 0) : 0;
            const profit = revenue - cost;
            const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

            return {
                group: item.seasonName || `Season ${item.seasonId}`,
                revenue,
                profit,
                profitMargin,
            };
        });
    }, [revenueReport, costReport]);

    // Profit chart data (from profit endpoint)
    const profitData: ProfitDataItem[] = useMemo(() => {
        if (!profitReport) return [];

        return profitReport.map(item => ({
            group: item.seasonName || `Season ${item.seasonId}`,
            revenue: item.totalRevenue ?? 0,
            expense: item.totalExpense ?? 0,
            grossProfit: item.grossProfit ?? 0,
            profitMargin: item.profitMargin,
        }));
    }, [profitReport]);

    // ═══════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════

    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchYield(),
                refetchCost(),
                refetchRevenue(),
                refetchProfit(),
            ]);
            toast.success('Data refreshed successfully');
        } catch {
            toast.error('Failed to refresh data');
        }
    };

    const handleExport = () => {
        const headers = ['Group', 'Expected (kg)', 'Actual (kg)', 'Variance (kg)', 'Variance (%)'];
        const rows = yieldData.map(item => [
            item.group,
            item.expected.toString(),
            item.actual.toString(),
            item.varianceKg.toString(),
            `${item.variancePercent.toFixed(1)}%`
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reports_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Report exported successfully');
    };

    const handleFiltersChange = (newFilters: ReportFilters) => {
        // Reset plotId when farmId changes
        if (newFilters.farmId !== filters.farmId) {
            setFilters({ ...newFilters, plotId: 'all' });
        } else {
            setFilters(newFilters);
        }
    };

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
        toast.success('Filters applied');
    };

    const handleResetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
        toast.info('Filters reset');
    };

    // ═══════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════

    return (
        <div className="p-6 space-y-6 bg-[#f8f8f4] min-h-full">
            {/* Header */}
            <ReportsHeader
                onRefresh={handleRefresh}
                onExport={handleExport}
                isLoading={isLoading}
            />

            {/* Filter Card */}
            <ReportsFilterCard
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                farms={farmOptions}
                plots={plotOptions}
                crops={cropOptions}
                isPlotDisabled={filters.farmId === 'all'}
                isSeasonDisabled={filters.plotId === 'all'}
            />

            {/* Summary Cards */}
            <ReportsSummaryCards
                stats={summaryStats}
                isLoading={isLoading}
            />

            {/* Chart Tabs */}
            <ReportsChartTabs
                yieldData={yieldData}
                costData={costData}
                revenueData={revenueData}
                profitData={profitData}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onReset={handleResetFilters}
                isLoading={isLoading}
            />
        </div>
    );
};
