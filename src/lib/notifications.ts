/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FastingReminderConfig } from "../types";

export const DEFAULT_FASTING_REMINDER_CONFIG: FastingReminderConfig = {
  enabled: true,
  targetTime: "07:30",
  leadMinutes: 15,
  soundEnabled: true,
  vibrationEnabled: true,
  browserNotificationsEnabled: true,
  prepChecklistEnabled: true,
  customNotes: "Wash hands with warm water and dry thoroughly. Ensure an 8-hour water-only fast.",
  lastTriggeredDate: "",
  snoozedUntil: null,
  wakeWindowEnabled: true,
  wakeWindowStart: "06:30",
  wakeWindowEnd: "08:30",
  weekendShiftMinutes: 30,
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  smartSnoozeMode: "adaptive_decay",
  snoozeIntervalMinutes: 10,
  maxSnoozeCount: 3,
  currentSnoozeCount: 0,
  autoEscalateSound: true,
  requireFastHours: 8
};

export function formatTime12h(time24: string): string {
  const [hStr, mStr] = (time24 || "07:30").split(":");
  const hour = parseInt(hStr || "7", 10);
  const minute = parseInt(mStr || "30", 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function addMinutesToTime24(time24: string, addMins: number): string {
  const [hStr, mStr] = (time24 || "07:30").split(":");
  const h = parseInt(hStr || "7", 10);
  const m = parseInt(mStr || "30", 10);
  let total = h * 60 + m + addMins;
  while (total < 0) total += 24 * 60;
  total = total % (24 * 60);
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

/**
 * Computes effective wake-up window & target time (accounting for weekend shift if enabled)
 */
export function getEffectiveWakeWindow(config: FastingReminderConfig, refDate: Date = new Date()): {
  isWeekend: boolean;
  shiftMinutes: number;
  effectiveStart: string;
  effectiveEnd: string;
  effectiveTarget: string;
  formattedStart: string;
  formattedEnd: string;
  formattedTarget: string;
} {
  const day = refDate.getDay();
  const isWeekend = day === 0 || day === 6;
  const shiftMinutes = isWeekend && config.weekendShiftMinutes ? config.weekendShiftMinutes : 0;

  const baseStart = config.wakeWindowStart || "06:30";
  const baseEnd = config.wakeWindowEnd || "08:30";
  const baseTarget = config.targetTime || "07:30";

  const effectiveStart = shiftMinutes ? addMinutesToTime24(baseStart, shiftMinutes) : baseStart;
  const effectiveEnd = shiftMinutes ? addMinutesToTime24(baseEnd, shiftMinutes) : baseEnd;
  const effectiveTarget = shiftMinutes ? addMinutesToTime24(baseTarget, shiftMinutes) : baseTarget;

  return {
    isWeekend,
    shiftMinutes,
    effectiveStart,
    effectiveEnd,
    effectiveTarget,
    formattedStart: formatTime12h(effectiveStart),
    formattedEnd: formatTime12h(effectiveEnd),
    formattedTarget: formatTime12h(effectiveTarget)
  };
}

/**
 * Generates the sequence of snooze intervals (in minutes) for each allowed snooze step.
 */
export function getSnoozeSequencePreview(config: FastingReminderConfig): number[] {
  const base = config.snoozeIntervalMinutes || 10;
  const maxCount = Math.max(1, Math.min(5, config.maxSnoozeCount || 3));
  const mode = config.smartSnoozeMode || "adaptive_decay";

  const sequence: number[] = [];
  for (let i = 0; i < maxCount; i++) {
    if (mode === "fixed") {
      sequence.push(base);
    } else if (mode === "adaptive_decay") {
      // Progressive decay: e.g. 10m -> 5m -> 3m
      const decayed = i === 0 ? base : i === 1 ? Math.max(3, Math.round(base * 0.5)) : Math.max(2, Math.round(base * 0.3));
      sequence.push(decayed);
    } else {
      // dawn_guard: tapers down as it approaches wakeWindowEnd
      const factor = Math.max(0.35, 1 - i * 0.25);
      sequence.push(Math.max(3, Math.round(base * factor)));
    }
  }
  return sequence;
}

/**
 * Calculates the next smart snooze interval based on user's mode, snooze count, and wake window cutoff.
 */
export function calculateNextSmartSnoozeMinutes(config: FastingReminderConfig): {
  nextMinutes: number;
  remainingSnoozes: number;
  maxSnoozes: number;
  usedSnoozes: number;
  modeLabel: string;
  reason: string;
} {
  const maxSnoozes = Math.max(1, Math.min(5, config.maxSnoozeCount || 3));
  const usedSnoozes = Math.max(0, config.currentSnoozeCount || 0);
  const remainingSnoozes = Math.max(0, maxSnoozes - usedSnoozes);
  const sequence = getSnoozeSequencePreview(config);
  const stepIndex = Math.min(usedSnoozes, sequence.length - 1);
  let nextMinutes = sequence[stepIndex] || config.snoozeIntervalMinutes || 10;

  const mode = config.smartSnoozeMode || "adaptive_decay";
  let modeLabel =
    mode === "adaptive_decay"
      ? "Adaptive Decay"
      : mode === "dawn_guard"
      ? "Dawn Cortisol Guard"
      : "Fixed Interval";

  let reason =
    mode === "adaptive_decay"
      ? `Step ${usedSnoozes + 1}/${maxSnoozes}: Interval tapers (${sequence.join("m → ")}m) to keep check before breakfast.`
      : mode === "dawn_guard"
      ? `Clamped before ${formatTime12h(config.wakeWindowEnd || "08:30")} wake window cutoff to avoid Dawn Phenomenon spikes.`
      : `Standard ${nextMinutes}-minute fixed snooze interval.`;

  if (mode === "dawn_guard" && config.wakeWindowEnabled && config.wakeWindowEnd) {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const [endH, endM] = config.wakeWindowEnd.split(":").map(Number);
    const endMins = endH * 60 + endM;
    const minsUntilCutoff = endMins - nowMins;
    if (minsUntilCutoff > 2 && minsUntilCutoff < nextMinutes) {
      nextMinutes = Math.max(2, minsUntilCutoff - 1);
      reason = `Smart-clamped to ${nextMinutes}m so you test before your ${formatTime12h(config.wakeWindowEnd)} wake window closes.`;
    }
  }

  return {
    nextMinutes,
    remainingSnoozes,
    maxSnoozes,
    usedSnoozes,
    modeLabel,
    reason
  };
}

/**
 * Calculates the exact pre-alert time given a target check time and lead minutes.
 * Default: 15 minutes before the user's scheduled morning fasting glucose check.
 */
export function calculatePreAlertTime(targetTime: string, leadMinutes: number = 15): {
  preAlertTime: string;
  formattedTarget: string;
  formattedAlert: string;
} {
  const [hStr, mStr] = (targetTime || "07:30").split(":");
  const h = parseInt(hStr || "7", 10);
  const m = parseInt(mStr || "30", 10);

  const totalTargetMinutes = h * 60 + m;
  // Subtract lead minutes, handling midnight boundary wrapping if applicable
  let totalAlertMinutes = totalTargetMinutes - leadMinutes;
  if (totalAlertMinutes < 0) {
    totalAlertMinutes += 24 * 60;
  }

  const alertH = Math.floor(totalAlertMinutes / 60) % 24;
  const alertM = totalAlertMinutes % 60;

  const preAlertTime = `${String(alertH).padStart(2, "0")}:${String(alertM).padStart(2, "0")}`;

  return {
    preAlertTime,
    formattedTarget: formatTime12h(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`),
    formattedAlert: formatTime12h(preAlertTime)
  };
}

/**
 * Checks if current time is within the alert window for today (same minute or within 2 minutes)
 */
export function isAlertTimeNow(alertTime: string): boolean {
  const now = new Date();
  const currentH = now.getHours();
  const currentM = now.getMinutes();
  const currentMinutes = currentH * 60 + currentM;

  const [aH, aM] = alertTime.split(":").map(Number);
  const alertMinutes = aH * 60 + aM;

  return currentMinutes === alertMinutes;
}

/**
 * Formats countdown string to the next alert
 */
export function getCountdownToAlert(alertTime: string): string {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [aH, aM] = alertTime.split(":").map(Number);
  const alertMinutes = aH * 60 + aM;

  let diffMinutes = alertMinutes - currentMinutes;
  if (diffMinutes <= 0) {
    // Next day
    diffMinutes += 24 * 60;
  }

  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  if (hours === 0) {
    return `in ${mins} min${mins === 1 ? "" : "s"}`;
  }
  return `in ${hours}h ${mins}m`;
}

/**
 * Synthesizes a soothing medical audio chime using the Web Audio API.
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Gentle chord: D5 (587.33Hz) followed by A5 (880Hz) and high D6 (1174.66Hz)
    const notes = [
      { freq: 587.33, start: 0, duration: 0.4 },
      { freq: 880.0, start: 0.12, duration: 0.5 },
      { freq: 1174.66, start: 0.26, duration: 0.7 }
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (err) {
    console.warn("Audio chime unsupported or blocked by autoplay policy", err);
  }
}

/**
 * Haptic vibration for mobile devices / Android PWA
 */
export function triggerHaptic(pattern: number[] = [200, 100, 200, 100, 300]): void {
  try {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Gets notification permission state
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Requests native browser / PWA push notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error("Failed to request notification permission:", err);
    return Notification.permission;
  }
}

/**
 * Sends a native push notification via Service Worker or Notification API
 */
export async function sendNativeNotification(
  title: string,
  options: NotificationOptions & { url?: string }
): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const notificationOptions: NotificationOptions & Record<string, any> = {
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    tag: "morning-fasting-glucose-precheck",
    renotify: true,
    ...options
  };

  try {
    // Attempt ServiceWorker showNotification first (native Android PWA support)
    if ("serviceWorker" in navigator) {
      try {
        const reg = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 500))
        ]);
        if (reg && reg.showNotification) {
          await reg.showNotification(title, notificationOptions);
          return true;
        }
      } catch {
        // Fallback to standard window Notification below
      }
    }

    // Fallback to standard window Notification
    const notif = new Notification(title, notificationOptions);
    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn("Native notification dispatch error:", err);
    return false;
  }
}
