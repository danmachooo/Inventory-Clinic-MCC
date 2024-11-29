<template>
  <div class="container mx-auto px-6 py-8">
    <h1 class="text-gray-700 text-3xl font-medium">Notifications</h1>
    <p class="mt-4 text-gray-600">View and manage alerts for low stock batches and expired batches.</p>
    
    <div class="mt-8">
      <div v-if="loading" class="text-center">
        <p class="text-gray-600">Loading notifications...</p>
      </div>
      <div v-else-if="error" class="text-center">
        <p class="text-red-600">{{ error }}</p>
      </div>
      <div v-else-if="notifications.length === 0" class="text-center">
        <p class="text-gray-600">No notifications at this time.</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="notification in notifications" :key="notification.id" 
             class="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
             :class="{ 'border-l-4 border-yellow-500': notification.notification_type === 'LOW_STOCK',
                      'border-l-4 border-red-500': notification.notification_type === 'EXPIRED' }">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              {{ getNotificationTitle(notification) }}
            </h2>
            <p class="text-gray-600">{{ getNotificationDescription(notification) }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ formatDate(notification.created_at) }}</p>
          </div>
          <button @click="markAsSeen(notification.id)" 
                  class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                  v-if="!notification.seen">
            Mark as Seen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const notifications = ref([])
const loading = ref(true)
const error = ref(null)
const API_URL = 'http://localhost:5000/api/inventory' // Replace with your actual API URL

const fetchNotifications = async () => {
  try {
    loading.value = true
    const response = await axios.get(`${API_URL}/notifications`)
    notifications.value = response.data.data
  } catch (err) {
    error.value = 'Failed to fetch notifications. Please try again later.'
    console.error('Error fetching notifications:', err)
  } finally {
    loading.value = false
  }
}

const markAsSeen = async (id) => {
  try {
    await axios.patch(` ${API_URL}/notifications/${id}`, { seen: true })
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value[index].seen = true
    }
  } catch (err) {
    console.error('Error marking notification as seen:', err)
  }
}

const getNotificationTitle = (notification) => {
  switch (notification.notification_type) {
    case 'LOW_STOCK':
      return 'Low Stock Alert'
    case 'EXPIRED':
      return 'Batch Expired'
    default:
      return 'Notification'
  }
}

const getNotificationDescription = (notification) => {
  if (!notification.batch) {
    return 'Details unavailable'
  }

  const itemName = notification.batch.inventoryItem?.name || 'Unknown Item'
  const batchNumber = notification.batch.batch_number || 'Unknown Batch'

  switch (notification.notification_type) {
    case 'LOW_STOCK':
      return `Batch ${batchNumber} of ${itemName} is running low. Current stock: ${notification.quantity_left || 'Unknown'}`
    case 'EXPIRED':
      return `Batch ${batchNumber} of ${itemName} has expired on ${formatDate(notification.expiry_date)}`
    default:
      return 'Please check your inventory'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown Date'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(fetchNotifications)
</script>