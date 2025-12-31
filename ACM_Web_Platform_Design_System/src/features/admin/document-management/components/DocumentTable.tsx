import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreHorizontal,
    Pencil,
    ExternalLink,
    Power,
    PowerOff,
    Eye,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    FileText,
} from 'lucide-react';
import { AdminDocument } from '@/services/api.admin';
import { DocumentType, DocumentStatus } from '../types';
import { STATUS_BADGE_COLORS, TYPE_BADGE_COLORS, TYPE_LABELS } from '../constants';
import { Skeleton } from '@/components/ui/skeleton';

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface DocumentTableProps {
    documents: AdminDocument[];
    isLoading?: boolean;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (field: string) => void;
    onEdit?: (document: AdminDocument) => void;
    onView?: (document: AdminDocument) => void;
    onDeactivate?: (document: AdminDocument) => void;
    onActivate?: (document: AdminDocument) => void;
}

// ═══════════════════════════════════════════════════════════════
// SORTABLE HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════

const SortableHeader: React.FC<{
    field: string;
    label: string;
    currentSort?: string;
    direction?: 'asc' | 'desc';
    onSort?: (field: string) => void;
}> = ({ field, label, currentSort, direction, onSort }) => {
    const isActive = currentSort === field;

    return (
        <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 hover:bg-transparent"
            onClick={() => onSort?.(field)}
        >
            {label}
            {isActive ? (
                direction === 'asc' ? (
                    <ArrowUp className="ml-1 h-3 w-3" />
                ) : (
                    <ArrowDown className="ml-1 h-3 w-3" />
                )
            ) : (
                <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
        </Button>
    );
};

// ═══════════════════════════════════════════════════════════════
// FORMAT DATE HELPER
// ═══════════════════════════════════════════════════════════════

const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return dateString;
    }
};

// ═══════════════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

const TableSkeleton: React.FC = () => (
    <>
        {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
        ))}
    </>
);

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

const EmptyState: React.FC = () => (
    <TableRow>
        <TableCell colSpan={6} className="h-40 text-center">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
                <FileText className="h-10 w-10 mb-3 opacity-50" />
                <p className="text-lg font-medium">No documents found</p>
                <p className="text-sm">Try adjusting your filters or create a new document.</p>
            </div>
        </TableCell>
    </TableRow>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const DocumentTable: React.FC<DocumentTableProps> = ({
    documents,
    isLoading = false,
    sortField,
    sortDirection,
    onSort,
    onEdit,
    onView,
    onDeactivate,
    onActivate,
}) => {
    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[300px]">
                            <SortableHeader
                                field="title"
                                label="Title"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead className="w-[200px]">Document URL</TableHead>
                        <TableHead className="w-[120px]">
                            <SortableHeader
                                field="createdAt"
                                label="Created"
                                currentSort={sortField}
                                direction={sortDirection}
                                onSort={onSort}
                            />
                        </TableHead>
                        <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableSkeleton />
                    ) : documents.length === 0 ? (
                        <EmptyState />
                    ) : (
                        documents.map((doc) => (
                            <TableRow key={doc.id} className="group">
                                {/* Title */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-foreground">
                                            {doc.title}
                                        </span>
                                        {doc.description && (
                                            <span className="text-xs text-muted-foreground line-clamp-1">
                                                {doc.description}
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Type Badge */}
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={TYPE_BADGE_COLORS[doc.documentType as DocumentType] || TYPE_BADGE_COLORS.OTHER}
                                    >
                                        {TYPE_LABELS[doc.documentType as DocumentType] || doc.documentType}
                                    </Badge>
                                </TableCell>

                                {/* Status Badge */}
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={STATUS_BADGE_COLORS[doc.status as DocumentStatus] || STATUS_BADGE_COLORS.INACTIVE}
                                    >
                                        {doc.status}
                                    </Badge>
                                </TableCell>

                                {/* URL */}
                                <TableCell>
                                    <a
                                        href={doc.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[180px]"
                                        title={doc.documentUrl}
                                    >
                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{doc.documentUrl}</span>
                                    </a>
                                </TableCell>

                                {/* Created At */}
                                <TableCell className="text-muted-foreground text-sm">
                                    {formatDate(doc.createdAt)}
                                </TableCell>

                                {/* Actions */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onView?.(doc)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit?.(doc)}>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => window.open(doc.documentUrl, '_blank')}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Open URL
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {doc.status === 'ACTIVE' ? (
                                                <DropdownMenuItem
                                                    onClick={() => onDeactivate?.(doc)}
                                                    className="text-orange-600"
                                                >
                                                    <PowerOff className="h-4 w-4 mr-2" />
                                                    Deactivate
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    onClick={() => onActivate?.(doc)}
                                                    className="text-emerald-600"
                                                >
                                                    <Power className="h-4 w-4 mr-2" />
                                                    Activate
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
