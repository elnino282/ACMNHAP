import { Calendar, Filter, Download, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReportsAnalytics } from './hooks/useReportsAnalytics';
import { getAlertIcon, getAlertBadge, getHealthStatus } from './utils';

import { KPICard } from './components/KPICard';
import { UserActivityChart } from './components/UserActivityChart';
import { MetricsTable } from './components/MetricsTable';
import { SystemHealthCard } from './components/SystemHealthCard';
import { RecentAlertsCard } from './components/RecentAlertsCard';
import { FilterDrawer } from './components/FilterDrawer';
import { SettingsDrawer } from './components/SettingsDrawer';

// NEW Analytics Components
import { YieldReportCard } from './components/YieldReportCard';
import { CostAnalysisChart } from './components/CostAnalysisChart';
import { InventoryOnHandTable } from './components/InventoryOnHandTable';

import type { DateRange } from './types';

export const ReportsAnalytics: React.FC = () => {
    const {
        dateRange,
        setDateRange,
        filterOpen,
        setFilterOpen,
        settingsOpen,
        setSettingsOpen,
        userActivityFilter,
        setUserActivityFilter,
        cropFilter,
        setCropFilter,
        regionFilter,
        setRegionFilter,
        roleFilter,
        setRoleFilter,
        selectedYear,
        setSelectedYear,

        // Real API data
        yieldReport,
        costReport,
        taskPerformance,
        incidentStatistics,
        inventoryOnHand,

        // Legacy/Mock data
        kpiData,
        metricsData,
        systemAlerts,
        systemHealth,
        filteredUserActivityData,

        // Loading states
        isLoading,
        isDeferredLoading,

        // Handlers
        handleExport,
        handleFilterClear,
        handleFilterApply,
        handleSettingsSave,
    } = useReportsAnalytics();

    // Generate year options (current year and past 5 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="mb-1">Reports & Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Platform insights, metrics, and system health monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Year Selector */}
                    <Select
                        value={String(selectedYear)}
                        onValueChange={(v) => setSelectedYear(parseInt(v))}
                    >
                        <SelectTrigger className="w-[120px]">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {yearOptions.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={() => setFilterOpen(true)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="bg-[#2563EB] hover:bg-[#1E40AF]">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                                <ChevronDown className="w-4 h-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport('csv')}>
                                Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('excel')}>
                                Export as Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                Export as PDF
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}>
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Loading indicator */}
            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading reports...</span>
                </div>
            )}

            {/* KPI Overview Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {kpiData.map((kpi, index) => (
                    <KPICard key={index} kpi={kpi} index={index} />
                ))}
            </div>



            {/* Yield Report */}
            <YieldReportCard
                data={yieldReport}
                isLoading={isDeferredLoading}
            />

            {/* Cost Analysis Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CostAnalysisChart
                    data={costReport}
                    isLoading={isDeferredLoading}
                />
                <UserActivityChart
                    filteredUserActivityData={filteredUserActivityData}
                    userActivityFilter={userActivityFilter}
                    setUserActivityFilter={setUserActivityFilter}
                />
            </div>

            {/* Inventory On-Hand Summary */}
            <InventoryOnHandTable
                data={inventoryOnHand}
                isLoading={isDeferredLoading}
            />

            {/* Detailed Metrics Table */}
            <MetricsTable metricsData={metricsData} />

            {/* System Health & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SystemHealthCard systemHealth={systemHealth} getHealthStatus={getHealthStatus} />
                <RecentAlertsCard
                    systemAlerts={systemAlerts}
                    getAlertIcon={getAlertIcon}
                    getAlertBadge={getAlertBadge}
                />
            </div>

            {/* Filter Sheet */}
            <FilterDrawer
                filterOpen={filterOpen}
                setFilterOpen={setFilterOpen}
                cropFilter={cropFilter}
                setCropFilter={setCropFilter}
                regionFilter={regionFilter}
                setRegionFilter={setRegionFilter}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                handleFilterClear={handleFilterClear}
                handleFilterApply={handleFilterApply}
            />

            {/* Settings Drawer */}
            <SettingsDrawer
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                handleSettingsSave={handleSettingsSave}
            />
        </div>
    );
};
