export const reportMarkersDummy = [
  {
    id: 'RPT-001',
    position: { lat: 8.935142, lng: 125.508743 },
    type: 'Road Issues',
    description: 'Large pothole on J.C. Aquino Avenue',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-002',
    position: { lat: 8.921547, lng: 125.495832 },
    type: 'Infrastructure',
    description: 'Broken water pipe affecting Langihan Road',
    priority: 'Critical',
    status: 'Pending',
  },
  {
    id: 'RPT-003',
    position: { lat: 8.940823, lng: 125.517429 },
    type: 'Road Issues',
    description: 'Damaged road sign near Butuan National High School',
    priority: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'RPT-004',
    position: { lat: 8.915632, lng: 125.489157 },
    type: 'Infrastructure',
    description: 'Cracked pavement on Montilla Boulevard',
    priority: 'Low',
    status: 'Pending',
  },
  {
    id: 'RPT-005',
    position: { lat: 8.933821, lng: 125.512638 },
    type: 'Road Issues',
    description: 'Traffic light malfunction at Rizal Street intersection',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-006',
    position: { lat: 8.925174, lng: 125.501832 },
    type: 'Infrastructure',
    description: 'Damaged sidewalk near Guingona Park',
    priority: 'Medium',
    status: 'Pending',
  },
  {
    id: 'RPT-007',
    position: { lat: 8.931456, lng: 125.507291 },
    type: 'Road Issues',
    description: 'Flooded area on San Mateo Street during rain',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-008',
    position: { lat: 8.922385, lng: 125.498745 },
    type: 'Infrastructure',
    description: 'Broken streetlight on P. Burgos Street',
    priority: 'Medium',
    status: 'Resolved',
  },
]

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
    default:
      return '❓'
  }
}
