// ═══════════════════════════════════════════════════════════════
// DOCUMENT TYPES - Matching Backend DTOs
// ═══════════════════════════════════════════════════════════════

/**
 * Document status enum - matches backend DocumentStatus enum
 */
export type DocumentStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Document type enum - matches backend DocumentType enum
 */
export type DocumentType = 'POLICY' | 'GUIDE' | 'MANUAL' | 'LEGAL' | 'OTHER';

/**
 * Document entity - matches AdminDocumentResponse DTO
 */
export interface Document {
    id: number;
    title: string;
    description?: string | null;
    documentUrl: string;
    documentType: DocumentType;
    status: DocumentStatus;
    createdAt?: string | null;
    updatedAt?: string | null;
    createdBy?: number | null;
}

/**
 * Create document request - matches AdminDocumentCreateRequest DTO
 */
export interface DocumentCreateRequest {
    title: string;
    description?: string;
    documentUrl: string;
    documentType: DocumentType;
    status: DocumentStatus;
}

/**
 * Update document request - matches AdminDocumentUpdateRequest DTO
 */
export interface DocumentUpdateRequest {
    title: string;
    description?: string;
    documentUrl: string;
    documentType: DocumentType;
    status: DocumentStatus;
}

/**
 * List params for document queries
 */
export interface DocumentListParams {
    q?: string;
    type?: DocumentType;
    status?: DocumentStatus;
    page?: number;
    size?: number;
    sort?: string;
}

/**
 * Document statistics (calculated client-side from filtered data)
 */
export interface DocumentStats {
    total: number;
    active: number;
    inactive: number;
    /** Indicates stats are from current filter results, not entire dataset */
    isFiltered: boolean;
}

/**
 * Form data for create/edit modal
 */
export interface DocumentFormData {
    title: string;
    description: string;
    documentUrl: string;
    documentType: DocumentType;
    status: DocumentStatus;
}

/**
 * Initial form state
 */
export const INITIAL_FORM_DATA: DocumentFormData = {
    title: '',
    description: '',
    documentUrl: '',
    documentType: 'OTHER',
    status: 'ACTIVE',
};
