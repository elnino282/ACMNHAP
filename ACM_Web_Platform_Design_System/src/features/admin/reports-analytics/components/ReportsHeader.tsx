import { FileBarChart, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportsHeaderProps {
    onRefresh: () => void;
    onExport: () => void;
    isLoading?: boolean;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
    onRefresh,
    onExport,
    isLoading
}) => {
    return (
        <div className="flex items-start justify-between">
            <div className="flex gap-3 items-start">
                <div className="w-12 h-12 rounded-[18px] border border-[#e0e0e0] bg-white flex items-center justify-center">
                    <FileBarChart className="w-6 h-6 text-[#2563eb]" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-base font-normal text-[#1f2937]">Reports</h1>
                    <p className="text-sm text-[#6b7280]">
                        Analyze yield, costs, and revenue from existing season data
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-8 px-3 rounded-[14px] border-[#e0e0e0] bg-[#f8f8f4]"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
                <Button
                    size="sm"
                    onClick={onExport}
                    className="h-8 px-3 rounded-[14px] bg-[#3ba55d] hover:bg-[#2e8b4a]"
                >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>
        </div>
    );
};
