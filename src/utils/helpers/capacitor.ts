import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { StatusBar } from '@capacitor/status-bar'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'

// 👉 Set Status Bar
export async function setStatusBar() {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setOverlaysWebView({ overlay: false })
    await StatusBar.setBackgroundColor({ color: '#ffffff' })
  }
}

// 👉 Open Browser Link
export const openExternalLink = async (url: string) => {
  await Browser.open({ url })
}

// 👉 Download File
export const downloadFile = async (filePath: string, fileName: string) => {
  if (Capacitor.getPlatform() === 'web') {
    // Web Download
    const response = await fetch(filePath)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = fileName || 'downloaded_file'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } else {
    // Native Mobile Download
    const response = await fetch(filePath)
    const blob = await response.blob()
    const reader = new FileReader()

    reader.onloadend = async () => {
      const base64Data = reader.result?.toString().split(',')[1]

      if (base64Data) {
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        })
      }
    }
    reader.readAsDataURL(blob)
  }
}
