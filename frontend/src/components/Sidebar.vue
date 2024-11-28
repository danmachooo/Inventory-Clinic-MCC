<template>
    <aside :class="[
      'bg-gray-700 text-white w-64 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out',
      { '-ml-64': !isOpen }
    ]">
      <div class="p-4">
        <h1 class="text-2xl font-bold mb-6">Clinic Inventory</h1>
        <nav>
          <SidebarLink icon="LayoutDashboard" to="/">Dashboard</SidebarLink>
          <SidebarLink icon="Package" to="/inventory">Inventory</SidebarLink>
          <SidebarLink icon="Layers" to="/batch-management">Batch Management</SidebarLink>
          <SidebarLink icon="FileText" to="/transactions">Transactions / Audit Log</SidebarLink>
          <SidebarLink icon="BarChart2" to="/reports">Reports</SidebarLink>
          <!-- <SidebarLink icon="Settings" to="/settings">Settings</SidebarLink> -->
          <SidebarLink icon="Bell" to="/notifications">Notifications</SidebarLink>
        </nav>
      </div>
      <div class="mt-auto p-4">
        <button @click="logout" class="flex items-center text-white hover:text-indigo-200 transition-colors duration-200">
          <LogOut class="w-5 h-5 mr-2" />
          Logout
        </button>
      </div>
    </aside>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import { LogOut } from 'lucide-vue-next'
  import SidebarLink from './SidebarLink.vue'
  
  defineProps({
    isOpen: {
      type: Boolean,
      required: true
    }
  })
  
  const emit = defineEmits(['toggle-sidebar'])
  
  const logout = () => {
    // Implement logout logic here
    console.log('Logging out...')
  }
  </script>