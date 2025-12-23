import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { incidentKeys } from '../model/keys';
import { incidentApi } from './client';
import type {
    Incident,
    IncidentCreateRequest,
    IncidentUpdateRequest,
} from '../model/types';

export const useIncidentsBySeason = (
    seasonId: number,
    options?: Omit<UseQueryOptions<Incident[], Error>, 'queryKey' | 'queryFn'>
) => useQuery({
    queryKey: incidentKeys.listBySeason(seasonId),
    queryFn: () => incidentApi.listBySeason(seasonId),
    enabled: seasonId > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
});

export const useCreateIncident = (
    seasonId: number,
    options?: UseMutationOptions<Incident, Error, IncidentCreateRequest>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => incidentApi.create(seasonId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: incidentKeys.listBySeason(seasonId) });
        },
        ...options,
    });
};

export const useUpdateIncident = (
    seasonId: number,
    options?: UseMutationOptions<Incident, Error, { id: number; data: IncidentUpdateRequest }>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => incidentApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: incidentKeys.listBySeason(seasonId) });
        },
        ...options,
    });
};

export const useDeleteIncident = (
    seasonId: number,
    options?: UseMutationOptions<void, Error, number>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: incidentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: incidentKeys.listBySeason(seasonId) });
        },
        ...options,
    });
};
