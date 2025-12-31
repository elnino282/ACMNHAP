import { z } from 'zod';
import { DateSchema } from '@/shared/api/types';

// ═══════════════════════════════════════════════════════════════
// FIELD LOG LIST PARAMS
// ═══════════════════════════════════════════════════════════════

export const FieldLogListParamsSchema = z.object({
    from: DateSchema.optional(),
    to: DateSchema.optional(),
    type: z.string().optional(),
    page: z.number().int().min(0).default(0),
    size: z.number().int().min(1).default(20),
});

export type FieldLogListParams = z.infer<typeof FieldLogListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// FIELD LOG RESPONSE
// ═══════════════════════════════════════════════════════════════

export const FieldLogSchema = z.object({
    id: z.number().int().positive(),
    seasonId: z.number().int().positive().optional(),
    seasonName: z.string().optional(),
    logDate: DateSchema,
    logType: z.string().max(100),
    notes: z.string().max(4000).optional().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export type FieldLog = z.infer<typeof FieldLogSchema>;

// ═══════════════════════════════════════════════════════════════
// FIELD LOG CREATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const FieldLogCreateRequestSchema = z.object({
    logDate: DateSchema,
    logType: z.string().min(1, 'Log type is required').max(100),
    notes: z.string().max(4000).optional(),
});

export type FieldLogCreateRequest = z.infer<typeof FieldLogCreateRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// FIELD LOG UPDATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const FieldLogUpdateRequestSchema = z.object({
    logDate: DateSchema,
    logType: z.string().min(1, 'Log type is required').max(100),
    notes: z.string().max(4000).optional(),
});

export type FieldLogUpdateRequest = z.infer<typeof FieldLogUpdateRequestSchema>;
