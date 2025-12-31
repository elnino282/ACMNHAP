import httpClient from '@/shared/api/http';
import { parseApiResponse } from '@/shared/api/types';
import { z } from 'zod';
import {
    DocumentSchema,
    DocumentCreateRequestSchema,
    DocumentUpdateRequestSchema,
} from '../model/schemas';
import type { Document, DocumentCreateRequest, DocumentUpdateRequest } from '../model/types';

export const documentApi = {
    /**
     * List documents (farmer/admin)
     * GET /api/v1/documents
     */
    list: async (): Promise<Document[]> => {
        const response = await httpClient.get('/api/v1/documents');
        return parseApiResponse(response.data, z.array(DocumentSchema));
    },

    /**
     * Create document (admin)
     * POST /api/v1/admin/documents
     */
    create: async (data: DocumentCreateRequest): Promise<Document> => {
        const validatedPayload = DocumentCreateRequestSchema.parse(data);
        const response = await httpClient.post('/api/v1/admin/documents', validatedPayload);
        return parseApiResponse(response.data, DocumentSchema);
    },

    /**
     * Update document (admin)
     * PUT /api/v1/admin/documents/{id}
     */
    update: async (id: number, data: DocumentUpdateRequest): Promise<Document> => {
        const validatedPayload = DocumentUpdateRequestSchema.parse(data);
        const response = await httpClient.put(`/api/v1/admin/documents/${id}`, validatedPayload);
        return parseApiResponse(response.data, DocumentSchema);
    },

    /**
     * Delete document (admin)
     * DELETE /api/v1/admin/documents/{id}
     */
    delete: async (id: number): Promise<void> => {
        await httpClient.delete(`/api/v1/admin/documents/${id}`);
    },
};
