<script setup lang="ts">
import { supabase, supabaseAdmin } from '@/utils/supabase'
import { useAuthUserStore } from '@/stores/authUser'
import { useDisplay } from 'vuetify'
import { ref, onMounted } from 'vue'

const { mobile } = useDisplay()
const authUserData = useAuthUserStore()

// Interface for report data
interface ReportData {
  id: number
  citizen: string
  type: string
  description: string
  location: string
  priority: string
  status: string
  dateSubmitted: string
}

// Reports data from Supabase
const reports = ref<ReportData[]>([])
const loading = ref(true)

// Fetch reports from Supabase
const fetchReports = async () => {
  try {
    loading.value = true

    // Fetch reports from Supabase
    let query = supabase.from('reports').select('*').order('created_at', {
      ascending: false,
    })

    if (authUserData.userRole === 'User') query = query.eq('user_id', authUserData.userData?.id)

    const { data: reportsData, error: reportsError } = await query

    if (reportsError) {
      console.error('Error fetching reports:', reportsError)
      return
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
          type: report.report_type || 'General',
          description: report.description || 'No description provided',
          location: report.location || 'Unknown Location',
          priority: report.priority || 'Medium',
          status: report.status || 'Pending',
          dateSubmitted: report.created_at,
        }
      }),
    )

    reports.value = reportsWithUserData
  } catch (error) {
    console.error('Error in fetchReports:', error)
  } finally {
    loading.value = false
  }
}

// Load reports on component mount
onMounted(() => {
  fetchReports()
})

// Table headers
const headers = [
  { title: 'Report ID', key: 'id', sortable: true },
  { title: 'Citizen', key: 'citizen', sortable: true },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Location', key: 'location', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'dateSubmitted', sortable: true },
  ...(authUserData.userRole !== 'User'
    ? [{ title: 'Actions', key: 'actions', sortable: false }]
    : []),
]

// Status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Resolved':
      return 'success'
    case 'In Progress':
      return 'warning'
    case 'Pending':
      return 'info'
    case 'Rejected':
      return 'error'
    default:
      return 'default'
  }
}

// Priority colors
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return 'error'
    case 'High':
      return 'warning'
    case 'Medium':
      return 'info'
    case 'Low':
      return 'success'
    default:
      return 'default'
  }
}
</script>

<template>
  <v-card
    title="Reports Submitted"
    class="border-md border-solid border-opacity-100 border-primary"
    elevation="8"
  >
    <v-card-text>
      <!-- Loading state -->
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="text-h6 mt-4">Loading Reports...</div>
      </div>

      <!-- Data table -->
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table
        v-else
        :headers="headers"
        :items="reports"
        :items-per-page="5"
        class="elevation-1"
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <!-- Custom slot for description column -->
        <template #item.description="{ item }">
          <div class="text-truncate" style="max-width: 200px">
            {{ item.description }}
            <v-tooltip activator="parent" location="top">
              {{ item.description }}
            </v-tooltip>
          </div>
        </template>

        <!-- Custom slot for priority column -->
        <template #item.priority="{ item }">
          <v-chip :color="getPriorityColor(item.priority)" size="small" variant="flat">
            {{ item.priority }}
          </v-chip>
        </template>

        <!-- Custom slot for status column -->
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Custom slot for date column -->
        <template #item.dateSubmitted="{ item }">
          {{ new Date(item.dateSubmitted).toLocaleDateString() }}
        </template>

        <!-- Custom slot for actions column -->
        <template #item.actions="{}">
          <div class="d-flex" :class="mobile ? 'justify-end' : 'justify-center'">
            <v-btn icon="mdi-pencil" size="small" variant="text" color="warning">
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top"> Edit Report </v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- Custom slot for no data -->
        <template #no-data>
          <div class="text-center pa-4">
            <v-icon size="48" color="grey">mdi-clipboard-text-off</v-icon>
            <div class="text-h6 mt-2">No Reports Found</div>
            <div class="text-caption">No citizen reports have been submitted yet.</div>
          </div>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>
