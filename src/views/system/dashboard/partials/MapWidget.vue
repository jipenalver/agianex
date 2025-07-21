<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, ref, watchEffect } from 'vue'
import { useGeolocation } from '@vueuse/core'
import leaflet from 'leaflet'

// Utilize pre-defined vue functions; GeoLocation
const { coords, locatedAt, resume, pause } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
})

// Load Variables
const map = ref<any>()
const marker = ref<any>()
const defaultLatLng: [number, number] = [8.95555279469484, 125.59780764933492] // CSU Coords
const isTrackingPause = ref(false)

// Toggle Geolocation Tracking
const onTrackingPause = () => {
  isTrackingPause.value = !isTrackingPause.value

  // Pause Tracking
  if (isTrackingPause.value) {
    pause()
    map.value.setView(defaultLatLng, 15)
  }
  // Resume Tracking
  else {
    resume()
    setMapMarker()
  }
}

// Set Map Marker Function
const setMapMarker = () => {
  const newLatLng = [coords.value.latitude, coords.value.longitude]

  // Update map view and marker position
  map.value.setView(newLatLng, 17)

  // If the marker is not on the map, add it
  if (!marker.value._map) marker.value.addTo(map)

  // Set the marker's position to the new coordinates
  marker.value.setLatLng(newLatLng).openPopup()
}

// Watch Coords variable if it changes
watchEffect(() => {
  if (
    coords.value.latitude !== Number.POSITIVE_INFINITY &&
    coords.value.longitude !== Number.POSITIVE_INFINITY
  )
    setMapMarker()
})

// Load Functions during component rendering
onMounted(() => {
  // Load Map, set view to default coords, Zoom = 15
  map.value = leaflet.map('map').setView(defaultLatLng, 15)

  // Load OpenStreetmap Map Layer
  leaflet
    .tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
    .addTo(map.value)

  // Load Marker, set view to default coords
  marker.value = leaflet.marker(defaultLatLng).addTo(map.value).bindPopup('You are here!')
})
</script>

<template>
  <v-card title="Current Location">
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
      <div id="map"></div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
#map {
  width: 100%;
  height: 500px;
}
</style>
