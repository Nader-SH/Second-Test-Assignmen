import type { CommentNode } from '../api';
import { CommentForm } from './CommentForm';

interface CommentTreeProps {
  postId: string;
  comments: CommentNode[];
  canEdit: boolean;
  onAddComment: (content: string, parentId: string | null) => void;
  pending: boolean;
  error: { postId: string; commentId: string | null; message: string } | null;
  depth: number;
}

export function CommentTree({
  postId,
  comments,
  canEdit,
  onAddComment,
  pending,
  error,
  depth
}: CommentTreeProps) {
  if (comments.length === 0 && depth === 0) {
    return (
      <div className="comments-section">
        <h4>Comments</h4>
        {canEdit && (
          <CommentForm
            onSubmit={(content) => onAddComment(content, null)}
            isSubmitting={pending}
            error={error?.postId === postId && error?.commentId === null ? error.message : null}
          />
        )}
        <p className="muted">No comments yet.</p>
      </div>
    );
  }

  return (
    <div className="comments-section">
      {depth === 0 && <h4>Comments</h4>}
      {canEdit && depth === 0 && (
        <CommentForm
          onSubmit={(content) => onAddComment(content, null)}
          isSubmitting={pending}
          error={error?.postId === postId && error?.commentId === null ? error.message : null}
        />
      )}
      <ul className={`comment-tree depth-${depth}`}>
        {comments.map((comment) => (
          <CommentNode
            key={comment.id}
            postId={postId}
            comment={comment}
            canEdit={canEdit}
            onAddComment={onAddComment}
            pending={pending}
            error={error}
            depth={depth}
          />
        ))}
      </ul>
    </div>
  );
}

interface CommentNodeProps {
  postId: string;
  comment: CommentNode;
  canEdit: boolean;
  onAddComment: (content: string, parentId: string | null) => void;
  pending: boolean;
  error: { postId: string; commentId: string | null; message: string } | null;
  depth: number;
}

function CommentNode({
  postId,
  comment,
  canEdit,
  onAddComment,
  pending,
  error,
  depth
}: CommentNodeProps) {
  return (
    <li>
      <div className={`comment-card depth-${depth}`}>
        <div className="comment-content">{comment.content}</div>
        <div className="comment-meta">
          {comment.createdBy && <span>By: {comment.createdBy.username}</span>}
          <span>{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        {canEdit && (
          <CommentForm
            onSubmit={(content) => onAddComment(content, comment.id)}
            isSubmitting={pending}
            error={error?.postId === postId && error?.commentId === comment.id ? error.message : null}
          />
        )}
      </div>
      {comment.replies.length > 0 && (
        <ul className={`comment-tree depth-${depth + 1}`}>
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              postId={postId}
              comment={reply}
              canEdit={canEdit}
              onAddComment={onAddComment}
              pending={pending}
              error={error}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

