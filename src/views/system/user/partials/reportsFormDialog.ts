import { type ReportData, type UpdateReportData, useReportsStore } from '@/stores/reports'
import { formActionDefault } from '@/utils/helpers/constants'
import { type TableOptions } from '@/utils/helpers/tables'
import { ref, watch } from 'vue'

export function useReportsFormDialog(
  props: {
    isDialogVisible: boolean
    itemData: ReportData | null
    tableOptions: TableOptions
  },
  emit: (event: 'update:isDialogVisible', value: boolean) => void,
) {
  const reportsStore = useReportsStore()

  // States
  const formDataDefault = {
    id: undefined as number | undefined,
    report_type: '',
    priority: '',
    status: '',
  }

  type FormData = {
    id?: number | undefined
    report_type: string
    priority: string
    status: string
  }

  const formData = ref<FormData>({ ...formDataDefault })
  const formAction = ref({ ...formActionDefault })
  const refVForm = ref()

  // Options for form fields
  const reportTypeOptions = [
    'Road Issues',
    'Public Safety',
    'Infrastructure',
    'Environmental',
    'Utilities',
    'Public Transport',
    'General',
  ]

  const priorityOptions = ['Low', 'Medium', 'High', 'Critical']

  const statusOptions = ['Pending', 'In Progress', 'Resolved', 'Rejected']

  watch(
    () => props.isDialogVisible,
    () => {
      if (props.itemData) {
        formData.value = {
          id: props.itemData.id,
          report_type: props.itemData.type || 'General',
          priority: props.itemData.priority || 'Medium',
          status: props.itemData.status || 'Pending',
        }
      } else {
        formData.value = { ...formDataDefault }
      }
    },
  )

  // Actions
  const onSubmit = async () => {
    formAction.value = { ...formActionDefault, formProcess: true }

    try {
      // Update report via store
      if (!formData.value.id) {
        throw new Error('Report ID is required for update')
      }

      const updateData: UpdateReportData = {
        id: formData.value.id,
        report_type: formData.value.report_type,
        priority: formData.value.priority,
        status: formData.value.status,
      }

      const { error } = await reportsStore.updateReport(updateData)

      if (error) {
        formAction.value = {
          formProcess: false,
          formAlert: true,
          formStatus: 400,
          formMessage: error || 'Failed to update report',
        }
        return
      }

      formAction.value = {
        formProcess: false,
        formAlert: true,
        formStatus: 200,
        formMessage: 'Report updated successfully',
      }

      // Refresh the table data
      await reportsStore.getReportsTable(props.tableOptions)
      await reportsStore.fetchReports()

      // Close dialog after successful update
      setTimeout(() => {
        onFormReset()
      }, 1500)
    } catch {
      formAction.value = {
        formProcess: false,
        formAlert: true,
        formStatus: 400,
        formMessage: 'An error occurred while updating the report',
      }
    }
  }

  const onFormSubmit = async () => {
    const form = refVForm.value
    const { valid: isValid } = await form.validate()
    if (isValid) onSubmit()
  }

  const onFormReset = () => {
    const form = refVForm.value
    if (form) form.reset()
    formAction.value = { ...formActionDefault }
    formData.value = { ...formDataDefault }
    emit('update:isDialogVisible', false)
  }

  // Expose State and Actions
  return {
    formData,
    formAction,
    refVForm,
    reportTypeOptions,
    priorityOptions,
    statusOptions,
    onFormSubmit,
    onFormReset,
  }
}
