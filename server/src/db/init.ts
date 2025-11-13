import { sequelize } from './sequelize';
import '../models/index';

export async function initializeDatabase(): Promise<void> {
  await sequelize.authenticate();
  await sequelize.sync();
}

