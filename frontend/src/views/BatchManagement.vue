  <template>
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-semibold text-gray-800">Batch Management</h1>
        <button
          @click="openAddModal"
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <PlusIcon class="h-5 w-5" />
          Add New Batch
        </button>
      </div>

      <!-- Filtering -->
      <div class="mb-4 flex gap-4">
        <input
          v-model="filters.search"
          placeholder="Search batches..."
          class="px-4 py-2 border rounded-lg"
        />
        
      </div>

      <!-- Batches List -->
      <div class="bg-white shadow-md rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch Number</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="batch in filteredBatches" :key="batch.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ batch.batch_number }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ batch.inventoryItem?.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ batch.quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(batch.expiry_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ batch.supplier }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(batch.received_date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap space-x-2">
                <button 
                  @click="editBatch(batch)" 
                  class="text-blue-600 hover:text-blue-900"
                >
                  <PencilIcon class="h-5 w-5" />
                </button>
                <button 
                  @click="confirmDelete(batch)" 
                  class="text-red-600 hover:text-red-900"
                >
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-semibold mb-4">
            {{ currentBatch.id ? 'Edit Batch' : 'Add New Batch' }}
          </h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Item</label>
              <select 
                v-model="currentBatch.inventory_item_id"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select an item</option>
                <option v-for="item in inventoryItems" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Quantity</label>
              <input 
                v-model="currentBatch.quantity"
                type="number"
                min="0"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input 
                v-model="currentBatch.expiry_date"
                type="date"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Supplier</label>
              <input 
                v-model="currentBatch.supplier"
                type="text"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Received Date</label>
              <input 
                v-model="currentBatch.received_date"
                type="date"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div class="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Saving...' : (currentBatch.id ? 'Update' : 'Save') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 class="text-xl font-semibold mb-4">Confirm Delete</h2>
          <p>Are you sure you want to delete this batch?</p>
          <div class="flex justify-end space-x-2 mt-6">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              :disabled="isDeleting"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import axios from 'axios'
  import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-vue-next'

  const API_URL = 'http://localhost:5000/api/inventory'

  const batches = ref([])
  const inventoryItems = ref([])
  const showAddModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const isSubmitting = ref(false)
  const isDeleting = ref(false)
  const selectedBatchId = ref(null)

  const filters = ref({
    search: '',
    item: ''
  })

  const currentBatch = ref({
    id: null,
    inventory_item_id: '',
    batch_number: '',
    quantity: 0,
    expiry_date: '',
    supplier: '',
    received_date: ''
  })

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`)
      batches.value = response.data.data.reduce((acc, item) => {
        return [...acc, ...(item.batches || []).map(batch => ({
          ...batch,
          inventoryItem: {
            id: item.id,
            name: item.name
          }
        }))]
      }, [])
    } catch (error) {
      console.error('Error fetching batches:', error)
      // Add user-friendly error handling here, e.g., showing an error message
    }
  }

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/items`)
      inventoryItems.value = response.data.data || []
    } catch (error) {
      console.error('Error fetching inventory items:', error)
      // Add user-friendly error handling here, e.g., showing an error message
    }
  }

  const handleSubmit = async () => {
    try {
      isSubmitting.value = true
      let response
      
      if (currentBatch.value.id) {
        response = await axios.put(`${API_URL}/batches/${currentBatch.value.id}`, currentBatch.value)
      } else {
        response = await axios.post(`${API_URL}/batches`, currentBatch.value)
      }
      if (response.data.success) {
        await fetchBatches()
        closeModal()
      } else {
        console.error('Error submitting batch:', response.data.error)
      }
    } catch (error) {
      console.error('Error submitting batch:', error)
    } finally {
      isSubmitting.value = false
    }
  }

  const editBatch = (batch) => {
    currentBatch.value = { 
      id: batch.id,
      inventory_item_id: batch.inventoryItem?.id || '',
      batch_number: batch.batch_number,
      quantity: batch.quantity,
      expiry_date: batch.expiry_date ? new Date(batch.expiry_date).toISOString().split('T')[0] : '',
      supplier: batch.supplier,
      received_date: batch.received_date ? new Date(batch.received_date).toISOString().split('T')[0] : ''
    }
    showEditModal.value = true
  }

  const confirmDelete = (batch) => {
    selectedBatchId.value = batch.id
    showDeleteModal.value = true
  }

  const handleDelete = async () => {
    try {
      isDeleting.value = true
      await axios.delete(`${API_URL}/batches/${selectedBatchId.value}`)
      await fetchBatches()
      showDeleteModal.value = false
    } catch (error) {
      console.error('Error deleting batch:', error)
    } finally {
      isDeleting.value = false
    }
  }

  const closeModal = () => {
    showAddModal.value = false
    showEditModal.value = false
    currentBatch.value = {
      id: null,
      inventory_item_id: '',
      batch_number: '',
      quantity: 0,
      expiry_date: '',
      supplier: '',
      received_date: ''
    }
  }

  const openAddModal = () => {
    currentBatch.value = {
      id: null,
      inventory_item_id: '',
      batch_number: '',
      quantity: 0,
      expiry_date: '',
      supplier: '',
      received_date: ''
    }
    showAddModal.value = true
  }

  const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  }

  const filteredBatches = computed(() => {
    return batches.value.filter(batch => {
      const matchesSearch = (batch.batch_number || '').toLowerCase().includes(filters.value.search.toLowerCase()) ||
                            (batch.supplier || '').toLowerCase().includes(filters.value.search.toLowerCase()) ||
                            (batch.inventoryItem?.name || '').toLowerCase().includes(filters.value.search.toLowerCase())
      const matchesItem = !filters.value.item || batch.inventory_item_id === filters.value.item
      return matchesSearch && matchesItem
    })
  })

  onMounted(() => {
    fetchBatches()
    fetchInventoryItems()
  })
  </script>