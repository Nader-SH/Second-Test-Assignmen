import { AuthenticatedUser, PostNode, CommentNode } from '../types';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';
import { User } from '../models/User';

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

