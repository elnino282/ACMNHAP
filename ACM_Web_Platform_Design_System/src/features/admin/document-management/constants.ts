import { DocumentType, DocumentStatus } from './types';

// ═══════════════════════════════════════════════════════════════
// DOCUMENT TYPE LABELS
// ═══════════════════════════════════════════════════════════════

export const TYPE_LABELS: Record<DocumentType, string> = {
    POLICY: 'Policy',
    GUIDE: 'Guide',
    MANUAL: 'Manual',
    LEGAL: 'Legal',
    OTHER: 'Other',
};

export const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
    { value: 'POLICY', label: 'Policy' },
    { value: 'GUIDE', label: 'Guide' },
    { value: 'MANUAL', label: 'Manual' },
    { value: 'LEGAL', label: 'Legal' },
    { value: 'OTHER', label: 'Other' },
];

// ═══════════════════════════════════════════════════════════════
// DOCUMENT STATUS LABELS & COLORS
// ═══════════════════════════════════════════════════════════════

export const STATUS_LABELS: Record<DocumentStatus, string> = {
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
};

export const STATUS_OPTIONS: { value: DocumentStatus; label: string }[] = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
];

export const STATUS_BADGE_COLORS: Record<DocumentStatus, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
    INACTIVE: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
};

// ═══════════════════════════════════════════════════════════════
// PAGINATION OPTIONS
// ═══════════════════════════════════════════════════════════════

export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;

// ═══════════════════════════════════════════════════════════════
// TYPE BADGE COLORS (for document type chips)
// ═══════════════════════════════════════════════════════════════

export const TYPE_BADGE_COLORS: Record<DocumentType, string> = {
    POLICY: 'bg-blue-100 text-blue-700',
    GUIDE: 'bg-purple-100 text-purple-700',
    MANUAL: 'bg-orange-100 text-orange-700',
    LEGAL: 'bg-red-100 text-red-700',
    OTHER: 'bg-slate-100 text-slate-700',
};
