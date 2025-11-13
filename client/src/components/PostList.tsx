import type { PostNode } from '../api';
import { CommentTree } from './CommentTree';

interface PostListProps {
  posts: PostNode[];
  canEdit: boolean;
  onAddComment: (postId: string, content: string, parentId: string | null) => void;
  pending: boolean;
  error: { postId: string; commentId: string | null; message: string } | null;
}

export function PostList({ posts, canEdit, onAddComment, pending, error }: PostListProps) {
  if (posts.length === 0) {
    return <p className="muted">No posts yet. Be the first to create one!</p>;
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-header">
            <h3>{post.title}</h3>
            <div className="post-meta">
              {post.createdBy && <span>By: {post.createdBy.username}</span>}
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="post-content">{post.content}</div>
          <CommentTree
            postId={post.id}
            comments={post.comments}
            canEdit={canEdit}
            onAddComment={(content, parentId) => onAddComment(post.id, content, parentId)}
            pending={pending}
            error={error?.postId === post.id ? error : null}
            depth={0}
          />
        </div>
      ))}
    </div>
  );
}

