const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category'); // Import Category model

const InventoryItem = sequelize.define(
  'InventoryItem',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category_id: {
      // Link to the Category model
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category, 
        key: 'id', 
      },
      onDelete: 'CASCADE', 
    },
    quantity_in_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0, 
      },
    },
    min_stock_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0, 
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      validate: {
        min: 0, 
      },
    },
    reorder_level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0, 
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'inventory_items',
    timestamps: false,
    indexes: [
      {
        unique: false,
        fields: ['name'], 
      },
      {
        unique: false,
        fields: ['category_id'], 
      },
      {
        unique: false,
        fields: ['is_active'], 
      },
      {
        unique: false,
        fields: ['quantity_in_stock'], 
      },
      {
        unique: false,
        fields: ['unit_price'], 
      },
    ],
  }
);

// Define the associations
InventoryItem.associate = (models) => {
  // Link InventoryItem to Category
  InventoryItem.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category', 
  });

  // Link InventoryItem to Batches
  InventoryItem.hasMany(models.Batch, {
    foreignKey: 'inventory_item_id',
    as: 'batches', 
  });
};

module.exports = InventoryItem;
