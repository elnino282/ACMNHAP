
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface ReportFilters {
    fromDate: string;
    toDate: string;
    farmId: string;
    plotId: string;
    seasonId: string;
    cropId: string;
    groupBy: 'season' | 'farm' | 'crop' | 'farmer';
    farmerId: string;
}

interface FilterOption {
    value: string;
    label: string;
}

interface ReportsFilterCardProps {
    filters: ReportFilters;
    onFiltersChange: (filters: ReportFilters) => void;
    onApply: () => void;
    onReset: () => void;
    farms?: FilterOption[];
    plots?: FilterOption[];
    crops?: FilterOption[];
    isPlotDisabled?: boolean;
}

export const ReportsFilterCard: React.FC<ReportsFilterCardProps> = ({
    filters,
    onFiltersChange,
    onApply,
    onReset,
    farms = [],
    plots = [],
    crops = [],
    isPlotDisabled = false,
}) => {
    const handleChange = (key: keyof ReportFilters, value: string) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    return (
        <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
            <CardContent className="p-6 space-y-4">
                {/* Row 1: Date Range and Entity Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1f2937]">From Date</Label>
                        <Input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => handleChange('fromDate', e.target.value)}
                            className="h-9 rounded-[14px] border-[#e0e0e0]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1f2937]">To Date</Label>
                        <Input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => handleChange('toDate', e.target.value)}
                            className="h-9 rounded-[14px] border-[#e0e0e0]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1f2937]">Farm</Label>
                        <Select
                            value={filters.farmId}
                            onValueChange={(value) => handleChange('farmId', value)}
                        >
                            <SelectTrigger className="h-9 rounded-[14px] border-[#e0e0e0]">
                                <SelectValue placeholder="All farms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All farms</SelectItem>
                                {farms.map((farm) => (
                                    <SelectItem key={farm.value} value={farm.value}>
                                        {farm.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1f2937]">Plot</Label>
                        <Select
                            value={filters.plotId}
                            onValueChange={(value) => handleChange('plotId', value)}
                            disabled={isPlotDisabled}
                        >
                            <SelectTrigger className={`h-9 rounded-[14px] border-[#e0e0e0] ${isPlotDisabled ? 'opacity-50' : ''}`}>
                                <SelectValue placeholder="All plots" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All plots</SelectItem>
                                {plots.map((plot) => (
                                    <SelectItem key={plot.value} value={plot.value}>
                                        {plot.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-[#1f2937]">Crop</Label>
                        <Select
                            value={filters.cropId}
                            onValueChange={(value) => handleChange('cropId', value)}
                        >
                            <SelectTrigger className="h-9 rounded-[14px] border-[#e0e0e0]">
                                <SelectValue placeholder="All crops" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All crops</SelectItem>
                                {crops.map((crop) => (
                                    <SelectItem key={crop.value} value={crop.value}>
                                        {crop.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-8 px-3 rounded-[14px] text-[#6b7280]"
                    >
                        Reset
                    </Button>
                    <Button
                        size="sm"
                        onClick={onApply}
                        className="h-8 px-4 rounded-[14px] bg-[#3ba55d] hover:bg-[#2e8b4a]"
                    >
                        Apply
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
