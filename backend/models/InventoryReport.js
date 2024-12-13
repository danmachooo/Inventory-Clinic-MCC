const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryReport = sequelize.define('InventoryReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  report_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  total_items: {
    type: DataTypes.INTEGER
  },
  total_stock_value: {
    type: DataTypes.DECIMAL(15, 2)
  },
  low_stock_items: {
    type: DataTypes.INTEGER
  },
  expired_items: {
    type: DataTypes.INTEGER
  },
  generated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'inventory_reports',
  timestamps: false,
  indexes: [
    {
      unique: false,
      fields: ['report_date'] 
    },
    {
      unique: false,
      fields: ['generated_at'] 
    },
    {
      unique: false,
      fields: ['total_items'] 
    },
    {
      unique: false,
      fields: ['report_date', 'total_stock_value'] 
    }
  ]
});

module.exports = InventoryReport;
