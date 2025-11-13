import { useState, type FormEvent } from 'react';

interface EditPostFormProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export function EditPostForm({
  initialTitle,
  initialContent,
  onSave,
  onCancel,
  isLoading = false,
  error
}: EditPostFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }
    onSave(title.trim(), content.trim());
  };

  return (
    <form className="edit-post-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="edit-title">Title</label>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div className="form-group">
        <label htmlFor="edit-content">Content</label>
        <textarea
          id="edit-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          disabled={isLoading}
          rows={4}
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <div className="form-actions">
        <button type="submit" disabled={isLoading || !title.trim() || !content.trim()}>
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

