import { useState } from 'react';
import type { CommentNode, AuthenticatedUser } from '../api';
import { CommentForm } from './CommentForm';
import { EditCommentForm } from './EditCommentForm';

interface CommentTreeProps {
  postId: string;
  comments: CommentNode[];
  canEdit: boolean;
  currentUser: AuthenticatedUser | null;
  onAddComment: (content: string, parentId: string | null) => void;
  onUpdateComment: (postId: string, commentId: string, content: string) => void;
  pending: boolean;
  error: { postId: string; commentId: string | null; message: string } | null;
  depth: number;
  isUpdatingComment?: boolean;
  updateCommentError?: { commentId: string; message: string } | null;
}

export function CommentTree({
  postId,
  comments,
  canEdit,
  currentUser,
  onAddComment,
  onUpdateComment,
  pending,
  error,
  depth,
  isUpdatingComment = false,
  updateCommentError
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
            currentUser={currentUser}
            onAddComment={onAddComment}
            onUpdateComment={onUpdateComment}
            pending={pending}
            error={error}
            depth={depth}
            isUpdatingComment={isUpdatingComment}
            updateCommentError={updateCommentError}
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
  currentUser: AuthenticatedUser | null;
  onAddComment: (content: string, parentId: string | null) => void;
  onUpdateComment: (postId: string, commentId: string, content: string) => void;
  pending: boolean;
  error: { postId: string; commentId: string | null; message: string } | null;
  depth: number;
  isUpdatingComment?: boolean;
  updateCommentError?: { commentId: string; message: string } | null;
}

function CommentNode({
  postId,
  comment,
  canEdit,
  currentUser,
  onAddComment,
  onUpdateComment,
  pending,
  error,
  depth,
  isUpdatingComment = false,
  updateCommentError
}: CommentNodeProps) {
  const [isEditing, setIsEditing] = useState(false);

  const canEditThisComment = () => {
    if (!currentUser) return false;
    // User can edit if they are the owner or have admin role
    return comment.createdBy?.id === currentUser.id || currentUser.role === 'admin';
  };

  return (
    <li>
      <div className={`comment-card depth-${depth}`}>
        {isEditing ? (
          <EditCommentForm
            initialContent={comment.content}
            onSave={(content) => {
              onUpdateComment(postId, comment.id, content);
              setIsEditing(false);
            }}
            onCancel={() => setIsEditing(false)}
            isLoading={isUpdatingComment}
            error={
              updateCommentError?.commentId === comment.id
                ? updateCommentError.message
                : null
            }
          />
        ) : (
          <>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-meta">
              {comment.createdBy && <span>By: {comment.createdBy.username}</span>}
              <span>{new Date(comment.createdAt).toLocaleString()}</span>
              {canEditThisComment() && (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>
            {canEdit && (
              <CommentForm
                onSubmit={(content) => onAddComment(content, comment.id)}
                isSubmitting={pending}
                error={
                  error?.postId === postId && error?.commentId === comment.id
                    ? error.message
                    : null
                }
              />
            )}
          </>
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
              currentUser={currentUser}
              onAddComment={onAddComment}
              onUpdateComment={onUpdateComment}
              pending={pending}
              error={error}
              depth={depth + 1}
              isUpdatingComment={isUpdatingComment}
              updateCommentError={updateCommentError}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

