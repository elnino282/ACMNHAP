import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { ReportsHeader } from './components/ReportsHeader';
import { ReportsFilterCard, type ReportFilters } from './components/ReportsFilterCard';
import { ReportsSummaryCards, type SummaryStats } from './components/ReportsSummaryCards';
import { ReportsChartTabs, type YieldDataItem, type CostDataItem, type RevenueDataItem } from './components/ReportsChartTabs';
import {
    adminReportsApi,
    reportsKeys,
} from '@/services/api.admin';

// Default filter values
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

export const ReportsAnalytics: React.FC = () => {
    // Filter state
    const [filters, setFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(DEFAULT_FILTERS);
    const [activeTab, setActiveTab] = useState<'yield' | 'cost' | 'revenue'>('yield');

    // Get current year for default queries
    const currentYear = new Date().getFullYear();

    // ═══════════════════════════════════════════════════════════════
    // API QUERIES
    // ═══════════════════════════════════════════════════════════════

    const {
        data: yieldReport,
        isLoading: yieldLoading,
        refetch: refetchYield
    } = useQuery({
        queryKey: reportsKeys.yield(
            currentYear,
            appliedFilters.cropId !== 'all' ? parseInt(appliedFilters.cropId) : undefined
        ),
        queryFn: () => adminReportsApi.getYieldReport({
            year: currentYear,
            cropId: appliedFilters.cropId !== 'all' ? parseInt(appliedFilters.cropId) : undefined,
        }),
        staleTime: 1000 * 60 * 5,
    });

    const {
        data: costReport,
        isLoading: costLoading,
        refetch: refetchCost
    } = useQuery({
        queryKey: reportsKeys.cost(currentYear),
        queryFn: () => adminReportsApi.getCostReport(currentYear),
        staleTime: 1000 * 60 * 5,
    });

    const {
        data: revenueReport,
        isLoading: revenueLoading,
        refetch: refetchRevenue
    } = useQuery({
        queryKey: reportsKeys.revenue(currentYear),
        queryFn: () => adminReportsApi.getRevenueReport(currentYear),
        staleTime: 1000 * 60 * 5,
    });

    const isLoading = yieldLoading || costLoading || revenueLoading;

    // ═══════════════════════════════════════════════════════════════
    // COMPUTED DATA
    // ═══════════════════════════════════════════════════════════════

    // Summary statistics
    const summaryStats: SummaryStats = useMemo(() => {
        const totalYield = yieldReport?.reduce((sum, item) => sum + (Number(item.actualYieldKg) || 0), 0) ?? 0;
        const totalCost = costReport?.reduce((sum, item) => sum + (Number(item.totalExpense) || 0), 0) ?? 0;
        const costPerKg = totalYield > 0 ? totalCost / totalYield : 0;
        const totalRevenue = revenueReport?.reduce((sum, item) => sum + (Number(item.totalRevenue) || 0), 0) ?? 0;

        return {
            totalYield: Math.round(totalYield),
            totalCost: Math.round(totalCost),
            costPerKg: Math.round(costPerKg * 1000) / 1000,
            totalRevenue: Math.round(totalRevenue),
        };
    }, [yieldReport, costReport, revenueReport]);

    // Yield chart data
    const yieldData: YieldDataItem[] = useMemo(() => {
        if (!yieldReport) return [];

        return yieldReport.map(item => ({
            group: item.seasonName || `Season ${item.seasonId}`,
            expected: Number(item.expectedYieldKg) || 0,
            actual: Number(item.actualYieldKg) || 0,
            varianceKg: (Number(item.actualYieldKg) || 0) - (Number(item.expectedYieldKg) || 0),
            variancePercent: item.variancePercent ?? 0,
        }));
    }, [yieldReport]);

    // Cost chart data
    const costData: CostDataItem[] = useMemo(() => {
        if (!costReport) return [];

        return costReport.map(item => ({
            group: item.seasonName || `Season ${item.seasonId}`,
            totalCost: Number(item.totalExpense) || 0,
            costPerKg: Number(item.costPerKg) || 0,
        }));
    }, [costReport]);

    // Revenue chart data
    const revenueData: RevenueDataItem[] = useMemo(() => {
        if (!revenueReport) return [];

        return revenueReport.map(item => {
            const revenue = Number(item.totalRevenue) || 0;
            const matchingCost = costReport?.find(c => c.seasonId === item.seasonId);
            const cost = matchingCost ? Number(matchingCost.totalExpense) || 0 : 0;
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

    // ═══════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════

    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchYield(),
                refetchCost(),
                refetchRevenue(),
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
                onFiltersChange={setFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
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
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isLoading={isLoading}
            />
        </div>
    );
};
