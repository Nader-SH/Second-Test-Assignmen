import { CalculationNode } from '../api';
import { OperationForm } from './OperationForm';

interface CalculationTreeProps {
  nodes: CalculationNode[];
  canEdit: boolean;
  onAddOperation: (parentId: string, payload: { operation: 'add' | 'subtract' | 'multiply' | 'divide'; rightOperand: number }) => void;
  pendingNodeId: string | null;
  pending: boolean;
  errorNodeId: string | null;
  errorMessage: string | null;
}

export function CalculationTree({
  nodes,
  canEdit,
  onAddOperation,
  pendingNodeId,
  pending,
  errorNodeId,
  errorMessage
}: CalculationTreeProps) {
  if (nodes.length === 0) {
    return <p className="muted">No discussions yet. Be the first to start one!</p>;
  }

  return (
    <>
      <div className="tree-legend">
        <strong>كيفية قراءة القوائم المتداخلة:</strong>
        <p>
          العناصر في المستوى الأول تمثل الأرقام الابتدائية. أي عنصر متداخل تحتها هو عملية تم نشرها
          على النتيجة السابقة. كل مستوى إضافي داخل القائمة يعني ردًا جديدًا على العملية التي فوقه.
        </p>
      </div>
      <ul className="tree" data-depth={0}>
        {nodes.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            canEdit={canEdit}
            onAddOperation={onAddOperation}
            pendingNodeId={pendingNodeId}
            pending={pending}
            errorNodeId={errorNodeId}
            errorMessage={errorMessage}
            depth={0}
          />
        ))}
      </ul>
    </>
  );
}

interface TreeNodeProps {
  node: CalculationNode;
  canEdit: boolean;
  onAddOperation: (parentId: string, payload: { operation: 'add' | 'subtract' | 'multiply' | 'divide'; rightOperand: number }) => void;
  pendingNodeId: string | null;
  pending: boolean;
  errorNodeId: string | null;
  errorMessage: string | null;
  depth: number;
}

function TreeNode({
  node,
  canEdit,
  onAddOperation,
  pendingNodeId,
  pending,
  errorNodeId,
  errorMessage,
  depth
}: TreeNodeProps) {
  const isPending = pending && pendingNodeId === node.id;
  const showError = errorNodeId === node.id ? errorMessage : null;

  const operationDescription =
    node.operation === null
      ? 'Starting number'
      : {
          add: `Add ${node.rightOperand}`,
          subtract: `Subtract ${node.rightOperand}`,
          multiply: `Multiply by ${node.rightOperand}`,
          divide: `Divide by ${node.rightOperand}`
        }[node.operation];

  return (
    <li>
      <div className={`node-card depth-${depth}`}>
        <strong>{operationDescription}</strong>
        <div className="node-meta">
          <span>Result: {node.result}</span>
          {node.createdBy && <span>By: {node.createdBy.username}</span>}
          <span>{new Date(node.createdAt).toLocaleString()}</span>
        </div>
        {canEdit && (
          <OperationForm
            onSubmit={(payload) => onAddOperation(node.id, payload)}
            isSubmitting={isPending}
            error={showError}
          />
        )}
      </div>

      {node.children.length > 0 && (
        <ul className="tree" data-depth={depth + 1}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              canEdit={canEdit}
              onAddOperation={onAddOperation}
              pendingNodeId={pendingNodeId}
              pending={pending}
              errorNodeId={errorNodeId}
              errorMessage={errorMessage}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

