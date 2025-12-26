import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Bug, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { IncidentStatisticsReport } from '@/services/api.admin';

interface IncidentStatisticsCardProps {
    data?: IncidentStatisticsReport;
    isLoading?: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
    'HIGH': '#EF4444',
    'MEDIUM': '#F59E0B',
    'LOW': '#10B981',
};

const STATUS_COLORS: Record<string, string> = {
    'OPEN': '#EF4444',
    'IN_PROGRESS': '#3B82F6',
    'RESOLVED': '#10B981',
    'CANCELLED': '#6B7280',
};

export const IncidentStatisticsCard: React.FC<IncidentStatisticsCardProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Incident Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.totalCount === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Incident Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        <p>No incident data available for the selected year.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Transform data for severity pie chart
    const severityData = Object.entries(data.bySeverity).map(([name, value]) => ({
        name,
        value,
        color: SEVERITY_COLORS[name] || '#6B7280',
    }));

    // Transform data for status breakdown
    const statusData = Object.entries(data.byStatus).map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || '#6B7280',
    }));

    // Top incident types
    const topTypes = Object.entries(data.byIncidentType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

    const avgResolution = data.averageResolutionDays ? Number(data.averageResolutionDays).toFixed(1) : 'N/A';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Incident Statistics
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {/* Severity Pie Chart */}
                    <div className="h-[160px]">
                        <p className="text-xs text-muted-foreground mb-2 text-center">By Severity</p>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-2 text-xs mt-1">
                            {severityData.map((item) => (
                                <span key={item.name} className="flex items-center gap-1">
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    {item.name}: {item.value}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <p className="text-2xl font-bold">{data.totalCount}</p>
                            <p className="text-xs text-muted-foreground">Total Incidents</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-red-50 text-center">
                                <p className="text-lg font-bold text-red-600">{data.openCount}</p>
                                <p className="text-xs text-red-600">Open</p>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 text-center">
                                <p className="text-lg font-bold text-emerald-600">{data.resolvedCount}</p>
                                <p className="text-xs text-emerald-600">Resolved</p>
                            </div>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 text-center">
                            <p className="text-sm font-semibold text-blue-600">{avgResolution} days</p>
                            <p className="text-xs text-blue-600">Avg Resolution</p>
                        </div>
                    </div>

                    {/* Top Incident Types */}
                    <div>
                        <p className="text-xs text-muted-foreground mb-2">Top Incident Types</p>
                        <div className="space-y-2">
                            {topTypes.map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <Bug className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs truncate max-w-[100px]">{type}</span>
                                    </div>
                                    <span className="text-xs font-semibold">{count}</span>
                                </div>
                            ))}
                            {topTypes.length === 0 && (
                                <p className="text-xs text-muted-foreground">No types recorded</p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
