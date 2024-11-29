const EventEmitter = require('events');
class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();
const inventoryService = require('../services/inventoryService');

// Listener for batch-related events
notificationEmitter.on('batchAddedOrUpdated', async (data) => {
    console.log(`Event received for batch ${data.action}. Checking for notifications...`);
  
    try {
      // Check for expiring batches
      const expiringBatches = await inventoryService.getExpiringBatches(30); // Expiry check for the next 30 days
      console.log('Expiring Batches:', expiringBatches);
  
      // Create notifications for expiring batches
      for (const batch of expiringBatches) {
        console.log('Creating expiry notification for batch:', batch.id);
        await inventoryService.createNotification({
          notification_type: 'EXPIRED',  // Set the notification type to 'EXPIRED'
          title: `Batch ${batch.id} is nearing expiry`,
          message: `Batch ${batch.name} (ID: ${batch.id}) will expire on ${batch.expiryDate}. Please take action.`,
          batch_id: batch.id,
          expiry_date: batch.expiry_date,
        });
      }
  
      // Check for low stock batches
      const lowStockBatches = await inventoryService.getLowStockItems();
      console.log('Low Stock Batches:', lowStockBatches);
  
      // Create notifications for low stock batches
      for (const batch of lowStockBatches) {
        console.log('Creating low stock notification for batch:', batch.id);
        await inventoryService.createNotification({
          notification_type: 'LOW_STOCK',  // Set the notification type to 'LOW_STOCK'
          title: `Batch ${batch.id} is running low on stock`,
          message: `Batch ${batch.name} (ID: ${batch.id}) has only ${batch.quantity} units left, below the reorder level of ${batch.reorder_level}. Please restock.`,
          batch_id: batch.id,
          quantity_left: batch.quantity,
        });
      }
  
      console.log('Notifications processed successfully.');
    } catch (error) {
      console.error('Error processing notifications:', error);
    }
  });
  
  

module.exports = notificationEmitter;
