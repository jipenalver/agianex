# Camera & Image Browser Setup Instructions

## Overview

The FAB (Floating Action Button) now includes both camera capture and image browsing functionality using Capacitor's Camera API. Users can take new photos or browse existing images from their device.

## Features Implemented

- ✅ Camera capture using Capacitor Camera API
- ✅ Image browsing from device gallery/file system
- ✅ Photo saving to Downloads/Documents folder
- ✅ Cross-platform support (Web and Android)
- ✅ Multiple image selection support (Web)
- ✅ Proper error handling and user feedback

## How It Works

### Web Platform

**Camera (🎥 Button):**

- Opens browser camera
- Downloads photo directly to browser's Downloads folder
- Uses data URL format for compatibility

**Image Browser (🖼️ Button):**

- Opens file picker with image filter
- Supports multiple image selection
- Downloads selected images to browser's Downloads folder

### Android Platform

**Camera (🎥 Button):**

- Opens native camera app
- Saves photo to Documents folder

**Image Browser (🖼️ Button):**

- Opens native photo gallery
- Allows single image selection
- Saves selected image to Documents folder

## Usage

1. Click the FAB (Floating Action Button) in the bottom right
2. Choose one of two options:
   - **Camera icon (🎥)**: Take a new photo
   - **Image icon (🖼️)**: Browse and select existing images
3. Follow the camera/gallery prompts
4. Images will be automatically saved
5. Success/error message will be displayed

## Permissions Required

### Android Permissions (Already Added)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```

## Testing

1. **Web Testing**: Run `npm run dev` and test in browser

2. **Android Testing**:

   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

## File Locations

- **Web**: Browser's default Downloads folder
- **Android**: `/storage/emulated/0/Documents/` (accessible via file manager)

## Notes

- Photos are named with timestamp: `photo_[timestamp].jpg`
- Selected images are named: `selected_[timestamp]_[index].[extension]`
- Quality is set to 90% for good balance of size and quality
- iOS support not implemented yet (as requested)
- Error messages provide user feedback for debugging
- Web platform supports multiple image selection
- Android platform supports single image selection per operation

## Future Enhancements

- Add photo preview before saving
- Allow photo editing/cropping
- Integration with report submission
- Photo gallery for viewing saved photos
- Batch operations for multiple images on Android
