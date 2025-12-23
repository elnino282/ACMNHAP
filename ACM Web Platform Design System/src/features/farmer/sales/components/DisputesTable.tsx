import { Eye, Send, CheckCircle2, MoreVertical } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dispute } from "../types";

interface DisputesTableProps {
    disputes: Dispute[];
    onViewDetails: (dispute: Dispute, type: string) => void;
    getStatusBadge: (status: string, type: string) => JSX.Element;
}

export function DisputesTable({
    disputes,
    onViewDetails,
    getStatusBadge,
}: DisputesTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#F8F8F4] hover:bg-[#F8F8F4]">
                        <TableHead className="text-[#333333]">
                            Dispute ID
                        </TableHead>
                        <TableHead className="text-[#333333]">Buyer</TableHead>
                        <TableHead className="text-[#333333]">Issue Type</TableHead>
                        <TableHead className="text-[#333333]">
                            Opened Date
                        </TableHead>
                        <TableHead className="text-[#333333]">Status</TableHead>
                        <TableHead className="text-[#333333]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {disputes.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center py-12 text-[#777777]"
                            >
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-[#3BA55D]" />
                                <p>No active disputes</p>
                                <p className="text-sm mt-1">You're all clear!</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        disputes.map((dispute) => (
                            <TableRow
                                key={dispute.id}
                                className="hover:bg-[#F8F8F4]/50 cursor-pointer"
                                onClick={() => onViewDetails(dispute, "dispute")}
                            >
                                <TableCell className="numeric text-[#333333]">
                                    {dispute.disputeId}
                                </TableCell>
                                <TableCell className="text-[#333333]">
                                    {dispute.buyer}
                                </TableCell>
                                <TableCell>
                                    <Badge className="bg-[#F4C542]/10 text-[#333333] border-[#F4C542]/20 capitalize">
                                        {dispute.issueType}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-[#777777]">
                                    {new Date(dispute.openedDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(dispute.status, "dispute")}
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
                                                <Send className="w-4 h-4 mr-2" />
                                                Respond
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Resolve
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}





























