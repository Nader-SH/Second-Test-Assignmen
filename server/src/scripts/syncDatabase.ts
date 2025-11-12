import { initializeDatabase } from '../db/init';

async function run(): Promise<void> {
  try {
    await initializeDatabase();
    console.log('Database synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to synchronize database:', error);
    process.exit(1);
  }
}

run();

