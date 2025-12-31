import {
    ShoppingBag,
    FileText,
    Truck,
    Wallet,
    AlertTriangle,
    FileSignature,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecordType } from "../types";

interface DetailsDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: RecordType | null;
}

export function DetailsDrawer({ open, onOpenChange, record }: DetailsDrawerProps) {
    if (!record) return null;

    const getIcon = () => {
        switch (record.type) {
            case "listing":
                return <ShoppingBag className="w-5 h-5 text-[#3BA55D]" />;
            case "quote":
                return <FileText className="w-5 h-5 text-[#4A90E2]" />;
            case "contract":
                return <FileSignature className="w-5 h-5 text-[#3BA55D]" />;
            case "delivery":
                return <Truck className="w-5 h-5 text-[#F4C542]" />;
            case "payment":
                return <Wallet className="w-5 h-5 text-[#4A90E2]" />;
            case "dispute":
                return <AlertTriangle className="w-5 h-5 text-[#E74C3C]" />;
            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (record.type) {
            case "listing":
                return "Listing Details";
            case "quote":
                return "Quote Details";
            case "contract":
                return "Contract Details";
            case "delivery":
                return "Delivery Details";
            case "payment":
                return "Payment Details";
            case "dispute":
                return "Dispute Details";
            default:
                return "Details";
        }
    };

    const getIdentifier = () => {
        switch (record.type) {
            case 'listing':
                return record.lotId;
            case 'quote':
                return record.orderId;
            case 'contract':
                return record.contractNo;
            case 'delivery':
                return record.deliveryId;
            case 'payment':
                return record.invoiceNo;
            case 'dispute':
                return record.disputeId;
            default:
                return "";
        }
    };

    const getDate = () => {
        switch (record.type) {
            case 'listing':
                return record.postedDate;
            case 'quote':
                return record.requestDate;
            case 'contract':
                return record.signedDate;
            case 'delivery':
                return record.pickupDate;
            case 'payment':
                return record.dueDate;
            case 'dispute':
                return record.openedDate;
            default:
                return "";
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[500px] sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-[#333333]">
                        {getIcon()}
                        {getTitle()}
                    </SheetTitle>
                    <SheetDescription className="text-sm text-[#777777]">
                        {getIdentifier()}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Timeline */}
                    <Card className="border-[#E0E0E0] rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-[#333333]">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#3BA55D] mt-2"></div>
                                    <div>
                                        <p className="text-sm text-[#333333]">Record Created</p>
                                        <p className="text-xs text-[#777777]">{getDate()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attached Documents */}
                    <Card className="border-[#E0E0E0] rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-[#333333] flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#777777]" />
                                Attached Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#777777]">No documents attached</p>
                        </CardContent>
                    </Card>
                </div>
            </SheetContent>
        </Sheet>
    );
}





























