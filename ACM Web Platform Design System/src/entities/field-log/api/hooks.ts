import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from '@tanstack/react-query';
import type { PageResponse } from '@/shared/api/types';
import { fieldLogKeys } from '../model/keys';
import { fieldLogApi } from './client';
import type {
    FieldLogListParams,
    FieldLog,
    FieldLogCreateRequest,
    FieldLogUpdateRequest,
} from '../model/types';

export const useFieldLogsBySeason = (
    seasonId: number,
    params?: FieldLogListParams,
    options?: Omit<UseQueryOptions<PageResponse<FieldLog>, Error>, 'queryKey' | 'queryFn'>
) => useQuery({
    queryKey: fieldLogKeys.listBySeason(seasonId, params),
    queryFn: () => fieldLogApi.listBySeason(seasonId, params),
    enabled: seasonId > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
});

export const useFieldLogById = (
    id: number,
    options?: Omit<UseQueryOptions<FieldLog, Error>, 'queryKey' | 'queryFn'>
) => useQuery({
    queryKey: fieldLogKeys.detail(id),
    queryFn: () => fieldLogApi.getById(id),
    enabled: id > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
});

export const useCreateFieldLog = (
    seasonId: number,
    options?: UseMutationOptions<FieldLog, Error, FieldLogCreateRequest>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => fieldLogApi.create(seasonId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fieldLogKeys.listBySeason(seasonId) });
        },
        ...options,
    });
};

export const useUpdateFieldLog = (
    seasonId: number,
    options?: UseMutationOptions<FieldLog, Error, { id: number; data: FieldLogUpdateRequest }>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => fieldLogApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: fieldLogKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: fieldLogKeys.listBySeason(seasonId) });
        },
        ...options,
    });
};

export const useDeleteFieldLog = (
    seasonId: number,
    options?: UseMutationOptions<void, Error, number>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: fieldLogApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: fieldLogKeys.listBySeason(seasonId) });
        },
        ...options,
    });
};
