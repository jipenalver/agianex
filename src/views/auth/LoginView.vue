<script setup lang="ts">
import LogoAgianexDark from '@/assets/logos/logo-agianex-v2-dark.png'
import LogoAgianex from '@/assets/logos/logo-agianex-v2.png'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from './partials/LoginForm.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

const { xs } = useDisplay()

const theme = ref(localStorage.getItem('theme') ?? 'light')

const onToggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <AppLayout @theme="onToggleTheme">
    <template #content>
      <v-container>
        <v-row class="d-flex justify-center">
          <v-col cols="12" xl="4" lg="5" sm="8">
            <div class="my-16"></div>

            <v-card
              class="mx-auto pa-8 mt-4 border-md border-solid border-opacity-100 border-primary"
              elevation="8"
              rounded="lg"
            >
              <v-img
                class="mx-auto my-6"
                max-width="150"
                :src="theme === 'light' ? LogoAgianex : LogoAgianexDark"
              ></v-img>

              <LoginForm></LoginForm>

              <v-card color="surface-variant" variant="tonal">
                <v-card-text class="text-medium-emphasis text-caption">
                  <p class="text-center">
                    <strong>Agianex</strong> is a comprehensive road infrastructure reporting
                    platform that enables citizens and authorities to report, track, and manage road
                    conditions and infrastructure issues. The application features Google Maps for
                    precise location mapping of road incidents and infrastructure problems.
                  </p>
                </v-card-text>
              </v-card>

              <v-card-text class="text-center">
                Don't have an account?
                <v-spacer v-if="xs"></v-spacer>
                <RouterLink class="ms-2 text-primary" to="/register">
                  Sign Up Now <v-icon icon="mdi-chevron-right"></v-icon>
                </RouterLink>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
