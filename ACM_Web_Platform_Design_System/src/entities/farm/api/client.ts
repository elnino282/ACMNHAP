import httpClient from '@/shared/api/http';
import {
    FarmListParamsSchema,
    FarmSchema,
    FarmResponseSchema,
    FarmDetailResponseSchema,
    FarmCreateRequestSchema,
    FarmUpdateRequestSchema,
} from '../model/schemas';
import type {
    FarmListParams,
    FarmResponse,
    FarmDetailResponse,
    FarmCreateRequest,
    FarmUpdateRequest,
} from '../model/types';

// ═══════════════════════════════════════════════════════════════
// API RESPONSE EXTRACTION HELPER
// Backend wraps responses in { status, code, message, result }
// ═══════════════════════════════════════════════════════════════

/**
 * Extract the result from backend's ApiResponse wrapper
 * Handles both wrapped and unwrapped responses
 */
const extractApiResult = <T>(response: any): T => {
    // Backend wraps response in { status, code, message, result }
    // But sometimes might return data directly
    return response?.result ?? response;
};

// ═══════════════════════════════════════════════════════════════
// TRANSFORM HELPERS
// Backend returns data in the format specified in API documentation
// These helpers normalize data if needed
// ═══════════════════════════════════════════════════════════════

/**
 * Transform farm response - API doc shows backend returns in expected format
 * Just pass through, no transformation needed
 */
const transformFarmResponse = (data: any): any => ({
    id: data.id,
    name: data.name,
    provinceId: data.provinceId,
    wardId: data.wardId,
    provinceName: data.provinceName,
    wardName: data.wardName,
    area: data.area,
    active: data.active,
});

/**
 * Transform farm detail response - API doc shows ownerUsername field
 */
const transformFarmDetailResponse = (data: any): any => ({
    id: data.id,
    name: data.name,
    provinceId: data.provinceId,
    wardId: data.wardId,
    provinceName: data.provinceName,
    wardName: data.wardName,
    area: data.area,
    active: data.active,
    ownerUsername: data.ownerUsername,
    plots: data.plots,
    totalPlots: data.totalPlots,
    activePlots: data.activePlots,
});

// ═══════════════════════════════════════════════════════════════
// FARM API CLIENT
// Pure Axios calls with Zod validation (no React dependencies)
// ═══════════════════════════════════════════════════════════════

export const farmApi = {
    /**
     * List farms for the current authenticated farmer
     */
    list: async (params?: FarmListParams): Promise<FarmResponse> => {
        const validatedParams = params ? FarmListParamsSchema.parse(params) : undefined;
        console.log('[Farm API Client] Fetching farms with params:', validatedParams);

        const response = await httpClient.get('/api/v1/farms', { params: validatedParams });
        console.log('[Farm API Client] Raw response:', response.data);

        // Extract result from ApiResponse wrapper
        const rawResult = extractApiResult(response.data);
        console.log('[Farm API Client] Extracted result:', rawResult);

        // Handle both 'content' and 'items' array formats from backend
        const content = rawResult.content || rawResult.items || [];

        // Transform each farm in the array
        const transformedResult = {
            content: content.map(transformFarmResponse),
            page: rawResult.page ?? 0,
            size: rawResult.size ?? 20,
            totalElements: rawResult.totalElements ?? content.length,
            totalPages: rawResult.totalPages ?? 1,
        };
        console.log('[Farm API Client] Transformed result:', transformedResult);

        // Parse and validate with schema
        try {
            const parsed = FarmResponseSchema.parse(transformedResult);
            console.log('[Farm API Client] Successfully parsed:', {
                totalFarms: parsed.totalElements,
                farmNames: parsed.content.map(f => f.name),
            });
            return parsed;
        } catch (error) {
            console.error('[Farm API Client] Schema validation error:', error);
            console.error('[Farm API Client] Failed to parse data:', transformedResult);
            throw error;
        }
    },

    /**
     * Get farm detail by ID
     */
    getById: async (id: number): Promise<FarmDetailResponse> => {
        const response = await httpClient.get(`/api/v1/farms/${id}`);
        const rawData = extractApiResult(response.data);
        const transformedData = transformFarmDetailResponse(rawData);
        return FarmDetailResponseSchema.parse(transformedData);
    },

    /**
     * Create a new farm
     */
    create: async (data: FarmCreateRequest): Promise<FarmDetailResponse> => {
        console.log('[Farm API Client] Validating payload:', data);
        const validatedPayload = FarmCreateRequestSchema.parse(data);
        console.log('[Farm API Client] Validated payload:', validatedPayload);
        console.log('[Farm API Client] POST /api/v1/farms');

        try {
            const response = await httpClient.post('/api/v1/farms', validatedPayload);
            console.log('[Farm API Client] Create response status:', response.status);
            console.log('[Farm API Client] Create response data:', response.data);

            const rawData = extractApiResult(response.data);
            console.log('[Farm API Client] Extracted data:', rawData);
            
            const transformedData = transformFarmDetailResponse(rawData);
            console.log('[Farm API Client] Transformed data:', transformedData);
            
            const parsed = FarmDetailResponseSchema.parse(transformedData);
            console.log('[Farm API Client] Successfully created farm:', parsed);
            return parsed;
        } catch (error: any) {
            console.error('[Farm API Client] Create error:', error);
            console.error('[Farm API Client] Error details:', {
                message: error?.message,
                response: error?.response,
                status: error?.response?.status,
                data: error?.response?.data,
            });
            throw error;
        }
    },

    /**
     * Update an existing farm
     */
    update: async (id: number, data: FarmUpdateRequest): Promise<FarmDetailResponse> => {
        const validatedPayload = FarmUpdateRequestSchema.parse(data);
        const response = await httpClient.put(`/api/v1/farms/${id}`, validatedPayload);
        const rawData = extractApiResult(response.data);
        const transformedData = transformFarmDetailResponse(rawData);
        return FarmDetailResponseSchema.parse(transformedData);
    },

    /**
     * Delete/deactivate a farm (soft delete)
     */
    delete: async (id: number): Promise<void> => {
        console.log('[Farm API Client] delete called with id:', id, 'type:', typeof id);
        console.log('[Farm API Client] DELETE URL:', `/api/v1/farms/${id}`);
        await httpClient.delete(`/api/v1/farms/${id}`);
    },
};

