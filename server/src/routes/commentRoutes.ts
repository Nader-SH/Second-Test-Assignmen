import { Router } from 'express';
import { ZodError } from 'zod';
import { authenticate } from '../middleware/auth';
import { createComment, updateComment } from '../services/commentService';
import { createCommentSchema, updateCommentSchema } from '../validators/commentValidators';

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

commentRouter.put('/posts/:postId/comments/:id', authenticate, async (req, res, next) => {
  try {
    const payload = updateCommentSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const comment = await updateComment(req.params.id, payload.content, req.user);

    // Verify comment belongs to the post
    if (comment.postId !== req.params.postId) {
      res.status(400).json({ message: 'Comment does not belong to this post.' });
      return;
    }

    res.status(200).json({ data: comment });
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

