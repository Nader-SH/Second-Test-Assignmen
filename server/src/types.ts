export type OperationType = 'add' | 'subtract' | 'multiply' | 'divide';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

export interface CalculationNode {
  id: string;
  rootId: string;
  parentId: string | null;
  operation: OperationType | null;
  rightOperand: number | null;
  result: number;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  } | null;
  children: CalculationNode[];
}

