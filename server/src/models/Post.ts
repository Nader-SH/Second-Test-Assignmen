import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute
} from 'sequelize';
import { sequelize } from '../db/sequelize';
import { User } from './User';

export class Post extends Model<
  InferAttributes<Post, { omit: 'createdBy' | 'comments' | 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<Post, { omit: 'createdBy' | 'comments' | 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare content: string;
  declare createdById: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare createdBy?: NonAttribute<User>;
  declare comments?: NonAttribute<any[]>;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdById: {
      field: 'created_by_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    tableName: 'posts',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_posts_created_by_id',
        fields: ['created_by_id']
      },
      {
        name: 'idx_posts_created_at',
        fields: ['created_at']
      }
    ]
  }
);


