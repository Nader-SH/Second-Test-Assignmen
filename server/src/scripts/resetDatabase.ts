import { sequelize } from '../db/sequelize';
import '../models/index';

async function resetDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Drop all tables
    console.log('Dropping all tables...');
    await sequelize.query('DROP TABLE IF EXISTS comments CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS posts CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS calculations CASCADE;');
    console.log('All tables dropped.');

    // Sync new schema
    console.log('Creating new tables...');
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

resetDatabase()
  .then(() => {
    console.log('Database reset completed.');
    console.log('⚠️  All data has been deleted!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database reset failed:', error);
    process.exit(1);
  });

