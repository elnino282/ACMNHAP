import type { OnHandParams } from './types';

export const inventoryKeys = {
    all: ['inventory'] as const,
    movements: () => [...inventoryKeys.all, 'movement'] as const,
    onHand: (lotId: number, params: OnHandParams) =>
        [...inventoryKeys.all, 'onHand', lotId, params] as const,
};
