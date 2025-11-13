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

