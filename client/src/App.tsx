import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPost, createComment, fetchPosts } from './api';
import type { PostNode, AuthResponse } from './api';
import { usePersistentAuth } from './useAuth';
import { AuthPanel } from './components/AuthPanel';
import { PostForm } from './components/PostForm';
import { PostList } from './components/PostList';

export default function App() {
  const queryClient = useQueryClient();
  const { auth, login, logout } = usePersistentAuth();
  const [creationError, setCreationError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<{ postId: string; commentId: string | null; message: string } | null>(null);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    refetchInterval: 10000
  });

  const handleAuthSuccess = useCallback(
    (response: AuthResponse) => {
      login(response);
      queryClient.invalidateQueries({ queryKey: ['posts'] }).catch(() => {
        // ignore refetch errors
      });
    },
    [login, queryClient]
  );

  const createPostMutation = useMutation({
    mutationFn: async (payload: { title: string; content: string }) => {
      if (!auth) {
        throw new Error('You must be logged in to create a post.');
      }
      setCreationError(null);
      return createPost(payload.title, payload.content, auth.token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] }).catch(() => {
        // ignore refetch errors
      });
    },
    onError: (err: unknown) => {
      setCreationError(err instanceof Error ? err.message : 'Unable to create post.');
    }
  });

  const [pendingComment, setPendingComment] = useState<{
    postId: string;
    parentId: string | null;
  } | null>(null);

  const createCommentMutation = useMutation({
    mutationFn: async (payload: {
      postId: string;
      content: string;
      parentId: string | null;
    }) => {
      if (!auth) {
        throw new Error('You must be logged in to comment.');
      }
      setCommentError(null);
      setPendingComment({ postId: payload.postId, parentId: payload.parentId });
      return createComment(payload.postId, payload.content, payload.parentId, auth.token);
    },
    onSuccess: () => {
      setCommentError(null);
      setPendingComment(null);
      queryClient.invalidateQueries({ queryKey: ['posts'] }).catch(() => {
        // ignore refetch errors
      });
    },
    onError: (err: unknown) => {
      setCommentError({
        postId: pendingComment?.postId ?? '',
        commentId: pendingComment?.parentId ?? null,
        message: err instanceof Error ? err.message : 'Unable to add comment.'
      });
      setPendingComment(null);
    }
  });

  const posts: PostNode[] = data ?? [];

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Discussion Board</h1>
        <p>
          Explore posts and comments from the community. Sign in to create your own post or comment on existing ones.
        </p>
      </header>

      {auth ? (
        <div className="card">
          <div className="auth-summary">
            <span>
              Signed in as <strong>{auth.user.username}</strong>
            </span>
            <button type="button" className="secondary" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      ) : (
        <AuthPanel onAuthSuccess={handleAuthSuccess} />
      )}

      <div className="card">
        <h2>Posts</h2>

        {auth && (
          <PostForm
            onCreate={(title, content) => createPostMutation.mutate({ title, content })}
            isLoading={createPostMutation.isPending}
            error={creationError}
          />
        )}

        {isLoading && <p className="loading">Loading posts…</p>}
        {error && (
          <p className="error-text">
            {error instanceof Error ? error.message : 'Failed to load posts.'}
          </p>
        )}

        <PostList
          posts={posts}
          canEdit={Boolean(auth)}
          onAddComment={(postId, content, parentId) =>
            createCommentMutation.mutate({ postId, content, parentId })
          }
          pending={createCommentMutation.isPending}
          error={commentError}
        />

        {isFetching && !isLoading && <p className="muted">Refreshing…</p>}
      </div>
    </div>
  );
}
