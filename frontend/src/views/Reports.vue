<template>
  <div class="container mx-auto px-6 py-8">
    <h1 class="text-gray-700 text-3xl font-medium mb-4">Yearly Inventory Reports</h1>
    <p class="text-gray-600">View and download inventory reports for each year.</p>

    <!-- Year Selection -->
    <div class="mt-6 flex items-center space-x-4">
      <label for="year" class="text-gray-700 font-medium">Select Year:</label>
      <select
        id="year"
        v-model="selectedYear"
        @change="fetchReport"
        class="block w-32 px-3 py-2 border rounded-md text-gray-700"
      >
        <option v-for="year in availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>

    <!-- Report Table -->
    <div v-if="reportData.length > -1" class="mt-8">
      <h2 class="text-xl font-medium text-gray-700 mb-4">
        Inventory Report for {{ selectedYear }}
      </h2>
      <table class="table-auto w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-100 text-gray-700">
            <th class="px-4 py-2 border">Item Name</th>
            <th class="px-4 py-2 border">Batch Name</th>
            <th class="px-4 py-2 border">Total Added</th>
            <th class="px-4 py-2 border">Total Removed</th>
            <th class="px-4 py-2 border">Net Change</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in reportData"
            :key="index"
            class="text-gray-600 hover:bg-gray-50"
          >
            <td class="px-4 py-2 border">{{ item.itemName }}</td>
            <td class="px-4 py-2 border">{{ item.batchName }}</td>
            <td class="px-4 py-2 border">{{ item.totalAdded }}</td>
            <td class="px-4 py-2 border">{{ item.totalRemoved }}</td>
            <td class="px-4 py-2 border">{{ item.netChange }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Download Button -->
      <button
        @click="downloadPDF"
        class="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-500"
      >
        Download PDF
      </button>
    </div>

    <!-- No Data Message -->
    <div v-else class="mt-8">
      <p class="text-gray-600">No data available for the selected year.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Reactive variables
const selectedYear = ref(new Date().getFullYear());
const availableYears = ref(Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i));
const reportData = ref([]);

// Fetch report data
const fetchReport = async () => {
  try {
    const response = await axios.get("/reports", {
      params: { year: selectedYear.value },
    });
    reportData.value = response.data.data;
  } catch (error) {
    console.error("Error fetching report:", error);
    reportData.value = [];
  }
};

// Download PDF report
const downloadPDF = () => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(`Inventory Report for ${selectedYear.value}`, 14, 20);

  // Table
  doc.autoTable({
    startY: 30,
    head: [["Item Name", "Batch Name", "Total Added", "Total Removed", "Net Change"]],
    body: reportData.value.map((item) => [
      item.itemName,
      item.batchName,
      item.totalAdded,
      item.totalRemoved,
      item.netChange,
    ]),
  });

  // Save PDF
  doc.save(`Inventory_Report_${selectedYear.value}.pdf`);
};

// Fetch report data when the component is mounted
onMounted(fetchReport);
</script>

