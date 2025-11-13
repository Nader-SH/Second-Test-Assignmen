import type { FormEvent } from 'react';
import { useState } from 'react';

interface PostFormProps {
  onCreate: (title: string, content: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function PostForm({ onCreate, isLoading, error }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (title.trim() && content.trim()) {
      onCreate(title.trim(), content.trim());
      setTitle('');
      setContent('');
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter post title"
          minLength={1}
          maxLength={255}
          required
        />
      </label>
      <label>
        Content
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Enter post content"
          minLength={1}
          required
          rows={4}
        />
      </label>
      {error && <span className="error-text">{error}</span>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating…' : 'Create Post'}
      </button>
    </form>
  );
}

