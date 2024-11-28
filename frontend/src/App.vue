<template>
  <!-- asddasd -->
  <div class="flex h-screen bg-gray-100">
    <Sidebar :is-open="sidebarOpen" @toggle-sidebar="toggleSidebar" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header @toggle-sidebar="toggleSidebar" />
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const sidebarOpen = ref(true)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}
</script>