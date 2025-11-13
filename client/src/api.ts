export interface PostNode {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  } | null;
  comments: CommentNode[];
}

export interface CommentNode {
  id: string;
  content: string;
  postId: string;
  parentId: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    username: string;
  } | null;
  replies: CommentNode[];
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  token: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:4000';

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const headers = new Headers(rest.headers);

  if (!headers.has('Content-Type') && rest.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : 'Request failed.';
    throw new Error(message);
  }

  return payload as T;
}

export async function fetchPosts(): Promise<PostNode[]> {
  const data = await request<{ data: PostNode[] }>('/api/posts');
  return data.data;
}

export async function registerUser(payload: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function loginUser(payload: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function createPost(
  title: string,
  content: string,
  token: string
): Promise<PostNode> {
  const data = await request<{ data: PostNode }>('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
    token
  });
  return data.data;
}

export async function createComment(
  postId: string,
  content: string,
  parentId: string | null,
  token: string
): Promise<CommentNode> {
  const data = await request<{ data: CommentNode }>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parentId }),
    token
  });
  return data.data;
}

export async function updatePost(
  postId: string,
  updates: { title?: string; content?: string },
  token: string
): Promise<PostNode> {
  const data = await request<{ data: PostNode }>(`/api/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    token
  });
  return data.data;
}

export async function updateComment(
  postId: string,
  commentId: string,
  content: string,
  token: string
): Promise<CommentNode> {
  const data = await request<{ data: CommentNode }>(`/api/posts/${postId}/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
    token
  });
  return data.data;
}
