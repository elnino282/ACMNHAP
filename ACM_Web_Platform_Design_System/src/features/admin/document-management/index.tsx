import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { AdminDocument, AdminDocumentCreateRequest, AdminDocumentUpdateRequest } from '@/services/api.admin';
import {
    useDocumentList,
    useCreateDocument,
    useUpdateDocument,
    useDeactivateDocument,
    useActivateDocument,
    calculateDocumentStats,
} from './hooks/useDocuments';
import { DocumentType, DocumentStatus } from './types';
import { DEFAULT_PAGE_SIZE } from './constants';
import { StatCards } from './components/StatCards';
import { FilterBar } from './components/FilterBar';
import { DocumentTable } from './components/DocumentTable';
import { Pagination } from './components/Pagination';
import { DocumentFormModal } from './components/DocumentFormModal';
import { PreviewDrawer } from './components/PreviewDrawer';
import { ConfirmDialog } from './components/ConfirmDialog';

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const DocumentManagement: React.FC = () => {
    // ─────────────────────────────────────────────────────────────
    // FILTER & PAGINATION STATE
    // ─────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [sortField, setSortField] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    // ─────────────────────────────────────────────────────────────
    // MODAL & DRAWER STATE
    // ─────────────────────────────────────────────────────────────
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<AdminDocument | null>(null);
    const [confirmAction, setConfirmAction] = useState<'deactivate' | 'activate'>('deactivate');

    // ─────────────────────────────────────────────────────────────
    // QUERY PARAMS
    // ─────────────────────────────────────────────────────────────
    const queryParams = useMemo(() => ({
        q: searchQuery.length >= 2 ? searchQuery : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: currentPage,
        size: pageSize,
        sort: `${sortField},${sortDirection}`,
    }), [searchQuery, typeFilter, statusFilter, currentPage, pageSize, sortField, sortDirection]);

    const hasFilters = searchQuery.length >= 2 || typeFilter !== 'all' || statusFilter !== 'all';

    // ─────────────────────────────────────────────────────────────
    // API HOOKS
    // ─────────────────────────────────────────────────────────────
    const { data: documentsData, isLoading, refetch, isFetching } = useDocumentList(queryParams);
    const createMutation = useCreateDocument();
    const updateMutation = useUpdateDocument();
    const deactivateMutation = useDeactivateDocument();
    const activateMutation = useActivateDocument();

    // ─────────────────────────────────────────────────────────────
    // COMPUTED VALUES
    // ─────────────────────────────────────────────────────────────
    const documents = documentsData?.items ?? [];
    const totalPages = documentsData?.totalPages ?? 0;
    const totalItems = documentsData?.totalElements ?? 0;

    const stats = useMemo(
        () => calculateDocumentStats(documents, hasFilters),
        [documents, hasFilters]
    );

    // ─────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────
    const handleSort = useCallback((field: string) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(0);
    }, [sortField]);

    const handleClearFilters = useCallback(() => {
        setSearchQuery('');
        setTypeFilter('all');
        setStatusFilter('all');
        setCurrentPage(0);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(0);
    }, []);

    const handleCreate = useCallback(() => {
        setSelectedDocument(null);
        setFormModalOpen(true);
    }, []);

    const handleEdit = useCallback((document: AdminDocument) => {
        setSelectedDocument(document);
        setFormModalOpen(true);
    }, []);

    const handleView = useCallback((document: AdminDocument) => {
        setSelectedDocument(document);
        setPreviewDrawerOpen(true);
    }, []);

    const handleDeactivateClick = useCallback((document: AdminDocument) => {
        setSelectedDocument(document);
        setConfirmAction('deactivate');
        setConfirmDialogOpen(true);
    }, []);

    const handleActivateClick = useCallback((document: AdminDocument) => {
        setSelectedDocument(document);
        setConfirmAction('activate');
        setConfirmDialogOpen(true);
    }, []);

    const handleConfirmStatusChange = useCallback(() => {
        if (!selectedDocument) return;

        if (confirmAction === 'deactivate') {
            deactivateMutation.mutate(selectedDocument, {
                onSuccess: () => setConfirmDialogOpen(false),
            });
        } else {
            activateMutation.mutate(selectedDocument, {
                onSuccess: () => setConfirmDialogOpen(false),
            });
        }
    }, [selectedDocument, confirmAction, deactivateMutation, activateMutation]);

    const handleFormSubmit = useCallback((data: AdminDocumentCreateRequest | AdminDocumentUpdateRequest) => {
        if (selectedDocument) {
            updateMutation.mutate(
                { id: selectedDocument.id, data: data as AdminDocumentUpdateRequest },
                { onSuccess: () => setFormModalOpen(false) }
            );
        } else {
            createMutation.mutate(data as AdminDocumentCreateRequest, {
                onSuccess: () => setFormModalOpen(false),
            });
        }
    }, [selectedDocument, createMutation, updateMutation]);

    // ─────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────
    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage system-wide documents and references
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Document
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <StatCards stats={stats} isLoading={isLoading} />

            {/* Filters */}
            <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                onClearFilters={handleClearFilters}
                isLoading={isLoading}
            />

            {/* Document Table */}
            <DocumentTable
                documents={documents}
                isLoading={isLoading}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onEdit={handleEdit}
                onView={handleView}
                onDeactivate={handleDeactivateClick}
                onActivate={handleActivateClick}
            />

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={isLoading}
            />

            {/* Create/Edit Modal */}
            <DocumentFormModal
                open={formModalOpen}
                onOpenChange={setFormModalOpen}
                document={selectedDocument}
                onSubmit={handleFormSubmit}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            {/* Preview Drawer */}
            <PreviewDrawer
                open={previewDrawerOpen}
                onOpenChange={setPreviewDrawerOpen}
                document={selectedDocument}
                onEdit={handleEdit}
                onDeactivate={handleDeactivateClick}
                onActivate={handleActivateClick}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialogOpen}
                onOpenChange={setConfirmDialogOpen}
                document={selectedDocument}
                action={confirmAction}
                onConfirm={handleConfirmStatusChange}
                isLoading={deactivateMutation.isPending || activateMutation.isPending}
            />
        </div>
    );
};
