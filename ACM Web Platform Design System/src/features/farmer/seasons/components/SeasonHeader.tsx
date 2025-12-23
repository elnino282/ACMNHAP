import { HelpCircle, Download, Plus, ArrowLeft, Edit, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Season, SeasonStatus } from '../types';

interface SeasonHeaderProps {
  viewMode: 'list' | 'detail';
  selectedSeason: Season | null;
  onNewSeason: () => void;
  onExport: () => void;
  onBack: () => void;
  onEdit?: () => void;
  onCloseSeason: () => void;
  getStatusColor: (status: SeasonStatus) => string;
  getStatusLabel: (status: SeasonStatus) => string;
  formatDateRange: (startDate: string, endDate: string) => string;
}

export function SeasonHeader({
  viewMode,
  selectedSeason,
  onNewSeason,
  onExport,
  onBack,
  onEdit,
  onCloseSeason,
  getStatusColor,
  getStatusLabel,
  formatDateRange,
}: SeasonHeaderProps) {
  if (viewMode === 'detail' && selectedSeason) {
    return (
      <div className="bg-white border-b border-[#E0E0E0] px-6 py-4 shadow-sm">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="acm-rounded-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl">{selectedSeason.name}</h1>
                  <Badge className={`${getStatusColor(selectedSeason.status)} acm-rounded-sm`}>
                    {getStatusLabel(selectedSeason.status)}
                  </Badge>
                </div>
                <p className="text-sm text-[#777777] mt-1">
                  {formatDateRange(selectedSeason.startDate, selectedSeason.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onEdit}
                className="acm-rounded-sm border-[#E0E0E0] hover:bg-[#F8F8F4]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              {selectedSeason.status === 'active' && (
                <Button
                  variant="outline"
                  onClick={onCloseSeason}
                  className="acm-rounded-sm border-[#E0E0E0] hover:bg-[#F8F8F4]"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Close Season
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-[#E0E0E0] px-6 py-4 shadow-sm">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">Seasons</h1>

          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="acm-rounded-sm">
                    <HelpCircle className="w-5 h-5 text-[#777777]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Help & Documentation</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              onClick={onExport}
              className="acm-rounded-sm border-[#E0E0E0] hover:bg-[#F8F8F4]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button
              className="bg-[#3BA55D] hover:bg-[#3BA55D]/90 text-white acm-rounded-sm acm-button-shadow"
              onClick={onNewSeason}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Season
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

