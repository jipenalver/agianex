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
const defaultLatLng = { lat: 8.9556151, lng: 125.5978901 } // CSU Coords
const isTrackingPause = ref(false)
const mapZoom = ref(15)

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

// Computed marker position
// const marker = computed(() => {
//   if (isTrackingPause.value) return defaultLatLng

//   if (
//     coords.value.latitude !== Number.POSITIVE_INFINITY &&
//     coords.value.longitude !== Number.POSITIVE_INFINITY
//   )
//     return { lat: coords.value.latitude, lng: coords.value.longitude }

//   return defaultLatLng
// })

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
            <!-- <Marker :options="{ position: marker }" /> -->
            <AdvancedMarker :options="markerOptions">
              <template #content>
                <div id="marker">You are here!</div>
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

#marker {
  background: white;
  color: black;
  padding: 5px;
  border-radius: 5px;
}
</style>
