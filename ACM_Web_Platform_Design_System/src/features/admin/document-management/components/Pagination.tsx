import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { ITEMS_PER_PAGE_OPTIONS } from '../constants';

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    isLoading?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    isLoading = false,
}) => {
    const startItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems);
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage >= totalPages - 1;

    // Generate page numbers to show
    const getPageNumbers = (): (number | '...')[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const pages: (number | '...')[] = [];
        const showFirst = currentPage > 2;
        const showLast = currentPage < totalPages - 3;

        if (showFirst) {
            pages.push(0);
            if (currentPage > 3) pages.push('...');
        }

        const start = Math.max(0, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }

        if (showLast) {
            if (currentPage < totalPages - 4) pages.push('...');
            pages.push(totalPages - 1);
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            {/* Items per page selector */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select
                    value={String(pageSize)}
                    onValueChange={(value) => onPageSizeChange(Number(value))}
                    disabled={isLoading}
                >
                    <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {ITEMS_PER_PAGE_OPTIONS.map((size) => (
                            <SelectItem key={size} value={String(size)}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>per page</span>
            </div>

            {/* Items count info */}
            <div className="text-sm text-muted-foreground">
                {isLoading ? (
                    'Loading...'
                ) : totalItems === 0 ? (
                    'No items'
                ) : (
                    <>
                        Showing <span className="font-medium">{startItem}</span> to{' '}
                        <span className="font-medium">{endItem}</span> of{' '}
                        <span className="font-medium">{totalItems}</span> documents
                    </>
                )}
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
                {/* First page */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(0)}
                    disabled={isFirstPage || isLoading}
                    title="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous page */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage || isLoading}
                    title="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((page, idx) =>
                        page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onPageChange(page)}
                                disabled={isLoading}
                            >
                                {page + 1}
                            </Button>
                        )
                    )}
                </div>

                {/* Mobile page indicator */}
                <span className="sm:hidden text-sm text-muted-foreground px-2">
                    {totalPages === 0 ? '0/0' : `${currentPage + 1}/${totalPages}`}
                </span>

                {/* Next page */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage || isLoading}
                    title="Next page"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last page */}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(totalPages - 1)}
                    disabled={isLastPage || isLoading}
                    title="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
