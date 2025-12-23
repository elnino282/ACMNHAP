import { Plus, X, Save } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { SaleFormData } from "../types";
import { SEASON_OPTIONS, GRADE_OPTIONS } from "../constants";

interface AddListingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formData: SaleFormData;
    onFormDataChange: (data: SaleFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export function AddListingDialog({
    open,
    onOpenChange,
    formData,
    onFormDataChange,
    onSubmit,
    onCancel,
}: AddListingDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#333333] text-xl">
                        <Plus className="w-5 h-5 text-[#3BA55D]" />
                        Add New Listing
                    </DialogTitle>
                    <DialogDescription className="text-sm text-[#777777]">
                        Create a new crop listing for sale
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lotId" className="text-[#333333]">
                                Lot ID <span className="text-[#E74C3C]">*</span>
                            </Label>
                            <Input
                                id="lotId"
                                placeholder="LOT-2025-XXX"
                                value={formData.lotId}
                                onChange={(e) => onFormDataChange({ ...formData, lotId: e.target.value })}
                                className="rounded-xl border-[#E0E0E0] focus:border-[#3BA55D]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="crop" className="text-[#333333]">
                                Crop <span className="text-[#E74C3C]">*</span>
                            </Label>
                            <Input
                                id="crop"
                                placeholder="e.g., Rice, Corn, Wheat"
                                value={formData.crop}
                                onChange={(e) => onFormDataChange({ ...formData, crop: e.target.value })}
                                className="rounded-xl border-[#E0E0E0] focus:border-[#3BA55D]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grade" className="text-[#333333]">
                                Grade
                            </Label>
                            <Select
                                value={formData.grade}
                                onValueChange={(value: "A" | "B" | "C" | "Premium") =>
                                    onFormDataChange({ ...formData, grade: value })
                                }
                            >
                                <SelectTrigger className="rounded-xl border-[#E0E0E0]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {GRADE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-[#333333]">
                                Quantity (kg) <span className="text-[#E74C3C]">*</span>
                            </Label>
                            <Input
                                id="quantity"
                                type="number"
                                placeholder="0"
                                value={formData.quantity}
                                onChange={(e) =>
                                    onFormDataChange({ ...formData, quantity: e.target.value })
                                }
                                className="rounded-xl border-[#E0E0E0] focus:border-[#3BA55D]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pricePerKg" className="text-[#333333]">
                                Price/kg ($) <span className="text-[#E74C3C]">*</span>
                            </Label>
                            <Input
                                id="pricePerKg"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.pricePerKg}
                                onChange={(e) =>
                                    onFormDataChange({ ...formData, pricePerKg: e.target.value })
                                }
                                className="rounded-xl border-[#E0E0E0] focus:border-[#3BA55D]"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="season" className="text-[#333333]">
                            Season
                        </Label>
                        <Select
                            value={formData.season}
                            onValueChange={(value) => onFormDataChange({ ...formData, season: value })}
                        >
                            <SelectTrigger className="rounded-xl border-[#E0E0E0]">
                                <SelectValue placeholder="Select season" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEASON_OPTIONS.slice(1).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="rounded-xl border-[#E0E0E0]"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        className="bg-[#3BA55D] hover:bg-[#3BA55D]/90 text-white rounded-xl"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Create Listing
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}





























