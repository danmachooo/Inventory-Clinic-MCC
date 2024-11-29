  <template>
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Inventory Management</h1>
        <p class="text-gray-600 mb-8">Manage your inventory items, track stock levels, and maintain product information.</p>
        
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <div class="flex flex-col md:flex-row justify-between items-center mb-6">
            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4 md:mb-0">
              <button @click="showAddModal = true" class="btn-primary">
                <PlusIcon class="w-5 h-5 mr-2" />
                Add Item
              </button>
              <label class="btn-secondary">
                <UploadIcon class="w-5 h-5 mr-2" />
                Upload Excel
                <input type="file" class="hidden" @change="uploadExcel" accept=".xlsx, .xls" />
              </label>
            </div>
            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div class="relative">
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Search items..." 
                  class="pl-10 pr-4 py-2 w-full sm:w-64 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  
                />
                <SearchIcon class="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
              </div>
              <select 
                v-model="selectedCategory" 
                class="w-full sm:w-auto border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                @change="handleCategoryChange"
              >
                <option value="">All Categories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
                <option value="new">+ Add New Category</option>
              </select>
            </div>
          </div>

          <!-- New Category Modal -->
          <Teleport to="body">
            <div v-if="showNewCategoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style="z-index: 100;">
              <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 class="text-xl font-bold mb-4">Add New Category</h3>
                <form @submit.prevent="submitNewCategory">
                  <div class="space-y-4">
                    <div>
                      <label for="categoryName" class="block text-sm font-medium text-gray-700">Category Name</label>
                      <input 
                        type="text" 
                        id="categoryName" 
                        v-model="newCategory.name" 
                        required 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label for="categoryDescription" class="block text-sm font-medium text-gray-700">Description</label>
                      <textarea 
                        id="categoryDescription" 
                        v-model="newCategory.description" 
                        rows="3" 
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      ></textarea>
                    </div>
                    <div class="flex justify-end space-x-3">
                      <button type="button" @click="closeNewCategoryModal" class="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" class="btn-primary">
                        Add Category
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </Teleport>

        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th v-for="header in tableHeaders" :key="header" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ header }}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.description }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ getCategoryName(item.category_id) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    {{ item.quantity_in_stock === 0 ? 'Out of Stock' : item.quantity_in_stock }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.min_stock_level }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">P{{ parseFloat(item.unit_price).toFixed(2) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.reorder_level }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <button @click="editItem(item)" class="text-blue-600 hover:text-blue-900">
                      <EditIcon class="w-5 h-5" />
                    </button>
                    <button @click="openReduceStockModal(item)" class="text-red-600 hover:text-red-900">
                      <MinusIcon class="w-10 h-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <div class="text-sm text-gray-700">
            Showing {{ paginationStart }} to {{ paginationEnd }} of {{ totalItems }} entries
          </div>
          <div class="flex space-x-2">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1" 
              class="btn-secondary px-3 py-1 disabled:opacity-50"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <button 
              v-for="page in displayedPages" 
              :key="page" 
              @click="goToPage(page)" 
              :class="['btn-secondary px-3 py-1', currentPage === page ? 'bg-blue-600 text-white' : '']"
            >
              {{ page }}
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages" 
              class="btn-secondary px-3 py-1 disabled:opacity-50"
            >
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Item Modal -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">{{ editingItem ? 'Edit' : 'Add New' }} Item</h2>
            <form @submit.prevent="submitItem">
              <div class="space-y-4">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" id="name" v-model="currentItem.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" v-model="currentItem.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"></textarea>
                </div>
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
                  <select id="category" v-model="currentItem.category_id" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                    <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                  </select>
                </div>
                <div>
                  <label for="quantityInStock" class="block text-sm font-medium text-gray-700">Quantity in Stock</label>
                  <input type="number" readonly id="quantityInStock" v-model="currentItem.quantity_in_stock" min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
                <div>
                  <label for="minStockLevel" class="block text-sm font-medium text-gray-700">Min Stock Level</label>
                  <input type="number" id="minStockLevel" v-model="currentItem.min_stock_level" required min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
                <div>
                  <label for="unitPrice" class="block text-sm font-medium text-gray-700">Unit Price</label>
                  <input type="number" id="unitPrice" v-model="currentItem.unit_price" required min="0" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
                <div>
                  <label for="reorderLevel" class="block text-sm font-medium text-gray-700">Reorder Level</label>
                  <input type="number" id="reorderLevel" v-model="currentItem.reorder_level" required min="0" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">{{ editingItem ? 'Update' : 'Add' }} Item</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div v-if="showReduceStockModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div class="p-6">
            <h2 class="text-2xl font-bold mb-4">Reduce Stock</h2>
            <form @submit.prevent="reduceStock">
              <div class="space-y-4">
                <div>
                  <label for="reduceQuantity" class="block text-sm font-medium text-gray-700">Quantity to Reduce</label>
                  <input
                    type="number"
                    id="reduceQuantity"
                    v-model="reduceQuantity"
                    required
                    min="1"
                    max="currentItem.quantity_in_stock"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  />
                </div>
              </div>
              <div class="mt-6 flex justify-end space-x-3">
                <button type="button" @click="closeReduceStockModal" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Reduce</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  </template>

  <script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { MinusIcon, PlusIcon, UploadIcon, EditIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
  import axios from 'axios'
  import debounce from 'lodash/debounce'

  const API_URL = 'http://localhost:5000/api/inventory' // Replace with your actual API URL

  const items = ref([])
  const categories = ref([])
  const tableHeaders = ['Name', 'Description', 'Category', 'Quantity in Stock', 'Min Stock Level', 'Unit Price', 'Reorder Level']

  const searchQuery = ref('')
  const selectedCategory = ref('')
  const showAddModal = ref(false)
  const showNewCategoryModal = ref(false)
  const newCategory = ref({
    name: '',
    description: ''
  })
  const currentItem = ref({
    name: '',
    description: '',
    category_id: null,
    quantity_in_stock: 0,
    min_stock_level: 0,
    unit_price: 0,
    reorder_level: 0
  })
  const editingItem = ref(null)



  // Pagination
  const itemsPerPage = 10
  const currentPage = ref(1)
  const totalItems = ref(0) // Ensure this is initialized to 0
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const paginationStart = computed(() => Math.max((currentPage.value - 1) * itemsPerPage + 1, 0))
  const paginationEnd = computed(() => Math.min(currentPage.value * itemsPerPage, totalItems.value))

  const displayedPages = computed(() => {
    const range = 2
    let start = Math.max(1, currentPage.value - range)
    let end = Math.min(totalPages.value, currentPage.value + range)

    if (end - start + 1 < range * 2 + 1) {
      if (start === 1) {
        end = Math.min(start + range * 2, totalPages.value)
      } else {
        start = Math.max(end - range * 2, 1)
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  // Watch for category selection
  watch(() => currentItem.value.category_id, (newValue) => {
    if (newValue === 'new') {
      showNewCategoryModal.value = true
      currentItem.value.category_id = '' // Reset selection
    }
  })

  // Add new method to handle category changes
const handleCategoryChange = (event) => {
  const value = event.target.value
  if (value === 'new') {
    showNewCategoryModal.value = true
    // Store the previous selection
    selectedCategory.value = ''
  } else {
    fetchItems()
  }
}

  // Add new methods for category management
  const closeNewCategoryModal = () => {
  showNewCategoryModal.value = false
  newCategory.value = {
    name: '',
    description: ''
  }
}
  // Update submitNewCategory to handle both contexts
const submitNewCategory = async () => {
  try {
    const response = await axios.post(`${API_URL}/categories`, newCategory.value)
    if (response.data.success) {
      const newCat = response.data.data
      // Add the new category to the categories list
      categories.value.push(newCat)
      
      // If adding from the item modal, select the new category
      if (showAddModal.value) {
        currentItem.value.category_id = newCat.id
      }
      
      // Close the modal and reset form
      closeNewCategoryModal()
      // Fetch items to refresh the list
      fetchItems()
    }
  } catch (error) {
    console.error('Error creating category:', error)
  }
}
  onMounted(() => {
    fetchCategories()
    fetchItems()
  })

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`)
      categories.value = response.data.data
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const debouncedFetchItems = debounce(() => {
    fetchItems()
  }, 300)

  watch(searchQuery, () => {
    debouncedFetchItems()
  })

  watch(selectedCategory, () => {
    fetchItems()
  })

  const fetchItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`, {
        params: {
          page: currentPage.value,
          limit: itemsPerPage,
          search: searchQuery.value,
          category: selectedCategory.value
        }
      })
      if (response.data.success) {
        items.value = response.data.data || [] // Default to empty array if no data
        totalItems.value = response.data.total_count || 0 // Default to 0 if no total count
        console.log("Reorder Level:",items.value.reorder_level);
        if (currentPage.value > totalPages.value) {
          currentPage.value = 1
        }
      } else {
        console.error('Failed to fetch items:', response.data.message)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      fetchItems()
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      fetchItems()
    }
  }

  const goToPage = (page) => {
    currentPage.value = page
    fetchItems()
  }

  const editItem = (item) => {
    editingItem.value = item
    currentItem.value = { ...item }
    showAddModal.value = true
  }

  const closeModal = () => {
    showAddModal.value = false
    editingItem.value = null
    currentItem.value = {
      name: '',
      description: '',
      category_id: null,
      quantity_in_stock: 0,
      min_stock_level: 0,
      unit_price: 0,
      reorder_level: 0
    }
  }

  const submitItem = async () => {
    try {
      const itemData = {
        name: currentItem.value.name,
        description: currentItem.value.description,
        category_id: parseInt(currentItem.value.category_id),
        quantity_in_stock: parseInt(currentItem.value.quantity_in_stock),
        min_stock_level: parseInt(currentItem.value.min_stock_level),
        unit_price: parseFloat(currentItem.value.unit_price),
        reorder_level: parseInt(currentItem.value.reorder_level)
      }


      if (editingItem.value) {
        await axios.put(`${API_URL}/items/${editingItem.value.id}`, itemData)
      } else {
        await axios.post(`${API_URL}/items`, itemData)
      }
      closeModal()
      fetchItems()
    } catch (error) {
      console.error('Error submitting item:', error)
    }
  }

  const uploadExcel = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post(`${API_URL}/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      fetchItems()
    } catch (error) {
      console.error('Error uploading Excel file:', error)
    }
  }

  const getCategoryName = (categoryId) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category ? category.name : 'Unknown'
  }

  const filteredItems = computed(() => {
    let filtered = items.value
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    }
    if (selectedCategory.value) {
      filtered = filtered.filter(item => item.category_id === parseInt(selectedCategory.value))
    }
    return filtered
  })


  const showReduceStockModal = ref(false);
  const reduceQuantity = ref(0);

  const openReduceStockModal = (item) => {
    currentItem.value = { ...item };
    reduceQuantity.value = 0;
    showReduceStockModal.value = true;
  };

  const closeReduceStockModal = () => {
    showReduceStockModal.value = false;
    currentItem.value = {
      name: '',
      description: '',
      category_id: null,
      quantity_in_stock: 0,
      min_stock_level: 0,
      unit_price: 0,
      reorder_level: 0,
    };
  };

  const reduceStock = async () => {
    try {
      const response = await axios.post(`${API_URL}/items/${currentItem.value.id}/reduce-stock`, {
        quantity: parseInt(reduceQuantity.value),
      });

      if (response.data.success) {
        alert('Stock reduced successfully!');
        closeReduceStockModal();
        fetchItems();
      } else {
        alert('Failed to reduce stock. Please try again.');
      }
    } catch (error) {
      console.error('Error reducing stock:', error);
      alert('An error occurred while reducing stock.');
    }
  };

  </script>

  <style scoped>
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center;
  }

  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 ease-in-out flex items-center justify-center;
  }
  </style>

