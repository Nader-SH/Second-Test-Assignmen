import { Router } from 'express';
import { ZodError } from 'zod';
import { authenticate } from '../middleware/auth';
import { createComment } from '../services/commentService';
import { createCommentSchema } from '../validators/commentValidators';

export const commentRouter = Router();

commentRouter.post('/posts/:postId/comments', authenticate, async (req, res, next) => {
  try {
    const payload = createCommentSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const comment = await createComment(
      req.params.postId,
      payload.content,
      payload.parentId ?? null,
      req.user
    );

    res.status(201).json({ data: comment });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid request payload.' });
      return;
    }

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
      return;
    }

    next(error);
  }
});

