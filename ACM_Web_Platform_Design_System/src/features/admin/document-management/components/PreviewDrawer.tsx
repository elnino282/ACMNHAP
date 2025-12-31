import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Pencil, Power, PowerOff, Calendar, User } from 'lucide-react';
import { AdminDocument } from '@/services/api.admin';
import { DocumentType, DocumentStatus } from '../types';
import { STATUS_BADGE_COLORS, TYPE_BADGE_COLORS, TYPE_LABELS } from '../constants';

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface PreviewDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    document: AdminDocument | null;
    onEdit?: (document: AdminDocument) => void;
    onDeactivate?: (document: AdminDocument) => void;
    onActivate?: (document: AdminDocument) => void;
}

// ═══════════════════════════════════════════════════════════════
// FORMAT DATE HELPER
// ═══════════════════════════════════════════════════════════════

const formatDateTime = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
    open,
    onOpenChange,
    document,
    onEdit,
    onDeactivate,
    onActivate,
}) => {
    if (!document) return null;

    const isActive = document.status === 'ACTIVE';

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="text-xl pr-8">{document.title}</SheetTitle>
                    <SheetDescription className="sr-only">
                        Document details and actions
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Status & Type Badges */}
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="secondary"
                            className={STATUS_BADGE_COLORS[document.status as DocumentStatus] || STATUS_BADGE_COLORS.INACTIVE}
                        >
                            {document.status}
                        </Badge>
                        <Badge
                            variant="secondary"
                            className={TYPE_BADGE_COLORS[document.documentType as DocumentType] || TYPE_BADGE_COLORS.OTHER}
                        >
                            {TYPE_LABELS[document.documentType as DocumentType] || document.documentType}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Description
                        </h4>
                        <p className="text-sm leading-relaxed">
                            {document.description || 'No description provided.'}
                        </p>
                    </div>

                    {/* Document URL */}
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Document URL
                        </h4>
                        <a
                            href={document.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                            {document.documentUrl}
                        </a>
                    </div>

                    <Separator />

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Created</span>
                            </div>
                            <p className="font-medium">{formatDateTime(document.createdAt)}</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Updated</span>
                            </div>
                            <p className="font-medium">{formatDateTime(document.updatedAt)}</p>
                        </div>
                        {document.createdBy && (
                            <div>
                                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <User className="h-3.5 w-3.5" />
                                    <span>Created By</span>
                                </div>
                                <p className="font-medium">User #{document.createdBy}</p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => window.open(document.documentUrl, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Document URL
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => {
                                onEdit?.(document);
                                onOpenChange(false);
                            }}
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Document
                        </Button>

                        {isActive ? (
                            <Button
                                variant="outline"
                                className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => {
                                    onDeactivate?.(document);
                                    onOpenChange(false);
                                }}
                            >
                                <PowerOff className="h-4 w-4 mr-2" />
                                Deactivate Document
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full justify-start text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => {
                                    onActivate?.(document);
                                    onOpenChange(false);
                                }}
                            >
                                <Power className="h-4 w-4 mr-2" />
                                Activate Document
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
