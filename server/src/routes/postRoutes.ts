import { Router } from 'express';
import { ZodError } from 'zod';
import { authenticate } from '../middleware/auth';
import { getAllPosts, createPost, updatePost } from '../services/postService';
import { createPostSchema, updatePostSchema } from '../validators/postValidators';

export const postRouter = Router();

postRouter.get('/', async (_req, res, next) => {
  try {
    const posts = await getAllPosts();
    res.status(200).json({ data: posts });
  } catch (error) {
    next(error);
  }
});

postRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const payload = createPostSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const post = await createPost(payload.title, payload.content, req.user);
    res.status(201).json({ data: post });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid request payload.' });
      return;
    }

    next(error);
  }
});

postRouter.put('/:id', authenticate, async (req, res, next) => {
  try {
    const payload = updatePostSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (Object.keys(payload).length === 0) {
      res.status(400).json({ message: 'At least one field must be provided for update.' });
      return;
    }

    const post = await updatePost(req.params.id, payload, req.user);
    res.status(200).json({ data: post });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid request payload.' });
      return;
    }

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('permission')) {
        res.status(403).json({ message: error.message });
        return;
      }
    }

    next(error);
  }
});

