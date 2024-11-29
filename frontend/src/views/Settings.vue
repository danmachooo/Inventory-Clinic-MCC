<template>
  <div class="container mx-auto px-6 py-8">
    <!-- Header Section -->
    <h1 class="text-gray-700 text-3xl font-medium">Inventory Clinic Settings</h1>
    <p class="mt-4 text-gray-600">
      Manage your clinic's inventory preferences, track supplies, and configure notifications.
    </p>

    <!-- Inventory Management Section -->
    <div class="mt-8">
      <h2 class="text-gray-600 text-xl font-medium">Inventory Management</h2>
      <p class="text-gray-500 mt-2">Monitor stock levels and reorder critical items.</p>
      <div class="mt-4 bg-white shadow-md rounded-lg p-6">
        <!-- Add functionality for inventory tracking here -->
        <label class="block text-gray-700 font-medium" for="reorder-level">
          Default Reorder Level:
        </label>
        <input
          type="number"
          id="reorder-level"
          class="mt-2 w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter default reorder threshold"
        />

        <div class="mt-4">
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications Section -->
    <div class="mt-8">
      <h2 class="text-gray-600 text-xl font-medium">Notification Preferences</h2>
      <p class="text-gray-500 mt-2">
        Enable alerts for low stock, new arrivals, or expiration dates.
      </p>
      <div class="mt-4 bg-white shadow-md rounded-lg p-6">
        <!-- Add notification toggle functionality -->
        <label class="flex items-center">
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-blue-600"
          />
          <span class="ml-2 text-gray-700">Enable Low Stock Alerts</span>
        </label>
        <label class="flex items-center mt-4">
          <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-blue-600"
          />
          <span class="ml-2 text-gray-700">Notify About Expired Items</span>
        </label>

        <div class="mt-4">
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>

    <!-- Other Options Section -->
    <div class="mt-8">
      <h2 class="text-gray-600 text-xl font-medium">Other Options</h2>
      <p class="text-gray-500 mt-2">Additional inventory-related configurations.</p>
      <div class="mt-4 bg-white shadow-md rounded-lg p-6">
        <!-- Add functionality for additional configurations -->
        <button
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Export Inventory Report
        </button>
        <button
          class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 ml-4"
        >
          Reset Inventory Data
        </button>
      </div>
    </div>
  </div>
</template>
