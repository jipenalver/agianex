<script setup lang="ts">
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { formActionDefault } from '@/utils/helpers/constants'
import { useAuthUserStore } from '@/stores/authUser'
import AppAlert from '../common/AppAlert.vue'
import { useGeolocation } from '@vueuse/core'
import { supabase } from '@/utils/supabase'
import { Capacitor } from '@capacitor/core'
import { ref } from 'vue'
import { groq } from '@/utils/groq'

const isFabOpen = ref(false)
const authUserData = useAuthUserStore()

const formAction = ref({ ...formActionDefault })

// Loading state for submission process
const isSubmitting = ref(false)
const submissionStep = ref('')

// Show notification using AppAlert
const showNotification = (message: string, status: number) => {
  formAction.value.formMessage = message
  formAction.value.formStatus = status
  formAction.value.formAlert = true
}

// Get user's geolocation
const { coords } = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
})

// Reverse geocoding function to get address from coordinates
const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_GEOC_API_KEY
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data = await response.json()

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Get the formatted address from the first result
      const address = data.results[0].formatted_address
      console.log('Reverse geocoded address:', address)
      return address
    } else {
      console.warn('No address found for coordinates:', lat, lng)
      return 'Location not found'
    }
  } catch (error) {
    console.error('Error getting address from coordinates:', error)
    return 'Unable to determine location'
  }
}

// Analyze image with AI to get description and priority
const analyzeImageWithAI = async (
  imageUrl: string,
): Promise<{ description: string; priority: string }> => {
  try {
    console.log('Analyzing image with AI:', imageUrl)

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an AI assistant helping with citizen reports. Analyze this image and:

1. Provide a detailed description of what you see (damage, issues, problems, etc.)
2. Assess the priority level based on severity and urgency:
   - Critical: Immediate danger to life/safety, major infrastructure failure, severe damage
   - High: Significant damage, safety concerns, urgent repairs needed
   - Medium: Moderate damage, non-urgent repairs, general maintenance issues
   - Low: Minor cosmetic issues, minor maintenance, non-urgent concerns

Respond in JSON format:
{
  "description": "detailed description of the image",
  "priority": "Critical|High|Medium|Low"
}

Focus on infrastructure, roads, public safety, environmental issues, and community concerns.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Use a vision model
      temperature: 0.3, // Lower temperature for more consistent results
      max_completion_tokens: 512,
      top_p: 1,
      stream: false,
      stop: null,
    })

    const content = chatCompletion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    console.log('AI Response:', content)

    // Try to parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          description: parsed.description || 'AI-generated description',
          priority: parsed.priority || 'Medium',
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse AI JSON response, extracting manually', parseError)
    }

    // Fallback: extract description and priority manually
    const description = content.replace(/\{[\s\S]*\}/, '').trim() || 'Image analysis completed'

    // Determine priority from content
    let priority = 'Medium'
    const lowerContent = content.toLowerCase()
    if (
      lowerContent.includes('critical') ||
      lowerContent.includes('danger') ||
      lowerContent.includes('severe')
    ) {
      priority = 'Critical'
    } else if (
      lowerContent.includes('high') ||
      lowerContent.includes('urgent') ||
      lowerContent.includes('significant')
    ) {
      priority = 'High'
    } else if (
      lowerContent.includes('low') ||
      lowerContent.includes('minor') ||
      lowerContent.includes('cosmetic')
    ) {
      priority = 'Low'
    }

    return { description, priority }
  } catch (error) {
    console.error('Error analyzing image with AI:', error)
    return {
      description: 'Report submitted via mobile app. Please review image for details.',
      priority: 'Medium',
    }
  }
}

// Save report to Supabase database and storage
const saveReportToSupabase = async (imageFile: File | Blob, fileName: string) => {
  try {
    // Start loading state
    isSubmitting.value = true
    submissionStep.value = 'Preparing report...'

    // Get coordinates
    const latitude =
      coords.value.latitude !== Number.POSITIVE_INFINITY ? coords.value.latitude : null
    const longitude =
      coords.value.longitude !== Number.POSITIVE_INFINITY ? coords.value.longitude : null

    // Get address from coordinates if available
    let location = 'Location not available'
    if (latitude && longitude) {
      submissionStep.value = 'Getting location details...'
      location = await getAddressFromCoordinates(latitude, longitude)
    }

    // First, insert the report record to get the ID
    submissionStep.value = 'Creating report record...'
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id: authUserData.userData?.id,
        latitude: latitude ? latitude.toString() : null,
        longitude: longitude ? longitude.toString() : null,
        location: location,
        status: 'Pending',
      })
      .select()
      .single()

    if (reportError) {
      console.error('Error creating report:', reportError)
      showNotification('Failed to create report. Please try again.', 400)
      return null
    }

    // Upload image with report ID in filename
    submissionStep.value = 'Uploading image...'
    const reportImagePath = `reports/${reportData.id}-${fileName}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agianex')
      .upload(reportImagePath, imageFile, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      showNotification('Failed to upload image. Please try again.', 400)
      return null
    }

    // Get public URL for the uploaded image
    const { data: imageData } = supabase.storage.from('agianex').getPublicUrl(uploadData.path)
    const imageUrl = imageData.publicUrl

    // Analyze image with AI to get description and priority
    submissionStep.value = 'Analyzing image with AI...'
    const { description, priority } = await analyzeImageWithAI(imageUrl)

    // Update report with image path, AI-generated description, and priority
    submissionStep.value = 'Finalizing report...'
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        image_path: imageUrl,
        description: description,
        priority: priority,
        report_type: 'General', // Default type, can be updated later by admin
      })
      .eq('id', reportData.id)

    if (updateError) {
      console.error('Error updating report with image path:', updateError)
    }

    console.log('Report saved successfully:', reportData)

    // Small delay to show completion
    submissionStep.value = 'Report submitted successfully!'
    await new Promise((resolve) => setTimeout(resolve, 1000))

    showNotification(`Report submitted successfully!`, 200)
    return reportData
  } catch (error) {
    console.error('Error saving report:', error)
    showNotification('Failed to save report. Please try again.', 400)
    return null
  } finally {
    // Hide loading state
    isSubmitting.value = false
    submissionStep.value = ''
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
    // Add camera active class to body for styling
    document.body.classList.add('camera-active')

    // Check if running on native platform
    if (!Capacitor.isNativePlatform()) {
      // For web, use web camera with enhanced styling
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        webUseInput: false, // Use native camera interface
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
    showNotification('Failed to take photo. Please try again.', 400)
  } finally {
    // Remove camera active class
    document.body.classList.remove('camera-active')
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
      input.multiple = false // Only allow single file selection to ensure proper processing

      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files
        if (files && files.length > 0) {
          const file = files[0] // Process only the first file
          const fileName = `selected_${Date.now()}.${file.name.split('.').pop()}`
          await saveReportToSupabase(file, fileName)
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
    showNotification('Failed to browse images. Please try again.', 400)
  }
}
</script>

<template>
  <!-- App Alert for notifications -->
  <AppAlert
    v-model:is-alert-visible="formAction.formAlert"
    :form-message="formAction.formMessage"
    :form-status="formAction.formStatus"
  ></AppAlert>

  <!-- Loading Modal for submission process -->
  <v-dialog v-model="isSubmitting" persistent max-width="400">
    <v-card class="pa-4">
      <v-card-title class="text-h6 text-center">
        <v-icon class="me-2" color="primary">mdi-cloud-upload</v-icon>
        Submitting Report
      </v-card-title>

      <v-card-text class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          width="6"
          class="mb-4"
        ></v-progress-circular>

        <div class="text-body-1 font-weight-medium mb-2">
          {{ submissionStep }}
        </div>

        <div class="text-caption text-grey">Please wait while we process your report...</div>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- FAB Navigation -->
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

<style>
@import './fabNavigation.css';
</style>
