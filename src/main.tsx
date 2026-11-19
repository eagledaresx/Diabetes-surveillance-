import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Production Cloud Run Backend URL for Standalone Android APK / AAB (Capacitor & TWA)
const CLOUD_RUN_PRODUCTION_URL =
  'https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app';

if (typeof window !== 'undefined') {
  const isPackagedAndroidWebView =
    window.location.protocol === 'capacitor:' ||
    window.location.protocol === 'file:' ||
    (window.location.hostname === 'localhost' && !window.location.port);

  if (isPackagedAndroidWebView) {
    (window as any).__VITE_API_URL__ = CLOUD_RUN_PRODUCTION_URL;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        return originalFetch(`${CLOUD_RUN_PRODUCTION_URL}${input}`, init);
      }
      return originalFetch(input, init);
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
