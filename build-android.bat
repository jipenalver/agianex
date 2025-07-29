@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Android APK build with environment variables...

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo Please create .env file with required environment variables.
    echo See .env.example for reference.
    exit /b 1
)

echo 📋 Loading environment variables...

REM Load environment variables from .env file
for /f "tokens=*" %%i in ('type .env ^| findstr /v "^#"') do (
    set %%i
)

REM Validate required environment variables
if "!VITE_SUPABASE_URL!"=="" (
    echo ❌ Error: VITE_SUPABASE_URL is not set!
    exit /b 1
) else (
    echo ✅ VITE_SUPABASE_URL is set
)

if "!VITE_SUPABASE_ANON_KEY!"=="" (
    echo ❌ Error: VITE_SUPABASE_ANON_KEY is not set!
    exit /b 1
) else (
    echo ✅ VITE_SUPABASE_ANON_KEY is set
)

if "!VITE_GOOGLE_MAPS_API_KEY!"=="" (
    echo ❌ Error: VITE_GOOGLE_MAPS_API_KEY is not set!
    exit /b 1
) else (
    echo ✅ VITE_GOOGLE_MAPS_API_KEY is set
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist android\app\src\main\assets\public rmdir /s /q android\app\src\main\assets\public

REM Build the web application
echo 🏗️ Building web application...
call npm run build

REM Verify build output
if not exist dist (
    echo ❌ Error: Build failed - dist directory not found!
    exit /b 1
)

echo ✅ Web build completed successfully

REM Sync with Capacitor
echo 🔄 Syncing with Capacitor...
call npx cap sync android

REM Verify assets
echo 📂 Verifying assets...
if exist android\app\src\main\assets\public (
    echo ✅ Assets synced successfully
) else (
    echo ❌ Warning: Assets may not have synced properly
)

REM Build the Android APK
echo 📱 Building Android APK...
cd android
call gradlew.bat assembleDebug

REM Check if APK was created
if exist app\build\outputs\apk\debug\app-debug.apk (
    echo ✅ Android APK built successfully!
    echo 📍 APK location: android\app\build\outputs\apk\debug\app-debug.apk
    
    REM Copy APK to root directory for easy access
    copy app\build\outputs\apk\debug\app-debug.apk ..\agianex-debug.apk
    echo 📍 APK copied to: agianex-debug.apk
) else (
    echo ❌ Error: APK build failed!
    exit /b 1
)

cd ..

echo 🎉 Build completed successfully!
echo.
echo 📱 To install on device:
echo    adb install agianex-debug.apk
echo.
echo 🔍 To debug:
echo    npx cap open android
echo    Use Android Studio for debugging

pause
