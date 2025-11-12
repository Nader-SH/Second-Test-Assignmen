import { OperationType } from '../types';

export const supportedOperations: OperationType[] = [
  'add',
  'subtract',
  'multiply',
  'divide'
];

export function applyOperation(left: number, right: number, operation: OperationType): number {
  switch (operation) {
    case 'add':
      return left + right;
    case 'subtract':
      return left - right;
    case 'multiply':
      return left * right;
    case 'divide':
      if (right === 0) {
        throw new Error('Division by zero is not allowed.');
      }
      return left / right;
    default: {
      const exhaustiveCheck: never = operation;
      throw new Error(`Unsupported operation: ${exhaustiveCheck}`);
    }
  }
}

