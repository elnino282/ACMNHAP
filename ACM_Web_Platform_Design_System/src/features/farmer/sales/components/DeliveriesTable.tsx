import { Eye, Upload, Truck, MoreVertical, FileText } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Delivery } from "../types";

interface DeliveriesTableProps {
    deliveries: Delivery[];
    onViewDetails: (delivery: Delivery, type: string) => void;
    getStatusBadge: (status: string, type: string) => JSX.Element;
}

export function DeliveriesTable({
    deliveries,
    onViewDetails,
    getStatusBadge,
}: DeliveriesTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#F8F8F4] hover:bg-[#F8F8F4]">
                        <TableHead className="text-[#333333]">
                            Delivery ID
                        </TableHead>
                        <TableHead className="text-[#333333]">
                            Pickup Date
                        </TableHead>
                        <TableHead className="text-[#333333]">Carrier</TableHead>
                        <TableHead className="text-[#333333]">Buyer</TableHead>
                        <TableHead className="text-[#333333]">Status</TableHead>
                        <TableHead className="text-[#333333]">
                            Proof of Delivery
                        </TableHead>
                        <TableHead className="text-[#333333]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deliveries.map((delivery) => (
                        <TableRow
                            key={delivery.id}
                            className="hover:bg-[#F8F8F4]/50 cursor-pointer"
                            onClick={() => onViewDetails(delivery, "delivery")}
                        >
                            <TableCell className="numeric text-[#333333]">
                                {delivery.deliveryId}
                            </TableCell>
                            <TableCell className="text-sm text-[#777777]">
                                {new Date(delivery.pickupDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-[#333333]">
                                {delivery.carrier}
                            </TableCell>
                            <TableCell className="text-[#333333]">
                                {delivery.buyer}
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(delivery.status, "delivery")}
                            </TableCell>
                            <TableCell>
                                {delivery.proofOfDelivery ? (
                                    <div className="flex items-center gap-1 text-xs text-[#4A90E2]">
                                        <FileText className="w-3 h-3" />
                                        {delivery.proofOfDelivery}
                                    </div>
                                ) : (
                                    <span className="text-xs text-[#E0E0E0]">—</span>
                                )}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-[#F8F8F4]"
                                        >
                                            <MoreVertical className="w-4 h-4 text-[#777777]" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem>
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload POD
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Truck className="w-4 h-4 mr-2" />
                                            Track Shipment
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}





























