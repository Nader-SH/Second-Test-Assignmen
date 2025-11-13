import { useState, type FormEvent } from 'react';

interface EditCommentFormProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function EditCommentForm({
  initialContent,
  onSave,
  onCancel,
  isLoading = false,
  error
}: EditCommentFormProps) {
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }
    onSave(content.trim());
  };

  return (
    <form className="edit-comment-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isLoading}
          rows={3}
          placeholder="Edit your comment..."
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

