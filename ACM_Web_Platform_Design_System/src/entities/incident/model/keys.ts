export const incidentKeys = {
    all: ['incident'] as const,
    lists: () => [...incidentKeys.all, 'list'] as const,
    listBySeason: (seasonId: number) => [...incidentKeys.lists(), 'bySeason', seasonId] as const,
    details: () => [...incidentKeys.all, 'detail'] as const,
    detail: (id: number) => [...incidentKeys.details(), id] as const,
};
