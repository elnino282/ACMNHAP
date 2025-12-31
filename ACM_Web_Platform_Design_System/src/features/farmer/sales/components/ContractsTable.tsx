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
import type { Contract } from "../types";

interface ContractsTableProps {
    contracts: Contract[];
    onViewDetails: (contract: Contract, type: string) => void;
    getStatusBadge: (status: string, type: string) => JSX.Element;
}

export function ContractsTable({
    contracts,
    onViewDetails,
    getStatusBadge,
}: ContractsTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#F8F8F4] hover:bg-[#F8F8F4]">
                        <TableHead className="text-[#333333]">
                            Contract No
                        </TableHead>
                        <TableHead className="text-[#333333]">Buyer</TableHead>
                        <TableHead className="text-[#333333] text-right">
                            Value
                        </TableHead>
                        <TableHead className="text-[#333333]">
                            Signed Date
                        </TableHead>
                        <TableHead className="text-[#333333]">Status</TableHead>
                        <TableHead className="text-[#333333]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contracts.map((contract) => (
                        <TableRow
                            key={contract.id}
                            className="hover:bg-[#F8F8F4]/50 cursor-pointer"
                            onClick={() => onViewDetails(contract, "contract")}
                        >
                            <TableCell className="numeric text-[#333333]">
                                {contract.contractNo}
                            </TableCell>
                            <TableCell className="text-[#333333]">
                                {contract.buyer}
                            </TableCell>
                            <TableCell className="text-right numeric text-[#333333]">
                                ${contract.value.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm text-[#777777]">
                                {new Date(contract.signedDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {getStatusBadge(contract.status, "contract")}
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
                                            View Contract
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send to Buyer
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





























