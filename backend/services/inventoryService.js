const InventoryItem = require('../models/InventoryItem');
const Category = require('../models/Category');
const Batch = require('../models/Batch');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { Op, sequelize } = require('sequelize');
const logTransaction = require('../utils/transactionLogger');

const inventoryService = {
  // Add a new inventory item
  async addInventoryItem(itemData) {
    const newItem = await InventoryItem.create(itemData);
    await logTransaction(newItem.id, null, 'ADD', newItem.quantity_in_stock, 'New item added');
    return newItem;  },

  // Get all inventory items
  async getAllInventoryItems() {
    try {
      return await InventoryItem.findAll({
        attributes: ['id', 'name', 'category_id', 'description', 'quantity_in_stock', 'min_stock_level', 'unit_price', 'reorder_level'],
        include: [{
          model: Batch,
          as: 'batches', // Make sure this alias matches the one in your InventoryItem model
          attributes: ['id', 'batch_number', 'quantity', 'expiry_date', 'supplier', 'received_date'],
          where: { is_active: true },
          required: false
        }],
        where: { is_active: true }
      });
    } catch (error) {
      console.error('Error in getAllInventoryItems:', error);
      throw error;
    }
  },

  async getAllDistinctItems() {
    try {
      const distinctItems = await InventoryItem.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('name')), 'name'], // Use DISTINCT for unique item names
          'id', 
          'category_id'
        ],
        where: { is_active: true },
        include: [{
          model: Batch,
          as: 'batches',
          attributes: ['id', 'batch_number'],
          where: { is_active: true },
          required: false
        }]
      });
  
      return distinctItems;
    } catch (error) {
      console.error('Error in getAllDistinctItems:', error);
      throw error;
    }
  },

  // Get inventory item by ID
  async getInventoryItemById(id) {
    return await InventoryItem.findByPk(id, {
        include: [{ model: Batch, where: { is_active: true }, required: false }],
    });
  },

  // Update inventory item
  async updateInventoryItem(id, updateData) {
    const item = await InventoryItem.findByPk(id);
    if (item) {
      const oldQuantity = item.quantity_in_stock;
      await item.update(updateData);
      const quantityChange = item.quantity_in_stock - oldQuantity;
      await logTransaction(id, null, 'UPDATE', quantityChange, 'Item updated');
      return item;
    }
    return null;
  },

  // Soft delete inventory item
  async softDeleteInventoryItem(id) {
    const item = await InventoryItem.findByPk(id);
    if (item) {
      await item.update({ is_active: false });
      await logTransaction(id, null, 'DELETE', -item.quantity_in_stock, 'Item soft deleted');
      return item;
    }
    return null;
  },

  // Add a new batch
  async addBatch(batchData) {
    const batch = await Batch.create(batchData);
    await logTransaction(batch.inventory_item_id, batch.id, 'ADD', batch.quantity,  'New batch added');
    await this.updateInventoryQuantity(batch.inventory_item_id);
    return batch;
  },
  // Edit a batch
  async updateBatch(id, updateData) {
    const batch = await Batch.findByPk(id);
    if (batch) {
      const oldQuantity = batch.quantity;
      await batch.update(updateData);
      const quantityChange = batch.quantity - oldQuantity;
      await logTransaction(batch.inventory_item_id, id, 'UPDATE', quantityChange, 'Batch updated');
      await this.updateInventoryQuantity(batch.inventory_item_id);
      return batch;
    }
    return null;
  },


  
  // Update inventory quantity
  async updateInventoryQuantity(inventoryItemId) {
    const totalQuantity = await Batch.sum('quantity', {
      where: { inventory_item_id: inventoryItemId, is_active: true }
    });
    await InventoryItem.update(
      { quantity_in_stock: totalQuantity },
      { where: { id: inventoryItemId } }
    );
  },

  // Get low stock items
  async getLowStockItems() {
    return await InventoryItem.findAll({
      where: {
        quantity_in_stock: { [Op.lte]: sequelize.col('min_stock_level') },
        is_active: true
      }
    });
  },

  // Get expiring batches
  async getExpiringBatches(daysThreshold) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysThreshold);
    
    return await Batch.findAll({
      where: {
        expiry_date: { [Op.lte]: expiryDate },
        is_active: true
      },
      include: [
        { model: Batch, where: { is_active: true } },
        { model: InventoryItem }
      ]
    });
  },

  // Record a transaction
  async recordTransaction(transactionData) {
    return await Transaction.create(transactionData);
  },

  // Create a notification
  async createNotification(notificationData) {
    return await Notification.create(notificationData);
  },

  // Add a new category
  async addCategory(categoryData) {
    return await Category.create(categoryData);
  },

  // Get all categories
  async getAllCategories() {
    return await Category.findAll();
  },

  async getAllTransactions() {
    return await Transaction.findAll({
      include: [
        {
          model: InventoryItem,
          attributes: ['id', 'name'], // Only include `id` and `name` from InventoryItem
        },
        {
          model: Batch,
          attributes: ['id', 'batch_number'], // Only include `id` and `name` from Batch
        },
      ],
    });
  },
  // Get category by ID
  async getCategoryById(id) {
    return await Category.findByPk(id);
  },

  // Update category
  async updateCategory(id, updateData) {
    const category = await Category.findByPk(id);
    if (category) {
      return await category.update(updateData);
    }
    return null;
  },

  // Soft delete category
  async softDeleteCategory(id) {
    const category = await Category.findByPk(id);
    if (category) {
      return await category.update({ is_active: false });
    }
    return null;
  },


async getTransactionsForYear (year) {
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  // Fetch transactions for the given year
  const transactions = await Transaction.findAll({
    where: {
      date: { [Op.between]: [startOfYear, endOfYear] },
    },
    include: [
      { model: InventoryItem, attributes: ['name'] },
      { model: Batch, attributes: ['batch_number'] },
    ],
  });

  // Aggregate the report data
  const report = transactions.reduce((acc, transaction) => {
    const key = `${transaction.inventory_item_id}-${transaction.batch_id}`;
    if (!acc[key]) {
      acc[key] = {
        itemName: transaction.InventoryItem.name,
        batchName: transaction.Batch.batch_number,
        totalAdded: 0,
        totalRemoved: 0,
        netChange: 0,
      };
    }

    if (transaction.transaction_type === 'ADD') {
      acc[key].totalAdded += transaction.quantity_change;
      acc[key].netChange += transaction.quantity_change;
    } else if (transaction.transaction_type === 'REMOVE') {
      acc[key].totalRemoved += transaction.quantity_change;
      acc[key].netChange -= transaction.quantity_change;
    }

    return acc;
  }, {});

  // Convert the aggregated data to an array
  return Object.values(report);
  }
}

module.exports = inventoryService;