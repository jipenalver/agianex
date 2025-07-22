<script setup lang="ts">
import { ref } from 'vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

const isFabOpen = ref(false)

// Camera functionality
const takePhoto = async () => {
  try {
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // For web, use web camera
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      })

      if (image.dataUrl) {
        await savePhotoToDownloads(image.dataUrl, `photo_${Date.now()}.jpg`)
      }
    } else {
      // For native platforms (Android)
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      })

      if (image.webPath) {
        await savePhotoToDownloads(image.webPath, `photo_${Date.now()}.jpg`)
      }
    }

    // Close the FAB after taking photo
    isFabOpen.value = false
  } catch (error) {
    console.error('Error taking photo:', error)
    alert('Failed to take photo. Please try again.')
  }
}

// Save photo to downloads folder
const savePhotoToDownloads = async (imageData: string, fileName: string) => {
  try {
    let base64Data = imageData

    // Convert data URL to base64 if needed
    if (imageData.startsWith('data:')) {
      base64Data = imageData.split(',')[1]
    }

    // For web platform, create download link
    if (!Capacitor.isNativePlatform()) {
      const link = document.createElement('a')
      link.href = imageData
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      alert('Photo downloaded successfully!')
      return
    }

    // For native platforms, save to downloads directory
    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents,
    })

    alert('Photo saved to Downloads folder successfully!')
  } catch (error) {
    console.error('Error saving photo:', error)
    alert('Failed to save photo. Please check permissions.')
  }
}
</script>

<template>
  <v-fab id="fab" variant="elevated" color="primary" size="x-large" icon app>
    <v-icon>{{ isFabOpen ? 'mdi-close' : 'mdi-human-greeting-proximity' }}</v-icon>
    <v-speed-dial
      v-model="isFabOpen"
      location="bottom center"
      transition="scale-transition"
      activator="parent"
    >
      <v-btn key="2" color="info" size="large" icon>
        <v-icon size="large">mdi-plus</v-icon>
      </v-btn>

      <v-btn key="1" color="secondary" size="large" icon @click="takePhoto">
        <v-icon size="large">mdi-camera</v-icon>
        <v-tooltip activator="parent" location="top"> Take Photo </v-tooltip>
      </v-btn>
    </v-speed-dial>
  </v-fab>
</template>

<style scoped>
#fab {
  margin-bottom: 3.75rem;
}
</style>
