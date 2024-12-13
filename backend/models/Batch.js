const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const InventoryItem = require('./InventoryItem');

const Batch = sequelize.define(
  'Batch',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    inventory_item_id: {
      type: DataTypes.INTEGER,
      references: {
        model: InventoryItem,
        key: 'id',
      },
    },
    batch_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, 
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    expiry_date: {
      type: DataTypes.DATE,
    },
    supplier: {
      type: DataTypes.STRING(255),
    },
    received_date: {
      type: DataTypes.DATE,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'batches',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['batch_number'], 
      },
      {
        unique: false,
        fields: ['expiry_date'], 
      },
      {
        unique: false,
        fields: ['received_date'], 
      },
      {
        unique: false,
        fields: ['is_active'], 
      },
    ],
  }
);

// Define relationships
Batch.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', as: 'inventoryItem' });
InventoryItem.hasMany(Batch, { foreignKey: 'inventory_item_id', as: 'batches' });

module.exports = Batch;
