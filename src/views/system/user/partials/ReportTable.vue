<script setup lang="ts">
import AppAlert from '@/components/common/AppAlert.vue'
import ReportsFormDialog from './ReportsFormDialog.vue'
import ReportsViewDialog from './ReportsViewDialog.vue'
import type { ReportData } from '@/stores/reports'
import { useReportsTable } from './reportsTable'
import { useDate, useDisplay } from 'vuetify'
import { ref } from 'vue'

const date = useDate()
const { mobile } = useDisplay()
const { tableOptions, formAction, onLoadItems, reportsStore, authUserStore } = useReportsTable()

// Dialog state
const isEditDialogVisible = ref(false)
const isViewDialogVisible = ref(false)
const selectedReport = ref<ReportData | null>(null)

// Open edit dialog
const openEditDialog = (report: ReportData) => {
  selectedReport.value = report
  isEditDialogVisible.value = true
}

// Open view dialog
const openViewDialog = (report: ReportData) => {
  selectedReport.value = report
  isViewDialogVisible.value = true
}

// Table headers
const headers = [
  { title: 'Report ID', key: 'id', sortable: true },
  { title: 'Citizen', key: 'citizen', sortable: false },
  { title: 'Type', key: 'type', sortable: true },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Location', key: 'location', sortable: true },
  { title: 'Priority', key: 'priority', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'dateSubmitted', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
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
      <!-- Alert for errors -->
      <AppAlert
        v-if="formAction.formAlert"
        v-model:is-alert-visible="formAction.formAlert"
        :form-message="formAction.formMessage"
        :form-status="formAction.formStatus"
      />

      <!-- Data table with server-side pagination -->
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table-server
        :headers="headers"
        :items="reportsStore.serverReports"
        :items-length="reportsStore.totalServerReports"
        :loading="tableOptions.isLoading"
        :items-per-page="tableOptions.itemsPerPage"
        @update:options="onLoadItems"
        class="elevation-1"
        :hide-default-header="mobile"
        :mobile="mobile"
      >
        <!-- Custom slot for id column -->
        <template #item.id="{ item }">
          <span class="font-weight-black"> RPT-{{ item.id }} </span>
        </template>

        <!-- Custom slot for description column -->
        <template #item.description="{ item }">
          <div class="text-wrap" :class="mobile ? 'text-justify' : ''" style="max-width: 550px">
            {{ item.description }}
          </div>
        </template>

        <!-- Custom slot for location column -->
        <template #item.location="{ item }">
          <div class="text-wrap" :class="mobile ? 'text-justify' : ''" style="max-width: 550px">
            {{
              item.location.includes('not') ? item.latitude + ', ' + item.longitude : item.location
            }}
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
          {{ date.format(item.dateSubmitted, 'fullDate') }}
        </template>

        <!-- Custom slot for actions column -->
        <template #item.actions="{ item }">
          <div class="d-flex" :class="mobile ? 'justify-end' : 'justify-center'">
            <v-btn @click="openViewDialog(item)" size="large" variant="text" density="compact" icon>
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top"> View Report </v-tooltip>
            </v-btn>

            <v-btn
              v-if="authUserStore.userRole !== 'User'"
              @click="openEditDialog(item)"
              size="large"
              variant="text"
              color="warning"
              density="compact"
              icon
            >
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
      </v-data-table-server>
    </v-card-text>
  </v-card>

  <!-- Edit Report Dialog -->
  <ReportsFormDialog
    v-model:is-dialog-visible="isEditDialogVisible"
    :item-data="selectedReport"
    :table-options="tableOptions"
  />

  <!-- View Report Dialog -->
  <ReportsViewDialog v-model:is-dialog-visible="isViewDialogVisible" :item-data="selectedReport" />
</template>
