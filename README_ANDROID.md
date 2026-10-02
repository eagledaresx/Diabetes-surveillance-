# Diabetes Surveillance App - Android APK Build Guide

This project is fully configured as a native Android application using **Capacitor 8** and **Android WebAPK / PWA Trusted Web Activity (TWA)**.

---

## 🚀 Option 1: Instant 1-Click APK via PWABuilder (Easiest & Fastest)
You can generate a signed, installable APK in 30 seconds with **zero command-line or Android Studio setup**:

1. Go to: **[PWABuilder Android Generator](https://www.pwabuilder.com)**
2. Input the published app URL:
   `https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app`
3. Click **"Start"** → PWABuilder verifies the PWA manifest and icons.
4. Click **"Package for Android"** → Select **"Generate APK / AAB"**.
5. Download your signed **`.apk`** file and install it directly onto any Android device!

---

## 📱 Option 2: Native Android WebAPK (Direct from Android Phone)
Android Google Play Services automatically compiles and installs an official **WebAPK** onto your device:

1. Open the app link in **Google Chrome** on your Android phone:
   `https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app`
2. Tap the **"Android App"** button at the top header, OR tap the Chrome menu (**⋮**).
3. Select **"Install app"** or **"Add to Home screen"**.
4. Android's native WebAPK minting service downloads and registers a real `.apk` in Android OS (`/data/app/...`), accessible from your phone app drawer.

---

## 🛠 Option 3: Compile via Android Studio / Gradle (Full Source Code)
The repository contains the complete native Android project located in `./android/`.

### Steps:
1. Open the `./android` folder in **Android Studio** (or extract the project zip).
2. Wait for Gradle sync to complete.
3. In Android Studio, go to:
   **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
4. Locate the generated APK at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### CLI Command (if you have Android SDK & Java 17+ installed):
```bash
cd android
./gradlew assembleDebug
# The APK will be generated at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📦 Option 4: Command Line with Google Bubblewrap (TWA)
You can also package this app directly via Google's official Bubblewrap tool:
```bash
npx @bubblewrap/cli init --manifest="https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app/manifest.webmanifest"
npx @bubblewrap/cli build
```
This produces both a standalone **Debug APK** for sideloading and a release **AAB (Android App Bundle)** for Google Play Store upload.
