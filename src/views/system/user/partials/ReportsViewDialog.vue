<script setup lang="ts">
import type { ReportData } from '@/stores/reports'
import { useDate, useDisplay } from 'vuetify'
import { computed } from 'vue'

interface Props {
  isDialogVisible: boolean
  itemData: ReportData | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isDialogVisible': [value: boolean]
}>()

const date = useDate()
const { mdAndDown, xs } = useDisplay()

const dialogValue = computed({
  get: () => props.isDialogVisible,
  set: (value: boolean) => emit('update:isDialogVisible', value),
})

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

// Format coordinates for display
const formatCoordinates = (lat: string | null | undefined, lng: string | null | undefined) => {
  if (!lat || !lng) return 'Not available'
  return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`
}

// Open location in Google Maps
const openInMaps = () => {
  if (props.itemData?.latitude && props.itemData?.longitude) {
    const url = `https://www.google.com/maps?q=${props.itemData.latitude},${props.itemData.longitude}`
    window.open(url, '_blank')
  }
}

// View full-size image
const viewFullImage = () => {
  if (props.itemData?.image_path) {
    window.open(props.itemData.image_path, '_blank')
  }
}
</script>

<template>
  <v-dialog v-model="dialogValue" max-width="900" :fullscreen="mdAndDown" persistent scrollable>
    <v-card v-if="itemData" class="pa-0">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between bg-primary text-white">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-eye</v-icon>
          <span>Report Details - RPT-{{ itemData.id }}</span>
        </div>
        <v-btn icon variant="text" @click="dialogValue = false" color="white">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-0">
        <v-container fluid class="pa-6">
          <v-row>
            <!-- Left Column: Basic Information & Description -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="bg-grey-lighten-4">
                  <v-icon class="me-2">mdi-information</v-icon>
                  Basic Information
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-row dense>
                    <v-col cols="12">
                      <div class="text-caption text-grey">Report ID</div>
                      <div class="text-h6 font-weight-bold">RPT-{{ itemData.id }}</div>
                    </v-col>
                    <v-col cols="12">
                      <div class="text-caption text-grey">Submitted By</div>
                      <div class="text-body-1">{{ itemData.citizen }}</div>
                    </v-col>
                    <v-col cols="12">
                      <div class="text-caption text-grey">Report Type</div>
                      <v-chip color="primary" size="small" variant="outlined">
                        {{ itemData.type || 'General' }}
                      </v-chip>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Priority</div>
                      <v-chip
                        :color="getPriorityColor(itemData.priority)"
                        size="small"
                        variant="flat"
                      >
                        {{ itemData.priority }}
                      </v-chip>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-grey">Status</div>
                      <v-chip :color="getStatusColor(itemData.status)" size="small" variant="flat">
                        {{ itemData.status }}
                      </v-chip>
                    </v-col>
                    <v-col cols="12">
                      <div class="text-caption text-grey">Date Submitted</div>
                      <div class="text-body-1">
                        {{ date.format(itemData.dateSubmitted, 'fullDateWithWeekday') }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Description -->
              <v-card variant="outlined" height="407">
                <v-card-title class="bg-grey-lighten-4">
                  <v-icon class="me-2">mdi-text</v-icon>
                  Description
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="text-body-1" style="white-space: pre-wrap; line-height: 1.6">
                    {{ itemData.description || 'No description provided.' }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Right Column: Location Information and Image -->
            <v-col cols="12" md="6">
              <!-- Location Information -->
              <v-card variant="outlined" class="mb-4" :min-height="xs ? '' : '347'">
                <v-card-title class="bg-grey-lighten-4">
                  <v-icon class="me-2">mdi-map-marker</v-icon>
                  Location Information
                </v-card-title>
                <v-card-text class="pa-4">
                  <v-row dense>
                    <v-col cols="12">
                      <div class="text-caption text-grey">Address</div>
                      <div class="text-body-1 mb-2">
                        {{
                          itemData.location === 'Location not found'
                            ? 'Address not available'
                            : itemData.location
                        }}
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <div class="text-caption text-grey">Coordinates</div>
                      <div class="text-body-1 mb-2">
                        {{ formatCoordinates(itemData.latitude, itemData.longitude) }}
                      </div>
                    </v-col>
                    <v-col cols="12" v-if="itemData.latitude && itemData.longitude">
                      <v-btn
                        @click="openInMaps"
                        color="primary"
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-map"
                      >
                        View on Google Maps
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Image -->
              <v-card variant="outlined" v-if="itemData.image_path" height="xs ? '' : '360'">
                <v-card-title class="bg-grey-lighten-4">
                  <v-icon class="me-2">mdi-image</v-icon>
                  Report Image
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="text-center">
                    <v-img
                      :src="itemData.image_path"
                      alt="Report Image"
                      class="mx-auto rounded cursor-pointer"
                      max-width="100%"
                      height="284px"
                      cover
                      @click="viewFullImage"
                    >
                      <template #placeholder>
                        <div class="d-flex align-center justify-center fill-height">
                          <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </div>
                      </template>
                      <template #error>
                        <div
                          class="d-flex align-center justify-center fill-height bg-grey-lighten-3"
                        >
                          <div class="text-center">
                            <v-icon size="48" color="grey">mdi-image-broken</v-icon>
                            <div class="text-caption mt-2">Image not available</div>
                          </div>
                        </div>
                      </template>
                    </v-img>
                    <v-btn
                      @click="viewFullImage"
                      color="primary"
                      variant="outlined"
                      size="small"
                      class="mt-3"
                      prepend-icon="mdi-magnify-plus"
                    >
                      View Full Size
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- No Image Card -->
              <v-card variant="outlined" v-else>
                <v-card-title class="bg-grey-lighten-4">
                  <v-icon class="me-2">mdi-image-off</v-icon>
                  Report Image
                </v-card-title>
                <v-card-text class="pa-4">
                  <div class="text-center py-8">
                    <v-icon size="64" color="grey-lighten-1">mdi-image-off</v-icon>
                    <div class="text-body-1 mt-2 text-grey">No image attached to this report</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <!-- Footer Actions -->
      <v-card-actions class="border-t-md border-primary border-opacity-100 pa-4">
        <v-spacer></v-spacer>
        <v-btn @click="dialogValue = false" color="primary" variant="outlined"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
