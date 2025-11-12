import { FormEvent, useState } from 'react';

type Operation = 'add' | 'subtract' | 'multiply' | 'divide';

interface OperationFormProps {
  onSubmit: (payload: { operation: Operation; rightOperand: number }) => void;
  isSubmitting: boolean;
  error: string | null;
}

const operations: { value: Operation; label: string }[] = [
  { value: 'add', label: 'Add (+)' },
  { value: 'subtract', label: 'Subtract (−)' },
  { value: 'multiply', label: 'Multiply (×)' },
  { value: 'divide', label: 'Divide (÷)' }
];

export function OperationForm({ onSubmit, isSubmitting, error }: OperationFormProps) {
  const [operation, setOperation] = useState<Operation>('add');
  const [rightOperand, setRightOperand] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(rightOperand);
    if (Number.isNaN(parsed)) {
      return;
    }
    onSubmit({ operation, rightOperand: parsed });
    setRightOperand('');
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Operation
        <select value={operation} onChange={(event) => setOperation(event.target.value as Operation)}>
          {operations.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Right operand
        <input
          type="number"
          value={rightOperand}
          onChange={(event) => setRightOperand(event.target.value)}
          required
        />
      </label>
      {error && <span className="error-text">{error}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting…' : 'Add Operation'}
      </button>
    </form>
  );
}

