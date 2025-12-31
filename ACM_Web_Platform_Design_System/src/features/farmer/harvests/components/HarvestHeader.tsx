import { Plus, Wheat } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SEASON_OPTIONS } from "../constants";

interface HarvestHeaderProps {
    selectedSeason: string;
    onSeasonChange: (value: string) => void;
    onAddBatch: () => void;
}

export function HarvestHeader({
    selectedSeason,
    onSeasonChange,
    onAddBatch,
}: HarvestHeaderProps) {
    return (
        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm mb-6">
            <CardHeader>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8B7355] to-[#6B5545] flex items-center justify-center shadow-sm">
                            <Wheat className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl text-[#333333]">
                                Harvest Management
                            </CardTitle>
                            <CardDescription className="text-sm text-[#777777]">
                                Track and manage harvest batches, quality control, and sales
                            </CardDescription>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={selectedSeason} onValueChange={onSeasonChange}>
                            <SelectTrigger className="w-[200px] rounded-xl border-[#E0E0E0]">
                                <SelectValue placeholder="All Seasons" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEASON_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={onAddBatch}
                            className="bg-[#3BA55D] hover:bg-[#3BA55D]/90 text-white rounded-xl shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Batch
                        </Button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
