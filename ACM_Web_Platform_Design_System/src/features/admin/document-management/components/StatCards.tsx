import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface DocumentStats {
    total: number;
    active: number;
    inactive: number;
    isFiltered: boolean;
}

interface StatCardsProps {
    stats: DocumentStats;
    isLoading?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const StatCards: React.FC<StatCardsProps> = ({ stats, isLoading = false }) => {
    const cards = [
        {
            label: 'Total Documents',
            value: stats.total,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Active',
            value: stats.active,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
        {
            label: 'Inactive',
            value: stats.inactive,
            icon: XCircle,
            color: 'text-gray-500',
            bgColor: 'bg-gray-50',
        },
    ];

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cards.map((card) => (
                    <Card key={card.label} className="relative overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{card.label}</p>
                                    <p className={`text-2xl font-bold ${isLoading ? 'animate-pulse' : ''}`}>
                                        {isLoading ? '—' : card.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${card.bgColor}`}>
                                    <card.icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filtered data indicator */}
            {stats.isFiltered && !isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                        Statistics are based on current filter results, not the entire dataset.
                    </span>
                </div>
            )}
        </div>
    );
};
