import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { documentKeys } from '../model/keys';
import { documentApi } from './client';
import type { Document, DocumentCreateRequest, DocumentUpdateRequest } from '../model/types';

export const useDocumentsList = (
    options?: Omit<UseQueryOptions<Document[], Error>, 'queryKey' | 'queryFn'>
) => useQuery({
    queryKey: documentKeys.list(),
    queryFn: documentApi.list,
    staleTime: 5 * 60 * 1000,
    ...options,
});

export const useCreateDocument = (
    options?: UseMutationOptions<Document, Error, DocumentCreateRequest>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: documentApi.create,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.list() });
            options?.onSuccess?.(data, variables, context);
        },
        ...options,
    });
};

export const useUpdateDocument = (
    options?: UseMutationOptions<Document, Error, { id: number; data: DocumentUpdateRequest }>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => documentApi.update(id, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.list() });
            options?.onSuccess?.(data, variables, context);
        },
        ...options,
    });
};

export const useDeleteDocument = (
    options?: UseMutationOptions<void, Error, number>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: documentApi.delete,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: documentKeys.list() });
            options?.onSuccess?.(data, variables, context);
        },
        ...options,
    });
};
