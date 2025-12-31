import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    adminDocumentApi,
    AdminDocument,
    AdminDocumentCreateRequest,
    AdminDocumentUpdateRequest,
    AdminDocumentListParams,
} from '@/services/api.admin';
import type { PageResponse } from '@/shared/api/types';

// ═══════════════════════════════════════════════════════════════
// QUERY KEYS - Structured for proper caching & refetching
// ═══════════════════════════════════════════════════════════════

export const documentKeys = {
    all: ['adminDocuments'] as const,
    lists: () => [...documentKeys.all, 'list'] as const,
    list: (params: AdminDocumentListParams) => [...documentKeys.lists(), params] as const,
    details: () => [...documentKeys.all, 'detail'] as const,
    detail: (id: number) => [...documentKeys.details(), id] as const,
};

// ═══════════════════════════════════════════════════════════════
// LIST DOCUMENTS HOOK
// ═══════════════════════════════════════════════════════════════

export function useDocumentList(params: AdminDocumentListParams = { page: 0, size: 20 }) {
    const normalizedParams: AdminDocumentListParams = {
        ...params,
        page: params.page ?? 0,
        size: params.size ?? 20,
    };
    return useQuery({
        queryKey: documentKeys.list(normalizedParams),
        queryFn: () => adminDocumentApi.list(normalizedParams),
        staleTime: 30 * 1000, // 30 seconds
    });
}

// ═══════════════════════════════════════════════════════════════
// GET DOCUMENT BY ID HOOK
// ═══════════════════════════════════════════════════════════════

export function useDocument(id: number | null) {
    return useQuery({
        queryKey: documentKeys.detail(id!),
        queryFn: () => adminDocumentApi.getById(id!),
        enabled: id !== null && id > 0,
    });
}

// ═══════════════════════════════════════════════════════════════
// CREATE DOCUMENT MUTATION
// ═══════════════════════════════════════════════════════════════

export function useCreateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: AdminDocumentCreateRequest) => adminDocumentApi.create(data),
        onSuccess: (newDocument) => {
            // Invalidate all list queries to refetch
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            toast.success('Document created', {
                description: `"${newDocument.title}" has been created successfully.`,
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to create document', {
                description: error.message || 'An unexpected error occurred.',
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// UPDATE DOCUMENT MUTATION
// ═══════════════════════════════════════════════════════════════

export function useUpdateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AdminDocumentUpdateRequest }) =>
            adminDocumentApi.update(id, data),
        onSuccess: (updatedDocument) => {
            // Invalidate all list queries and the specific document detail
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: documentKeys.detail(updatedDocument.id) });
            toast.success('Document updated', {
                description: `"${updatedDocument.title}" has been updated successfully.`,
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to update document', {
                description: error.message || 'An unexpected error occurred.',
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DEACTIVATE DOCUMENT MUTATION (Status update to INACTIVE)
// ═══════════════════════════════════════════════════════════════

export function useDeactivateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (document: AdminDocument) => {
            // Update status to INACTIVE (deactivate)
            return adminDocumentApi.update(document.id, {
                title: document.title,
                description: document.description || undefined,
                documentUrl: document.documentUrl,
                documentType: document.documentType as 'POLICY' | 'GUIDE' | 'MANUAL' | 'LEGAL' | 'OTHER',
                status: 'INACTIVE',
            });
        },
        onSuccess: (updatedDocument) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: documentKeys.detail(updatedDocument.id) });
            toast.success('Document deactivated', {
                description: `"${updatedDocument.title}" has been deactivated.`,
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to deactivate document', {
                description: error.message || 'An unexpected error occurred.',
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// ACTIVATE DOCUMENT MUTATION (Status update to ACTIVE)
// ═══════════════════════════════════════════════════════════════

export function useActivateDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (document: AdminDocument) => {
            // Update status to ACTIVE
            return adminDocumentApi.update(document.id, {
                title: document.title,
                description: document.description || undefined,
                documentUrl: document.documentUrl,
                documentType: document.documentType as 'POLICY' | 'GUIDE' | 'MANUAL' | 'LEGAL' | 'OTHER',
                status: 'ACTIVE',
            });
        },
        onSuccess: (updatedDocument) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: documentKeys.detail(updatedDocument.id) });
            toast.success('Document activated', {
                description: `"${updatedDocument.title}" has been activated.`,
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to activate document', {
                description: error.message || 'An unexpected error occurred.',
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// DELETE DOCUMENT MUTATION (Hard delete - not used in MVP)
// ═══════════════════════════════════════════════════════════════

export function useDeleteDocument() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => adminDocumentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
            toast.success('Document deleted', {
                description: 'The document has been permanently deleted.',
            });
        },
        onError: (error: Error) => {
            toast.error('Failed to delete document', {
                description: error.message || 'An unexpected error occurred.',
            });
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Calculate stats from document list
// ═══════════════════════════════════════════════════════════════

export function calculateDocumentStats(
    documents: AdminDocument[],
    hasFilters: boolean
): { total: number; active: number; inactive: number; isFiltered: boolean } {
    return {
        total: documents.length,
        active: documents.filter((d) => d.status === 'ACTIVE').length,
        inactive: documents.filter((d) => d.status === 'INACTIVE').length,
        isFiltered: hasFilters,
    };
}
