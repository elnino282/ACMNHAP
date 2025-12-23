import { DollarSign, ShoppingBag, Truck, Wallet, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardsProps {
    totalRevenue: number;
    ordersCount: number;
    pendingDeliveries: number;
    unpaidAmount: number;
    disputesOpen: number;
}

export function KPICards({
    totalRevenue,
    ordersCount,
    pendingDeliveries,
    unpaidAmount,
    disputesOpen,
}: KPICardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[#777777] mb-1">Total Revenue</p>
                            <p className="text-2xl numeric text-[#333333]">
                                ${totalRevenue.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <TrendingUp className="w-3 h-3 text-[#3BA55D]" />
                                <p className="text-xs text-[#3BA55D]">+12.5%</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#3BA55D]/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#3BA55D]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[#777777] mb-1">Orders Count</p>
                            <p className="text-2xl numeric text-[#333333]">{ordersCount}</p>
                            <p className="text-xs text-[#777777] mt-1">accepted</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#4A90E2]/10 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-[#4A90E2]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[#777777] mb-1">Pending Deliveries</p>
                            <p className="text-2xl numeric text-[#333333]">
                                {pendingDeliveries}
                            </p>
                            <p className="text-xs text-[#777777] mt-1">scheduled</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#F4C542]/10 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-[#F4C542]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[#777777] mb-1">Unpaid Amount</p>
                            <p className="text-2xl numeric text-[#333333]">
                                ${unpaidAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-[#777777] mt-1">outstanding</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#4A90E2]/10 flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-[#4A90E2]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-[#777777] mb-1">Disputes Open</p>
                            <p className="text-2xl numeric text-[#333333]">
                                {disputesOpen}
                            </p>
                            {disputesOpen > 0 ? (
                                <p className="text-xs text-[#E74C3C] mt-1">requires attention</p>
                            ) : (
                                <p className="text-xs text-[#3BA55D] mt-1">all clear</p>
                            )}
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#E74C3C]/10 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-[#E74C3C]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}





























