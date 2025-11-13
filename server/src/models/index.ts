// Load models in order to avoid circular dependencies
import './User';
import './Post';
import './Comment';

// Import after loading to set up associations
import { User } from './User';
import { Post } from './Post';
import { Comment } from './Comment';

// Initialize associations after all models are loaded
Post.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
User.hasMany(Post, { as: 'posts', foreignKey: 'createdById' });

Post.hasMany(Comment, { as: 'comments', foreignKey: 'postId' });
Comment.belongsTo(Post, { as: 'post', foreignKey: 'postId' });

Comment.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
User.hasMany(Comment, { as: 'comments', foreignKey: 'createdById' });

Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });
Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });

export { User, Post, Comment };

