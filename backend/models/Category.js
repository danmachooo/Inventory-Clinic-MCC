const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true, 
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'categories',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['name'], 
      },
      {
        unique: false,
        fields: ['description'], 
      },
    ],
  }
);

Category.associate = (models) => {

  Category.hasMany(models.InventoryItem, {
    foreignKey: 'category_id',
    as: 'items', 
  });
};

module.exports = Category;
