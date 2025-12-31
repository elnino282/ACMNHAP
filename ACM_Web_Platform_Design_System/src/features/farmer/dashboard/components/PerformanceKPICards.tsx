import { TrendingUp, DollarSign, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PerformanceKPICardsProps {
  selectedSeason: string;
}

/**
 * Performance KPI Cards Component
 *
 * Displays three key performance indicators:
 * - Average Yield per hectare
 * - Cost per Hectare
 * - On-time task completion percentage
 *
 * Each card shows the current value, trend comparison, and contextual icon.
 */
export function PerformanceKPICards({ selectedSeason }: PerformanceKPICardsProps) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-[#1F2937] mb-1">Performance Overview</h2>
        <p className="text-sm text-[#6B7280]">
          Key metrics for{" "}
          {selectedSeason === "2024-winter" ? "Winter 2024" : selectedSeason} season
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avg Yield KPI */}
        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-[#6B7280]">Avg Yield</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="w-3.5 h-3.5 text-[#6B7280]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Average crop yield per hectare across all plots
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="numeric text-3xl text-[#1F2937]">4.2</span>
                  <span className="text-sm text-[#6B7280]">tons/ha</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#3BA55D]/10 text-[#3BA55D] border-[#3BA55D]/20 px-2 py-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span className="numeric">+12%</span>
                  </Badge>
                  <span className="text-xs text-[#6B7280]">vs last season</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#3BA55D]/10 text-[#3BA55D] border border-[#3BA55D]/20">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost/Hectare KPI */}
        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-[#6B7280]">Cost/Hectare</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="w-3.5 h-3.5 text-[#6B7280]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Total operational cost per hectare</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="numeric text-3xl text-[#1F2937]">1,850</span>
                  <span className="text-sm text-[#6B7280]">USD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#3BA55D]/10 text-[#3BA55D] border-[#3BA55D]/20 px-2 py-1">
                    <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
                    <span className="numeric">-5%</span>
                  </Badge>
                  <span className="text-xs text-[#6B7280]">vs last season</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#4A90E2]/10 text-[#4A90E2] border border-[#4A90E2]/20">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* On-time % KPI */}
        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-[#6B7280]">On-time %</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="w-3.5 h-3.5 text-[#6B7280]" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          Tasks completed on or before due date
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="numeric text-3xl text-[#1F2937]">94</span>
                  <span className="text-sm text-[#6B7280]">%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#3BA55D]/10 text-[#3BA55D] border-[#3BA55D]/20 px-2 py-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span className="numeric">+3%</span>
                  </Badge>
                  <span className="text-xs text-[#6B7280]">vs last season</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4C542]/10 text-[#F4C542] border border-[#F4C542]/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

