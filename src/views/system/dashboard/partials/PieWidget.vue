<script setup lang="ts">
import { useReportsStore } from '@/stores/reports'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const reportsStore = useReportsStore()
const { loading } = storeToRefs(reportsStore)

// Active tab
const activeTab = ref('status')

// Color mappings for different categories
const statusColors: Record<string, string> = {
  Pending: '#2196F3', // Blue
  'In Progress': '#FF9800', // Orange
  Resolved: '#4CAF50', // Green
  Rejected: '#F44336', // Red
}

const reportTypeColors: Record<string, string> = {
  'Road Issues': '#F44336', // Red
  'Public Safety': '#E91E63', // Pink
  Infrastructure: '#9C27B0', // Purple
  Environmental: '#4CAF50', // Green
  Utilities: '#FF9800', // Orange
  'Public Transport': '#2196F3', // Blue
  General: '#795548', // Brown
}

const priorityColors: Record<string, string> = {
  Critical: '#F44336', // Red
  High: '#FF9800', // Orange
  Medium: '#2196F3', // Blue
  Low: '#4CAF50', // Green
}

// Calculate status distribution
const statusData = computed(() => {
  const statusCounts: Record<string, number> = {
    Pending: 0,
    'In Progress': 0,
    Resolved: 0,
    Rejected: 0,
  }

  reportsStore.reports.forEach((report) => {
    const status = report.status || 'Pending'
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++
    }
  })

  return Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      label: status,
      value: count,
      color: statusColors[status],
    }))
})

// Calculate report type distribution
const reportTypeData = computed(() => {
  const typeCounts: Record<string, number> = {}

  reportsStore.reports.forEach((report) => {
    const type = report.type || 'General'
    typeCounts[type] = (typeCounts[type] || 0) + 1
  })

  return Object.entries(typeCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({
      label: type,
      value: count,
      color: reportTypeColors[type] || '#9E9E9E',
    }))
})

// Calculate priority distribution
const priorityData = computed(() => {
  const priorityCounts: Record<string, number> = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  }

  reportsStore.reports.forEach((report) => {
    const priority = report.priority || 'Medium'
    if (priorityCounts.hasOwnProperty(priority)) {
      priorityCounts[priority]++
    }
  })

  return Object.entries(priorityCounts)
    .filter(([, count]) => count > 0)
    .map(([priority, count]) => ({
      label: priority,
      value: count,
      color: priorityColors[priority],
    }))
})

// Get current data based on active tab
const currentData = computed(() => {
  switch (activeTab.value) {
    case 'status':
      return statusData.value
    case 'type':
      return reportTypeData.value
    case 'priority':
      return priorityData.value
    default:
      return statusData.value
  }
})

// Chart series (values only)
const chartSeries = computed(() => currentData.value.map((item) => item.value))

// Chart labels
const chartLabels = computed(() => currentData.value.map((item) => item.label))

// Chart colors
const chartColors = computed(() => currentData.value.map((item) => item.color))

// Get tab title
const tabTitle = computed(() => {
  switch (activeTab.value) {
    case 'status':
      return 'Report Status Distribution'
    case 'type':
      return 'Report Type Distribution'
    case 'priority':
      return 'Priority Level Distribution'
    default:
      return 'Report Distribution'
  }
})

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
const totalReports = computed(() => currentData.value.reduce((sum, item) => sum + item.value, 0))

// Calculate percentages
const dataWithPercentage = computed(() =>
  currentData.value.map((item) => ({
    ...item,
    percentage: totalReports.value > 0 ? Math.round((item.value / totalReports.value) * 100) : 0,
  })),
)

// Handle legend click to toggle series visibility
const handleLegendClick = (dataPointIndex: number) => {
  console.log('Legend clicked for:', currentData.value[dataPointIndex]?.label)
}
</script>

<template>
  <v-card
    title="Reports Distribution Analysis"
    subtitle="Comprehensive breakdown of reports by different categories"
    class="border-md border-solid border-opacity-100 border-primary"
    elevation="8"
  >
    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="px-4">
      <v-tab value="status">
        <v-icon class="me-2">mdi-check-circle</v-icon>
        Status
      </v-tab>
      <v-tab value="type">
        <v-icon class="me-2">mdi-clipboard-list</v-icon>
        Type
      </v-tab>
      <v-tab value="priority">
        <v-icon class="me-2">mdi-alert-circle</v-icon>
        Priority
      </v-tab>
    </v-tabs>

    <v-divider></v-divider>

    <v-card-text>
      <!-- Loading state -->
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="text-h6 mt-4">Loading Chart...</div>
      </div>

      <!-- Chart content -->
      <template v-else-if="totalReports > 0">
        <!-- Tab Content Header -->
        <div class="text-center mb-4">
          <h3 class="text-h6 text-primary">{{ tabTitle }}</h3>
        </div>

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
              <div class="text-h6 mb-4 text-center">
                {{ activeTab.charAt(0).toUpperCase() + activeTab.slice(1) }} Breakdown
              </div>

              <div
                v-for="(item, index) in dataWithPercentage"
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

              <!-- Quick Stats -->
              <v-card variant="outlined" class="mt-4 pa-3">
                <div class="text-caption text-medium-emphasis mb-2">Quick Stats</div>
                <div v-if="activeTab === 'status'">
                  <div class="d-flex justify-space-between">
                    <span>Resolution Rate:</span>
                    <span class="font-weight-bold">
                      {{
                        Math.round(
                          ((statusData.find((s) => s.label === 'Resolved')?.value || 0) /
                            totalReports) *
                            100,
                        )
                      }}%
                    </span>
                  </div>
                </div>
                <div v-else-if="activeTab === 'priority'">
                  <div class="d-flex justify-space-between">
                    <span>High/Critical:</span>
                    <span class="font-weight-bold text-error">
                      {{
                        (priorityData.find((p) => p.label === 'Critical')?.value || 0) +
                        (priorityData.find((p) => p.label === 'High')?.value || 0)
                      }}
                    </span>
                  </div>
                </div>
                <div v-else>
                  <div class="d-flex justify-space-between">
                    <span>Most Common:</span>
                    <span class="font-weight-bold">
                      {{
                        reportTypeData.reduce(
                          (max, current) => (current.value > max.value ? current : max),
                          { label: 'None', value: 0 },
                        ).label
                      }}
                    </span>
                  </div>
                </div>
              </v-card>
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
