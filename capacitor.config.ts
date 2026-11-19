import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.diabetescare.surveillance.twa',
  appName: 'Diabetes Care & Tracker',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: [
      'ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app',
      '*.run.app'
    ]
  }
};

export default config;
