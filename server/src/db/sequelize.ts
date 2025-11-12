import { Sequelize } from 'sequelize';
import { appConfig } from '../config';

export const sequelize = new Sequelize(appConfig.databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});