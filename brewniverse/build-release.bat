@echo off
REM Brewniverse Release Build Script for Windows
REM This script builds a signed release APK

echo ========================================
echo Brewniverse Release Build
echo ========================================
echo.

REM Check if keystore.properties exists
if not exist "android\keystore.properties" (
    echo ERROR: keystore.properties not found!
    echo Please create android\keystore.properties with your signing configuration.
    echo See SIGNING_AND_RELEASE_GUIDE.md for details.
    pause
    exit /b 1
)

REM Check if keystore file exists
for /f "tokens=2 delims==" %%a in ('findstr "storeFile" android\keystore.properties') do set KEYSTORE=%%a
if not exist "android\%KEYSTORE%" (
    echo ERROR: Keystore file not found at android\%KEYSTORE%
    echo Please generate your keystore first.
    echo See SIGNING_AND_RELEASE_GUIDE.md for details.
    pause
    exit /b 1
)

echo Step 1: Building web assets...
call npm run build
if errorlevel 1 (
    echo ERROR: Web build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Syncing with Android...
call npx cap sync android
if errorlevel 1 (
    echo ERROR: Capacitor sync failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Building signed release APK...
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo ERROR: Android build failed!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo SUCCESS! Release APK built successfully!
echo ========================================
echo.
echo Your signed APK is located at:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo You can now:
echo 1. Test it: adb install android\app\build\outputs\apk\release\app-release.apk
echo 2. Upload it to GitHub Releases
echo 3. Share it with your friends!
echo.
pause


