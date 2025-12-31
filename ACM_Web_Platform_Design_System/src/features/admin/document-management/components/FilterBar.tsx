import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DocumentType, DocumentStatus } from '../types';
import { TYPE_OPTIONS, STATUS_OPTIONS } from '../constants';

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROPS
// ═══════════════════════════════════════════════════════════════

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    typeFilter: DocumentType | 'all';
    onTypeChange: (type: DocumentType | 'all') => void;
    statusFilter: DocumentStatus | 'all';
    onStatusChange: (status: DocumentStatus | 'all') => void;
    onClearFilters: () => void;
    isLoading?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const FilterBar: React.FC<FilterBarProps> = ({
    searchQuery,
    onSearchChange,
    typeFilter,
    onTypeChange,
    statusFilter,
    onStatusChange,
    onClearFilters,
    isLoading = false,
}) => {
    const hasActiveFilters =
        searchQuery.length > 0 || typeFilter !== 'all' || statusFilter !== 'all';

    const activeFilterCount = [
        searchQuery.length > 0,
        typeFilter !== 'all',
        statusFilter !== 'all',
    ].filter(Boolean).length;

    return (
        <div className="space-y-3">
            {/* Main Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title (min 2 chars)..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                        disabled={isLoading}
                    />
                    {searchQuery.length > 0 && searchQuery.length < 2 && (
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-amber-600">
                            Min 2 chars
                        </span>
                    )}
                </div>

                {/* Type Filter */}
                <Select
                    value={typeFilter}
                    onValueChange={(value) => onTypeChange(value as DocumentType | 'all')}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={statusFilter}
                    onValueChange={(value) => onStatusChange(value as DocumentStatus | 'all')}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="whitespace-nowrap"
                        disabled={isLoading}
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
};
