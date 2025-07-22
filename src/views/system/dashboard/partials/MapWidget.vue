<script setup lang="ts">
import { GoogleMap, Marker } from 'vue3-google-map'
import { computed, ref, watchEffect } from 'vue'
import { useGeolocation } from '@vueuse/core'

// Utilize pre-defined vue functions; GeoLocation
const { coords, locatedAt, resume, pause } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
})

// Load Variables
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
const marker = computed(() => {
  if (isTrackingPause.value) return defaultLatLng

  if (
    coords.value.latitude !== Number.POSITIVE_INFINITY &&
    coords.value.longitude !== Number.POSITIVE_INFINITY
  )
    return { lat: coords.value.latitude, lng: coords.value.longitude }

  return defaultLatLng
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

// Watch Coords variable if it changes to update zoom when location is found
watchEffect(() => {
  if (
    !isTrackingPause.value &&
    coords.value.latitude !== Number.POSITIVE_INFINITY &&
    coords.value.longitude !== Number.POSITIVE_INFINITY
  )
    mapZoom.value = 17
})
</script>

<template>
  <v-card class="border-md border-solid border-opacity-100 border-primary" title="Citizen Report">
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
        api-key="AIzaSyBiyf0K2SL3k9iXh7cKB4mB7eo3g4jd39k"
        style="width: 100%; height: 500px"
        :center="center"
        :zoom="mapZoom"
      >
        <Marker :options="{ position: marker }" />
      </GoogleMap>
    </v-card-text>
  </v-card>
</template>

<style scoped>
#map {
  width: 100%;
  height: 550px;
}
</style>
