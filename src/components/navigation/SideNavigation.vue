<script setup lang="ts">
import {
  type MainNavigation,
  type SubNavigation,
  adminNav,
  adminItemsNav1,
  settingsItemsNav,
} from './sideNavigation'
import { useAuthUserStore } from '@/stores/authUser'
import { useDisplay } from 'vuetify'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  isDrawerVisible: boolean
}>()

const { mobile } = useDisplay()

const authUserStore = useAuthUserStore()

const noAccessPages = ref<string[]>([])
const mainNav = ref<MainNavigation[] | SubNavigation[]>([])
const editableItemsNav1 = ref<SubNavigation[]>([...adminItemsNav1])

onMounted(() => {
  mainNav.value = adminNav

  if (authUserStore.userRole === 'Super Administrator') return

  const menuItems = [{ items: editableItemsNav1, title: adminNav[0][0] }]

  menuItems.forEach(({ items, title }) => {
    if (!items.value) return

    items.value = items.value.filter((item: { [key: number]: string }) =>
      authUserStore.authPages.includes(item[3]),
    )

    if (items.value.length === 0) noAccessPages.value.push(title)
  })
})
</script>

<template>
  <v-navigation-drawer
    class="border-e-md border-solid border-opacity-100 border-primary"
    :model-value="props.isDrawerVisible"
    :persistent="mobile"
    :temporary="mobile"
    :permanent="!mobile"
    :width="300"
    close-delay="2000"
    expand-on-hover
    rail
  >
    <v-list density="compact" lines="two" nav>
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        to="/dashboard"
        color="primary"
        variant="flat"
        slim
      >
        <template #title>
          <span class="font-weight-black"> Dashboard </span>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-group v-for="([title, icon], i) in mainNav" :key="i" fluid>
        <template #activator="{ props }" v-if="!noAccessPages.includes(title)">
          <v-list-item v-bind="props" :prepend-icon="icon" color="primary" variant="flat" slim>
            <template #title>
              <span class="font-weight-black">
                {{ title }}
              </span>
            </template>
          </v-list-item>
        </template>

        <template v-if="mainNav[0] && title === mainNav[0][0]">
          <v-list-item
            v-for="([title, icon, subtitle, to], i) in editableItemsNav1"
            :key="i"
            :prepend-icon="icon"
            :subtitle="subtitle ?? undefined"
            :to="to ?? undefined"
            color="primary"
            variant="flat"
            slim
          >
            <template #title>
              <span class="font-weight-black"> {{ title }} </span>
            </template>
          </v-list-item>
        </template>
      </v-list-group>

      <v-divider></v-divider>

      <v-list-item prepend-icon="mdi-chart-line" to="/reports" color="primary" variant="flat" slim>
        <template #title>
          <span class="font-weight-black"> Reports </span>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <v-list-group fluid>
        <template #activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-wrench" color="primary" variant="flat" slim>
            <template #title>
              <span class="font-weight-black"> Settings </span>
            </template>
          </v-list-item>
        </template>

        <v-list-item
          v-for="([title, icon, subtitle, to], i) in settingsItemsNav"
          :key="i"
          :prepend-icon="icon"
          :subtitle="subtitle ?? undefined"
          :to="to ?? undefined"
          color="primary"
          variant="flat"
          slim
        >
          <template #title>
            <span class="font-weight-black"> {{ title }} </span>
          </template>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>
