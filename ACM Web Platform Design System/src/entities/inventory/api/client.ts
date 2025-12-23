import httpClient from '@/shared/api/http';
import { parseApiResponse, parsePageResponse } from '@/shared/api/types';
import { z } from 'zod';
import {
    StockMovementSchema,
    StockMovementRequestSchema,
    OnHandParamsSchema,
} from '../model/schemas';
import type {
    StockMovement,
    StockMovementRequest,
    OnHandParams,
} from '../model/types';

// Warehouse types (inline for simplicity)
export interface Warehouse {
    id: number;
    name: string;
    type: string | null;
    farmId: number | null;
    farmName: string | null;
    provinceId: number | null;
    provinceName: string | null;
    wardId: number | null;
    wardName: string | null;
    locationCount: number | null;
}

export interface StockLocation {
    id: number;
    warehouseId: number | null;
    zone: string | null;
    aisle: string | null;
    shelf: string | null;
    bin: string | null;
}

const WarehouseSchema = z.object({
    id: z.number(),
    name: z.string(),
    type: z.string().nullable(),
    farmId: z.number().nullable(),
    farmName: z.string().nullable(),
    provinceId: z.number().nullable(),
    provinceName: z.string().nullable(),
    wardId: z.number().nullable(),
    wardName: z.string().nullable(),
    locationCount: z.number().nullable(),
});

const StockLocationSchema = z.object({
    id: z.number(),
    warehouseId: z.number().nullable(),
    zone: z.string().nullable(),
    aisle: z.string().nullable(),
    shelf: z.string().nullable(),
    bin: z.string().nullable(),
});

export const inventoryApi = {
    /** POST /api/v1/inventory/movements - Record stock movement (inbound/outbound) */
    recordMovement: async (data: StockMovementRequest): Promise<StockMovement> => {
        const validatedPayload = StockMovementRequestSchema.parse(data);
        const response = await httpClient.post('/api/v1/inventory/movements', validatedPayload);
        return parseApiResponse(response.data, StockMovementSchema);
    },

    /** GET /api/v1/inventory/lots/{lotId}/on-hand - Get current on-hand quantity */
    getOnHand: async (lotId: number, params: OnHandParams): Promise<number> => {
        const validatedParams = OnHandParamsSchema.parse(params);
        const response = await httpClient.get(`/api/v1/inventory/lots/${lotId}/on-hand`, { params: validatedParams });
        return parseApiResponse(response.data, z.number());
    },

    /** GET /api/v1/farmer/warehouses - List farmer's warehouses */
    listWarehouses: async (): Promise<Warehouse[]> => {
        const response = await httpClient.get('/api/v1/farmer/warehouses');
        return parseApiResponse(response.data, z.array(WarehouseSchema));
    },

    /** GET /api/v1/farmer/warehouses/{id} - Get warehouse detail */
    getWarehouse: async (id: number): Promise<Warehouse> => {
        const response = await httpClient.get(`/api/v1/farmer/warehouses/${id}`);
        return parseApiResponse(response.data, WarehouseSchema);
    },

    /** GET /api/v1/farmer/warehouses/{id}/locations - List stock locations */
    listLocations: async (warehouseId: number): Promise<StockLocation[]> => {
        const response = await httpClient.get(`/api/v1/farmer/warehouses/${warehouseId}/locations`);
        return parseApiResponse(response.data, z.array(StockLocationSchema));
    },

    /** GET /api/v1/farmer/warehouses/{id}/movements - List stock movements */
    listMovements: async (warehouseId: number, params?: { page?: number; size?: number }) => {
        const response = await httpClient.get(`/api/v1/farmer/warehouses/${warehouseId}/movements`, { params });
        return parsePageResponse(response.data, StockMovementSchema);
    },
};
