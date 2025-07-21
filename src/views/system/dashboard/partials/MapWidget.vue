<script setup lang="ts">
// import { onMounted, ref, watchEffect } from 'vue'
// import { useGeolocation } from '@vueuse/core'
</script>

<template>
  <v-card class="border-md border-solid border-opacity-100 border-primary" title="Citizen Report">
    <template #subtitle>
      <!-- <div class="text-wrap">
        {{ `LatLng: ${coords.latitude}, ${coords.longitude}` }} <br />
        {{ `Date/Time: ${new Date(locatedAt as number).toLocaleString()}` }}
      </div> -->
    </template>

    <template #append>
      <!-- <v-btn @click="onTrackingPause" variant="text" icon>
        <v-icon :icon="isTrackingPause ? 'mdi-refresh' : 'mdi-pause'"></v-icon>

        <v-tooltip activator="parent" location="top">
          {{ isTrackingPause ? 'Resume Tracking' : 'Pause Tracking' }}
        </v-tooltip>
      </v-btn> -->
    </template>

    <v-card-text>
      <div id="map"></div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
#map {
  width: 100%;
  height: 550px;
}
</style>
