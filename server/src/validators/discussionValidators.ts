import { z } from 'zod';
import { supportedOperations } from '../utils/operations';

const operationEnum = z.enum(supportedOperations);

export const createRootDiscussionSchema = z.object({
  startingNumber: z.coerce.number()
});

export const createOperationSchema = z.object({
  operation: operationEnum,
  rightOperand: z.coerce.number()
});

export type CreateRootDiscussionInput = z.infer<typeof createRootDiscussionSchema>;
export type CreateOperationInput = z.infer<typeof createOperationSchema>;

