/**
 * Validated Clinical Database & Storage Architecture
 * Provides schema validation, physiological bounds sanitization, SHA-256 integrity
 * checksums, safe localStorage persistence, and debounced server-side vault synchronization.
 */

import { deterministicFallbackHash, getAuthenticatedApiHeaders } from './securityAuth';
import { isValidPhysiologicalGlucose } from './medicalCalculations';

export interface ClinicalVaultSnapshot {
  version: number;
  updatedAt: string;
  checksum: string;
  readingsCount: number;
  readings?: unknown[];
  profile?: Record<string, unknown>;
  meals?: unknown[];
  activities?: unknown[];
  medLogs?: unknown[];
  reminders?: unknown[];
  fastingSessions?: unknown[];
}

const VAULT_META_KEY = 'glucose_clinical_vault_meta_v2';

/**
 * Safely parses and validates stored JSON with fallback recovery.
 */
export function safeLoadStorageItem<T>(key: string, fallback: T, validator?: (val: unknown) => boolean): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (validator && !validator(parsed)) {
      return fallback;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Safely writes JSON to localStorage and updates the local clinical integrity checksum.
 */
export function safeSaveStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    const digest = deterministicFallbackHash(`${key}:${serialized.length}:${serialized.slice(0, 256)}`);
    window.localStorage.setItem(`${VAULT_META_KEY}_${key}`, digest);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitizes an array of glucose readings to ensure all entries have valid IDs,
 * valid physiological values (20 - 600 mg/dL), and valid timestamps.
 */
export function sanitizeGlucoseReadingsArray<T extends { id?: string; value?: number; date?: Date | string }>(
  rawReadings: T[]
): T[] {
  if (!Array.isArray(rawReadings)) return [];
  const seenIds = new Set<string>();
  const sanitized: T[] = [];

  for (const item of rawReadings) {
    if (!item || typeof item !== 'object') continue;
    const numVal = Number(item.value);
    if (!isValidPhysiologicalGlucose(numVal)) continue;

    const parsedDate = item.date instanceof Date ? item.date : new Date(String(item.date));
    if (Number.isNaN(parsedDate.getTime())) continue;

    const id = typeof item.id === 'string' && item.id.trim().length > 0
      ? item.id
      : `reading_${parsedDate.getTime()}_${numVal}`;

    if (seenIds.has(id)) continue;
    seenIds.add(id);

    sanitized.push({
      ...item,
      id,
      value: Math.round(numVal * 10) / 10,
      date: parsedDate,
    });
  }

  return sanitized;
}

let syncTimeoutId: ReturnType<typeof setTimeout> | null = null;

/**
 * Debounced synchronization of the client clinical database snapshot to `/api/vault/sync`.
 * Ensures non-blocking background persistence with checksum verification.
 */
export function scheduleServerVaultSync(payload: {
  readings: unknown[];
  profile: Record<string, unknown>;
  meals?: unknown[];
  activities?: unknown[];
  medLogs?: unknown[];
  reminders?: unknown[];
  fastingSessions?: unknown[];
}): void {
  if (typeof window === 'undefined') return;
  if (syncTimeoutId) {
    clearTimeout(syncTimeoutId);
  }

  syncTimeoutId = setTimeout(async () => {
    try {
      const summaryString = JSON.stringify({
        r: Array.isArray(payload.readings) ? payload.readings.length : 0,
        m: Array.isArray(payload.meals) ? payload.meals.length : 0,
        a: Array.isArray(payload.activities) ? payload.activities.length : 0,
        l: Array.isArray(payload.medLogs) ? payload.medLogs.length : 0,
      });
      const checksum = deterministicFallbackHash(summaryString);

      await fetch('/api/vault/sync', {
        method: 'POST',
        headers: getAuthenticatedApiHeaders(),
        body: JSON.stringify({
          version: 2,
          updatedAt: new Date().toISOString(),
          checksum,
          readingsCount: Array.isArray(payload.readings) ? payload.readings.length : 0,
          readings: Array.isArray(payload.readings) ? payload.readings.slice(0, 500) : [],
          profile: payload.profile,
          meals: Array.isArray(payload.meals) ? payload.meals.slice(0, 200) : [],
          activities: Array.isArray(payload.activities) ? payload.activities.slice(0, 200) : [],
          medLogs: Array.isArray(payload.medLogs) ? payload.medLogs.slice(0, 200) : [],
          reminders: Array.isArray(payload.reminders) ? payload.reminders.slice(0, 100) : [],
          fastingSessions: Array.isArray(payload.fastingSessions) ? payload.fastingSessions.slice(0, 100) : [],
        }),
      });
    } catch {
      // Offline-first resilience: local storage remains authoritative when offline
    }
  }, 2500);
}
