#!/bin/bash
# Brewniverse Release Build Script
# This script builds a signed release APK

echo "========================================"
echo "Brewniverse Release Build"
echo "========================================"
echo ""

# Check if keystore.properties exists
if [ ! -f "android/keystore.properties" ]; then
    echo "ERROR: keystore.properties not found!"
    echo "Please create android/keystore.properties with your signing configuration."
    echo "See SIGNING_AND_RELEASE_GUIDE.md for details."
    exit 1
fi

# Check if keystore file exists
KEYSTORE=$(grep "storeFile" android/keystore.properties | cut -d'=' -f2)
if [ ! -f "android/$KEYSTORE" ]; then
    echo "ERROR: Keystore file not found at android/$KEYSTORE"
    echo "Please generate your keystore first."
    echo "See SIGNING_AND_RELEASE_GUIDE.md for details."
    exit 1
fi

echo "Step 1: Building web assets..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Web build failed!"
    exit 1
fi

echo ""
echo "Step 2: Syncing with Android..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "ERROR: Capacitor sync failed!"
    exit 1
fi

echo ""
echo "Step 3: Building signed release APK..."
cd android
./gradlew assembleRelease
if [ $? -ne 0 ]; then
    echo "ERROR: Android build failed!"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "========================================"
echo "SUCCESS! Release APK built successfully!"
echo "========================================"
echo ""
echo "Your signed APK is located at:"
echo "android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "You can now:"
echo "1. Test it: adb install android/app/build/outputs/apk/release/app-release.apk"
echo "2. Upload it to GitHub Releases"
echo "3. Share it with your friends!"
echo ""


