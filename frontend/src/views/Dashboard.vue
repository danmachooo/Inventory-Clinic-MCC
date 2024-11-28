<template>
    <div class="container mx-auto px-6 py-8">
      <h1 class="text-gray-700 text-3xl font-medium">Dashboard</h1>
      
      <div class="mt-4">
        <div class="flex flex-wrap -mx-6">
          <DashboardCard title="Total Items" :value="8282" icon="Package" color="bg-indigo-600" />
          <DashboardCard title="Low Stock Alerts" :value="200" icon="AlertTriangle" color="bg-orange-600" />
          <DashboardCard title="Expiring Soon" :value="215" icon="Clock" color="bg-pink-600" />
        </div>
      </div>
  
      <div class="mt-8">
        <h2 class="text-gray-600 text-xl font-medium">Recent Activity</h2>
        <div class="mt-4">
          <div class="bg-white shadow rounded-lg overflow-hidden">
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
                <tr v-for="activity in recentActivity" :key="activity.id">
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div class="flex items-center">
                      <div class="ml-3">
                        <p class="text-gray-900 whitespace-no-wrap">
                          {{ activity.item }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">{{ activity.action }}</p>
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">{{ activity.quantity }}</p>
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p class="text-gray-900 whitespace-no-wrap">{{ activity.date }}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import DashboardCard from '../components/DashboardCard.vue'
  
  const recentActivity = ref([
    { id: 1, item: 'Paracetamol', action: 'Added', quantity: 500, date: '2023-05-15' },
    { id: 2, item: 'Ibuprofen', action: 'Updated', quantity: 200, date: '2023-05-14' },
    { id: 3, item: 'Bandages', action: 'Low Stock', quantity: 50, date: '2023-05-13' },
  ])
  </script>