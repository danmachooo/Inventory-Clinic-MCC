<template>
  <aside :class="[
    'bg-green-950 text-gray-100 w-64 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out',
    { '-ml-64': !isOpen }
  ]">
    <div class="flex flex-col h-full">
      <div class="p-6">
        <div class="flex items-center space-x-3 mb-8">
          <img src="@/assets/minsu.png" alt="Logo" class="w-12 h-12 rounded-full shadow-md" />
          <h1 class="font-bold text-lg">Clinic Inventory</h1>
        </div>
        <nav class="space-y-1">
          <SidebarLink icon="LayoutDashboard" to="/dashboard">Dashboard</SidebarLink>
          <SidebarLink icon="Package" to="/inventory">Inventory</SidebarLink>
          <SidebarLink icon="Layers" to="/batch-management">Batch Management</SidebarLink>
          <SidebarLink icon="FileText" to="/transactions">Transactions / Audit Log</SidebarLink>
          <SidebarLink icon="BarChart2" to="/reports">Reports</SidebarLink>
          <SidebarLink icon="Settings" to="/settings">Settings</SidebarLink>
        </nav>
      </div>
      <div class="mt-auto p-6">
        <button @click="handleLogout" class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
          <LogOut class="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import SidebarLink from './SidebarLink.vue'
import { useAuthStore } from '@/store/authStore'
import Swal from 'sweetalert2'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You will be logged out of the system.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, log out!'
  })

  if (result.isConfirmed) {
    await Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have been successfully logged out.',
      timer: 1500,
      showConfirmButton: false
    })
    authStore.logout()
    router.push('/')
  }
}
</script>