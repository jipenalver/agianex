<script setup lang="ts">
import LogoAgianex from '@/assets/logos/logo-agianex-v2.png'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from './partials/LoginForm.vue'
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container>
        <v-row class="d-flex justify-center">
          <v-col cols="12" xl="4" lg="5" sm="8">
            <RouterLink class="text-decoration-none mt-16" to="/">
              <h1 class="text-h2 font-weight-black text-primary text-center">AGIANEX</h1>
            </RouterLink>

            <v-card
              class="mx-auto pa-8 mt-4 border-md border-solid border-opacity-100 border-primary"
              elevation="8"
              rounded="lg"
            >
              <v-img class="mx-auto my-6" max-width="150" :src="LogoAgianex"></v-img>

              <LoginForm></LoginForm>

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
