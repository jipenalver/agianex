import { formActionDefault } from '@/utils/helpers/constants'
import { type TableOptions } from '@/utils/helpers/tables'
import { useAuthUserStore } from '@/stores/authUser'
import { useReportsStore } from '@/stores/reports'
import { ref, onMounted } from 'vue'

export function useReportsTable() {
  const authUserStore = useAuthUserStore()
  const reportsStore = useReportsStore()

  // States
  const tableOptions = ref({
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    isLoading: false,
  })

  const formAction = ref({ ...formActionDefault })

  // Actions
  const onLoadItems = async ({ page, itemsPerPage, sortBy }: TableOptions) => {
    tableOptions.value.isLoading = true

    try {
      // If user role is 'User', filter by their reports only
      if (authUserStore.userRole === 'User' && authUserStore.userData?.id) {
        await reportsStore.getReportsTable({
          page,
          itemsPerPage,
          sortBy,
          userId: authUserStore.userData.id,
        })
      } else {
        await reportsStore.getReportsTable({ page, itemsPerPage, sortBy })
      }
    } catch (error) {
      console.error('Error loading reports:', error)
      formAction.value.formMessage = 'Failed to load reports'
      formAction.value.formStatus = 400
      formAction.value.formAlert = true
    } finally {
      tableOptions.value.isLoading = false
    }
  }

  // Initialize data on mount
  onMounted(async () => {
    // Load initial data for both table and map widget
    await onLoadItems({
      page: tableOptions.value.page,
      itemsPerPage: tableOptions.value.itemsPerPage,
      sortBy: tableOptions.value.sortBy,
    })

    // Also fetch all reports for the map widget and statistics
    try {
      if (authUserStore.userRole === 'User' && authUserStore.userData?.id) {
        await reportsStore.fetchReports(authUserStore.userData.id)
      } else {
        await reportsStore.fetchReports()
      }
    } catch (error) {
      console.error('Error loading all reports for map:', error)
    }
  })

  // Expose State and Actions
  return {
    tableOptions,
    formAction,
    onLoadItems,
    reportsStore,
    authUserStore,
  }
}
