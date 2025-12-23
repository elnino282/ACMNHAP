import { z } from 'zod';
import { DateSchema } from '@/shared/api/types';

// ═══════════════════════════════════════════════════════════════
// HARVEST LIST PARAMS
// ═══════════════════════════════════════════════════════════════

export const HarvestListParamsSchema = z.object({
    from: DateSchema.optional(),
    to: DateSchema.optional(),
    page: z.number().int().min(0).default(0),
    size: z.number().int().min(1).default(20),
});

export type HarvestListParams = z.infer<typeof HarvestListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// HARVEST RESPONSE
// ═══════════════════════════════════════════════════════════════

export const HarvestSchema = z.object({
    id: z.number().int().positive(),
    seasonId: z.number().int().positive().optional(),
    seasonName: z.string().optional(),
    harvestDate: DateSchema,
    quantity: z.number().positive(),
    unit: z.number().optional(),
    note: z.string().optional().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export type Harvest = z.infer<typeof HarvestSchema>;

// ═══════════════════════════════════════════════════════════════
// HARVEST CREATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const HarvestCreateRequestSchema = z.object({
    harvestDate: DateSchema,
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.number(),
    note: z.string().optional(),
});

export type HarvestCreateRequest = z.infer<typeof HarvestCreateRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// HARVEST UPDATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const HarvestUpdateRequestSchema = HarvestCreateRequestSchema;

export type HarvestUpdateRequest = z.infer<typeof HarvestUpdateRequestSchema>;
