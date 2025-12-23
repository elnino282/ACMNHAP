import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from '@/shared/ui';
import { useNavigate } from 'react-router-dom';

interface PlotResponse {
    id: number;
    name: string;
    area?: string | number | null;
    status?: string;
}

interface FarmPlotsTableProps {
    plots: PlotResponse[];
}

/**
 * Table showing plots belonging to a farm
 */
export function FarmPlotsTable({ plots }: FarmPlotsTableProps) {
    const navigate = useNavigate();

    if (!plots || plots.length === 0) {
        return (
            <div className="rounded-md border p-8 text-center text-gray-500">
                No plots found for this farm
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Plot Name</TableHead>
                        <TableHead className="text-right">Area (ha)</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plots.map((plot) => (
                        <TableRow
                            key={plot.id}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => navigate(`/farmer/plots/${plot.id}`)}
                        >
                            <TableCell className="font-medium">{plot.name}</TableCell>
                            <TableCell className="text-right font-mono">
                                {plot.area ? plot.area : '—'}
                            </TableCell>
                            <TableCell>
                                {plot.status ? (
                                    <Badge variant="outline">{plot.status}</Badge>
                                ) : (
                                    '—'
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
