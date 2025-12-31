import type { ExpenseListParams } from './types';

export const expenseKeys = {
    all: ['expense'] as const,
    lists: () => [...expenseKeys.all, 'list'] as const,
    listBySeason: (seasonId: number, params?: ExpenseListParams) =>
        [...expenseKeys.lists(), 'bySeason', seasonId, params] as const,
    details: () => [...expenseKeys.all, 'detail'] as const,
    detail: (id: number) => [...expenseKeys.details(), id] as const,
};
