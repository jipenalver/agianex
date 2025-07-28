<script setup lang="ts">
import SideNavigation from '@/components/navigation/SideNavigation.vue'
import FabNavigation from '@/components/navigation/FabNavigation.vue'
import HeaderPanel from '@/components/common/HeaderPanel.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import ReportTable from './partials/ReportTable.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

const { xs } = useDisplay()

const isDrawerVisible = ref(xs.value ? false : true)
</script>

<template>
  <AppLayout :is-with-app-bar-icon="true" @is-drawer-visible="isDrawerVisible = !isDrawerVisible">
    <template #navigation>
      <SideNavigation v-model:is-drawer-visible="isDrawerVisible"></SideNavigation>
    </template>

    <template #content>
      <v-container fluid>
        <HeaderPanel
          :header-items="['Citizen Report']"
          header-icon="mdi-human-greeting-proximity"
          headline="Report road infrastructure issues and other concerns."
        ></HeaderPanel>

        <ReportTable></ReportTable>

        <FabNavigation></FabNavigation>
      </v-container>
    </template>
  </AppLayout>
</template>
