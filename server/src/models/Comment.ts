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

export class Comment extends Model<
  InferAttributes<Comment, { omit: 'createdBy' | 'post' | 'parent' | 'replies' | 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<Comment, { omit: 'createdBy' | 'post' | 'parent' | 'replies' | 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;
  declare content: string;
  declare postId: string;
  declare parentId: string | null;
  declare createdById: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare createdBy?: NonAttribute<User>;
  declare post?: NonAttribute<any>;
  declare parent?: NonAttribute<Comment>;
  declare replies?: NonAttribute<Comment[]>;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    postId: {
      field: 'post_id',
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id'
      }
    },
    parentId: {
      field: 'parent_id',
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
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
    tableName: 'comments',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_comments_post_id',
        fields: ['post_id']
      },
      {
        name: 'idx_comments_parent_id',
        fields: ['parent_id']
      },
      {
        name: 'idx_comments_created_by_id',
        fields: ['created_by_id']
      }
    ]
  }
);


