<script setup lang="ts">
import LogoAgianexDark from '@/assets/logos/logo-agianex-v2-dark.png'
import LogoAgianex from '@/assets/logos/logo-agianex-v2.png'
import AppLayout from '@/components/layout/AppLayout.vue'
import RegisterForm from './partials/RegisterForm.vue'
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

const { xs } = useDisplay()

const theme = ref(localStorage.getItem('theme') ?? 'light')

const onToggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>

<template>
  <AppLayout @theme="onToggleTheme"
    >">
    <template #content>
      <v-container>
        <v-row class="d-flex justify-center">
          <v-col cols="12" xl="4" lg="5" sm="8">
            <RouterLink class="text-decoration-none mt-16" to="/">
              <h1 class="text-h2 font-weight-black text-black text-center">AGIANEX</h1>
            </RouterLink>

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

              <RegisterForm></RegisterForm>

              <v-card-text class="text-center">
                Already have an account?
                <v-spacer v-if="xs"></v-spacer>
                <RouterLink class="ms-2 text-primary" to="/">
                  Sign In <v-icon icon="mdi-chevron-left"></v-icon>
                </RouterLink>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
