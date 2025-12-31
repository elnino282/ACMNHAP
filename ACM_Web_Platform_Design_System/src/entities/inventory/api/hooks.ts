import {
    useMutation,
    useQuery,
    useQueryClient,
    type UseMutationOptions,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { inventoryKeys } from '../model/keys';
import { inventoryApi } from './client';
import type {
    StockMovement,
    StockMovementRequest,
    OnHandParams,
} from '../model/types';

export const useOnHand = (
    lotId: number,
    params: OnHandParams,
    options?: Omit<UseQueryOptions<number, Error>, 'queryKey' | 'queryFn'>
) => useQuery({
    queryKey: inventoryKeys.onHand(lotId, params),
    queryFn: () => inventoryApi.getOnHand(lotId, params),
    enabled: lotId > 0 && params.warehouseId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for inventory data
    ...options,
});

export const useRecordStockMovement = (
    options?: UseMutationOptions<StockMovement, Error, StockMovementRequest>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.recordMovement,
        onSuccess: () => {
            // Invalidate all on-hand queries since movement affects stock levels
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
        },
        ...options,
    });
};
