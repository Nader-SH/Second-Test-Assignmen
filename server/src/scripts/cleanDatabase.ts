import { sequelize } from '../db/sequelize';
import '../models/index';

async function cleanDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    // Drop old tables if they exist
    await sequelize.query('DROP TABLE IF EXISTS calculations CASCADE;');
    console.log('Dropped old calculations table if it existed.');

    // Sync new schema
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Failed to clean database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

cleanDatabase()
  .then(() => {
    console.log('Database cleanup completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database cleanup failed:', error);
    process.exit(1);
  });

