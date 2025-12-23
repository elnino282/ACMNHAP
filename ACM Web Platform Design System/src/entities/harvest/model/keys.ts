import type { HarvestListParams } from './types';

export const harvestKeys = {
    all: ['harvest'] as const,
    lists: () => [...harvestKeys.all, 'list'] as const,
    listBySeason: (seasonId: number, params?: HarvestListParams) =>
        [...harvestKeys.lists(), 'bySeason', seasonId, params] as const,
    details: () => [...harvestKeys.all, 'detail'] as const,
    detail: (id: number) => [...harvestKeys.details(), id] as const,
};
