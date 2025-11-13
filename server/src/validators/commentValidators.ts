import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().uuid().nullable().optional()
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
  content: z.string().min(1)
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;

