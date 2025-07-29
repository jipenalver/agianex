import { type TableOptions } from '@/utils/helpers/tables'
import { supabase, supabaseAdmin } from '@/utils/supabase'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Interface for user metadata
interface UserMetadata {
  firstname?: string
  lastname?: string
  phone?: string
  user_role?: string
  middlename?: string
  email_verified?: boolean
}

// Extended user interface to include raw_user_meta_data
interface ExtendedUser {
  raw_user_meta_data?: UserMetadata
  user_metadata?: UserMetadata
}

// Interface for report data
export interface ReportData {
  id: number
  citizen: string
  user_id: string
  type: string
  description: string
  location: string
  latitude?: string
  longitude?: string
  image_path?: string
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

  // Server-side pagination state
  const serverReports = ref<ReportData[]>([])
  const totalServerReports = ref(0)
  const serverLoading = ref(false)

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
          if (!userError && userData.user) {
            // Try both raw_user_meta_data and user_metadata
            const user = userData.user as ExtendedUser
            const rawMetadata = user.raw_user_meta_data
            const userMetadata = user.user_metadata

            const metadata = rawMetadata || userMetadata

            if (metadata && (metadata.firstname || metadata.lastname)) {
              citizenName =
                `${metadata.firstname || ''} ${metadata.lastname || ''}`.trim() || 'Unknown User'
            }
          }

          return {
            id: report.id,
            citizen: citizenName,
            user_id: report.user_id,
            type: report.report_type || 'General',
            description: report.description || 'No description provided',
            location: report.location || 'Unknown Location',
            latitude: report.latitude,
            longitude: report.longitude,
            image_path: report.image_path,
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

  // Server-side pagination method
  const getReportsTable = async (options: TableOptions & { userId?: string }) => {
    try {
      serverLoading.value = true
      error.value = null

      const { page, itemsPerPage, sortBy, userId } = options
      const offset = (page - 1) * itemsPerPage

      // Build query with pagination
      let query = supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact' })
        .range(offset, offset + itemsPerPage - 1)

      // Add user filter if provided
      if (userId) {
        query = query.eq('user_id', userId)
      }

      // Add sorting if provided
      if (sortBy && sortBy.length > 0) {
        const sort = sortBy[0]
        query = query.order(sort.key, { ascending: sort.order === 'asc' })
      } else {
        // Default sort by created_at descending
        query = query.order('created_at', { ascending: false })
      }

      const { data: reportsData, count, error: reportsError } = await query

      if (reportsError) {
        throw new Error(`Error fetching reports: ${reportsError.message}`)
      }

      // Get user details for each report
      const reportsWithUserData = await Promise.all(
        (reportsData || []).map(async (report) => {
          // Get user data from auth.users using admin client
          const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
            report.user_id,
          )

          let citizenName = 'Unknown User'
          if (!userError && userData.user) {
            // Try both raw_user_meta_data and user_metadata
            const user = userData.user as ExtendedUser
            const rawMetadata = user.raw_user_meta_data
            const userMetadata = user.user_metadata

            const metadata = rawMetadata || userMetadata

            if (metadata && (metadata.firstname || metadata.lastname)) {
              citizenName =
                `${metadata.firstname || ''} ${metadata.lastname || ''}`.trim() || 'Unknown User'
            }
          }

          return {
            id: report.id,
            citizen: citizenName,
            user_id: report.user_id,
            type: report.report_type || 'General',
            description: report.description || 'No description provided',
            location: report.location || 'Unknown Location',
            latitude: report.latitude,
            longitude: report.longitude,
            image_path: report.image_path,
            priority: report.priority || 'Medium',
            status: report.status || 'Pending',
            dateSubmitted: report.created_at,
            created_at: report.created_at,
          }
        }),
      )

      serverReports.value = reportsWithUserData
      totalServerReports.value = count || 0
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching reports'
      console.error('Error in getReportsTable:', err)
    } finally {
      serverLoading.value = false
    }
  }

  return {
    // State
    reports,
    loading,
    error,

    // Server-side pagination state
    serverReports,
    totalServerReports,
    serverLoading,

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
    getReportsTable,
  }
})
