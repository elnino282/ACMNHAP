import { z } from 'zod';
import { DateSchema } from '@/shared/api/types';

// ═══════════════════════════════════════════════════════════════
// TASK STATUS ENUM
// ═══════════════════════════════════════════════════════════════

export const TaskStatusEnum = z.enum([
    'PENDING',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED',
]);

export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// ═══════════════════════════════════════════════════════════════
// TASK LIST PARAMS
// ═══════════════════════════════════════════════════════════════

export const TaskListParamsSchema = z.object({
    status: TaskStatusEnum.optional(),
    from: DateSchema.optional(),
    to: DateSchema.optional(),
    page: z.number().int().min(0).default(0),
    size: z.number().int().min(1).default(20),
});

export type TaskListParams = z.infer<typeof TaskListParamsSchema>;

// ═══════════════════════════════════════════════════════════════
// TASK RESPONSE
// ═══════════════════════════════════════════════════════════════

export const TaskSchema = z.object({
    id: z.number().int().positive(),
    seasonId: z.number().int().positive().optional(),
    seasonName: z.string().optional(),
    userName: z.string().optional(),
    title: z.string().max(255),
    description: z.string().max(4000).optional().nullable(),
    plannedDate: DateSchema.optional().nullable(),
    dueDate: DateSchema.optional().nullable(),
    status: TaskStatusEnum.optional(),
    actualStartDate: DateSchema.optional().nullable(),
    actualEndDate: DateSchema.optional().nullable(),
    notes: z.string().optional().nullable(),
    createdAt: z.string().datetime().optional(),
    updatedAt: z.string().datetime().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// ═══════════════════════════════════════════════════════════════
// TASK CREATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const TaskCreateRequestSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(4000).optional(),
    plannedDate: DateSchema,
    dueDate: DateSchema,
});

export type TaskCreateRequest = z.infer<typeof TaskCreateRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// TASK UPDATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const TaskUpdateRequestSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().max(4000).optional(),
    plannedDate: DateSchema,
    dueDate: DateSchema,
});

export type TaskUpdateRequest = z.infer<typeof TaskUpdateRequestSchema>;

// ═══════════════════════════════════════════════════════════════
// TASK STATUS UPDATE REQUEST
// ═══════════════════════════════════════════════════════════════

export const TaskStatusUpdateRequestSchema = z.object({
    status: TaskStatusEnum,
    actualStartDate: DateSchema.optional(),
    actualEndDate: DateSchema.optional(),
    notes: z.string().optional(),
});

export type TaskStatusUpdateRequest = z.infer<typeof TaskStatusUpdateRequestSchema>;
