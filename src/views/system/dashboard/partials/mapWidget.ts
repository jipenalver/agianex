// Get marker color based on priority
export const getMarkerColor = (priority: string) => {
  switch (priority) {
    case 'Critical':
      return '#f44336' // red
    case 'High':
      return '#ff9800' // orange
    case 'Medium':
      return '#2196f3' // blue
    case 'Low':
      return '#4caf50' // green
    default:
      return '#9e9e9e' // grey
  }
}

// Get status icon
export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Resolved':
      return '✓'
    case 'In Progress':
      return '⏳'
    case 'Pending':
      return '⏸'
    case 'Rejected':
      return '✖'
    default:
      return '❓'
  }
}
