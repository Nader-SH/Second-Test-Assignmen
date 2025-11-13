import { AuthenticatedUser, PostNode, CommentNode } from '../types';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { User } from '../models/User';

// Import Comment here to avoid circular dependency
import '../models/index';

export async function getAllPosts(): Promise<PostNode[]> {
  const posts = await Post.findAll({
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  const postNodes: PostNode[] = [];

  for (const post of posts) {
    const comments = await Comment.findAll({
      where: { postId: post.id, parentId: null },
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    postNodes.push({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt?.toISOString() ?? new Date().toISOString(),
      createdBy:
        post.createdBy && post.createdBy.id && post.createdBy.username
          ? {
              id: post.createdBy.id,
              username: post.createdBy.username
            }
          : null,
      comments: await buildCommentTree(comments, post.id)
    });
  }

  return postNodes;
}

async function buildCommentTree(comments: Comment[], postId: string): Promise<CommentNode[]> {
  const commentNodes: CommentNode[] = [];

  for (const comment of comments) {
    const replies = await Comment.findAll({
      where: { postId, parentId: comment.id },
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    commentNodes.push({
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      parentId: comment.parentId,
      createdAt: comment.createdAt?.toISOString() ?? new Date().toISOString(),
      createdBy:
        comment.createdBy && comment.createdBy.id && comment.createdBy.username
          ? {
              id: comment.createdBy.id,
              username: comment.createdBy.username
            }
          : null,
      replies: await buildCommentTree(replies, postId)
    });
  }

  return commentNodes;
}

export async function createPost(
  title: string,
  content: string,
  user: AuthenticatedUser
): Promise<PostNode> {
  const post = await Post.create({
    title,
    content,
    createdById: user.id
  });

  const withUser = await post.reload({
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  return {
    id: withUser.id,
    title: withUser.title,
    content: withUser.content,
    createdAt: withUser.createdAt?.toISOString() ?? new Date().toISOString(),
    createdBy:
      withUser.createdBy && withUser.createdBy.id && withUser.createdBy.username
        ? {
            id: withUser.createdBy.id,
            username: withUser.createdBy.username
          }
        : null,
    comments: []
  };
}

export async function updatePost(
  postId: string,
  updates: { title?: string; content?: string },
  user: AuthenticatedUser
): Promise<PostNode> {
  const post = await Post.findByPk(postId, {
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  if (!post) {
    throw new Error('Post not found.');
  }

  // Check if user is the owner or has admin role
  if (post.createdById !== user.id && user.role !== 'admin') {
    throw new Error('You do not have permission to update this post.');
  }

  // Update post
  if (updates.title !== undefined) {
    post.title = updates.title;
  }
  if (updates.content !== undefined) {
    post.content = updates.content;
  }

  await post.save();

  const updated = await post.reload({
    include: [{ model: User, as: 'createdBy', attributes: ['id', 'username'] }]
  });

  // Get comments for the post
  const comments = await Comment.findAll({
    where: { postId: updated.id, parentId: null },
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

  return {
    id: updated.id,
    title: updated.title,
    content: updated.content,
    createdAt: updated.createdAt?.toISOString() ?? new Date().toISOString(),
    createdBy:
      updated.createdBy && updated.createdBy.id && updated.createdBy.username
        ? {
            id: updated.createdBy.id,
            username: updated.createdBy.username
          }
        : null,
    comments: await buildCommentTree(comments, updated.id)
  };
}

