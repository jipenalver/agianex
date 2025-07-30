<script setup lang="ts">
import { useReportsStore } from '@/stores/reports'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const reportsStore = useReportsStore()
const { reports, loading } = storeToRefs(reportsStore)

// Status color mapping
const statusColors: Record<string, string> = {
  Pending: '#FF9800', // Orange
  'In Progress': '#2196F3', // Blue
  Resolved: '#4CAF50', // Green
  Rejected: '#F44336', // Red
}

// Calculate status distribution
const statusData = computed(() => {
  const statusCounts: Record<string, number> = {
    Pending: 0,
    'In Progress': 0,
    Resolved: 0,
    Rejected: 0,
  }

  // Count reports by status
  reports.value.forEach((report) => {
    if (statusCounts.hasOwnProperty(report.status)) {
      statusCounts[report.status]++
    }
  })

  // Convert to array format for ApexCharts
  return Object.entries(statusCounts)
    .filter(([, count]) => count > 0) // Only include statuses with reports
    .map(([status, count]) => ({
      label: status,
      value: count,
      color: statusColors[status],
    }))
})

// Chart series (values only)
const chartSeries = computed(() => statusData.value.map((item) => item.value))

// Chart labels
const chartLabels = computed(() => statusData.value.map((item) => item.label))

// Chart colors
const chartColors = computed(() => statusData.value.map((item) => item.color))

// Chart options
const chartOptions = computed(() => ({
  chart: {
    type: 'pie',
    height: 500,
    fontFamily: 'Roboto, sans-serif',
  },
  labels: chartLabels.value,
  colors: chartColors.value,
  legend: {
    show: false, // We'll create custom legend
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => {
      return Math.round(val) + '%'
    },
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#fff'],
    },
    dropShadow: {
      enabled: false,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '0%',
      },
      expandOnClick: true,
      customScale: 0.9,
    },
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (value: number) => `${value} reports`,
    },
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 220,
        },
        dataLabels: {
          style: {
            fontSize: '10px',
          },
        },
      },
    },
  ],
}))

// Total reports
const totalReports = computed(() => statusData.value.reduce((sum, item) => sum + item.value, 0))

// Calculate percentages
const statusWithPercentage = computed(() =>
  statusData.value.map((item) => ({
    ...item,
    percentage: totalReports.value > 0 ? Math.round((item.value / totalReports.value) * 100) : 0,
  })),
)

// Handle legend click to toggle series visibility
const handleLegendClick = (dataPointIndex: number) => {
  // This would typically toggle the visibility of a pie slice
  // ApexCharts handles this automatically when legend items are clicked
  console.log('Legend clicked for:', statusData.value[dataPointIndex]?.label)
}
</script>

<template>
  <v-card
    title="Reports by Status"
    subtitle="Distribution of report statuses"
    class="border-md border-solid border-opacity-100 border-primary"
    elevation="8"
  >
    <v-card-text>
      <!-- Loading state -->
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="text-h6 mt-4">Loading Chart...</div>
      </div>

      <!-- Chart content -->
      <template v-else-if="totalReports > 0">
        <v-row>
          <!-- Pie Chart -->
          <v-col cols="12" md="8">
            <div class="chart-container">
              <VueApexCharts
                type="pie"
                height="500"
                :options="chartOptions"
                :series="chartSeries"
              />
            </div>
          </v-col>

          <!-- Custom Legend -->
          <v-col cols="12" md="4">
            <div class="legend-container">
              <div class="text-h6 mb-4 text-center">Status Breakdown</div>

              <div
                v-for="(item, index) in statusWithPercentage"
                :key="item.label"
                class="legend-item"
                @click="handleLegendClick(index)"
              >
                <div class="d-flex align-center justify-space-between pa-3 mb-2 legend-card">
                  <div class="d-flex align-center">
                    <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                    <div class="ml-3">
                      <div class="text-subtitle1 font-weight-medium">{{ item.label }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ item.percentage }}% of total
                      </div>
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-h6 font-weight-bold">{{ item.value }}</div>
                    <div class="text-caption text-medium-emphasis">reports</div>
                  </div>
                </div>
              </div>

              <!-- Total Summary -->
              <v-divider class="my-3"></v-divider>
              <div class="text-center">
                <div class="text-h5 font-weight-bold text-primary">{{ totalReports }}</div>
                <div class="text-caption text-medium-emphasis">Total Reports</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </template>

      <!-- No data state -->
      <div v-else class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-chart-pie</v-icon>
        <div class="text-h6 text-medium-emphasis">No reports available</div>
        <div class="text-caption text-medium-emphasis">Reports will appear here once submitted</div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.chart-container {
  margin: -16px;
  padding: 16px;
}

.legend-container {
  padding: 16px 0;
}

.legend-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.legend-item:hover {
  transform: translateX(4px);
}

.legend-card {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.legend-card:hover {
  border-color: rgba(25, 118, 210, 0.5);
  background: rgba(25, 118, 210, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.v-card-text {
  padding: 16px !important;
}

@media (max-width: 960px) {
  .legend-container {
    margin-top: 16px;
  }
}
</style>
