import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const NumberModel = sequelize.define(
  'Number',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'La valeur doit être au minimum 1' },
        max: { args: [1000], msg: 'La valeur doit être au maximum 1000' }
      }
    },
    originalValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Valeur originale avant édition'
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 1 },
      comment: 'Niveau de confiance de la reconnaissance vocale (0-1)'
    },
    originalText: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Texte issu du Web Speech API'
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indique si le chiffre a été modifié manuellement'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'numbers',
    timestamps: true,
    createdAt: 'timestamp',
    updatedAt: 'updatedAt'
  }
);

export default NumberModel;
