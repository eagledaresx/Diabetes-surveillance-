/**
 * Safely resolves absolute backend URL for APK (Capacitor) builds or Web builds
 */
export function getApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Read environment variable VITE_API_URL if configured
  const envApiUrl = (((import.meta as any).env?.VITE_API_URL) || "").trim();
  if (envApiUrl) {
    const base = envApiUrl.endsWith("/") ? envApiUrl.slice(0, -1) : envApiUrl;
    return `${base}${cleanPath}`;
  }

  // Capacitor / Native App check:
  // Capacitor applications run from local files/mock schemas like capacitor://localhost, ionic://, file://, etc.
  const isCapacitor = 
    window.location.protocol.startsWith("capacitor") || 
    window.location.protocol.startsWith("ionic") ||
    window.location.protocol.startsWith("file") ||
    (window as any).Capacitor !== undefined;

  if (isCapacitor) {
    // Falls back automatically to your production deployed Cloud Run address so APK features work out of the box!
    const fallbackBase = "https://ais-pre-wxtmhlh23krgo2gvmpicit-944506148515.asia-southeast1.run.app";
    return `${fallbackBase}${cleanPath}`;
  }

  // Standard web server behavior: Use relative paths
  return cleanPath;
}
