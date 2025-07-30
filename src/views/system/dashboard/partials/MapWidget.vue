<script setup lang="ts">
import { getMarkerColor, getStatusIcon } from './mapWidget'
import { GoogleMap, AdvancedMarker } from 'vue3-google-map'
import { useReportsStore } from '@/stores/reports'
import { useMapFilters } from './mapFilters'
import { computed, ref } from 'vue'
import { useDate } from 'vuetify'

const date = useDate()

// Load Variables
const mapZoom = ref(12)
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const defaultLatLng = { lat: 8.928979, lng: 125.5035561 } // Butuan City Center

// Reports store
const reportsStore = useReportsStore()

// Map filters
const { filters, reportTypeOptions, statusOptions, priorityOptions, applyFilters, clearFilters } =
  useMapFilters()

// State to track if filters are applied
const filtersApplied = ref(false)

// Loading state for refresh
const refreshing = ref(false)

// Computed filtered reports
const filteredReports = computed(() => {
  if (filtersApplied.value) {
    return applyFilters(reportsStore.reports)
  }
  return reportsStore.reports
})

// Apply filters function
const handleApplyFilters = () => {
  filtersApplied.value = true
}

// Clear filters function
const handleClearFilters = () => {
  clearFilters()
  filtersApplied.value = false
}

// Convert reports to markers format
const reportMarkers = computed(() => {
  return filteredReports.value.map((report) => {
    // Use actual coordinates if available, otherwise use default Butuan City area
    const lat = report.latitude
      ? parseFloat(report.latitude)
      : 8.928979 + (Math.random() - 0.5) * 0.1
    const lng = report.longitude
      ? parseFloat(report.longitude)
      : 125.5035561 + (Math.random() - 0.5) * 0.1

    return {
      id: report.id.toString(),
      type: report.type,
      description: report.description,
      priority: report.priority,
      status: report.status,
      citizen: report.citizen,
      location: report.location,
      image_path: report.image_path,
      dateSubmitted: report.dateSubmitted,
      position: { lat, lng },
    }
  })
})

// Marker expansion state
const expandedMarkers = ref<Set<string>>(new Set())

// Toggle marker expansion
const toggleMarker = (reportId: string) => {
  if (expandedMarkers.value.has(reportId)) {
    expandedMarkers.value.delete(reportId)
  } else {
    expandedMarkers.value.add(reportId)
  }
}

// Check if marker is expanded
const isMarkerExpanded = (reportId: string) => {
  return expandedMarkers.value.has(reportId)
}

// Handle image load errors
const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  console.log('Failed to load image:', img.src)
}

// Refresh map data
const refreshMap = async () => {
  try {
    refreshing.value = true

    // Refresh reports data from the store
    await reportsStore.refreshReports()

    // Clear any expanded markers to reset the view
    expandedMarkers.value.clear()

    console.log('Map refreshed with updated reports data')
  } catch (error) {
    console.error('Error refreshing map:', error)
  } finally {
    refreshing.value = false
  }
}
</script>

<template>
  <v-row>
    <v-col cols="12" lg="9">
      <v-card
        class="border-md border-solid border-opacity-100 border-primary"
        elevation="8"
        title="Citizen Report"
        subtitle="Real-time citizen reports on the map"
      >
        <template #append>
          <v-btn
            variant="text"
            icon
            @click="refreshMap"
            :loading="refreshing"
            :disabled="refreshing"
          >
            <v-icon icon="mdi-refresh"></v-icon>

            <v-tooltip activator="parent" location="top"> Refresh Map </v-tooltip>
          </v-btn>
        </template>

        <v-card-text>
          <!-- Loading state -->
          <div v-if="reportsStore.loading" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <div class="text-h6 mt-4">Loading Reports...</div>
          </div>
          <!-- Map Container -->
          <div v-else style="height: 495px; width: 100%">
            <GoogleMap
              id="map"
              :api-key="apiKey"
              :center="defaultLatLng"
              :zoom="mapZoom"
              map-id="DEMO_MAP_ID"
              style="height: 100%; width: 100%"
            >
              <!-- Report Markers -->
              <AdvancedMarker
                v-for="report in reportMarkers"
                :key="report.id"
                :options="{ position: report.position }"
              >
                <template #content>
                  <div
                    class="report-marker"
                    :class="{ expanded: isMarkerExpanded(report.id) }"
                    :style="{ backgroundColor: getMarkerColor(report.priority) }"
                    @click="toggleMarker(report.id)"
                  >
                    <div class="marker-header">
                      <span class="status-icon">{{ getStatusIcon(report.status) }}</span>
                      <span class="report-id">RPT-{{ report.id }}</span>
                      <span class="expand-icon">{{
                        isMarkerExpanded(report.id) ? '▼' : '▶'
                      }}</span>
                    </div>
                    <div v-if="isMarkerExpanded(report.id)" class="marker-content">
                      <div class="report-citizen">By: {{ report.citizen }}</div>
                      <div class="report-type">{{ report.type }}</div>
                      <div class="report-description">{{ report.description }}</div>
                      <div class="report-location">📍 {{ report.location }}</div>

                      <!-- Report Image -->
                      <div v-if="report.image_path" class="report-image-container">
                        <img
                          :src="report.image_path"
                          :alt="`Report ${report.id} image`"
                          class="report-image"
                          @error="onImageError"
                        />
                      </div>

                      <div class="report-priority">Priority: {{ report.priority }}</div>
                      <div class="report-status">Status: {{ report.status }}</div>
                      <div class="report-date">
                        {{ date.format(report.dateSubmitted, 'fullDate') }}
                      </div>
                    </div>
                  </div>
                </template>
              </AdvancedMarker>
            </GoogleMap>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" lg="3">
      <v-card
        class="border-md border-solid border-opacity-100 border-primary"
        title="Filters"
        subtitle="Filter reports by type, status, and priority"
      >
        <v-card-text>
          <v-row dense>
            <!-- Report Type Filter -->
            <v-col cols="12">
              <v-select
                class="mt-3"
                v-model="filters.reportType"
                label="Report Type"
                :items="reportTypeOptions"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>

            <!-- Status Filter -->
            <v-col cols="12">
              <v-select
                class="mt-3"
                v-model="filters.status"
                label="Status"
                :items="statusOptions"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>

            <!-- Priority Filter -->
            <v-col cols="12">
              <v-select
                class="mt-3"
                v-model="filters.priority"
                label="Priority"
                :items="priorityOptions"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>

            <!-- Date Range -->
            <v-col cols="12">
              <v-text-field
                class="mt-3"
                v-model="filters.fromDate"
                label="From Date"
                type="date"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                class="mt-3"
                v-model="filters.toDate"
                label="To Date"
                type="date"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <!-- Filter Actions -->
            <v-col cols="12">
              <v-btn
                @click="handleApplyFilters"
                color="primary"
                variant="elevated"
                block
                prepend-icon="mdi-filter"
              >
                Apply Filters
              </v-btn>
            </v-col>

            <v-col cols="12">
              <v-btn
                @click="handleClearFilters"
                variant="outlined"
                block
                prepend-icon="mdi-filter-off"
              >
                Clear Filters
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
@import './map.css';
</style>
