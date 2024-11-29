<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Conditional rendering based on user login status -->
    <Sidebar v-if="isLoggedIn" :is-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />
    <div :class="isLoggedIn ? 'flex-1 flex flex-col overflow-hidden' : 'flex-1 flex justify-center items-center'">
      <Header v-if="isLoggedIn" @toggle-sidebar="toggleSidebar" />
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

// Reactive state for user authentication status
const isLoggedIn = ref(false)
const sidebarOpen = ref(true)

// Function to check if the token exists in localStorage
const checkAuth = () => {
  const token = localStorage.getItem('token') // Replace 'token' with your actual key
  isLoggedIn.value = !!token // Set to true if token exists, false otherwise
}

// Call checkAuth when the component is mounted
onMounted(() => {
  checkAuth()
  console.log("LOGGED IN? ", isLoggedIn.value)
})

// Function to toggle the sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>
