import type { ReportData } from '@/stores/reports'
import { ref } from 'vue'

export function useMapFilters() {
  // Filter state
  const filters = ref({
    reportType: 'All Reports',
    status: 'All Status',
    priority: 'All Priorities',
    fromDate: '',
    toDate: '',
  })

  // Filter options
  const reportTypeOptions = [
    'All Reports',
    'Road Issues',
    'Public Safety',
    'Infrastructure',
    'Environmental',
    'Utilities',
    'Public Transport',
    'General',
  ]

  const statusOptions = ['All Status', 'Pending', 'In Progress', 'Resolved', 'Rejected']

  const priorityOptions = ['All Priorities', 'Low', 'Medium', 'High', 'Critical']

  // Apply filters action
  const applyFilters = (reports: ReportData[]): ReportData[] => {
    // Use the current filter values to ensure reactivity
    return reports.filter((report) => {
      // Normalize report data
      const reportType = report.type || 'General'
      const reportStatus = report.status || 'Pending'
      const reportPriority = report.priority || 'Medium'
      const reportDate = new Date(report.created_at)

      // Filter by report type
      if (filters.value.reportType !== 'All Reports' && reportType !== filters.value.reportType) {
        return false
      }

      // Filter by status
      if (filters.value.status !== 'All Status' && reportStatus !== filters.value.status) {
        return false
      }

      // Filter by priority
      if (
        filters.value.priority !== 'All Priorities' &&
        reportPriority !== filters.value.priority
      ) {
        return false
      }

      // Filter by date range
      if (filters.value.fromDate) {
        const fromDate = new Date(filters.value.fromDate)
        if (reportDate < fromDate) {
          return false
        }
      }

      if (filters.value.toDate) {
        const toDate = new Date(filters.value.toDate)
        // Set to end of day for inclusive comparison
        toDate.setHours(23, 59, 59, 999)
        if (reportDate > toDate) {
          return false
        }
      }

      return true
    })
  }

  // Clear filters action
  const clearFilters = () => {
    filters.value = {
      reportType: 'All Reports',
      status: 'All Status',
      priority: 'All Priorities',
      fromDate: '',
      toDate: '',
    }
  }

  return {
    filters,
    reportTypeOptions,
    statusOptions,
    priorityOptions,
    applyFilters,
    clearFilters,
  }
}
