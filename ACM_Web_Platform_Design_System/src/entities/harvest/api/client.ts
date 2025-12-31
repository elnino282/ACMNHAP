import httpClient from '@/shared/api/http';
import { parseApiResponse, parsePageResponse, type PageResponse } from '@/shared/api/types';
import {
    HarvestListParamsSchema,
    HarvestSchema,
    HarvestCreateRequestSchema,
    HarvestUpdateRequestSchema,
} from '../model/schemas';
import type {
    HarvestListParams,
    Harvest,
    HarvestCreateRequest,
    HarvestUpdateRequest,
} from '../model/types';

export const harvestApi = {
    listBySeason: async (seasonId: number, params?: HarvestListParams): Promise<PageResponse<Harvest>> => {
        const validatedParams = params ? HarvestListParamsSchema.parse(params) : undefined;
        const response = await httpClient.get(`/api/v1/seasons/${seasonId}/harvests`, { params: validatedParams });
        return parsePageResponse(response.data, HarvestSchema);
    },

    getById: async (id: number): Promise<Harvest> => {
        const response = await httpClient.get(`/api/v1/harvests/${id}`);
        return parseApiResponse(response.data, HarvestSchema);
    },

    create: async (seasonId: number, data: HarvestCreateRequest): Promise<Harvest> => {
        const validatedPayload = HarvestCreateRequestSchema.parse(data);
        const response = await httpClient.post(`/api/v1/seasons/${seasonId}/harvests`, validatedPayload);
        return parseApiResponse(response.data, HarvestSchema);
    },

    update: async (id: number, data: HarvestUpdateRequest): Promise<Harvest> => {
        const validatedPayload = HarvestUpdateRequestSchema.parse(data);
        const response = await httpClient.put(`/api/v1/harvests/${id}`, validatedPayload);
        return parseApiResponse(response.data, HarvestSchema);
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`/api/v1/harvests/${id}`);
    },
};
