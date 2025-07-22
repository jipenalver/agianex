# Camera Setup Instructions

## Overview

The camera functionality has been implemented using Capacitor's Camera API. The camera button in the FAB (Floating Action Button) will now take photos and save them to the device.

## Features Implemented

- ✅ Camera capture using Capacitor Camera API
- ✅ Photo saving to Downloads/Documents folder
- ✅ Cross-platform support (Web and Android)
- ✅ Proper error handling and user feedback

## How It Works

### Web Platform

- Opens browser camera
- Downloads photo directly to browser's Downloads folder
- Uses data URL format for compatibility

### Android Platform

- Opens native camera app
- Saves photo to Documents folder (more reliable than Downloads)
- Uses native file system API

## Usage

1. Click the FAB (Floating Action Button) in the bottom right
2. Click the camera icon button
3. Take a photo using the camera
4. Photo will be automatically saved
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
- Quality is set to 90% for good balance of size and quality
- iOS support not implemented yet (as requested)
- Error messages provide user feedback for debugging

## Future Enhancements

- Add photo preview before saving
- Allow photo editing/cropping
- Integration with report submission
- Photo gallery for viewing saved photos
