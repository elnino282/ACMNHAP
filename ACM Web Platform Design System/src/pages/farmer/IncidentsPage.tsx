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
import { AlertTriangle, Plus, Loader2, AlertCircle, Calendar, XCircle } from 'lucide-react';
import { useSeasons } from '@/entities/season';
import { useIncidentsBySeason, useCreateIncident, type Incident } from '@/entities/incident';

const INCIDENT_TYPES = [
    { value: 'PEST_OUTBREAK', label: 'Pest Outbreak / Sâu bệnh' },
    { value: 'DISEASE', label: 'Disease / Dịch bệnh' },
    { value: 'WEATHER_DAMAGE', label: 'Weather Damage / Thiên tai' },
    { value: 'EQUIPMENT_FAILURE', label: 'Equipment Failure / Thiết bị hỏng' },
    { value: 'OTHER', label: 'Other / Khác' },
];

const SEVERITY_OPTIONS = [
    { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-100 text-amber-800' },
    { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' },
];

const STATUS_OPTIONS = [
    { value: 'OPEN', label: 'Open', color: 'bg-blue-100 text-blue-800' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
    { value: 'RESOLVED', label: 'Resolved', color: 'bg-green-100 text-green-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
];

function getSeverityStyle(severity: string): string {
    return SEVERITY_OPTIONS.find(s => s.value === severity)?.color || 'bg-gray-100 text-gray-800';
}

function getStatusStyle(status: string): string {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
}

/**
 * Incidents Page
 * 
 * Displays and manages incidents for farmer's seasons.
 */
export function IncidentsPage() {
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    // Form state
    const [incidentType, setIncidentType] = useState<string>('PEST_OUTBREAK');
    const [description, setDescription] = useState<string>('');
    const [severity, setSeverity] = useState<string>('MEDIUM');
    const [deadline, setDeadline] = useState<string>('');

    // Fetch seasons
    const { data: seasonsData, isLoading: seasonsLoading, error: seasonsError } = useSeasons();

    const seasonId = parseInt(selectedSeasonId, 10);
    const hasSeason = !isNaN(seasonId) && seasonId > 0;

    // Fetch incidents for selected season
    const { data: incidentsData, isLoading: incidentsLoading, error: incidentsError } = useIncidentsBySeason(
        seasonId,
        { enabled: hasSeason }
    );

    // Create mutation
    const createMutation = useCreateIncident(seasonId);

    // Set default season when loaded
    useMemo(() => {
        if (seasonsData?.items?.length && !selectedSeasonId) {
            setSelectedSeasonId(String(seasonsData.items[0].id));
        }
    }, [seasonsData, selectedSeasonId]);

    // Filter incidents
    const filteredIncidents = useMemo(() => {
        const incidents: Incident[] = incidentsData ?? [];
        return incidents.filter((i: Incident) => {
            if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;
            if (filterStatus !== 'all' && i.status !== filterStatus) return false;
            return true;
        });
    }, [incidentsData, filterSeverity, filterStatus]);

    const handleCreateIncident = async () => {
        if (!hasSeason) return;

        try {
            await createMutation.mutateAsync({
                incidentType,
                description,
                severity: severity as 'LOW' | 'MEDIUM' | 'HIGH',
                deadline: deadline || undefined,
            });
            setCreateDialogOpen(false);
            setDescription('');
            setDeadline('');
            setIncidentType('PEST_OUTBREAK');
            setSeverity('MEDIUM');
        } catch (error) {
            console.error('Failed to create incident:', error);
        }
    };

    // Loading state
    if (seasonsLoading) {
        return (
            <div className="min-h-screen bg-[#F8F8F4] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-[#4A90E2]" />
                    <p className="text-[#333333]/70">Loading incidents...</p>
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
                    <AlertTriangle className="w-8 h-8 text-[#E74C3C]" />
                    <div>
                        <h1 className="text-3xl font-bold text-[#333333]">Incidents</h1>
                        <p className="text-[#777777]">Sự cố</p>
                    </div>
                </div>

                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#E74C3C] hover:bg-[#c0392b]" disabled={!hasSeason}>
                            <Plus className="w-4 h-4 mr-2" />
                            Report Incident
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Report Incident</DialogTitle>
                            <DialogDescription>
                                Report a new incident for your season.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="incidentType">Type</Label>
                                <Select value={incidentType} onValueChange={setIncidentType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INCIDENT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="severity">Severity</Label>
                                <Select value={severity} onValueChange={setSeverity}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SEVERITY_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deadline">Deadline (Optional)</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the incident..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateIncident}
                                disabled={createMutation.isPending || !description}
                                className="bg-[#E74C3C] hover:bg-[#c0392b]"
                            >
                                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Report Incident
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
                            <Label className="text-[#555555]">Severity:</Label>
                            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {SEVERITY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="text-[#555555]">Status:</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    {STATUS_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
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
                    <CardTitle>Incidents</CardTitle>
                    <CardDescription>
                        {filteredIncidents.length} incident(s) found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {incidentsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-[#4A90E2]" />
                            <span className="ml-2 text-[#777777]">Loading incidents...</span>
                        </div>
                    ) : incidentsError ? (
                        <div className="flex items-center justify-center py-8 text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Failed to load incidents
                        </div>
                    ) : filteredIncidents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#777777]">
                            <XCircle className="w-12 h-12 mb-4 opacity-50" />
                            <p>No incidents found</p>
                            {hasSeason && (
                                <p className="text-sm">Click "Report Incident" to log a new issue</p>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Type</TableHead>
                                    <TableHead className="w-[100px]">Severity</TableHead>
                                    <TableHead className="w-[120px]">Status</TableHead>
                                    <TableHead className="w-[120px]">Deadline</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredIncidents.map((incident: Incident) => (
                                    <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            {incident.incidentType.replace(/_/g, ' ')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getSeverityStyle(incident.severity)}>
                                                {incident.severity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusStyle(incident.status)}>
                                                {incident.status.replace(/_/g, ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {incident.deadline || '-'}
                                        </TableCell>
                                        <TableCell className="max-w-md truncate">
                                            {incident.description}
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
