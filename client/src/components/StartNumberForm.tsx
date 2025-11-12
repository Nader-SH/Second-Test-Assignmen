import { FormEvent, useState } from 'react';

interface StartNumberFormProps {
  onCreate: (value: number) => void;
  isLoading: boolean;
  error: string | null;
}

export function StartNumberForm({ onCreate, isLoading, error }: StartNumberFormProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    onCreate(parsed);
    setValue('');
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Start a new discussion
        <input
          type="number"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Enter starting number"
          required
        />
      </label>
      {error && <span className="error-text">{error}</span>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating…' : 'Create Discussion'}
      </button>
    </form>
  );
}

