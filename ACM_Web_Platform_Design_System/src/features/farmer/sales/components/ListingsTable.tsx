import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { Package } from "lucide-react";
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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Listing } from "../types";
import { GRADE_COLORS } from "../constants";

interface ListingsTableProps {
    listings: Listing[];
    onViewDetails: (listing: Listing, type: string) => void;
    onDelete: (id: string) => void;
    getStatusBadge: (status: string, type: string) => JSX.Element;
}

export function ListingsTable({
    listings,
    onViewDetails,
    onDelete,
    getStatusBadge,
}: ListingsTableProps) {
    const getGradeBadge = (grade: string) => {
        return <Badge className={GRADE_COLORS[grade]}>{grade}</Badge>;
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-[#E0E0E0]">
            <Table>
                <TableHeader>
                    <TableRow className="bg-[#F8F8F4] hover:bg-[#F8F8F4]">
                        <TableHead className="text-[#333333]">Lot ID</TableHead>
                        <TableHead className="text-[#333333]">Crop</TableHead>
                        <TableHead className="text-[#333333]">Grade</TableHead>
                        <TableHead className="text-[#333333] text-right">
                            Qty (kg)
                        </TableHead>
                        <TableHead className="text-[#333333] text-right">
                            Price/kg
                        </TableHead>
                        <TableHead className="text-[#333333]">Status</TableHead>
                        <TableHead className="text-[#333333]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {listings.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="text-center py-12 text-[#777777]"
                            >
                                <Package className="w-12 h-12 mx-auto mb-3 text-[#E0E0E0]" />
                                <p>No listings found</p>
                            </TableCell>
                        </TableRow>
                    ) : (
                        listings.map((listing) => (
                            <TableRow
                                key={listing.id}
                                className="hover:bg-[#F8F8F4]/50 cursor-pointer"
                                onClick={() => onViewDetails(listing, "listing")}
                            >
                                <TableCell className="numeric text-[#333333]">
                                    {listing.lotId}
                                </TableCell>
                                <TableCell className="text-[#333333]">
                                    {listing.crop}
                                </TableCell>
                                <TableCell>{getGradeBadge(listing.grade)}</TableCell>
                                <TableCell className="text-right numeric text-[#333333]">
                                    {listing.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right numeric text-[#333333]">
                                    ${listing.pricePerKg.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(listing.status, "listing")}
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
                                            <DropdownMenuItem
                                                onClick={() => onViewDetails(listing, "listing")}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Listing
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onDelete(listing.id)}
                                                className="text-[#E74C3C]"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
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





























