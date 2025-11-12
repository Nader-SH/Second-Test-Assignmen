import { sequelize } from './sequelize';
import '../models/User';
import '../models/Calculation';

export async function initializeDatabase(): Promise<void> {
  await sequelize.authenticate();
  await sequelize.sync();
}

