import { sequelize } from '../db/sequelize';
import '../models/index'; // Load associations first
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Comment } from '../models/Comment';

async function inspectData(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.\n');

    // Check Users
    console.log('=== USERS ===');
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });
    console.log(`Total users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.role}) - Created: ${user.createdAt?.toISOString()}`);
    });

    // Check Posts
    console.log('\n=== POSTS ===');
    const posts = await Post.findAll({
      attributes: ['id', 'title', 'content', 'createdById', 'createdAt'],
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['username']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    console.log(`Total posts: ${posts.length}`);
    posts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}"`);
      console.log(`   Content: ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`);
      console.log(`   Created by: ${post.createdBy?.username || 'Unknown'}`);
      console.log(`   Created: ${post.createdAt?.toISOString()}`);
    });

    // Check Comments
    console.log('\n=== COMMENTS ===');
    const comments = await Comment.findAll({
      attributes: ['id', 'content', 'postId', 'parentId', 'createdById', 'createdAt'],
      include: [
        {
          model: User,
          as: 'createdBy',
          attributes: ['username']
        },
        {
          model: Post,
          as: 'post',
          attributes: ['title']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
    console.log(`Total comments: ${comments.length}`);
    comments.forEach((comment, index) => {
      console.log(`${index + 1}. "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`);
      console.log(`   Post: ${comment.post?.title || 'Unknown'}`);
      console.log(`   Parent: ${comment.parentId ? 'Yes (reply)' : 'No (top-level)'}`);
      console.log(`   Created by: ${comment.createdBy?.username || 'Unknown'}`);
      console.log(`   Created: ${comment.createdAt?.toISOString()}`);
    });

    // Check for old calculations table
    console.log('\n=== CHECKING FOR OLD TABLES ===');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'calculations';
    `);
    if ((tables as Array<{ table_name: string }>).length > 0) {
      console.log('⚠️  Old "calculations" table still exists!');
    } else {
      console.log('✓ No old "calculations" table found.');
    }
  } catch (error) {
    console.error('Failed to inspect data:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

inspectData()
  .then(() => {
    console.log('\n✓ Data inspection completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Data inspection failed:', error);
    process.exit(1);
  });

