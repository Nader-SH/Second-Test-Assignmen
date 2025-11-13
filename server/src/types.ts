export interface AuthenticatedUser {
  id: string;
  username: string;
  role: string;
}

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

