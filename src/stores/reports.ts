import { defineStore } from 'pinia'
import { supabase, supabaseAdmin } from '@/utils/supabase'
import { ref, computed } from 'vue'

// Interface for report data
export interface ReportData {
  id: number
  citizen: string
  user_id: string
  type: string
  description: string
  location: string
  priority: string
  status: string
  dateSubmitted: string
  created_at: string
}

export const useReportsStore = defineStore('reports', () => {
  // State
  const reports = ref<ReportData[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed - Basic statistics
  const totalReports = computed(() => reports.value.length)

  const resolvedReports = computed(
    () => reports.value.filter((r) => r.status === 'Resolved').length,
  )

  const inProgressReports = computed(
    () => reports.value.filter((r) => r.status === 'In Progress').length,
  )

  const pendingReports = computed(() => reports.value.filter((r) => r.status === 'Pending').length)

  const criticalReports = computed(
    () => reports.value.filter((r) => r.priority === 'Critical').length,
  )

  // Computed - Time-based statistics
  const todayReports = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return reports.value.filter((r) => {
      const reportDate = new Date(r.dateSubmitted).toISOString().split('T')[0]
      return reportDate === today
    }).length
  })

  const thisWeekReports = computed(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return reports.value.filter((r) => new Date(r.dateSubmitted) >= weekAgo).length
  })

  const resolutionRate = computed(() => {
    if (totalReports.value === 0) return 0
    return Math.round((resolvedReports.value / totalReports.value) * 100)
  })

  // Actions
  const fetchReports = async (userId?: string) => {
    try {
      loading.value = true
      error.value = null

      // Build query with optional user filtering
      let query = supabase.from('reports').select('*').order('created_at', { ascending: false })

      // If userId is provided, filter by user
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data: reportsData, error: reportsError } = await query

      if (reportsError) {
        throw new Error(`Error fetching reports: ${reportsError.message}`)
      }

      // For each report, get user details from auth.users
      const reportsWithUserData = await Promise.all(
        reportsData.map(async (report) => {
          // Get user data from auth.users using admin client
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
            report.user_id,
          )

          let citizenName = 'Unknown User'
          if (!userError && userData.user?.user_metadata) {
            const metadata = userData.user.user_metadata as {
              firstname?: string
              lastname?: string
            }
            citizenName =
              `${metadata.firstname || ''} ${metadata.lastname || ''}`.trim() || 'Unknown User'
          }

          return {
            id: report.id,
            citizen: citizenName,
            user_id: report.user_id,
            type: report.report_type || 'General',
            description: report.description || 'No description provided',
            location: report.location || 'Unknown Location',
            priority: report.priority || 'Medium',
            status: report.status || 'Pending',
            dateSubmitted: report.created_at,
            created_at: report.created_at,
          }
        }),
      )

      reports.value = reportsWithUserData
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching reports'
      console.error('Error in fetchReports:', err)
    } finally {
      loading.value = false
    }
  }

  const refreshReports = async () => {
    await fetchReports()
  }

  // Get reports by status
  const getReportsByStatus = (status: string) => {
    return reports.value.filter((report) => report.status === status)
  }

  // Get reports by priority
  const getReportsByPriority = (priority: string) => {
    return reports.value.filter((report) => report.priority === priority)
  }

  // Get reports by user
  const getReportsByUser = (userId: string) => {
    return reports.value.filter((report) => report.user_id === userId)
  }

  return {
    // State
    reports,
    loading,
    error,

    // Computed statistics
    totalReports,
    resolvedReports,
    inProgressReports,
    pendingReports,
    criticalReports,
    todayReports,
    thisWeekReports,
    resolutionRate,

    // Actions
    fetchReports,
    refreshReports,
    getReportsByStatus,
    getReportsByPriority,
    getReportsByUser,
  }
})
