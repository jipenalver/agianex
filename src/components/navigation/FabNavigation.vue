<script setup lang="ts">
import { ref } from 'vue'

const isFabOpen = ref(false)
</script>

<template>
  <v-fab id="fab" variant="elevated" color="primary" size="x-large" icon app>
    <v-icon>{{ isFabOpen ? 'mdi-close' : 'mdi-human-greeting-proximity' }}</v-icon>
    <v-speed-dial
      v-model="isFabOpen"
      location="bottom center"
      transition="scale-transition"
      activator="parent"
    >
      <v-btn key="2" color="info" size="large" icon>
        <v-icon size="large">mdi-plus</v-icon>
      </v-btn>

      <v-btn key="1" color="secondary" size="large" icon>
        <v-icon size="large">mdi-camera</v-icon>
      </v-btn>
    </v-speed-dial>
  </v-fab>
</template>

<style scoped>
#fab {
  margin-bottom: 3.75rem;
}
</style>
