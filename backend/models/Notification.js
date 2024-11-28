const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Batch = require('./Batch');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  notification_type: {
    type: DataTypes.ENUM('LOW_STOCK', 'EXPIRED'),
    allowNull: false
  },
  batch_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Batch,
      key: 'id'
    }
  },
  quantity_left: {
    type: DataTypes.INTEGER
  },
  expiry_date: {
    type: DataTypes.DATE
  },
  seen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'notifications',
  timestamps: false
});

Notification.belongsTo(Batch, { foreignKey: 'batch_id', as: 'batch' });

module.exports = Notification;