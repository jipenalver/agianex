<script setup lang="ts">
import { emailValidator, requiredValidator } from '@/utils/validators'
import AppAlert from '@/components/common/AppAlert.vue'
import { useLoginForm } from './loginForm'
import { ref } from 'vue'

const { formData, formAction, refVForm, onFormSubmit } = useLoginForm()

const isPasswordVisible = ref(false)
</script>

<template>
  <AppAlert
    v-model:is-alert-visible="formAction.formAlert"
    :form-message="formAction.formMessage"
    :form-status="formAction.formStatus"
  ></AppAlert>

  <v-form ref="refVForm" @submit.prevent="onFormSubmit">
    <v-text-field
      class="mt-5"
      type="email"
      v-model="formData.email"
      prepend-inner-icon="mdi-email-outline"
      label="Email Address"
      placeholder="Email Address"
      :rules="[requiredValidator, emailValidator]"
    ></v-text-field>

    <v-text-field
      class="mt-5"
      v-model="formData.password"
      prepend-inner-icon="mdi-lock-outline"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      :type="isPasswordVisible ? 'text' : 'password'"
      label="Password"
      placeholder="Password"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-btn
      type="submit"
      class="mt-4 mb-8"
      prepend-icon="mdi-login"
      color="primary"
      variant="elevated"
      rounded="lg"
      block
      :disabled="formAction.formProcess"
      :loading="formAction.formProcess"
    >
      Sign In
    </v-btn>
  </v-form>
</template>
