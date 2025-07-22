<script setup lang="ts">
import SideNavigation from '@/components/navigation/SideNavigation.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import WelcomeWidget from './partials/WelcomeWidget.vue'
import { useAuthUserStore } from '@/stores/authUser'
import MapWidget from './partials/MapWidget.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

const { xs } = useDisplay()

const authUserStore = useAuthUserStore()

const isDrawerVisible = ref(xs.value ? false : true)
</script>

<template>
  <AppLayout :is-with-app-bar-icon="true" @is-drawer-visible="isDrawerVisible = !isDrawerVisible">
    <template #navigation>
      <SideNavigation v-model:is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <WelcomeWidget></WelcomeWidget>
          </v-col>

          <v-col v-if="authUserStore.userRole !== 'User'" cols="12">
            <MapWidget></MapWidget>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
