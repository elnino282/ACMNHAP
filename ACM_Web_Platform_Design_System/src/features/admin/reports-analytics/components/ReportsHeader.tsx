import { RefreshCw, Download, Save, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportsHeaderProps {
    onRefresh: () => void;
    onExport: () => void;
    onSaveView?: () => void;
    isLoading?: boolean;
    lastUpdated?: string;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
    onRefresh,
    onExport,
    onSaveView,
    isLoading,
    lastUpdated
}) => {
    // Format current date for display
    const formattedDate = lastUpdated || new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    return (
        <div className="bg-white border-b border-[#e0e0e0] -mx-6 -mt-6 px-6 py-4 mb-6">
            <div className="flex items-center justify-between">
                {/* Left Section - Title & Description */}
                <div className="flex flex-col gap-0.5">
                    <h1 className="text-[30px] font-normal text-[#1f2937] leading-[45px] tracking-tight"> <b>Reports</b>
                    </h1>
                    <p className="text-sm text-[#6b7280] leading-5">
                        Analyze yield, costs, and revenue · Last updated {formattedDate}
                    </p>
                </div>

                {/* Right Section - Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onSaveView}
                        className="h-8 px-3 rounded-[14px] border-[#e0e0e0] bg-[#f8f8f4] hover:bg-[#f0f0ec] text-[#333] font-medium text-sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save View
                    </Button>
                    <Button
                        size="sm"
                        onClick={onExport}
                        className="h-8 px-3 rounded-[14px] bg-[#3ba55d] hover:bg-[#2e8b4a] text-white font-medium text-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="h-9 w-9 rounded-[14px] hover:bg-[#f8f8f4]"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#6b7280] ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
