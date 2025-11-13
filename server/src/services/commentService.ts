import { AuthenticatedUser, CommentNode } from '../types';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { User } from '../models/User';

export async function createComment(
  postId: string,
  content: string,
  parentId: string | null,
  user: AuthenticatedUser
): Promise<CommentNode> {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new Error('Post not found.');
  }

  if (parentId) {
    const parent = await Comment.findByPk(parentId);
    if (!parent) {
      throw new Error('Parent comment not found.');
    }
    if (parent.postId !== postId) {
      throw new Error('Parent comment does not belong to this post.');
    }
  }

  const comment = await Comment.create({
    postId,
    content,
    parentId,
    createdById: user.id
  });

  const withUser = await comment.reload({
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  return {
    id: withUser.id,
    content: withUser.content,
    postId: withUser.postId,
    parentId: withUser.parentId,
    createdAt: withUser.createdAt?.toISOString() ?? new Date().toISOString(),
    createdBy:
      withUser.createdBy && withUser.createdBy.id && withUser.createdBy.username
        ? {
            id: withUser.createdBy.id,
            username: withUser.createdBy.username
          }
        : null,
    replies: []
  };
}

export async function updateComment(
  commentId: string,
  content: string,
  user: AuthenticatedUser
): Promise<CommentNode> {
  const comment = await Comment.findByPk(commentId, {
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  if (!comment) {
    throw new Error('Comment not found.');
  }

  // Check if user is the owner or has admin role
  if (comment.createdById !== user.id && user.role !== 'admin') {
    throw new Error('You do not have permission to update this comment.');
  }

  // Update comment
  comment.content = content;
  await comment.save();

  const updated = await comment.reload({
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  return {
    id: updated.id,
    content: updated.content,
    postId: updated.postId,
    parentId: updated.parentId,
    createdAt: updated.createdAt?.toISOString() ?? new Date().toISOString(),
    createdBy:
      updated.createdBy && updated.createdBy.id && updated.createdBy.username
        ? {
            id: updated.createdBy.id,
            username: updated.createdBy.username
          }
        : null,
    replies: []
  };
}

