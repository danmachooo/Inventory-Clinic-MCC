import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
import Inventory from '@/views/Inventory.vue'
import BatchManagement from '@/views/BatchManagement.vue'
import Transactions from '@/views/Transactions.vue'
import Reports from '@/views/Reports.vue'
import Settings from '@/views/Settings.vue'
import Notifications from '@/views/Notifications.vue'
import Login from '@/views/Login.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/inventory', component: Inventory },
  { path: '/batch-management', component: BatchManagement },
  { path: '/transactions', component: Transactions },
  { path: '/reports', component: Reports },
  { path: '/settings', component: Settings },
  { path: '/notifications', component: Notifications },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router