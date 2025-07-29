<script setup lang="ts">
import { useReportsFormDialog } from './reportsFormDialog'
import { type TableOptions } from '@/utils/helpers/tables'
import AppAlert from '@/components/common/AppAlert.vue'
import { requiredValidator } from '@/utils/validators'
import { type ReportData } from '@/stores/reports'
import { useDisplay } from 'vuetify'

const props = defineProps<{
  isDialogVisible: boolean
  itemData: ReportData | null
  tableOptions: TableOptions
}>()

const emit = defineEmits(['update:isDialogVisible'])

const { mdAndDown } = useDisplay()

const {
  formData,
  formAction,
  refVForm,
  reportTypeOptions,
  statusOptions,
  onFormSubmit,
  onFormReset,
} = useReportsFormDialog(props, emit)
</script>

<template>
  <AppAlert
    v-model:is-alert-visible="formAction.formAlert"
    :form-message="formAction.formMessage"
    :form-status="formAction.formStatus"
  ></AppAlert>

  <v-dialog
    :max-width="mdAndDown ? undefined : '600'"
    :model-value="props.isDialogVisible"
    :fullscreen="mdAndDown"
    persistent
  >
    <v-card
      prepend-icon="mdi-file-document-edit"
      title="Update Report"
      subtitle="Update the report status"
    >
      <v-form ref="refVForm" @submit.prevent="onFormSubmit">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.report_type"
                label="Report Type"
                :items="reportTypeOptions"
                variant="outlined"
                :rules="[requiredValidator]"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="formData.status"
                label="Status"
                :items="statusOptions"
                variant="outlined"
                :rules="[requiredValidator]"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>

          <v-btn text="Close" variant="plain" prepend-icon="mdi-close" @click="onFormReset"></v-btn>

          <v-btn
            prepend-icon="mdi-content-save"
            color="primary"
            type="submit"
            variant="elevated"
            :disabled="formAction.formProcess"
            :loading="formAction.formProcess"
          >
            Update Report
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>
