export const reportMarkersDummy = [
  {
    id: 'RPT-001',
    position: { lat: 8.943569461592341, lng: 125.52297248922524 },
    type: 'Road Issues',
    description: 'Large pothole on J.C. Aquino Avenue',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-002',
    position: { lat: 8.955931551476562, lng: 125.53574221350537 },
    type: 'Infrastructure',
    description: 'Broken water pipe affecting Langihan Road',
    priority: 'Critical',
    status: 'Pending',
  },
  {
    id: 'RPT-003',
    position: { lat: 8.944006185805133, lng: 125.54282709404029 },
    type: 'Road Issues',
    description: 'Damaged road sign near Butuan National High School',
    priority: 'Medium',
    status: 'Resolved',
  },
  {
    id: 'RPT-004',
    position: { lat: 8.943491066582817, lng: 125.54029369183264 },
    type: 'Infrastructure',
    description: 'Cracked pavement on Montilla Boulevard',
    priority: 'Low',
    status: 'Pending',
  },
  {
    id: 'RPT-005',
    position: { lat: 8.93851432564583, lng: 125.53787781369444 },
    type: 'Road Issues',
    description: 'Traffic light malfunction at Rizal Street intersection',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-006',
    position: { lat: 8.947400079950432, lng: 125.54311413291157 },
    type: 'Infrastructure',
    description: 'Damaged sidewalk near Guingona Park',
    priority: 'Medium',
    status: 'Pending',
  },
  {
    id: 'RPT-007',
    position: { lat: 8.947625439503982, lng: 125.54115855380742 },
    type: 'Road Issues',
    description: 'Flooded area on 420 Agusan-Misamis Oriental Rd during rain',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: 'RPT-008',
    position: { lat: 8.948828698539703, lng: 125.54226339472731 },
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
