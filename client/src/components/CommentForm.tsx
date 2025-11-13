import type { FormEvent } from 'react';
import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
  error: string | null;
}

export function CommentForm({ onSubmit, isSubmitting, error }: CommentFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent('');
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a comment..."
        minLength={1}
        required
        rows={2}
      />
      {error && <span className="error-text">{error}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting…' : 'Post Comment'}
      </button>
    </form>
  );
}

