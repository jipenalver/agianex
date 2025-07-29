<script setup lang="ts">
import { getMarkerColor, getStatusIcon } from './mapWidget'
import { GoogleMap, AdvancedMarker } from 'vue3-google-map'
import { computed, ref, watchEffect, onMounted } from 'vue'
import { useReportsStore } from '@/stores/reports'
import { useGeolocation } from '@vueuse/core'
import './map.css'

// Utilize pre-defined vue functions; GeoLocation
const { coords, locatedAt, resume, pause } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
})

// Load Variables
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const defaultLatLng = { lat: 8.928979, lng: 125.5035561 } // Butuan City Center
const isTrackingPause = ref(false)
const mapZoom = ref(15)

// Reports store
const reportsStore = useReportsStore()

// Load reports on component mount (for admin, show all reports)
onMounted(() => {
  // Only fetch reports if they haven't been loaded yet
  if (reportsStore.reports.length === 0 && !reportsStore.loading) {
    reportsStore.fetchReports()
  }
})

// Convert reports to markers format
const reportMarkers = computed(() => {
  return reportsStore.reports.map((report) => {
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

// Computed center for the map
const center = computed(() => {
  if (isTrackingPause.value) return defaultLatLng

  if (
    coords.value.latitude !== Number.POSITIVE_INFINITY &&
    coords.value.longitude !== Number.POSITIVE_INFINITY
  )
    return { lat: coords.value.latitude, lng: coords.value.longitude }

  return defaultLatLng
})

// Marker options as ref state
const markerOptions = ref({
  position: center.value,
  title: 'You are Here!',
})

// Watch center changes to update markerOptions position and zoom
watchEffect(() => {
  // Update marker position
  markerOptions.value.position = center.value

  // Update zoom when location is found and tracking is active
  if (
    !isTrackingPause.value &&
    coords.value.latitude !== Number.POSITIVE_INFINITY &&
    coords.value.longitude !== Number.POSITIVE_INFINITY
  ) {
    mapZoom.value = 17
  }
})

// Toggle Geolocation Tracking
const onTrackingPause = () => {
  isTrackingPause.value = !isTrackingPause.value

  // Pause Tracking
  if (isTrackingPause.value) {
    pause()
    mapZoom.value = 15
  }
  // Resume Tracking
  else {
    resume()
    mapZoom.value = 17
  }
}

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
</script>

<template>
  <v-row>
    <v-col cols="12" lg="9">
      <v-card
        class="border-md border-solid border-opacity-100 border-primary"
        elevation="8"
        title="Citizen Report"
      >
        <template #subtitle>
          <div class="text-wrap">
            {{ `LatLng: ${coords.latitude}, ${coords.longitude}` }} <br />
            {{ `Date/Time: ${new Date(locatedAt as number).toLocaleString()}` }}
          </div>
        </template>

        <template #append>
          <v-btn @click="onTrackingPause" variant="text" icon>
            <v-icon :icon="isTrackingPause ? 'mdi-refresh' : 'mdi-pause'"></v-icon>

            <v-tooltip activator="parent" location="top">
              {{ isTrackingPause ? 'Resume Tracking' : 'Pause Tracking' }}
            </v-tooltip>
          </v-btn>
        </template>

        <v-card-text>
          <!-- Loading state -->
          <div v-if="reportsStore.loading" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
            <div class="text-h6 mt-4">Loading Reports...</div>
          </div>
          <!-- Map Container -->
          <div v-else style="height: 400px; width: 100%">
            <GoogleMap
              :key="reportMarkers.length"
              id="map"
              :api-key="apiKey"
              :center="center"
              :zoom="mapZoom"
              map-id="DEMO_MAP_ID"
              style="height: 100%; width: 100%"
            >
              <!-- User Location Marker -->
              <AdvancedMarker :options="markerOptions">
                <template #content>
                  <div id="user-marker">📍 You are here!</div>
                </template>
              </AdvancedMarker>

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
                        {{ new Date(report.dateSubmitted).toLocaleDateString() }}
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
      <v-card class="border-md border-solid border-opacity-100 border-primary" title="Filters">
        <v-card-text>
          <v-row dense>
            <!-- Report Type Filter -->
            <v-col cols="12">
              <v-select
                label="Report Type"
                :items="[
                  'All Reports',
                  'Road Issues',
                  'Public Safety',
                  'Infrastructure',
                  'Environmental',
                  'Utilities',
                  'Public Transport',
                ]"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>

            <!-- Status Filter -->
            <v-col cols="12">
              <v-select
                label="Status"
                :items="['All Status', 'Pending', 'In Progress', 'Resolved', 'Rejected']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>

            <!-- Priority Filter -->
            <v-col cols="12">
              <v-select
                label="Priority"
                :items="['All Priorities', 'Low', 'Medium', 'High', 'Critical']"
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>

            <!-- Date Range -->
            <v-col cols="12">
              <v-text-field
                label="From Date"
                type="date"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-text-field
                label="To Date"
                type="date"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>

            <!-- Location Radius -->
            <v-col cols="12">
              <v-slider
                label="Search Radius (km)"
                :min="1"
                :max="50"
                :step="1"
                :model-value="10"
                show-ticks="always"
                tick-size="4"
              >
                <template #append>
                  <v-text-field
                    :model-value="10"
                    type="number"
                    style="width: 80px"
                    density="compact"
                    variant="outlined"
                    hide-details
                  ></v-text-field>
                </template>
              </v-slider>
            </v-col>

            <!-- Show My Reports Only -->
            <v-col cols="12">
              <v-checkbox label="Show my reports only" density="compact"></v-checkbox>
            </v-col>

            <!-- Filter Actions -->
            <v-col cols="12">
              <v-btn color="primary" variant="elevated" block prepend-icon="mdi-filter">
                Apply Filters
              </v-btn>
            </v-col>

            <v-col cols="12">
              <v-btn variant="outlined" block prepend-icon="mdi-filter-off"> Clear Filters </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
