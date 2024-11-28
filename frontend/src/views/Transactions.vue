<template>
  <div class="container mx-auto px-6 py-8">
    <h1 class="text-gray-700 text-3xl font-medium">Transactions / Audit Log</h1>
    <p class="mt-4 text-gray-600">View and manage all transactions and audit logs related to inventory changes.</p>
    
    <!-- Filters -->
    <div class="mt-6 flex flex-wrap gap-4">
      <div class="w-full md:w-64">
        <label for="transactionType" class="block text-sm font-medium text-gray-700">Transaction Type</label>
        <select
          id="transactionType"
          v-model="filters.transactionType"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">All Types</option>
          <option value="ADD">Add</option>
          <option value="REMOVE">Remove</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
      </div>
      <div class="w-full md:w-64">
        <label for="dateRange" class="block text-sm font-medium text-gray-700">Date Range</label>
        <input
          id="dateRange"
          v-model="filters.dateRange"
          type="date"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
      </div>
      <div class="w-full md:w-64">
        <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
        <input
          id="search"
          v-model="filters.search"
          type="text"
          placeholder="Search by item or batch..."
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="mt-8 flex flex-col">
      <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Change</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(transaction.date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getTransactionTypeClass(transaction.transaction_type)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ transaction.transaction_type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.InventoryItem?.name || 'N/A' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.Batch?.batch_number || 'N/A' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.quantity_change }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ transaction.remarks }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex justify-between items-center">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
      >
        Previous
      </button>
      <span class="text-sm text-gray-700">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const transactions = ref([]);
const currentPage = ref(1);
const itemsPerPage = 10;
const totalItems = ref(0);

const filters = ref({
  transactionType: '',
  dateRange: '',
  search: '',
});

const API_URL = 'http://localhost:5000/api/inventory'; // Adjust this to your API URL

const fetchTransactions = async () => {
  try {
    const response = await axios.get(`${API_URL}/transactions`, {
      params: {
        page: currentPage.value,
        limit: itemsPerPage,
        ...filters.value,
      },
    });
    transactions.value = response.data.data;
    totalItems.value = response.data.total;
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

onMounted(fetchTransactions);

const filteredTransactions = computed(() => {
  return transactions.value.filter(transaction => {
    const matchesType = !filters.value.transactionType || transaction.transaction_type === filters.value.transactionType;
    const matchesDate = !filters.value.dateRange || new Date(transaction.date).toDateString() === new Date(filters.value.dateRange).toDateString();
    const matchesSearch = !filters.value.search || 
    transaction.InventoryItem?.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      (transaction.Batch?.batch_number &&  transaction.Batch?.batch_number.toLowerCase().includes(filters.value.search.toLowerCase()));
    return matchesType && matchesDate && matchesSearch;
  });
});

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchTransactions();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchTransactions();
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const getTransactionTypeClass = (type) => {
  switch (type) {
    case 'ADD':
      return 'bg-green-100 text-green-800';
    case 'REMOVE':
      return 'bg-red-100 text-red-800';
    case 'UPDATE':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELETE':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};
</script>