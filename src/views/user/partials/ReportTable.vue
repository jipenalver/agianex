<script setup lang="ts">
import { reportsDummy } from './reportsTable'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

const { mobile } = useDisplay()

// Dummy data for citizen reports
const reports = ref([...reportsDummy])

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
      <!-- eslint-disable vue/valid-v-slot -->
      <v-data-table
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
            <v-btn icon="mdi-eye" size="small" variant="text" color="primary">
              <v-icon>mdi-eye</v-icon>
              <v-tooltip activator="parent" location="top"> View Details </v-tooltip>
            </v-btn>

            <v-btn icon="mdi-pencil" size="small" variant="text" color="warning">
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent" location="top"> Edit Report </v-tooltip>
            </v-btn>

            <v-btn icon="mdi-map-marker" size="small" variant="text" color="info">
              <v-icon>mdi-map-marker</v-icon>
              <v-tooltip activator="parent" location="top"> View on Map </v-tooltip>
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
