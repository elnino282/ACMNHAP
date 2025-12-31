import { z } from 'zod';
import { DateSchema, DateTimeSchema } from '@/shared/api/types';

// ═══════════════════════════════════════════════════════════════
// INCIDENT RESPONSE
// ═══════════════════════════════════════════════════════════════

export const IncidentSchema = z.object({
    id: z.number().int().positive(),
    seasonId: z.number().int().positive(),
    incidentType: z.string(),
    severity: z.string(),
    description: z.string(),
    status: z.string().optional(),
    deadline: DateSchema.optional().nullable(),
    resolvedAt: DateTimeSchema.optional().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export type Incident = z.infer<typeof IncidentSchema>;

// ═══════════════════════════════════════════════════════════════
// INCIDENT CREATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const IncidentCreateRequestSchema = z.object({
    incidentType: z.string().min(1, 'Incident type is required'),
    severity: z.string().min(1, 'Severity is required'),
    description: z.string().min(1, 'Description is required'),
    deadline: DateSchema.optional(),
});

export type IncidentCreateRequest = z.infer<typeof IncidentCreateRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// INCIDENT UPDATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const IncidentUpdateRequestSchema = z.object({
    status: z.string().min(1, 'Status is required'),
    severity: z.string().optional(),
    description: z.string().optional(),
    deadline: DateSchema.optional(),
    resolvedAt: DateTimeSchema.optional(),
});

export type IncidentUpdateRequest = z.infer<typeof IncidentUpdateRequestSchema>;
