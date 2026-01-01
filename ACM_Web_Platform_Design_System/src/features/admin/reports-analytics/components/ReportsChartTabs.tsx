import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface YieldDataItem {
    group: string;
    expected: number;
    actual: number;
    varianceKg: number;
    variancePercent: number;
}

export interface CostDataItem {
    group: string;
    totalCost: number;
    costPerKg: number;
}

export interface RevenueDataItem {
    group: string;
    revenue: number;
    profit: number;
    profitMargin: number;
}

export interface ProfitDataItem {
    group: string;
    revenue: number;
    expense: number;
    grossProfit: number;
    profitMargin: number | null;
}

interface ReportsChartTabsProps {
    yieldData: YieldDataItem[];
    costData?: CostDataItem[];
    revenueData?: RevenueDataItem[];
    profitData?: ProfitDataItem[];
    activeTab: 'yield' | 'cost' | 'revenue' | 'profit';
    onTabChange: (tab: 'yield' | 'cost' | 'revenue' | 'profit') => void;
    onReset?: () => void;
    isLoading?: boolean;
}

const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

// Empty state component
const EmptyState: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
    <div className="h-[300px] flex flex-col items-center justify-center text-[#6b7280]">
        <p className="mb-2">No data for selected filters</p>
        {onReset && (
            <Button variant="link" onClick={onReset} className="text-[#2563eb]">
                Reset filters
            </Button>
        )}
    </div>
);

// Loading spinner
const LoadingSpinner: React.FC = () => (
    <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]" />
    </div>
);

export const ReportsChartTabs: React.FC<ReportsChartTabsProps> = ({
    yieldData,
    costData = [],
    revenueData = [],
    profitData = [],
    activeTab,
    onTabChange,
    onReset,
    isLoading = false
}) => {
    return (
        <div className="space-y-6">
            {/* Tab List */}
            <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as 'yield' | 'cost' | 'revenue' | 'profit')}>
                <TabsList className="h-9 p-[3px] rounded-[18px] border border-[#e0e0e0] bg-white">
                    <TabsTrigger
                        value="yield"
                        className="h-[27px] px-[9px] rounded-[18px] text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Yield
                    </TabsTrigger>
                    <TabsTrigger
                        value="cost"
                        className="h-[27px] px-[9px] rounded-[18px] text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Cost
                    </TabsTrigger>
                    <TabsTrigger
                        value="revenue"
                        className="h-[27px] px-[9px] rounded-[18px] text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Revenue
                    </TabsTrigger>
                    <TabsTrigger
                        value="profit"
                        className="h-[27px] px-[9px] rounded-[18px] text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                        Profit
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Yield Tab Content */}
            {activeTab === 'yield' && (
                <div className="space-y-4">
                    {/* Bar Chart */}
                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold text-[#1f2937] mb-4 font-['Poppins']">
                                Expected vs Actual Yield
                            </h3>
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : yieldData.length === 0 ? (
                                <EmptyState onReset={onReset} />
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={yieldData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                        <XAxis
                                            dataKey="group"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            angle={0}
                                            textAnchor="middle"
                                            interval={0}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) => formatNumber(value)}
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => {
                                                const label = name === 'actual' ? 'Actual (kg)' : 'Expected (kg)';
                                                return [formatNumber(value), label];
                                            }}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e0e0e0',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            wrapperStyle={{ paddingTop: '20px' }}
                                            formatter={(value: string) => {
                                                const labels: Record<string, string> = {
                                                    actual: 'Actual (kg)',
                                                    expected: 'Expected (kg)'
                                                };
                                                return <span style={{ color: value === 'actual' ? '#3ba55d' : '#4a90e2' }}>{labels[value]}</span>;
                                            }}
                                        />
                                        <Bar
                                            dataKey="actual"
                                            name="actual"
                                            fill="#3ba55d"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                        <Bar
                                            dataKey="expected"
                                            name="expected"
                                            fill="#4a90e2"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Data Table */}
                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-[#e0e0e0]">
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Group</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Expected (kg)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Actual (kg)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Variance (kg)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Variance (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {yieldData.map((item, index) => (
                                        <TableRow key={index} className="border-b border-[#e0e0e0]">
                                            <TableCell className="text-sm text-[#333]">{item.group}</TableCell>
                                            <TableCell className="text-sm text-[#333]">{formatNumber(item.expected)}</TableCell>
                                            <TableCell className="text-sm text-[#333]">{formatNumber(item.actual)}</TableCell>
                                            <TableCell className={`text-sm ${item.varianceKg >= 0 ? 'text-[#3ba55d]' : 'text-[#fb2c36]'}`}>
                                                {item.varianceKg >= 0 ? '+' : ''}{formatNumber(item.varianceKg)}
                                            </TableCell>
                                            <TableCell className={`text-sm ${item.variancePercent >= 0 ? 'text-[#3ba55d]' : 'text-[#fb2c36]'}`}>
                                                {item.variancePercent >= 0 ? '+' : ''}{item.variancePercent.toFixed(1)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Cost Tab Content */}
            {activeTab === 'cost' && (
                <div className="space-y-4">
                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold text-[#1f2937] mb-4 font-['Poppins']">
                                Cost Analysis
                            </h3>
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : costData.length === 0 ? (
                                <EmptyState onReset={onReset} />
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={costData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                        <XAxis
                                            dataKey="group"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [formatNumber(value) + ' VND', 'Total Cost']}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e0e0e0',
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="totalCost"
                                            name="Total Cost (VND)"
                                            fill="#f59e0b"
                                            radius={[4, 4, 0, 0]}
                                            barSize={50}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-[#e0e0e0]">
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Group</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Total Cost (VND)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Cost per kg (VND)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {costData.map((item, index) => (
                                        <TableRow key={index} className="border-b border-[#e0e0e0]">
                                            <TableCell className="text-sm text-[#333]">{item.group}</TableCell>
                                            <TableCell className="text-sm text-[#333]">{formatNumber(item.totalCost)}</TableCell>
                                            <TableCell className="text-sm text-[#333]">{formatNumber(item.costPerKg)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Revenue Tab Content */}
            {activeTab === 'revenue' && (
                <div className="space-y-4">
                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold text-[#1f2937] mb-4 font-['Poppins']">
                                Revenue Analysis
                            </h3>
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : revenueData.length === 0 ? (
                                <EmptyState onReset={onReset} />
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={revenueData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                        <XAxis
                                            dataKey="group"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => {
                                                const labels: Record<string, string> = {
                                                    revenue: 'Revenue',
                                                    profit: 'Profit'
                                                };
                                                return [formatNumber(value) + ' VND', labels[name] || name];
                                            }}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e0e0e0',
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="revenue"
                                            name="Revenue (VND)"
                                            fill="#3ba55d"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                        <Bar
                                            dataKey="profit"
                                            name="Profit (VND)"
                                            fill="#2563eb"
                                            radius={[4, 4, 0, 0]}
                                            barSize={40}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-[#e0e0e0]">
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Group</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Revenue (VND)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Profit (VND)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Profit Margin (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {revenueData.map((item, index) => (
                                        <TableRow key={index} className="border-b border-[#e0e0e0]">
                                            <TableCell className="text-sm text-[#333]">{item.group}</TableCell>
                                            <TableCell className="text-sm text-[#333]">{formatNumber(item.revenue)}</TableCell>
                                            <TableCell className={`text-sm ${item.profit >= 0 ? 'text-[#3ba55d]' : 'text-[#fb2c36]'}`}>
                                                {item.profit >= 0 ? '+' : ''}{formatNumber(item.profit)}
                                            </TableCell>
                                            <TableCell className={`text-sm ${item.profitMargin >= 0 ? 'text-[#3ba55d]' : 'text-[#fb2c36]'}`}>
                                                {item.profitMargin >= 0 ? '+' : ''}{item.profitMargin.toFixed(1)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Profit Tab Content */}
            {activeTab === 'profit' && (
                <div className="space-y-4">
                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="text-xl font-semibold text-[#1f2937] mb-4 font-['Poppins']">
                                Profit Analysis
                            </h3>
                            {isLoading ? (
                                <LoadingSpinner />
                            ) : profitData.length === 0 ? (
                                <EmptyState onReset={onReset} />
                            ) : (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={profitData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                                        <XAxis
                                            dataKey="group"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                        />
                                        <Tooltip
                                            formatter={(value: number, name: string) => {
                                                const labels: Record<string, string> = {
                                                    revenue: 'Revenue',
                                                    expense: 'Expense',
                                                    grossProfit: 'Gross Profit'
                                                };
                                                return [formatNumber(value) + ' VND', labels[name] || name];
                                            }}
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: '1px solid #e0e0e0',
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="revenue"
                                            name="Revenue (VND)"
                                            fill="#3ba55d"
                                            radius={[4, 4, 0, 0]}
                                            barSize={30}
                                        />
                                        <Bar
                                            dataKey="expense"
                                            name="Expense (VND)"
                                            fill="#f59e0b"
                                            radius={[4, 4, 0, 0]}
                                            barSize={30}
                                        />
                                        <Bar
                                            dataKey="grossProfit"
                                            name="Gross Profit (VND)"
                                            fill="#2563eb"
                                            radius={[4, 4, 0, 0]}
                                            barSize={30}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-[18px] border-[#e0e0e0] shadow-sm">
                        <CardContent className="p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-[#e0e0e0]">
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Season</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Revenue (VND)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Expense (VND)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Gross Profit (VND)</TableHead>
                                        <TableHead className="text-sm font-medium text-[#1f2937]">Margin (%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...profitData]
                                        .sort((a, b) => b.grossProfit - a.grossProfit)
                                        .map((item, index) => (
                                            <TableRow key={index} className="border-b border-[#e0e0e0]">
                                                <TableCell className="text-sm text-[#333]">{item.group}</TableCell>
                                                <TableCell className="text-sm text-[#333]">{formatNumber(item.revenue)}</TableCell>
                                                <TableCell className="text-sm text-[#333]">{formatNumber(item.expense)}</TableCell>
                                                <TableCell className={`text-sm ${item.grossProfit >= 0 ? 'text-[#3ba55d]' : 'text-[#fb2c36]'}`}>
                                                    {item.grossProfit >= 0 ? '+' : ''}{formatNumber(item.grossProfit)}
                                                </TableCell>
                                                <TableCell className={`text-sm ${(item.profitMargin ?? 0) >= 0 ? 'text-[#3ba55d]' : 'text-[#fb2c36]'}`}>
                                                    {item.profitMargin != null ? `${item.profitMargin.toFixed(1)}%` : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
