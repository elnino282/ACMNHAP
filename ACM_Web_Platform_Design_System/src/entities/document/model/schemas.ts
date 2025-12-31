import { z } from 'zod';

// Document API schema (backend: id, title, content)
export const DocumentSchema = z.object({
    id: z.number().int().positive(),
    title: z.string(),
    content: z.string().optional().nullable(),
});

export type Document = z.infer<typeof DocumentSchema>;

export const DocumentCreateRequestSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
});

export type DocumentCreateRequest = z.infer<typeof DocumentCreateRequestSchema>;

export const DocumentUpdateRequestSchema = DocumentCreateRequestSchema;

export type DocumentUpdateRequest = z.infer<typeof DocumentUpdateRequestSchema>;
