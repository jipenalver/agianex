#!/bin/bash

# Android Build Script with Environment Variables
# This script ensures environment variables are properly embedded in Android APK builds

set -e

echo "🚀 Starting Android APK build with environment variables..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required environment variables."
    echo "See .env.example for reference."
    exit 1
fi

# Load environment variables
echo "📋 Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_GOOGLE_MAPS_API_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set!"
        exit 1
    else
        echo "✅ $var is set"
    fi
done

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf android/app/src/main/assets/public/

# Build the web application
echo "🏗️ Building web application..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found!"
    exit 1
fi

echo "✅ Web build completed successfully"

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android

# Copy additional assets if needed
echo "📂 Verifying assets..."
if [ -d "android/app/src/main/assets/public" ]; then
    echo "✅ Assets synced successfully"
else
    echo "❌ Warning: Assets may not have synced properly"
fi

# Build the Android APK
echo "📱 Building Android APK..."
cd android
./gradlew assembleDebug

# Check if APK was created
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo "✅ Android APK built successfully!"
    echo "📍 APK location: android/app/build/outputs/apk/debug/app-debug.apk"

    # Copy APK to root directory for easy access
    cp app/build/outputs/apk/debug/app-debug.apk ../agianex-debug.apk
    echo "📍 APK copied to: agianex-debug.apk"
else
    echo "❌ Error: APK build failed!"
    exit 1
fi

cd ..

echo "🎉 Build completed successfully!"
echo ""
echo "📱 To install on device:"
echo "   adb install agianex-debug.apk"
echo ""
echo "🔍 To debug:"
echo "   npx cap open android"
echo "   Use Android Studio for debugging"
