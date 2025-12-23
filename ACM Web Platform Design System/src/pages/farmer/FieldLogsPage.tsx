import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useSeasons } from '@/entities/season';
import { useFieldLogsBySeason, useCreateFieldLog, type FieldLog } from '@/entities/field-log';

const LOG_TYPES = [
    { value: 'TRANSPLANT', label: 'Transplant / Cấy' },
    { value: 'FERTILIZE', label: 'Fertilize / Bón phân' },
    { value: 'PEST', label: 'Pest / Sâu bệnh' },
    { value: 'IRRIGATION', label: 'Irrigation / Tưới nước' },
    { value: 'HARVEST', label: 'Harvest / Thu hoạch' },
    { value: 'OBSERVATION', label: 'Observation / Quan sát' },
    { value: 'OTHER', label: 'Other / Khác' },
];

function getLogTypeBadgeStyle(type: string): string {
    switch (type) {
        case 'TRANSPLANT':
            return 'bg-green-100 text-green-800';
        case 'FERTILIZE':
            return 'bg-blue-100 text-blue-800';
        case 'PEST':
            return 'bg-red-100 text-red-800';
        case 'IRRIGATION':
            return 'bg-cyan-100 text-cyan-800';
        case 'HARVEST':
            return 'bg-amber-100 text-amber-800';
        case 'OBSERVATION':
            return 'bg-purple-100 text-purple-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Field Logs Page
 * 
 * Displays field logs for farmer's seasons with create functionality.
 */
export function FieldLogsPage() {
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Form state
    const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [logType, setLogType] = useState<string>('OBSERVATION');
    const [notes, setNotes] = useState<string>('');

    // Fetch seasons
    const { data: seasonsData, isLoading: seasonsLoading, error: seasonsError } = useSeasons();

    const seasonId = parseInt(selectedSeasonId, 10);
    const hasSeason = !isNaN(seasonId) && seasonId > 0;

    // Fetch field logs for selected season
    const { data: fieldLogsData, isLoading: logsLoading, error: logsError } = useFieldLogsBySeason(
        seasonId,
        undefined,
        { enabled: hasSeason }
    );

    // Create mutation
    const createMutation = useCreateFieldLog(seasonId);

    // Set default season when loaded
    useMemo(() => {
        if (seasonsData?.items?.length && !selectedSeasonId) {
            setSelectedSeasonId(String(seasonsData.items[0].id));
        }
    }, [seasonsData, selectedSeasonId]);

    // Filter logs by type
    const filteredLogs = useMemo(() => {
        const logs = fieldLogsData?.items ?? [];
        if (filterType === 'all') return logs;
        return logs.filter((log: FieldLog) => log.logType === filterType);
    }, [fieldLogsData, filterType]);

    const handleCreateLog = async () => {
        if (!hasSeason) return;

        try {
            await createMutation.mutateAsync({
                logDate,
                logType,
                notes,
            });
            setCreateDialogOpen(false);
            setNotes('');
            setLogDate(new Date().toISOString().split('T')[0]);
            setLogType('OBSERVATION');
        } catch (error) {
            console.error('Failed to create field log:', error);
        }
    };

    // Loading state
    if (seasonsLoading) {
        return (
            <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4A90E2]" />
                    <p className="text-[#333333]/70">Loading field logs...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (seasonsError) {
        return (
            <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center p-6">
                <Card className="max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            Failed to Load
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[#555555]">Unable to load seasons. Please try again.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-[#2F9E44]" />
                    <div>
                        <h1 className="text-3xl font-bold text-[#333333]">Field Logs</h1>
                        <p className="text-[#777777]">Nhật ký đồng ruộng</p>
                    </div>
                </div>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#2F9E44] hover:bg-[#27833a]" disabled={!hasSeason}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Log
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Field Log</DialogTitle>
                            <DialogDescription>
                                Record a new observation or activity for your season.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="logDate">Date</Label>
                                <Input
                                    id="logDate"
                                    type="date"
                                    value={logDate}
                                    onChange={(e) => setLogDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="logType">Type</Label>
                                <Select value={logType} onValueChange={setLogType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LOG_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Enter your observations..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateLog}
                                disabled={createMutation.isPending}
                                className="bg-[#2F9E44] hover:bg-[#27833a]"
                            >
                                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create Log
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#777777]" />
                            <Label className="text-[#555555]">Season:</Label>
                            <Select value={selectedSeasonId} onValueChange={setSelectedSeasonId}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                                <SelectContent>
                                    {seasonsData?.items?.map((season) => (
                                        <SelectItem key={season.id} value={String(season.id)}>
                                            {season.seasonName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-[#555555]">Type:</Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {LOG_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Field Logs</CardTitle>
                    <CardDescription>
                        {filteredLogs.length} log(s) found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {logsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
                            <span className="ml-2 text-[#777777]">Loading logs...</span>
                        </div>
                    ) : logsError ? (
                        <div className="flex items-center justify-center py-8 text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Failed to load logs
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#777777]">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p>No field logs found</p>
                            {hasSeason && (
                                <p className="text-sm">Click "Add Log" to create your first entry</p>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Date</TableHead>
                                    <TableHead className="w-[150px]">Type</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log: FieldLog) => (
                                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            {String(log.logDate)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getLogTypeBadgeStyle(log.logType)}>
                                                {log.logType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {log.notes || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
