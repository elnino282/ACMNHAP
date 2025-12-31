import httpClient from '@/shared/api/http';
import { parseApiResponse, parsePageResponse, type PageResponse } from '@/shared/api/types';
import {
    FieldLogListParamsSchema,
    FieldLogSchema,
    FieldLogCreateRequestSchema,
    FieldLogUpdateRequestSchema,
} from '../model/schemas';
import type {
    FieldLogListParams,
    FieldLog,
    FieldLogCreateRequest,
    FieldLogUpdateRequest,
} from '../model/types';

export const fieldLogApi = {
    listBySeason: async (seasonId: number, params?: FieldLogListParams): Promise<PageResponse<FieldLog>> => {
        const validatedParams = params ? FieldLogListParamsSchema.parse(params) : undefined;
        const response = await httpClient.get(`/api/v1/seasons/${seasonId}/field-logs`, { params: validatedParams });
        return parsePageResponse(response.data, FieldLogSchema);
    },

    getById: async (id: number): Promise<FieldLog> => {
        const response = await httpClient.get(`/api/v1/field-logs/${id}`);
        return parseApiResponse(response.data, FieldLogSchema);
    },

    create: async (seasonId: number, data: FieldLogCreateRequest): Promise<FieldLog> => {
        const validatedPayload = FieldLogCreateRequestSchema.parse(data);
        const response = await httpClient.post(`/api/v1/seasons/${seasonId}/field-logs`, validatedPayload);
        return parseApiResponse(response.data, FieldLogSchema);
    },

    update: async (id: number, data: FieldLogUpdateRequest): Promise<FieldLog> => {
        const validatedPayload = FieldLogUpdateRequestSchema.parse(data);
        const response = await httpClient.put(`/api/v1/field-logs/${id}`, validatedPayload);
        return parseApiResponse(response.data, FieldLogSchema);
    },

    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`/api/v1/field-logs/${id}`);
    },
};
