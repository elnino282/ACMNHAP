import { Eye, Download, Send, MoreVertical } from "lucide-react";
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
import type { Payment } from "../types";

interface PaymentsTableProps {
    payments: Payment[];
    onViewDetails: (payment: Payment, type: string) => void;
    getStatusBadge: (status: string, type: string) => JSX.Element;
}

export function PaymentsTable({
    payments,
    onViewDetails,
    getStatusBadge,
}: PaymentsTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#F8F8F4] hover:bg-[#F8F8F4]">
                        <TableHead className="text-[#333333]">
                            Invoice No
                        </TableHead>
                        <TableHead className="text-[#333333]">Buyer</TableHead>
                        <TableHead className="text-[#333333] text-right">
                            Amount
                        </TableHead>
                        <TableHead className="text-[#333333]">Due Date</TableHead>
                        <TableHead className="text-[#333333]">Status</TableHead>
                        <TableHead className="text-[#333333]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow
                            key={payment.id}
                            className="hover:bg-[#F8F8F4]/50 cursor-pointer"
                            onClick={() => onViewDetails(payment, "payment")}
                        >
                            <TableCell className="numeric text-[#333333]">
                                {payment.invoiceNo}
                            </TableCell>
                            <TableCell className="text-[#333333]">
                                {payment.buyer}
                            </TableCell>
                            <TableCell className="text-right numeric text-[#333333]">
                                ${payment.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-[#777777]">
                                {new Date(payment.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(payment.status, "payment")}
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
                                            View Invoice
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Reminder
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





























