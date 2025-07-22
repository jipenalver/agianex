import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.agianex',
  appName: 'agianex',
  webDir: 'dist',
  plugins: {
    Camera: {
      permissions: {
        camera: 'Camera permission is needed to take photos for reports',
        photos: 'Photo library access is needed to save images',
      },
    },
  },
}

export default config
