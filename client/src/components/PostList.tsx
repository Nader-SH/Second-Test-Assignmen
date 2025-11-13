import { useState } from 'react';
import type { PostNode, AuthenticatedUser } from '../api';
import { CommentTree } from './CommentTree';
import { EditPostForm } from './EditPostForm';

interface PostListProps {
  posts: PostNode[];
  canEdit: boolean;
  currentUser: AuthenticatedUser | null;
  onAddComment: (postId: string, content: string, parentId: string | null) => void;
  onUpdatePost: (postId: string, title: string, content: string) => void;
  onUpdateComment: (postId: string, commentId: string, content: string) => void;
  pending: boolean;
  error: { postId: string; commentId: string | null; message: string } | null;
  isUpdatingPost?: boolean;
  updatePostError?: { postId: string; message: string } | null;
  isUpdatingComment?: boolean;
  updateCommentError?: { commentId: string; message: string } | null;
}

export function PostList({
  posts,
  canEdit,
  currentUser,
  onAddComment,
  onUpdatePost,
  onUpdateComment,
  pending,
  error,
  isUpdatingPost = false,
  updatePostError,
  isUpdatingComment = false,
  updateCommentError
}: PostListProps) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return <p className="muted">No posts yet. Be the first to create one!</p>;
  }

  const canEditPost = (post: PostNode) => {
    if (!currentUser) return false;
    // User can edit if they are the owner or have admin role
    return post.createdBy?.id === currentUser.id || currentUser.role === 'admin';
  };

  return (
    <div className="post-list">
      {posts.map((post) => {
        const isEditing = editingPostId === post.id;
        const canEditThisPost = canEditPost(post);

        return (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <h3>{post.title}</h3>
              <div className="post-meta">
                {post.createdBy && <span>By: {post.createdBy.username}</span>}
                <span>{new Date(post.createdAt).toLocaleString()}</span>
                {canEditThisPost && !isEditing && (
                  <button
                    type="button"
                    className="edit-button"
                    onClick={() => setEditingPostId(post.id)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            {isEditing ? (
              <EditPostForm
                initialTitle={post.title}
                initialContent={post.content}
                onSave={(title, content) => {
                  onUpdatePost(post.id, title, content);
                  setEditingPostId(null);
                }}
                onCancel={() => setEditingPostId(null)}
                isLoading={isUpdatingPost}
                error={
                  updatePostError?.postId === post.id ? updatePostError.message : null
                }
              />
            ) : (
              <div className="post-content">{post.content}</div>
            )}
            <CommentTree
              postId={post.id}
              comments={post.comments}
              canEdit={canEdit}
              currentUser={currentUser}
              onAddComment={(content, parentId) => onAddComment(post.id, content, parentId)}
              onUpdateComment={(commentId, content) => onUpdateComment(post.id, commentId, content)}
              pending={pending}
              error={error?.postId === post.id ? error : null}
              depth={0}
              isUpdatingComment={isUpdatingComment}
              updateCommentError={updateCommentError}
            />
          </div>
        );
      })}
    </div>
  );
}

