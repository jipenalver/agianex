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

// Interface for raw report data from Supabase
interface RawReportData {
  id: number
  user_id: string
  report_type?: string
  description?: string
  location?: string
  latitude?: string
  longitude?: string
  image_path?: string
  priority?: string
  status?: string
  created_at: string
}

// Interface for updating report data
export interface UpdateReportData {
  id: number
  report_type?: string
  priority?: string
  status?: string
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

  // Realtime subscription state
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  // Helper function to transform reports with user data
  const transformReportsWithUserData = async (
    reportsData: RawReportData[],
  ): Promise<ReportData[]> => {
    return Promise.all(
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
  } // Computed - Basic statistics
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

      // Transform reports with user data
      reports.value = await transformReportsWithUserData(reportsData || [])
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

  // Update report method
  const updateReport = async (reportData: UpdateReportData) => {
    try {
      serverLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('reports')
        .update({
          report_type: reportData.report_type,
          priority: reportData.priority,
          status: reportData.status,
        })
        .eq('id', reportData.id)
        .select()

      if (updateError) {
        throw new Error(`Error updating report: ${updateError.message}`)
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while updating the report'
      error.value = errorMessage
      return { data: null, error: errorMessage }
    } finally {
      serverLoading.value = false
    }
  }

  // Server-side pagination method
  const getReportsTable = async (options: TableOptions & { userId?: string }) => {
    try {
      serverLoading.value = true
      error.value = null

      const { page, itemsPerPage, sortBy, userId } = options
      const offset = (page - 1) * itemsPerPage

      // Build query with pagination
      let query = supabase
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

      // Transform reports with user data
      serverReports.value = await transformReportsWithUserData(reportsData || [])
      totalServerReports.value = count || 0
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred while fetching reports'
      console.error('Error in getReportsTable:', err)
    } finally {
      serverLoading.value = false
    }
  }

  // Realtime subscription methods
  /**
   * Subscribe to realtime changes on the reports table
   * Listens for INSERT, UPDATE, and DELETE events
   * Automatically updates the local store state
   *
   * Usage:
   * - Call this in onMounted of components that need real-time updates
   * - Don't forget to call unsubscribeFromReports() in onUnmounted
   */
  const subscribeToReports = async () => {
    try {
      // Unsubscribe from existing channel if any
      if (realtimeChannel) {
        await unsubscribeFromReports()
      }

      // Create a new channel for reports table
      realtimeChannel = supabase
        .channel('reports-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'reports',
          },
          async (payload) => {
            console.log('Realtime event:', payload)

            switch (payload.eventType) {
              case 'INSERT':
                await handleReportInsert(payload.new as RawReportData)
                break
              case 'UPDATE':
                await handleReportUpdate(payload.new as RawReportData)
                break
              case 'DELETE':
                handleReportDelete(payload.old.id)
                break
            }
          },
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
        })
    } catch (err) {
      console.error('Error setting up realtime subscription:', err)
    }
  }

  const unsubscribeFromReports = async () => {
    if (realtimeChannel) {
      await supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
      console.log('Unsubscribed from reports realtime')
    }
  }

  // Handle realtime events
  const handleReportInsert = async (newReport: RawReportData) => {
    try {
      // Transform the new report with user data
      const transformedReports = await transformReportsWithUserData([newReport])
      const transformedReport = transformedReports[0]

      // Add to the main reports array (at the beginning since it's newest)
      reports.value.unshift(transformedReport)

      // If we're showing paginated data and it's on the first page, add to serverReports too
      if (serverReports.value.length > 0) {
        serverReports.value.unshift(transformedReport)
        // Remove the last item if we exceed the page size
        if (serverReports.value.length > 10) {
          // Assuming default page size of 10
          serverReports.value.pop()
        }
        totalServerReports.value += 1
      }

      console.log('New report added via realtime:', transformedReport)
    } catch (err) {
      console.error('Error handling report insert:', err)
    }
  }

  const handleReportUpdate = async (updatedReport: RawReportData) => {
    try {
      // Transform the updated report with user data
      const transformedReports = await transformReportsWithUserData([updatedReport])
      const transformedReport = transformedReports[0]

      // Update in main reports array
      const reportIndex = reports.value.findIndex((r) => r.id === updatedReport.id)
      if (reportIndex !== -1) {
        reports.value[reportIndex] = transformedReport
      }

      // Update in server reports array if it exists there
      const serverReportIndex = serverReports.value.findIndex((r) => r.id === updatedReport.id)
      if (serverReportIndex !== -1) {
        serverReports.value[serverReportIndex] = transformedReport
      }

      console.log('Report updated via realtime:', transformedReport)
    } catch (err) {
      console.error('Error handling report update:', err)
    }
  }

  const handleReportDelete = (reportId: number) => {
    // Remove from main reports array
    const reportIndex = reports.value.findIndex((r) => r.id === reportId)
    if (reportIndex !== -1) {
      reports.value.splice(reportIndex, 1)
    }

    // Remove from server reports array
    const serverReportIndex = serverReports.value.findIndex((r) => r.id === reportId)
    if (serverReportIndex !== -1) {
      serverReports.value.splice(serverReportIndex, 1)
      totalServerReports.value -= 1
    }

    console.log('Report deleted via realtime:', reportId)
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
    updateReport,

    // Realtime methods
    subscribeToReports,
    unsubscribeFromReports,
  }
})
