import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1)
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional()
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;

