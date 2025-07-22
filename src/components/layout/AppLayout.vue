<script setup lang="ts">
import TopProfileNavigation from '@/components/navigation/TopProfileNavigation.vue'
import LogoAgianexDark from '@/assets/logos/logo-agianex-v2-dark.png'
import BottomNavigation from '../navigation/BottomNavigation.vue'
import LogoAgianex from '@/assets/logos/logo-agianex-v2.png'
import imageBg from '@/assets/images/img-bxu-hall.jpg'
import { useAuthUserStore } from '@/stores/authUser'
import { onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

const props = defineProps<{
  isWithAppBarIcon?: boolean
}>()

const emit = defineEmits(['isDrawerVisible', 'theme'])

const { mobile, smAndUp } = useDisplay()

const authUserStore = useAuthUserStore()

const isLoggedIn = ref(false)
const theme = ref(localStorage.getItem('theme') ?? 'light')

function onToggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', theme.value)
  emit('theme', theme.value)
}

onMounted(async () => {
  isLoggedIn.value = await authUserStore.isAuthenticated()
})
</script>

<template>
  <v-responsive>
    <v-app :theme="theme">
      <v-app-bar class="px-3 border-b-md border-solid border-opacity-100 border-primary">
        <v-app-bar-nav-icon
          v-if="props.isWithAppBarIcon"
          icon="mdi-menu"
          :theme="theme"
          @click="emit('isDrawerVisible')"
        >
        </v-app-bar-nav-icon>

        <v-app-bar-title>
          <RouterLink class="text-decoration-none" to="/">
            <h1
              v-if="smAndUp"
              class="text-h4 font-weight-black"
              :class="{ 'text-primary': theme === 'light', 'text-white': theme === 'dark' }"
            >
              AGIANEX
            </h1>
            <v-img
              v-else
              max-width="60"
              :src="theme === 'light' ? LogoAgianex : LogoAgianexDark"
            ></v-img>
          </RouterLink>
        </v-app-bar-title>

        <v-btn
          class="me-2"
          :icon="theme === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
          variant="elevated"
          @click="onToggleTheme"
          slim
        ></v-btn>

        <template v-if="isLoggedIn">
          <TopProfileNavigation></TopProfileNavigation>
        </template>

        <template v-else>
          <div v-if="mobile" class="d-flex align-center ga-1">
            <v-menu>
              <template #activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
              </template>

              <v-list>
                <v-list-item prepend-icon="mdi-login" to="/login">
                  <v-list-item-title class="font-weight-bold text-uppercase">
                    Sign In
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <div v-else class="d-flex align-center ga-5">
            <v-btn prepend-icon="mdi-login" rounded="lg" to="/login"> Sign In </v-btn>
          </div>
        </template>
      </v-app-bar>

      <slot name="navigation"></slot>

      <v-main>
        <v-img :src="imageBg" height="100%" cover>
          <slot name="content"></slot>
        </v-img>
      </v-main>

      <BottomNavigation
        v-if="mobile && isLoggedIn && authUserStore.userRole === 'User'"
      ></BottomNavigation>

      <v-footer
        v-else
        class="d-flex border-t-md border-solid border-opacity-100 border-primary"
        :class="mobile ? 'justify-center' : 'justify-between'"
        app
      >
        <div class="font-weight-bold text-center">Copyright © 2025 | Agianex</div>
      </v-footer>
    </v-app>
  </v-responsive>
</template>
