<script setup lang="ts">
import { useAuthUserStore } from '@/stores/authUser'
import { useReportsStore } from '@/stores/reports'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const reportsStore = useReportsStore()
const authUserStore = useAuthUserStore()

// Use storeToRefs to maintain reactivity for computed properties and refs
const {
  totalReports,
  resolvedReports,
  inProgressReports,
  pendingReports,
  criticalReports,
  todayReports,
  thisWeekReports,
  resolutionRate,
  loading,
} = storeToRefs(reportsStore)

onMounted(async () => {
  if (authUserStore.userRole === 'User' && authUserStore.userData?.id)
    await reportsStore.fetchReports(authUserStore.userData.id)
})
</script>

<template>
  <v-card
    title="Reports Dashboard"
    subtitle="Citizen report statistics and overview"
    class="border-md border-solid border-opacity-100 border-primary"
    elevation="8"
  >
    <v-card-text>
      <!-- Loading state -->
      <div v-if="loading" class="text-center pa-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <div class="text-h6 mt-4">Loading Reports...</div>
      </div>

      <!-- Dashboard content -->
      <template v-else>
        <v-row>
          <!-- Total Reports -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-icon size="40" color="primary" class="mb-2">mdi-clipboard-list</v-icon>
              <div class="text-h4 font-weight-bold text-primary">{{ totalReports }}</div>
              <div class="text-caption text-medium-emphasis">Total Reports</div>
            </div>
          </v-col>

          <!-- Pending Reports -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-icon size="40" color="info" class="mb-2">mdi-clock-outline</v-icon>
              <div class="text-h4 font-weight-bold text-info">{{ pendingReports }}</div>
              <div class="text-caption text-medium-emphasis">Pending</div>
            </div>
          </v-col>

          <!-- In Progress Reports -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-icon size="40" color="warning" class="mb-2">mdi-progress-clock</v-icon>
              <div class="text-h4 font-weight-bold text-warning">{{ inProgressReports }}</div>
              <div class="text-caption text-medium-emphasis">In Progress</div>
            </div>
          </v-col>

          <!-- Resolved Reports -->
          <v-col cols="6" sm="3">
            <div class="text-center">
              <v-icon size="40" color="success" class="mb-2">mdi-check-circle</v-icon>
              <div class="text-h4 font-weight-bold text-success">{{ resolvedReports }}</div>
              <div class="text-caption text-medium-emphasis">Resolved</div>
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <!-- Critical Reports -->
          <v-col cols="6">
            <v-alert
              type="error"
              variant="tonal"
              density="compact"
              :text="`${criticalReports} Critical Reports`"
              prepend-icon="mdi-alert-circle"
            ></v-alert>
          </v-col>

          <!-- This Week's Reports -->
          <v-col cols="6">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              :text="`${thisWeekReports} Reports This Week`"
              prepend-icon="mdi-calendar-week"
            ></v-alert>
          </v-col>
        </v-row>

        <!-- Quick Stats Row -->
        <v-row class="mt-2">
          <v-col cols="12">
            <div class="d-flex justify-space-around text-center">
              <div>
                <div class="text-caption text-medium-emphasis">Today</div>
                <div class="text-h6 font-weight-bold">{{ todayReports }}</div>
              </div>
              <v-divider vertical></v-divider>
              <div>
                <div class="text-caption text-medium-emphasis">Resolution Rate</div>
                <div class="text-h6 font-weight-bold text-success">{{ resolutionRate }}%</div>
              </div>
              <v-divider vertical></v-divider>
              <div>
                <div class="text-caption text-medium-emphasis">Avg. Response</div>
                <div class="text-h6 font-weight-bold text-info">3 days</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </template>
    </v-card-text>
  </v-card>
</template>
