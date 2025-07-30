<script setup lang="ts">
import { useReportsStore } from '@/stores/reports'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const reportsStore = useReportsStore()
const { reports, loading } = storeToRefs(reportsStore)

// Generate last 7 days data
const chartData = computed(() => {
  const last7Days = []
  const today = new Date()

  // Generate array of last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toLocaleDateString()
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

    // Count reports for this day
    const dayReports = reports.value.filter((report) => {
      const reportDate = new Date(report.created_at).toLocaleDateString()
      return reportDate === dateString
    }).length

    last7Days.push({
      date: dateString,
      day: dayName,
      count: dayReports,
    })
  }

  return last7Days
})

// Chart options
const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 330,
    toolbar: {
      show: false,
    },
    zoom: {
      enabled: false,
    },
    fontFamily: 'Roboto, sans-serif',
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  colors: ['#1976D2'],
  markers: {
    size: 6,
    colors: ['#1976D2'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: {
      size: 8,
    },
  },
  grid: {
    borderColor: '#e0e0e0',
    strokeDashArray: 5,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  xaxis: {
    categories: chartData.value.map((item) => item.day),
    labels: {
      style: {
        colors: '#666',
        fontSize: '12px',
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#666',
        fontSize: '12px',
      },
      formatter: (value: number) => Math.floor(value).toString(),
    },
    min: 0,
  },
  tooltip: {
    theme: 'light',
    x: {
      formatter: (seriesName: string, opts: { dataPointIndex: number }) => {
        const dataIndex = opts.dataPointIndex
        return chartData.value[dataIndex]?.date || ''
      },
    },
    y: {
      formatter: (value: number) => `${Math.floor(value)} reports`,
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 250,
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '10px',
            },
          },
        },
      },
    },
  ],
}))

// Chart series
const chartSeries = computed(() => [
  {
    name: 'Reports',
    data: chartData.value.map((item) => item.count),
  },
])

// Statistics for display
const totalReportsLast7Days = computed(() =>
  chartData.value.reduce((sum, day) => sum + day.count, 0),
)

const averageReportsPerDay = computed(() => Math.round((totalReportsLast7Days.value / 7) * 10) / 10)

const peakDay = computed(() => {
  const maxCount = Math.max(...chartData.value.map((item) => item.count))
  const peak = chartData.value.find((item) => item.count === maxCount)
  return peak ? `${peak.day} (${peak.count})` : 'N/A'
})
</script>

<template>
  <v-card
    title="Reports Trend"
    subtitle="Last 7 days activity"
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
      <template v-else>
        <!-- Chart -->
        <div class="chart-container">
          <VueApexCharts type="line" height="330" :options="chartOptions" :series="chartSeries" />
        </div>

        <v-divider class="my-4"></v-divider>

        <!-- Quick Stats -->
        <v-row dense class="text-center">
          <v-col cols="4">
            <div class="text-h6 font-weight-bold text-primary">{{ totalReportsLast7Days }}</div>
            <div class="text-caption text-medium-emphasis">Total Reports</div>
          </v-col>

          <v-col cols="4">
            <div class="text-h6 font-weight-bold text-info">{{ averageReportsPerDay }}</div>
            <div class="text-caption text-medium-emphasis">Daily Average</div>
          </v-col>

          <v-col cols="4">
            <div class="text-h6 font-weight-bold text-success">{{ peakDay }}</div>
            <div class="text-caption text-medium-emphasis">Peak Day</div>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.chart-container {
  margin: -16px;
  padding: 16px;
}

.v-card-text {
  padding: 16px !important;
}
</style>
