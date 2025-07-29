# Android APK Environment Variables Fix

## Problem

Environment variables from `.env` file are not being read when the app is built as an Android APK.

## Root Cause

Capacitor builds the web assets first, then bundles them into the native app. If environment variables aren't properly embedded during the build process, they won't be available in the APK.

## Solution Implemented

### 1. Updated Vite Configuration

**File: `vite.config.ts`**

- Added explicit `define` configuration to embed environment variables at build time
- Added `loadEnv` to ensure variables are loaded in all environments
- Added `envPrefix: 'VITE_'` for consistent variable handling

### 2. Enhanced Supabase Configuration

**File: `src/utils/supabase.ts`**

- Added fallback mechanisms for production builds
- Added global type declarations for build-time injected variables
- Added logging to help debug configuration issues
- Included hardcoded fallbacks as last resort

### 3. Created Build Scripts

**Files: `build-android.bat` (Windows) and `build-android.sh` (Unix)**

- Automated build process with environment validation
- Ensures `.env` file exists and variables are set
- Proper build sequence: clean → build → sync → APK

### 4. Updated Package.json Scripts

Added convenient npm scripts:

```json
"build:android": "npm run build && npx cap sync android"
"build:android:apk": "npm run build:android && cd android && ./gradlew assembleDebug"
"build:android:release": "npm run build:android && cd android && ./gradlew assembleRelease"
```

## How to Build Android APK

### Method 1: Using Build Script (Recommended)

```bash
# Windows
.\build-android.bat

# Unix/Linux/Mac
chmod +x build-android.sh
./build-android.sh
```

### Method 2: Using NPM Scripts

```bash
# Development APK
npm run build:android:apk

# Production APK
npm run build:android:release
```

### Method 3: Manual Steps

```bash
# 1. Ensure .env file exists with all required variables
# 2. Build web assets
npm run build

# 3. Sync with Capacitor
npx cap sync android

# 4. Build APK
cd android
./gradlew assembleDebug  # or assembleRelease

# 5. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

## Verification Steps

### 1. Check Build Logs

Look for these messages during build:

```Supabase configuration loaded: {
  url: "https://your-project.supabase.co",
  hasAnonKey: true,
  hasServiceRole: true,
  env: "production"
}
```

### 2. Test in Android Studio

```bash
npx cap open android
```

Check the browser console in the Android emulator/device for configuration logs.

### 3. Verify APK Contents

Extract the APK and check if environment variables are embedded in the JavaScript files.

## Troubleshooting

### Environment Variables Still Not Working

1. **Check .env file location**

   - Must be in project root directory
   - Must not be in `.gitignore` for local development

2. **Verify variable names**

   - Must start with `VITE_`
   - No spaces around `=` sign
   - Example: `VITE_SUPABASE_URL=https://...`

3. **Clear build cache**

   ```bash
   rm -rf dist/
   rm -rf node_modules/.vite/
   npm run build
   ```

4. **Check Capacitor sync**

   ```bash
   npx cap sync android --force
   ```

### Build Fails

1. **Check Android SDK**

   - Ensure Android SDK is properly installed
   - Check `ANDROID_HOME` environment variable

2. **Check Gradle**

   - Ensure Gradle is accessible
   - Try `cd android && ./gradlew clean`

3. **Check dependencies**

   ```bash
   npm install
   npx cap doctor
   ```

### Variables Work in Development but Not Production

1. **Check build mode**

   - Development uses `.env` directly
   - Production uses embedded variables from `vite.config.ts`

2. **Verify Vite configuration**
   - Check `define` section in `vite.config.ts`
   - Ensure all required variables are listed

## Testing the Fix

1. **Build APK using new process**
2. **Install on device/emulator**
3. **Check browser console for Supabase configuration logs**
4. **Test Supabase functionality (auth, data)**

## Files Modified

- ✅ `vite.config.ts` - Enhanced with environment variable handling
- ✅ `src/utils/supabase.ts` - Added fallbacks and logging
- ✅ `package.json` - Added build scripts
- ✅ `build-android.bat` - Windows build script
- ✅ `build-android.sh` - Unix build script

The environment variables should now work properly in Android APK builds!
