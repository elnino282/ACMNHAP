import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Listing, Quote, Contract } from "../types";

interface SalesSummaryCardProps {
    listings: Listing[];
    quotes: Quote[];
    contracts: Contract[];
}

export function SalesSummaryCard({
    listings,
    quotes,
    contracts,
}: SalesSummaryCardProps) {
    const activeListings = listings.filter((l) => l.status === "active").length;
    const pendingQuotes = quotes.filter((q) => q.status === "pending").length;
    const activeContracts = contracts.filter((c) => c.status === "active").length;

    const avgDealSize =
        contracts.length > 0
            ? (contracts.reduce((sum, c) => sum + c.value, 0) / contracts.length)
            : 0;

    return (
        <Card className="border-[#E0E0E0] rounded-2xl shadow-sm bg-gradient-to-br from-[#3BA55D]/5 to-transparent">
            <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#333333]">
                    Sales Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#777777]">Active Listings</span>
                    <span className="numeric text-[#333333]">
                        {activeListings}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#777777]">Pending Quotes</span>
                    <span className="numeric text-[#F4C542]">
                        {pendingQuotes}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#777777]">Active Contracts</span>
                    <span className="numeric text-[#3BA55D]">
                        {activeContracts}
                    </span>
                </div>
                <Separator className="bg-[#E0E0E0] my-2" />
                <div className="flex items-center justify-between">
                    <span className="text-sm text-[#777777]">Avg Deal Size</span>
                    <span className="numeric text-[#333333]">
                        ${avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}





























