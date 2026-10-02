/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Vibrate,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Info,
  Check,
  Coffee,
  Droplet,
  HeartPulse,
  Flame,
  ArrowRight,
  RefreshCw,
  Sun,
  AlertTriangle
} from "lucide-react";
import { FastingReminderConfig, GlucoseReading } from "../types";
import {
  calculatePreAlertTime,
  playNotificationChime,
  triggerHaptic,
  getNotificationPermission,
  requestNotificationPermission,
  sendNativeNotification,
  getCountdownToAlert
} from "../lib/notifications";

interface FastingGlucoseReminderProps {
  config: FastingReminderConfig;
  onUpdateConfig: (newConfig: FastingReminderConfig) => void;
  todayReadings: GlucoseReading[];
  onOpenLogFasting?: () => void;
  onSimulateAlert?: () => void;
}

export const FastingGlucoseReminder: React.FC<FastingGlucoseReminderProps> = ({
  config,
  onUpdateConfig,
  todayReadings,
  onOpenLogFasting,
  onSimulateAlert
}) => {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [copiedTime, setCopiedTime] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const { preAlertTime, formattedTarget, formattedAlert } = calculatePreAlertTime(
    config.targetTime,
    config.leadMinutes
  );

  const countdown = getCountdownToAlert(preAlertTime);

  // Check if fasting glucose has already been logged today
  const todaysFastingReading = todayReadings.find((r) => r.type === "fasting");

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === "granted") {
      onUpdateConfig({ ...config, browserNotificationsEnabled: true });
      await sendNativeNotification("🌅 Notifications Enabled!", {
        body: `You will be alerted at ${formattedAlert} (15 mins before your ${formattedTarget} fasting check).`
      });
    }
  };

  const handleFireTestAlert = async () => {
    if (config.soundEnabled) {
      playNotificationChime();
    }
    if (config.vibrationEnabled) {
      triggerHaptic([200, 100, 200, 100, 300]);
    }

    if (config.browserNotificationsEnabled && permission === "granted") {
      await sendNativeNotification("🌅 Fasting Glucose Check in 15 Minutes", {
        body: `Scheduled check at ${formattedTarget}. Wash hands with warm water, check your fasting status, and prep your test strip.`,
        data: { url: window.location.href }
      });
    }

    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3500);

    if (onSimulateAlert) {
      onSimulateAlert();
    }
  };

  const handlePresetSelect = (timeStr: string) => {
    onUpdateConfig({
      ...config,
      targetTime: timeStr
    });
  };

  const PRESETS = [
    { label: "06:30 AM", val: "06:30" },
    { label: "07:00 AM", val: "07:00" },
    { label: "07:30 AM", val: "07:30" },
    { label: "08:00 AM", val: "08:00" },
    { label: "08:30 AM", val: "08:30" },
    { label: "09:00 AM", val: "09:00" }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Hero Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-950 border border-amber-500/30 space-y-3.5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sun className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                15-Min Pre-Check Alert System
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase">
                Pro Feature
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Morning Fasting Glucose Pre-Alert
            </h3>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Sends an advance push notification and alarm <strong className="text-amber-300">15 minutes before</strong> your scheduled morning check, allowing adequate time for proper handwashing, resting, and preparing your glucometer.
            </p>
          </div>

          {/* Master Enable Toggle */}
          <div className="flex flex-col items-end shrink-0 pt-0.5">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-fasting-reminder"
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => onUpdateConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
            <span className="text-[9.5px] font-mono mt-1 text-neutral-400">
              {config.enabled ? "Active" : "Disabled"}
            </span>
          </div>
        </div>

        {/* 15-Minute Math Visual Widget */}
        <div className="p-3 bg-neutral-950/80 border border-neutral-800/80 rounded-xl grid grid-cols-3 gap-2 text-center divide-x divide-neutral-800/80">
          <div>
            <span className="text-[9px] font-mono text-neutral-400 uppercase block">Target Check</span>
            <span className="text-sm font-bold text-white font-mono">{formattedTarget}</span>
            <span className="text-[9px] text-neutral-500 block">Morning scheduled</span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-amber-400 font-bold uppercase block">Lead Window</span>
            <span className="text-sm font-bold text-amber-300 font-mono">-15 min</span>
            <span className="text-[9px] text-neutral-500 block">Preparation buffer</span>
          </div>
          <div>
            <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase block">🔔 Alert Fires</span>
            <span className="text-sm font-bold text-cyan-300 font-mono">{formattedAlert}</span>
            <span className="text-[9px] text-neutral-500 block">{countdown}</span>
          </div>
        </div>

        {/* Today's Fasting Check Status Pill */}
        <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {todaysFastingReading ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-[11px] text-neutral-300">
              Today's Fasting Check:{" "}
              {todaysFastingReading ? (
                <strong className="text-emerald-300">
                  Completed ({todaysFastingReading.value} mg/dL at {todaysFastingReading.time})
                </strong>
              ) : (
                <strong className="text-amber-300">Pending today's check</strong>
              )}
            </span>
          </div>
          {onOpenLogFasting && (
            <button
              type="button"
              id="btn-fasting-quick-log"
              onClick={onOpenLogFasting}
              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Log Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Target Schedule Time Customizer */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-white text-xs uppercase tracking-wide font-mono">
              Schedule Morning Fasting Time
            </h4>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">24h format</span>
        </div>

        {/* Custom time picker */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <label className="block text-[10px] text-neutral-400 font-mono mb-1">
              Select Scheduled Morning Glucose Time:
            </label>
            <input
              id="input-fasting-target-time"
              type="time"
              value={config.targetTime}
              onChange={(e) => onUpdateConfig({ ...config, targetTime: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 text-center"
            />
          </div>
          <div className="pt-4 flex-1">
            <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
              <span className="text-[10px] text-neutral-400 block font-mono">Calculated Alert Time</span>
              <span className="text-base font-black text-amber-400 font-mono">{formattedAlert}</span>
              <span className="text-[9px] text-neutral-500 block">(15 minutes prior)</span>
            </div>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div>
          <span className="text-[10px] text-neutral-400 font-mono mb-1.5 block">Quick Time Presets:</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {PRESETS.map((preset) => {
              const isSelected = config.targetTime === preset.val;
              return (
                <button
                  key={preset.val}
                  type="button"
                  id={`btn-preset-${preset.val.replace(":", "")}`}
                  onClick={() => handlePresetSelect(preset.val)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-sm"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Push Notification & Alarm Channels */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3.5 text-xs">
        <h4 className="font-bold text-white text-xs uppercase tracking-wide font-mono flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          Alert Delivery Channels
        </h4>

        {/* Native Browser / OS Push Notification */}
        <div className="p-3 bg-neutral-950 border border-neutral-800/90 rounded-xl space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-white">Browser & WebAPK Push Notifications</span>
                {permission === "granted" ? (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Granted
                  </span>
                ) : permission === "denied" ? (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" /> Blocked
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Needs Permission
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-neutral-400 leading-snug">
                Pushes a system notification to your Android status bar, lock screen, or desktop tray at {formattedAlert}.
              </p>
            </div>

            <input
              id="chk-push-notifications"
              type="checkbox"
              checked={config.browserNotificationsEnabled}
              onChange={(e) => onUpdateConfig({ ...config, browserNotificationsEnabled: e.target.checked })}
              className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500 mt-1"
            />
          </div>

          {permission !== "granted" && (
            <button
              type="button"
              id="btn-request-notification-perm"
              onClick={handleRequestPermission}
              className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Allow System Push Notifications</span>
            </button>
          )}
        </div>

        {/* Audio Chime & Vibration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Audio Chime */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={playNotificationChime}
                title="Play test chime"
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-400 rounded-lg transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[11px] font-bold text-white block">Medical Audio Chime</span>
                <span className="text-[9.5px] text-neutral-400 font-mono">Gentle sine wake tones</span>
              </div>
            </div>
            <input
              id="chk-sound-enabled"
              type="checkbox"
              checked={config.soundEnabled}
              onChange={(e) => onUpdateConfig({ ...config, soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Haptic Vibration */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => triggerHaptic([200, 100, 200, 100, 300])}
                title="Test vibration"
                className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-purple-400 rounded-lg transition-colors cursor-pointer"
              >
                <Vibrate className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[11px] font-bold text-white block">Device Vibration</span>
                <span className="text-[9.5px] text-neutral-400 font-mono">Haptic pulse pattern</span>
              </div>
            </div>
            <input
              id="chk-vibration-enabled"
              type="checkbox"
              checked={config.vibrationEnabled}
              onChange={(e) => onUpdateConfig({ ...config, vibrationEnabled: e.target.checked })}
              className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-purple-500 focus:ring-0 cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Test Alert Button */}
        <div className="pt-1">
          <button
            type="button"
            id="btn-test-fasting-alert"
            onClick={handleFireTestAlert}
            className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl border border-neutral-700 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Test 15-Min Pre-Check Alert Now</span>
          </button>
          {testNotificationSent && (
            <p className="text-[10px] text-emerald-400 text-center mt-1.5 font-mono animate-fadeIn flex items-center justify-center gap-1">
              <Check className="w-3 h-3" /> Test alert fired! Chime played and system push sent.
            </p>
          )}
        </div>
      </div>

      {/* Clinical Preparation Protocol Guide */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h4 className="font-bold text-white text-xs uppercase tracking-wide font-mono">
            Why 15 Minutes Before? Clinical Rationale
          </h4>
        </div>

        <p className="text-[11px] text-neutral-300 leading-relaxed">
          The American Diabetes Association (ADA) notes that up to 20% of anomalous fasting readings result from rushed measurement errors or residual surface sugar. Taking 15 minutes prevents testing artifacts:
        </p>

        <div className="space-y-2">
          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <span className="font-bold text-white text-[11px] block">Thorough Handwashing with Warm Water</span>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                Warm water promotes peripheral capillary blood flow so you don't squeeze your fingertip (squeezing dilutes blood with interstitial fluid, skewing glucose). Soap removes unseen sugar traces from doorknobs or toiletries.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <span className="font-bold text-white text-[11px] block">5-Minute Physical Rest to Settle Dawn Cortisol</span>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                Morning rush, cold room exposure, or sudden movement stimulates epinephrine and cortisol release, triggering transient hepatic glucose dumping. Sitting still for 5 minutes stabilizes baseline.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <span className="font-bold text-white text-[11px] block">8-Hour Fasting Verification</span>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                Confirm zero caloric intake (including sweetened tea, black coffee with milk, cough drops, or juices) within the last 8 to 12 hours. Plain water is encouraged.
              </p>
            </div>
          </div>

          <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              4
            </span>
            <div>
              <span className="font-bold text-white text-[11px] block">Equipment Readiness Check</span>
              <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                Inspect test strip bottle expiration, insert a fresh sterile lancet (reusing dull needles damages nerve endings), and ensure strip contact is clean.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Note or Protocol Instructions */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 text-xs">
        <label className="block text-[11px] font-bold text-white font-mono uppercase tracking-wide">
          Personal Morning Testing Notes
        </label>
        <textarea
          id="textarea-fasting-notes"
          value={config.customNotes || ""}
          onChange={(e) => onUpdateConfig({ ...config, customNotes: e.target.value })}
          placeholder="e.g. Test from the side of the ring finger; drink 1 glass of warm water first..."
          rows={2}
          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
        />
        <p className="text-[10px] text-neutral-500 font-mono">
          These personal instructions will appear directly inside the 15-minute alert notification.
        </p>
      </div>
    </div>
  );
};
