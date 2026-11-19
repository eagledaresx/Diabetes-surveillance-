# Diabetes Care & Tracker — Google Play Store Android Transfer & Launch Guide

This project is pre-configured and ready to launch on the **Google Play Store** as an official Android App Bundle (`.aab`) and standalone `.apk` under the production package ID:

- **Application ID (`package_name`)**: `com.diabetescare.surveillance.twa`
- **App Name**: `Diabetes Care & Tracker`
- **Short Launcher Name**: `DiabetesCare`
- **Production Backend & TWA Host**: `https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app`
- **Digital Asset Links Endpoint**: `https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app/.well-known/assetlinks.json`
- **Public Privacy Policy URL**: `https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app/privacy-policy`

---

## 🚀 Method 1: Build Signed `.aab` in Android Studio (Native Capacitor Android Project)

The `./android` folder contains the complete, production-ready Android Studio Gradle project with all compiled web assets bundled inside `android/app/src/main/assets/public/` and automatic API routing to the live Cloud Run backend.

1. Download **`diabetes-surveillance-android-project.zip`** from the in-app **APK / Play Store** modal (or open the `./android` directory directly).
2. Open **Android Studio** $\rightarrow$ select **Open** $\rightarrow$ choose the `android` folder.
3. Let Gradle sync complete.
4. In the top menu, click **Build $\rightarrow$ Generate Signed Bundle / APK...**
5. Select **Android App Bundle** (`.aab`) $\rightarrow$ click **Next**.
6. Click **Create new...** to create your upload keystore (`diabetescare-upload-key.jks`), fill in a password and alias, and click **Next $\rightarrow$ release $\rightarrow$ Create**.
7. Android Studio will generate your signed Play Store bundle at:
   `android/app/release/app-release.aab`

### Or via Command Line (Gradle):
```bash
cd android
# Build Google Play Store Android App Bundle (.aab)
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab

# Build installable Android APK (.apk)
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🌐 Method 2: 1-Click Cloud `.aab` Generator via PWABuilder (No Android Studio Needed)

1. Open **[PWABuilder](https://www.pwabuilder.com/?url=https%3A%2F%2Fais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app)**
2. Click **Package for stores** $\rightarrow$ choose **Android** $\rightarrow$ set Package ID to `com.diabetescare.surveillance.twa`.
3. Click **Download Package** to receive a `.zip` containing:
   - `Diabetes Care & Tracker.aab` (upload directly to Google Play Console)
   - `Diabetes Care & Tracker.apk` (install directly on any Android phone)
   - `signing.keystore` & `assetlinks.json`

---

## 📦 Method 3: Google Bubblewrap CLI (Official Google TWA Packager)

```bash
npx @bubblewrap/cli init --manifest="https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app/manifest.webmanifest"
npx @bubblewrap/cli build
```
This outputs `app-release-bundle.aab` for Google Play Console and `app-release-signed.apk` for direct device testing.

---

## 🏪 Step-by-Step Google Play Console Submission Checklist

1. **Create App in Google Play Console**:
   - Go to [Google Play Console](https://play.google.com/console) $\rightarrow$ **Create app**.
   - **App name**: `Diabetes Care & Tracker`
   - **Default language**: `English (United States) – en-US`
   - **App or game**: `App` | **Free or paid**: `Free`
2. **Upload `.aab` Bundle**:
   - Navigate to **Testing $\rightarrow$ Internal testing** (or **Production**) $\rightarrow$ **Create new release**.
   - Upload your generated `.aab` file (`app-release.aab` or `app-release-bundle.aab`).
3. **Link SHA-256 App Signing Fingerprint**:
   - In Play Console, go to **Setup $\rightarrow$ App signing** and copy the **SHA-256 certificate fingerprint**.
   - Open your live app $\rightarrow$ click **APK** in the header $\rightarrow$ **1. Google Play Store (.aab)** tab $\rightarrow$ paste the SHA-256 fingerprint and click **Save & Publish to /.well-known/assetlinks.json**.
4. **Complete App Content & Medical Declarations**:
   - **Privacy Policy**: Paste `https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app/privacy-policy`
   - **Health Apps Declaration**: Check *"Disease Management & Wellness Tracking"* and *"Medical Reference & Education"*.
   - **Data Safety**: Declare that blood glucose logs are encrypted locally with AES-256-GCM and users can delete all data at any time from the Profile tab.
