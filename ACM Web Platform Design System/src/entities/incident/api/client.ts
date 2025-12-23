import httpClient from '@/shared/api/http';
import { parseApiResponse } from '@/shared/api/types';
import { z } from 'zod';
import {
    IncidentSchema,
    IncidentCreateRequestSchema,
    IncidentUpdateRequestSchema,
} from '../model/schemas';
import type {
    Incident,
    IncidentCreateRequest,
    IncidentUpdateRequest,
} from '../model/types';

export const incidentApi = {
    /** GET /api/v1/seasons/{seasonId}/incidents - List incidents for a season */
    listBySeason: async (seasonId: number): Promise<Incident[]> => {
        const response = await httpClient.get(`/api/v1/seasons/${seasonId}/incidents`);
        return parseApiResponse(response.data, z.array(IncidentSchema));
    },

    /** POST /api/v1/seasons/{seasonId}/incidents - Create new incident */
    create: async (seasonId: number, data: IncidentCreateRequest): Promise<Incident> => {
        const validatedPayload = IncidentCreateRequestSchema.parse(data);
        const response = await httpClient.post(`/api/v1/seasons/${seasonId}/incidents`, validatedPayload);
        return parseApiResponse(response.data, IncidentSchema);
    },

    /** PUT /api/v1/incidents/{id} - Update incident */
    update: async (id: number, data: IncidentUpdateRequest): Promise<Incident> => {
        const validatedPayload = IncidentUpdateRequestSchema.parse(data);
        const response = await httpClient.put(`/api/v1/incidents/${id}`, validatedPayload);
        return parseApiResponse(response.data, IncidentSchema);
    },

    /** DELETE /api/v1/incidents/{id} - Delete incident */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`/api/v1/incidents/${id}`);
    },
};
