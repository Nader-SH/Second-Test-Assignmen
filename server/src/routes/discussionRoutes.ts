import { Router } from 'express';
import { ZodError } from 'zod';
import { authenticate } from '../middleware/auth';
import {
  addOperationToCalculation,
  createStartingCalculation,
  getCalculationTrees
} from '../services/discussionService';
import {
  createOperationSchema,
  createRootDiscussionSchema
} from '../validators/discussionValidators';

export const discussionRouter = Router();

discussionRouter.get('/', async (_req, res, next) => {
  try {
    const discussions = await getCalculationTrees();
    res.status(200).json({ data: discussions });
  } catch (error) {
    next(error);
  }
});

discussionRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const payload = createRootDiscussionSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const node = await createStartingCalculation(payload.startingNumber, req.user);
    res.status(201).json({ data: node });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid request payload.' });
      return;
    }

    next(error);
  }
});

discussionRouter.post('/:id/operations', authenticate, async (req, res, next) => {
  try {
    const payload = createOperationSchema.parse(req.body);

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const node = await addOperationToCalculation(
      req.params.id,
      payload.operation,
      payload.rightOperand,
      req.user
    );

    res.status(201).json({ data: node });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: 'Invalid request payload.' });
      return;
    }

    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({ message: error.message });
      return;
    }

    if (error instanceof Error && error.message.includes('Division by zero')) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
});

