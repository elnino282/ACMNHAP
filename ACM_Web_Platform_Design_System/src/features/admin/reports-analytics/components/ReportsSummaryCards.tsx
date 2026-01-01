import { TrendingUp, Wheat, Coins, Calculator, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface SummaryStats {
    totalYield: number;
    totalCost: number;
    costPerKg: number | null;
    totalRevenue: number;
    grossProfit: number;
    profitMargin: number | null;
}

interface ReportsSummaryCardsProps {
    stats: SummaryStats;
    isLoading?: boolean;
}

export const ReportsSummaryCards: React.FC<ReportsSummaryCardsProps> = ({
    stats,
    isLoading = false
}) => {
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const formatCurrency = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num) + ' VND';
    };

    const cards = [
        {
            title: 'Total Actual Yield',
            value: `${formatNumber(stats.totalYield)} kg`,
            subtitle: 'In selected range',
            icon: Wheat,
            bgColor: 'bg-[#e8f5e9]',
            iconColor: 'text-[#3ba55d]',
        },
        {
            title: 'Total Cost',
            value: formatCurrency(stats.totalCost),
            subtitle: 'All expenses',
            icon: Coins,
            bgColor: 'bg-[#fff9e6]',
            iconColor: 'text-[#f59e0b]',
        },
        {
            title: 'Cost per kg',
            value: stats.costPerKg != null ? formatCurrency(stats.costPerKg) : 'N/A',
            subtitle: 'Average efficiency',
            icon: Calculator,
            bgColor: 'bg-[#e3f2fd]',
            iconColor: 'text-[#2563eb]',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            subtitle: 'From harvests',
            icon: DollarSign,
            bgColor: 'bg-[#e8f5e9]',
            iconColor: 'text-[#3ba55d]',
        },
        {
            title: 'Gross Profit',
            value: formatCurrency(stats.grossProfit),
            subtitle: stats.profitMargin != null
                ? `${stats.profitMargin.toFixed(1)}% margin`
                : 'N/A margin',
            icon: TrendingUp,
            bgColor: stats.grossProfit >= 0 ? 'bg-[#e8f5e9]' : 'bg-[#ffebee]',
            iconColor: stats.grossProfit >= 0 ? 'text-[#3ba55d]' : 'text-[#fb2c36]',
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="rounded-[18px] border-[#e0e0e0] shadow-sm animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-24" />
                                    <div className="h-6 bg-gray-200 rounded w-32" />
                                    <div className="h-3 bg-gray-200 rounded w-20" />
                                </div>
                                <div className="w-10 h-10 bg-gray-200 rounded-2xl" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card key={index} className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-[#6b7280]">{card.title}</p>
                                    <p className="text-base font-normal text-[#1f2937]">{card.value}</p>
                                    <p className="text-xs text-[#6b7280]">{card.subtitle}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-2xl ${card.bgColor} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
