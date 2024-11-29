const InventoryItem = require('../models/InventoryItem');
const Category = require('../models/Category');
const Batch = require('../models/Batch');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const { Op, Sequelize } = require('sequelize');
const logTransaction = require('../utils/transactionLogger');
const xlsx = require('xlsx');


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
          [Sequelize.fn('DISTINCT', Sequelize.col('name')), 'name'], // Use DISTINCT for unique item names
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
    // Generate the batch number
    const item = await InventoryItem.findByPk(batchData.inventory_item_id);
    const batchNumber = this.generateBatchNumber(item.name);
    
    const batch = await Batch.create({
      ...batchData,
      batch_number: batchNumber
    });
    await logTransaction(batch.inventory_item_id, batch.id, 'ADD', batch.quantity, 'New batch added');
    await this.updateInventoryQuantity(batch.inventory_item_id);
    return batch;
  },
  generateBatchNumber(itemName) {
    const first4Letters = itemName.substring(0, 4).toUpperCase();
    const dateTime = new Date().toISOString().replace(/[-:]/g, '').slice(0, 12);
    return `BATCH-${first4Letters}-${dateTime}`;
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
        [Op.and]: [
          Sequelize.literal('quantity_in_stock <= min_stock_level'),
          { is_active: true }
        ]
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
        { 
          model: InventoryItem,
          as: 'inventoryItem',
          attributes: ['id', 'name', 'description']
        }
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
  async getNotifications() {
    return await Notification.findAll({
      include: [{ 
        model: Batch, 
        as: 'batch',
        include: [{
          model: InventoryItem,
          as: 'inventoryItem',
          attributes: ['name']
        }]
      }],
      order: [['created_at', 'DESC']]
    });
  },

  async markNotificationAsSeen(id) {
    const notification = await Notification.findByPk(id);
    if (notification) {
      notification.seen = true;
      await notification.save();
      return notification;
    }
    return null;
  },

  async createLowStockNotification(batchId, quantityLeft) {
    return await Notification.create({
      notification_type: 'LOW_STOCK',
      batch_id: batchId,
      quantity_left: quantityLeft
    });
  },

  async createExpiredNotification(batchId, expiryDate) {
    return await Notification.create({
      notification_type: 'EXPIRED',
      batch_id: batchId,
      expiry_date: expiryDate
    });
  },

  async checkAndCreateNotifications() {
    // Check for low stock batches
    const lowStockBatches = await Batch.findAll({
      where: {
        quantity: {
          [Op.lte]: Sequelize.col('inventoryItem.min_stock_level')
        },
        is_active: true
      },
      include: [{
        model: InventoryItem,
        as: 'inventoryItem'
      }]
    });

    for (const batch of lowStockBatches) {
      await this.createLowStockNotification(batch.id, batch.quantity);
    }

    // Check for expired batches
    const currentDate = new Date();
    const expiredBatches = await Batch.findAll({
      where: {
        expiry_date: {
          [Op.lte]: currentDate
        },
        is_active: true
      }
    });

    for (const batch of expiredBatches) {
      await this.createExpiredNotification(batch.id, batch.expiry_date);
    }

    console.log('Expired batches:', expiredBatches);

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
      order: [['date', 'DESC']], // Ordering by 'created_at' in descending order
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
  },
  async processExcelFile(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const results = {
      success: [],
      errors: []
    };

    for (const row of data) {
      try {
        // Validate required fields
          if (!row.name || !row.category || 
            row.min_stock_level === undefined || row.unit_price === undefined || 
            row.reorder_level === undefined) {
          throw new Error(`Invalid data: ${JSON.stringify(row)}`);
        }

        // Find or create category
        let category = await Category.findOne({ where: { name: row.category } });
        if (!category) {
          category = await Category.create({ name: row.category });
        }

        // Find or create inventory item
        let item = await InventoryItem.findOne({ where: { name: row.name } });
        let isNewItem = false;
        if (!item) {
          item = await InventoryItem.create({
            name: row.name,
            description: row.description || '',
            category_id: category.id,
            quantity_in_stock: 0,
            min_stock_level: row.min_stock_level,
            unit_price: row.unit_price,
            reorder_level: row.reorder_level
          });
          isNewItem = true;
        } else {
          // Update existing item
          await item.update({
            description: row.description || item.description,
            category_id: category.id,
            min_stock_level: row.min_stock_level,
            unit_price: row.unit_price,
            reorder_level: row.reorder_level
          });
        }

        // Create a new batch
        if (row.quantity !== undefined) {
          const batch = await this.addBatch({
            inventory_item_id: item.id,
            quantity: row.quantity,
            expiry_date: row.expiry_date ? new Date(row.expiry_date) : null,
            supplier: row.supplier || '',
            received_date: new Date()
          });
          await logTransaction(
            item.id,
            batch.id,
            'ADD',
            row.quantity,
            `Batch added from Excel import: ${batch.batch_number}`
          );
        } else {
          // If no quantity is provided, just log the item creation/update
          await logTransaction(
            item.id,
            null,
            isNewItem ? 'ADD' : 'UPDATE',
            0,
            `Item ${isNewItem ? 'added' : 'updated'} from Excel import (no batch)`
          );
        }
        // Log transaction for item creation or update
        if (isNewItem) {
          await logTransaction(
            item.id,
            null,
            'ADD',
            0,
            'New item added from Excel import'
          );
        } else {
          await logTransaction(
            item.id,
            null,
            'UPDATE',
            0,
            'Item updated from Excel import'
          );
        }

        results.success.push({ 
          name: row.name, 
          message: 'Processed successfully', 
          batchNumber: Batch.batch_number 
        });
      } catch (error) {
        results.errors.push({ name: row.name, error: error.message });
      }
    }
    return results;
  },
  async reduceStock(itemId, quantity) {
    const item = await InventoryItem.findByPk(itemId);
    if (!item) {
      return null;
    }
  
    if (item.quantity_in_stock < quantity) {
      throw new Error('Insufficient stock to reduce.');
    }
  
    const newQuantity = item.quantity_in_stock - quantity;
    await item.update({ quantity_in_stock: newQuantity });
  
    // Optionally, log the transaction
    await logTransaction(itemId, null, 'REDUCE', -quantity, 'Stock reduced');
  
    return item;
  }
  
}

module.exports = inventoryService;