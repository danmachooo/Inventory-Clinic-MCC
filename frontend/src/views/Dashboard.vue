<template>
  <div class="container mx-auto px-6 py-8">
    <h1 class="text-gray-700 text-3xl font-medium">Dashboard</h1>
    
    <div class="mt-4">
      <div class="flex flex-wrap -mx-6">
        <DashboardCard title="Total Items" :value="totalItems" icon="Package" color="bg-indigo-600" />
        <DashboardCard title="Low Stock Alerts" :value="lowStockCount" icon="AlertTriangle" color="bg-orange-600" />
        <DashboardCard title="Expiring Soon" :value="expiringCount" icon="Clock" color="bg-pink-600" />
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Recent Transactions -->
      <div class="bg-white shadow rounded-lg p-4">
        <h2 class="text-gray-600 text-xl font-medium mb-4">Recent Transactions</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full leading-normal">
            <thead>
              <tr>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Item
                </th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in recentTransactions" :key="transaction.id">
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">
                    {{ transaction.InventoryItem.name }}
                  </p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ transaction.transaction_type }}</p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ transaction.quantity_change }}</p>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p class="text-gray-900 whitespace-no-wrap">{{ formatDate(transaction.date) }}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-white shadow rounded-lg p-4">
        <h2 class="text-gray-600 text-xl font-medium mb-4">Notifications</h2>
        <div class="space-y-4">
          <div v-for="notification in notifications" :key="notification.id" 
               class="p-4 rounded-lg"
               :class="{ 'bg-yellow-100': notification.notification_type === 'LOW_STOCK',
                        'bg-red-100': notification.notification_type === 'EXPIRED' }">
            <h3 class="font-semibold text-gray-800">
              {{ notification.notification_type === 'LOW_STOCK' ? 'Low Stock Alert' : 'Item Expired' }}
            </h3>
            <p class="text-gray-600">
              {{ getNotificationDescription(notification) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import DashboardCard from '../components/DashboardCard.vue'

const totalItems = ref(0)
const lowStockCount = ref(0)
const expiringCount = ref(0)
const recentTransactions = ref([])
const notifications = ref([])
const API_URL = 'http://localhost:5000/api/inventory'

const fetchDashboardData = async () => {
  try {
    const [itemsResponse, lowStockResponse, expiringResponse, transactionsResponse, notificationsResponse] = await Promise.all([
      axios.get(`${API_URL}/items`),
      axios.get(`${API_URL}/low-stock`),
      axios.get(`${API_URL}/expiring-batches`),
      axios.get(`${API_URL}/transactions`),
      axios.get(`${API_URL}/notifications`)
    ])

    totalItems.value = itemsResponse.data.data.length
    lowStockCount.value = lowStockResponse.data.data.length
    expiringCount.value = expiringResponse.data.data.length
    recentTransactions.value = transactionsResponse.data.data.slice(0, 5) // Get only the 5 most recent transactions
    notifications.value = notificationsResponse.data.data.slice(0, 5) // Get only the 5 most recent notifications
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getNotificationDescription = (notification) => {
  if (!notification.batch) return 'Details unavailable'

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

onMounted(fetchDashboardData)
</script>