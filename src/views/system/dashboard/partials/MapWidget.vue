<script setup lang="ts">
import {
  GoogleMap,
  AdvancedMarker,
  // Marker
} from 'vue3-google-map'
import { computed, ref, watchEffect } from 'vue'
import { useGeolocation } from '@vueuse/core'

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

// Dummy report markers data scattered within Butuan City
const reportMarkers = ref([
  {
    id: 'RPT-001',
    position: { lat: 8.935142, lng: 125.508743 },
    type: 'Road Issues',
    description: 'Large pothole on J.C. Aquino Avenue',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-002',
    position: { lat: 8.921547, lng: 125.495832 },
    type: 'Infrastructure',
    description: 'Broken water pipe affecting Langihan Road',
    priority: 'Critical',
    status: 'Pending',
  },
  {
    id: 'RPT-003',
    position: { lat: 8.940823, lng: 125.517429 },
    type: 'Road Issues',
    description: 'Damaged road sign near Butuan National High School',
    priority: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'RPT-004',
    position: { lat: 8.915632, lng: 125.489157 },
    type: 'Infrastructure',
    description: 'Cracked pavement on Montilla Boulevard',
    priority: 'Low',
    status: 'Pending',
  },
  {
    id: 'RPT-005',
    position: { lat: 8.933821, lng: 125.512638 },
    type: 'Road Issues',
    description: 'Traffic light malfunction at Rizal Street intersection',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-006',
    position: { lat: 8.925174, lng: 125.501832 },
    type: 'Infrastructure',
    description: 'Damaged sidewalk near Guingona Park',
    priority: 'Medium',
    status: 'Pending',
  },
  {
    id: 'RPT-007',
    position: { lat: 8.931456, lng: 125.507291 },
    type: 'Road Issues',
    description: 'Flooded area on San Mateo Street during rain',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-008',
    position: { lat: 8.922385, lng: 125.498745 },
    type: 'Infrastructure',
    description: 'Broken streetlight on P. Burgos Street',
    priority: 'Medium',
    status: 'Resolved',
  },
])

// Get marker color based on priority
const getMarkerColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return '#f44336' // red
    case 'High':
      return '#ff9800' // orange
    case 'Medium':
      return '#2196f3' // blue
    case 'Low':
      return '#4caf50' // green
    default:
      return '#9e9e9e' // grey
  }
}

// Get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Resolved':
      return '✓'
    case 'In Progress':
      return '⏳'
    case 'Pending':
      return '⏸'
    default:
      return '❓'
  }
}

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
          <GoogleMap
            id="map"
            :api-key="apiKey"
            :center="center"
            :zoom="mapZoom"
            map-id="DEMO_MAP_ID"
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
                  :style="{ backgroundColor: getMarkerColor(report.priority) }"
                >
                  <div class="marker-header">
                    <span class="status-icon">{{ getStatusIcon(report.status) }}</span>
                    <span class="report-id">{{ report.id }}</span>
                  </div>
                  <div class="marker-content">
                    <div class="report-type">{{ report.type }}</div>
                    <div class="report-description">{{ report.description }}</div>
                    <div class="report-priority">Priority: {{ report.priority }}</div>
                    <div class="report-status">Status: {{ report.status }}</div>
                  </div>
                </div>
              </template>
            </AdvancedMarker>
          </GoogleMap>
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

<style scoped>
#map {
  width: 100%;
  height: 59dvh;
}

#user-marker {
  background: #2196f3;
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid white;
}

.report-marker {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid;
  min-width: 200px;
  max-width: 250px;
}

.marker-header {
  padding: 8px;
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px 6px 0 0;
}

.status-icon {
  font-size: 16px;
}

.report-id {
  font-size: 12px;
}

.marker-content {
  padding: 8px;
  background: white;
  border-radius: 0 0 6px 6px;
}

.report-type {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
}

.report-description {
  color: #666;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1.3;
}

.report-priority {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 2px;
}

.report-status {
  font-size: 11px;
  color: #666;
}

/* Priority-based header colors */
.report-marker[style*='#f44336'] .marker-header {
  background-color: #f44336;
}
.report-marker[style*='#ff9800'] .marker-header {
  background-color: #ff9800;
}
.report-marker[style*='#2196f3'] .marker-header {
  background-color: #2196f3;
}
.report-marker[style*='#4caf50'] .marker-header {
  background-color: #4caf50;
}
.report-marker[style*='#9e9e9e'] .marker-header {
  background-color: #9e9e9e;
}
</style>
