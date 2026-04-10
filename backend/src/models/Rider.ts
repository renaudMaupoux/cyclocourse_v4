import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Rider = sequelize.define(
  'Rider',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        min: { args: [1], msg: 'Le dossard doit être au minimum 1' },
        max: { args: [1000], msg: 'Le dossard doit être au maximum 1000' }
      }
    },
    nom: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    club: {
      type: DataTypes.STRING(300),
      allowNull: false,
      defaultValue: '',
      comment: 'Club ou équipe'
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6
      },
      comment: 'Catégorie 1 à 6'
    }
  },
  {
    tableName: 'riders',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

export default Rider;
