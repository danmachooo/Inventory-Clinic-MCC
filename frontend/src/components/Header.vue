<template>
    <header class="bg-white shadow-sm">
      <div class="flex items-center justify-between p-4">
        <button @click="$emit('toggle-sidebar')" class="text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md">
          <span class="sr-only">Toggle Sidebar</span>
          <Menu class="h-6 w-6" />
        </button>
        
      </div>
    </header>
  </template>
  
  <script setup>
  import { Menu, Bell } from 'lucide-vue-next'
  </script>