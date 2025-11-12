import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import { sequelize } from "../db/sequelize";

export class User extends Model<
  InferAttributes<User, { omit: 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<User, { omit: 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;
  declare username: string;
  declare passwordHash: string;
  declare role: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      field: "password_hash",
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: "registered",
    },
  },
  {
    sequelize,
    tableName: "users",
    underscored: true,
    timestamps: true,
  }
);
