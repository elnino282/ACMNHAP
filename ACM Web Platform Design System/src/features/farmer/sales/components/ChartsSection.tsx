import { LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint, BuyerMixDataPoint } from "../types";

interface ChartsSectionProps {
    monthlyRevenue: ChartDataPoint[];
    buyerMix: BuyerMixDataPoint[];
}

export function ChartsSection({ monthlyRevenue, buyerMix }: ChartsSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Revenue Trend */}
            <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base text-[#333333] flex items-center gap-2">
                        <LineChartIcon className="w-5 h-5 text-[#3BA55D]" />
                        Monthly Revenue Trend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#777777" }} />
                            <YAxis tick={{ fontSize: 12, fill: "#777777" }} />
                            <RechartsTooltip
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3BA55D"
                                strokeWidth={3}
                                dot={{ fill: "#3BA55D", r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Buyer Mix */}
            <Card className="border-[#E0E0E0] rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base text-[#333333] flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-[#4A90E2]" />
                        Buyer Mix
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={buyerMix}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {buyerMix.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value: number) => `$${value.toLocaleString()}`}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-4 space-y-2">
                        {buyerMix.map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center justify-between text-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-[#777777]">{item.name}</span>
                                </div>
                                <span className="numeric text-[#333333]">
                                    ${item.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}





























