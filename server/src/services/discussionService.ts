import { randomUUID } from 'crypto';
import { applyOperation, supportedOperations } from '../utils/operations';
import { AuthenticatedUser, CalculationNode, OperationType } from '../types';
import { Calculation } from '../models/Calculation';
import { User } from '../models/User';

export async function getCalculationTrees(): Promise<CalculationNode[]> {
  const rows = await Calculation.findAll({
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  const nodes = new Map<string, CalculationNode>();
  const roots: CalculationNode[] = [];

  for (const row of rows) {
    nodes.set(row.id, mapCalculationRow(row));
  }

  for (const row of rows) {
    const node = nodes.get(row.id);
    if (!node) {
      continue;
    }

    if (row.parentId) {
      const parent = nodes.get(row.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function createStartingCalculation(
  startingNumber: number,
  user: AuthenticatedUser
): Promise<CalculationNode> {
  const id = randomUUID();

  const calculation = await Calculation.create({
    id,
    rootId: id,
    parentId: null,
    operation: null,
    rightOperand: null,
    result: startingNumber,
    createdById: user.id
  });

  const withUser = await calculation.reload({
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  return mapCalculationRow(withUser);
}

export async function addOperationToCalculation(
  parentId: string,
  operation: OperationType,
  rightOperand: number,
  user: AuthenticatedUser
): Promise<CalculationNode> {
  if (!supportedOperations.includes(operation)) {
    throw new Error(`Unsupported operation "${operation}".`);
  }

  const parentRow = await Calculation.findByPk(parentId);

  if (!parentRow) {
    throw new Error('Parent calculation was not found.');
  }

  const leftValue = parentRow.result;
  const resultValue = applyOperation(leftValue, rightOperand, operation);
  const id = randomUUID();

  const calculation = await Calculation.create({
    id,
    rootId: parentRow.rootId,
    parentId,
    operation,
    rightOperand,
    result: resultValue,
    createdById: user.id
  });

  const withUser = await calculation.reload({
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  return mapCalculationRow(withUser);
}

function mapCalculationRow(row: Calculation): CalculationNode {
  return {
    id: row.id,
    rootId: row.rootId,
    parentId: row.parentId,
    operation: row.operation,
    rightOperand: row.rightOperand,
    result: row.result,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    createdBy:
      row.createdBy && row.createdBy.id && row.createdBy.username
        ? {
            id: row.createdBy.id,
            username: row.createdBy.username
          }
        : null,
    children: []
  };
}

