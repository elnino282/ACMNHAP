import { Eye, CheckCircle2, XCircle, ArrowUpRight, MoreVertical } from "lucide-react";
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
import type { Quote } from "../types";

interface QuotesTableProps {
    quotes: Quote[];
    onViewDetails: (quote: Quote, type: string) => void;
    getStatusBadge: (status: string, type: string) => JSX.Element;
}

export function QuotesTable({
    quotes,
    onViewDetails,
    getStatusBadge,
}: QuotesTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#F8F8F4] hover:bg-[#F8F8F4]">
                        <TableHead className="text-[#333333]">Order ID</TableHead>
                        <TableHead className="text-[#333333]">Buyer</TableHead>
                        <TableHead className="text-[#333333]">Crop</TableHead>
                        <TableHead className="text-[#333333] text-right">
                            Offer Price
                        </TableHead>
                        <TableHead className="text-[#333333] text-right">
                            Qty (kg)
                        </TableHead>
                        <TableHead className="text-[#333333]">Status</TableHead>
                        <TableHead className="text-[#333333]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quotes.map((quote) => (
                        <TableRow
                            key={quote.id}
                            className="hover:bg-[#F8F8F4]/50 cursor-pointer"
                            onClick={() => onViewDetails(quote, "quote")}
                        >
                            <TableCell className="numeric text-[#333333]">
                                {quote.orderId}
                            </TableCell>
                            <TableCell>
                                <div>
                                    <p className="text-sm text-[#333333]">{quote.buyer}</p>
                                    <p className="text-xs text-[#777777]">
                                        {quote.buyerCompany}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="text-[#333333]">
                                {quote.crop}
                            </TableCell>
                            <TableCell className="text-right numeric text-[#333333]">
                                ${quote.offerPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right numeric text-[#333333]">
                                {quote.quantity.toLocaleString()}
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(quote.status, "quote")}
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
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Accept Offer
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject Offer
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <ArrowUpRight className="w-4 h-4 mr-2" />
                                            Counter Offer
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





























