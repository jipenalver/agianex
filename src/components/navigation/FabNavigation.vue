<script setup lang="ts">
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { useAuthUserStore } from '@/stores/authUser'
import { useGeolocation } from '@vueuse/core'
import { supabase } from '@/utils/supabase'
import { Capacitor } from '@capacitor/core'
import { ref } from 'vue'

const isFabOpen = ref(false)
const authUserData = useAuthUserStore()

// Get user's geolocation
const { coords } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
})

// Save report to Supabase database and storage
const saveReportToSupabase = async (imageFile: File | Blob, fileName: string) => {
  try {
    // First, insert the report record to get the ID
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id: authUserData.userData?.id,
        latitude:
          coords.value.latitude !== Number.POSITIVE_INFINITY
            ? coords.value.latitude.toString()
            : null,
        longitude:
          coords.value.longitude !== Number.POSITIVE_INFINITY
            ? coords.value.longitude.toString()
            : null,
        status: 'Pending',
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report:', reportError)
      alert('Failed to create report. Please try again.')
      return null
    }

    // Upload image with report ID in filename
    const reportImagePath = `reports/${reportData.id}-${fileName}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agianex')
      .upload(reportImagePath, imageFile, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      alert('Failed to upload image. Please try again.')
      return null
    }

    // Update report with image path
    const { data: imageData } = supabase.storage.from('agianex').getPublicUrl(uploadData.path)

    const { error: updateError } = await supabase
      .from('reports')
      .update({
        image_path: imageData.publicUrl,
      })
      .eq('id', reportData.id)

    if (updateError) {
      console.error('Error updating report with image path:', updateError)
    }

    console.log('Report saved successfully:', reportData)
    alert(`Report #${reportData.id} submitted successfully!`)
    return reportData
  } catch (error) {
    console.error('Error saving report:', error)
    alert('Failed to save report. Please try again.')
    return null
  }
}

// Convert data URL to File
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

// Convert URI to File for native platforms
const uriToFile = async (uri: string, filename: string): Promise<File> => {
  const response = await fetch(uri)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type || 'image/jpeg' })
}

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
        const fileName = `photo_${Date.now()}.jpg`
        const file = dataURLtoFile(image.dataUrl, fileName)
        await saveReportToSupabase(file, fileName)
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
        const fileName = `photo_${Date.now()}.jpg`
        const file = await uriToFile(image.webPath, fileName)
        await saveReportToSupabase(file, fileName)
      }
    }

    // Close the FAB after taking photo
    isFabOpen.value = false
  } catch (error) {
    console.error('Error taking photo:', error)
    alert('Failed to take photo. Please try again.')
  }
}

// Browse images functionality
const browseImages = async () => {
  try {
    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // For web, use file input
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true

      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files
        if (files && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            const file = files[i]
            const fileName = `selected_${Date.now()}_${i}.${file.name.split('.').pop()}`
            await saveReportToSupabase(file, fileName)
          }
        }
      }

      input.click()
    } else {
      // For native platforms (Android), use camera with photo library source
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos, // This opens the photo gallery
      })

      if (image.webPath) {
        const fileName = `selected_${Date.now()}.jpg`
        const file = await uriToFile(image.webPath, fileName)
        await saveReportToSupabase(file, fileName)
      }
    }

    // Close the FAB after browsing
    isFabOpen.value = false
  } catch (error) {
    console.error('Error browsing images:', error)
    alert('Failed to browse images. Please try again.')
  }
}
</script>

<template>
  <v-fab id="fab" variant="elevated" color="primary" size="x-large" icon app>
    <v-icon>{{ isFabOpen ? 'mdi-close' : 'mdi-camera-plus' }}</v-icon>
    <v-speed-dial
      v-model="isFabOpen"
      location="bottom center"
      transition="scale-transition"
      activator="parent"
    >
      <v-btn key="2" color="info" size="large" icon @click="browseImages">
        <v-icon size="large">mdi-image-multiple</v-icon>
        <v-tooltip activator="parent" location="top"> Browse Images </v-tooltip>
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
