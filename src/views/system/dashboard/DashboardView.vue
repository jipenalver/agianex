<script setup lang="ts">
import SideNavigation from '@/components/navigation/SideNavigation.vue'
import ReportTable from '@/views/system/user/partials/ReportTable.vue'
import FabNavigation from '@/components/navigation/FabNavigation.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import WelcomeWidget from './partials/WelcomeWidget.vue'
import ReportWidget from './partials/ReportWidget.vue'
import { useAuthUserStore } from '@/stores/authUser'
import { useReportsStore } from '@/stores/reports'
import { ref, onMounted, onUnmounted } from 'vue'
import MapWidget from './partials/MapWidget.vue'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()

const authUserStore = useAuthUserStore()
const reportsStore = useReportsStore()

const isDrawerVisible = ref(xs.value ? false : true)
const activeTab = ref('reports')

// Fetch reports data and setup realtime subscription on dashboard load
onMounted(async () => {
  try {
    // Subscribe to realtime updates for reports
    await reportsStore.subscribeToReports()
  } catch (error) {
    console.error('Error loading reports for dashboard:', error)
  }
})

// Cleanup realtime subscription when component is unmounted
onUnmounted(async () => {
  await reportsStore.unsubscribeFromReports()
})
</script>

<template>
  <AppLayout :is-with-app-bar-icon="true" @is-drawer-visible="isDrawerVisible = !isDrawerVisible">
    <template #navigation>
      <SideNavigation v-model:is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container fluid>
        <v-row>
          <template v-if="authUserStore.userRole !== 'User'">
            <v-col cols="12">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <ReportWidget></ReportWidget>
                </v-col>

                <v-col cols="12" sm="6"> </v-col>
              </v-row>
            </v-col>

            <v-col cols="12">
              <v-tabs v-model="activeTab" class="mb-5">
                <v-tab value="reports" class="mx-1" color="primary" variant="flat" rounded="lg">
                  <v-icon start>mdi-table</v-icon>
                  Reports
                </v-tab>
                <v-tab value="map" class="mx-1" color="primary" variant="flat" rounded="lg">
                  <v-icon start>mdi-map</v-icon>
                  Map View
                </v-tab>
              </v-tabs>

              <v-tabs-window v-model="activeTab">
                <v-tabs-window-item value="reports">
                  <ReportTable></ReportTable>
                </v-tabs-window-item>

                <v-tabs-window-item value="map">
                  <MapWidget></MapWidget>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-col>
          </template>

          <template v-else>
            <v-col cols="12">
              <v-row dense>
                <v-col cols="12">
                  <WelcomeWidget></WelcomeWidget>
                </v-col>

                <v-col cols="12">
                  <ReportWidget></ReportWidget>
                </v-col>
              </v-row>
            </v-col>

            <FabNavigation></FabNavigation>
          </template>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
