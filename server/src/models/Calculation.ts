import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute
} from 'sequelize';
import { sequelize } from '../db/sequelize';
import { OperationType } from '../types';
import { User } from './User';

export class Calculation extends Model<
  InferAttributes<Calculation, { omit: 'createdBy' | 'children' | 'createdAt' | 'updatedAt' }>,
  InferCreationAttributes<Calculation, { omit: 'createdBy' | 'children' | 'createdAt' | 'updatedAt' }>
> {
  declare id: CreationOptional<string>;
  declare rootId: string;
  declare parentId: string | null;
  declare operation: OperationType | null;
  declare rightOperand: number | null;
  declare result: number;
  declare createdById: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare createdBy?: NonAttribute<User | null>;
  declare children?: NonAttribute<Calculation[]>;
}

Calculation.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    rootId: {
      field: 'root_id',
      type: DataTypes.UUID,
      allowNull: false
    },
    parentId: {
      field: 'parent_id',
      type: DataTypes.UUID,
      allowNull: true
    },
    operation: {
      type: DataTypes.ENUM('add', 'subtract', 'multiply', 'divide'),
      allowNull: true
    },
    rightOperand: {
      field: 'right_operand',
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    result: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    createdById: {
      field: 'created_by_id',
      type: DataTypes.UUID,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'calculations',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        name: 'idx_calculations_root_id',
        fields: ['root_id']
      },
      {
        name: 'idx_calculations_parent_id',
        fields: ['parent_id']
      }
    ]
  }
);

Calculation.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
User.hasMany(Calculation, { as: 'calculations', foreignKey: 'createdById' });

Calculation.belongsTo(Calculation, { as: 'parent', foreignKey: 'parentId' });
Calculation.hasMany(Calculation, { as: 'children', foreignKey: 'parentId' });

