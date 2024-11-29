<template>
    <aside :class="[
      'bg-green-950 text-white w-64 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out',
      { '-ml-64': !isOpen }
    ]">
        <div class="p-4">
          <div class="flex items-center space-x-2 mb-6">
            <img src="@/assets/minsu.png" alt="Logo" class="logo" />
            <h1 class="font-bold">Clinic Inventory</h1>
          </div>
          <nav>
            <SidebarLink icon="LayoutDashboard" to="/dashboard">Dashboard</SidebarLink>
            <SidebarLink icon="Package" to="/inventory">Inventory</SidebarLink>
            <SidebarLink icon="Layers" to="/batch-management">Batch Management</SidebarLink>
            <SidebarLink icon="FileText" to="/transactions">Transactions / Audit Log</SidebarLink>
            <SidebarLink icon="BarChart2" to="/reports">Reports</SidebarLink>
            <!-- <SidebarLink icon="Settings" to="/settings">Settings</SidebarLink> -->
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
  <style>
  img{
    width: 40px;
    height: 40px;
  }
</style>