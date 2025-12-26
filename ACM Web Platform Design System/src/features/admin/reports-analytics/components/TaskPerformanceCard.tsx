import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ListTodo } from 'lucide-react';
import type { TaskPerformanceReport } from '@/services/api.admin';

interface TaskPerformanceCardProps {
    data?: TaskPerformanceReport;
    isLoading?: boolean;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

export const TaskPerformanceCard: React.FC<TaskPerformanceCardProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Task Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[200px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!data || data.totalTasks === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Task Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        <p>No task data available for the selected year.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const pieData = [
        { name: 'Completed', value: data.completedTasks, color: '#10B981' },
        { name: 'In Progress', value: data.inProgressTasks, color: '#3B82F6' },
        { name: 'Pending', value: data.pendingTasks, color: '#F59E0B' },
        { name: 'Overdue', value: data.overdueTasks, color: '#EF4444' },
        { name: 'Cancelled', value: data.cancelledTasks, color: '#6B7280' },
    ].filter(item => item.value > 0);

    const completionRate = Number(data.completionRate) || 0;
    const overdueRate = Number(data.overdueRate) || 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ListTodo className="w-5 h-5" />
                    Task Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {/* Pie Chart */}
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [value, 'Tasks']} />
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '11px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2">
                                <ListTodo className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">Total Tasks</span>
                            </div>
                            <span className="font-semibold">{data.totalTasks}</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm">Completion Rate</span>
                            </div>
                            <span className="font-semibold text-emerald-600">{completionRate.toFixed(1)}%</span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-sm">Overdue Rate</span>
                            </div>
                            <span className="font-semibold text-red-600">{overdueRate.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
