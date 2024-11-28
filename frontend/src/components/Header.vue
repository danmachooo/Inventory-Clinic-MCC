<template>
    <header class="bg-white shadow-sm">
      <div class="flex items-center justify-between p-4">
        <button @click="$emit('toggle-sidebar')" class="text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md">
          <span class="sr-only">Toggle Sidebar</span>
          <Menu class="h-6 w-6" />
        </button>
        <div class="flex items-center">
          <button class="text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1 mr-4" aria-label="View notifications">
            <Bell class="h-6 w-6" />
          </button>
          <div class="relative">
            <button class="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full" aria-label="User menu" aria-haspopup="true">
              <img class="h-8 w-8 rounded-full object-cover" src="https://via.placeholder.com/150" alt="Admin avatar" />
              <span class="ml-2 text-sm font-medium text-gray-700">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  </template>
  
  <script setup>
  import { Menu, Bell } from 'lucide-vue-next'
  </script>