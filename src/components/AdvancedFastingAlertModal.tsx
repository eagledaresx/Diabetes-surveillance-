/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Sun,
  Clock,
  SlidersHorizontal,
  BellRing,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Volume2,
  Vibrate,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  Check,
  Timer,
  TrendingDown,
  Sunrise
} from "lucide-react";
import { FastingReminderConfig } from "../types";
import {
  calculatePreAlertTime,
  formatTime12h,
  getSnoozeSequencePreview,
  getEffectiveWakeWindow,
  playNotificationChime,
  triggerHaptic
} from "../lib/notifications";

interface AdvancedFastingAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FastingReminderConfig;
  onSaveConfig: (updatedConfig: FastingReminderConfig) => void;
  onTestAlert?: (previewConfig: FastingReminderConfig) => void;
}

const WAKE_WINDOW_PRESETS = [
  {
    id: "early_riser",
    label: "Early Riser",
    badge: "05:30 – 07:30",
    wakeStart: "05:30",
    targetTime: "06:30",
    wakeEnd: "07:30",
    desc: "Ideal for early shift schedules & pre-dawn workouts"
  },
  {
    id: "standard_clinical",
    label: "Standard Clinical",
    badge: "06:30 – 08:30",
    wakeStart: "06:30",
    targetTime: "07:30",
    wakeEnd: "08:30",
    desc: "Optimal ADA window before morning cortisol surge peaks"
  },
  {
    id: "flexible_morning",
    label: "Flexible Morning",
    badge: "07:30 – 09:30",
    wakeStart: "07:30",
    targetTime: "08:30",
    wakeEnd: "09:30",
    desc: "Balanced schedule for remote work & later breakfast"
  },
  {
    id: "late_riser",
    label: "Late / Night Shift",
    badge: "08:30 – 10:30",
    wakeStart: "08:30",
    targetTime: "09:30",
    wakeEnd: "10:30",
    desc: "Shifted circadian window for late-morning fasters"
  }
];

const DAYS_OF_WEEK = [
  { day: 1, short: "M", name: "Mon" },
  { day: 2, short: "T", name: "Tue" },
  { day: 3, short: "W", name: "Wed" },
  { day: 4, short: "T", name: "Thu" },
  { day: 5, short: "F", name: "Fri" },
  { day: 6, short: "S", name: "Sat" },
  { day: 0, short: "S", name: "Sun" }
];

export const AdvancedFastingAlertModal: React.FC<AdvancedFastingAlertModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestAlert
}) => {
  const [draft, setDraft] = useState<FastingReminderConfig>(config);
  const [activeSection, setActiveSection] = useState<"wake_window" | "smart_snooze" | "protocol">("wake_window");
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft({
        ...config,
        wakeWindowEnabled: config.wakeWindowEnabled ?? true,
        wakeWindowStart: config.wakeWindowStart || "06:30",
        wakeWindowEnd: config.wakeWindowEnd || "08:30",
        weekendShiftMinutes: config.weekendShiftMinutes ?? 30,
        activeDays: config.activeDays || [0, 1, 2, 3, 4, 5, 6],
        smartSnoozeMode: config.smartSnoozeMode || "adaptive_decay",
        snoozeIntervalMinutes: config.snoozeIntervalMinutes || 10,
        maxSnoozeCount: config.maxSnoozeCount || 3,
        currentSnoozeCount: config.currentSnoozeCount || 0,
        autoEscalateSound: config.autoEscalateSound ?? true,
        requireFastHours: config.requireFastHours || 8
      });
      setSavedBanner(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const { preAlertTime, formattedTarget, formattedAlert } = calculatePreAlertTime(
    draft.targetTime,
    draft.leadMinutes || 15
  );

  const effectiveWindow = getEffectiveWakeWindow(draft);
  const snoozeSequence = getSnoozeSequencePreview(draft);
  const totalSnoozeMinutes = snoozeSequence.reduce((acc, m) => acc + m, 0);

  const handleApplyPreset = (preset: (typeof WAKE_WINDOW_PRESETS)[number]) => {
    setDraft((prev) => ({
      ...prev,
      wakeWindowEnabled: true,
      wakeWindowStart: preset.wakeStart,
      targetTime: preset.targetTime,
      wakeWindowEnd: preset.wakeEnd
    }));
  };

  const handleToggleDay = (dayNum: number) => {
    const current = draft.activeDays || [0, 1, 2, 3, 4, 5, 6];
    if (current.includes(dayNum)) {
      if (current.length <= 1) return; // Keep at least 1 active day
      setDraft({ ...draft, activeDays: current.filter((d) => d !== dayNum) });
    } else {
      setDraft({ ...draft, activeDays: [...current, dayNum].sort() });
    }
  };

  const handleSave = () => {
    onSaveConfig(draft);
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 650);
  };

  const handleTest = () => {
    onSaveConfig(draft);
    if (draft.soundEnabled) playNotificationChime();
    if (draft.vibrationEnabled) triggerHaptic([200, 100, 200, 100, 300]);
    if (onTestAlert) {
      onTestAlert(draft);
    }
  };

  return (
    <div
      id="advanced-fasting-alert-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
    >
      <div
        id="advanced-fasting-alert-modal"
        className="w-full max-w-lg bg-neutral-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] my-auto text-neutral-100"
      >
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/70 via-neutral-900 to-cyan-950/50 border-b border-neutral-800 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                  Advanced Morning Check
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                  -{draft.leadMinutes}m Lead • {draft.smartSnoozeMode === "adaptive_decay" ? "Adaptive Snooze" : draft.smartSnoozeMode === "dawn_guard" ? "Dawn Guard" : "Fixed Snooze"}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Wake-Up Time Windows &amp; Smart Snooze
              </h3>
              <p className="text-[11px] text-neutral-300 mt-0.5">
                Configure circadian wake-up windows, Dawn Phenomenon cutoffs, and adaptive snooze intervals.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-advanced-fasting-modal"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Summary Strip */}
        <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 grid grid-cols-3 gap-2 text-center shrink-0">
          <div className="p-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
            <span className="text-[9px] font-mono text-neutral-400 uppercase block">Wake Window</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {formatTime12h(draft.wakeWindowStart || "06:30")} – {formatTime12h(draft.wakeWindowEnd || "08:30")}
            </span>
          </div>
          <div className="p-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
            <span className="text-[9px] font-mono text-cyan-400 uppercase block">Pre-Alert → Check</span>
            <span className="text-xs font-bold text-white font-mono">
              {formattedAlert} → {formattedTarget}
            </span>
          </div>
          <div className="p-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800">
            <span className="text-[9px] font-mono text-purple-400 uppercase block">Smart Snooze</span>
            <span className="text-xs font-bold text-purple-300 font-mono">
              {snoozeSequence.join("→")}m ({draft.maxSnoozeCount || 3}x)
            </span>
          </div>
        </div>

        {/* Sub-Navigation Tabs inside Modal */}
        <div className="px-4 pt-3 pb-1 bg-neutral-900 shrink-0">
          <div className="grid grid-cols-3 gap-1.5 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 text-xs font-bold">
            <button
              type="button"
              id="tab-adv-wake-window"
              onClick={() => setActiveSection("wake_window")}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSection === "wake_window"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sunrise className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Wake Window</span>
            </button>
            <button
              type="button"
              id="tab-adv-smart-snooze"
              onClick={() => setActiveSection("smart_snooze")}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSection === "smart_snooze"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Smart Snooze</span>
            </button>
            <button
              type="button"
              id="tab-adv-protocol"
              onClick={() => setActiveSection("protocol")}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeSection === "protocol"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Fast &amp; Audio</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* SECTION 1: WAKE-UP TIME WINDOWS */}
          {activeSection === "wake_window" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Enable Wake-Up Window Toggle Card */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white text-xs">
                      Enforce Morning Wake-Up Time Window
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-snug">
                    Aligns your fasting glucose test with your natural wake-up window before hepatic Dawn Phenomenon cortisol elevates baseline readings.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    id="chk-enable-wake-window"
                    type="checkbox"
                    checked={draft.wakeWindowEnabled ?? true}
                    onChange={(e) => setDraft({ ...draft, wakeWindowEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              {/* Quick Circadian Presets */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block">
                  Circadian Wake-Up Window Presets
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {WAKE_WINDOW_PRESETS.map((preset) => {
                    const isSelected =
                      draft.wakeWindowStart === preset.wakeStart &&
                      draft.targetTime === preset.targetTime &&
                      draft.wakeWindowEnd === preset.wakeEnd;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        id={`btn-wake-preset-${preset.id}`}
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/50 text-white shadow-sm"
                            : "bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-white">{preset.label}</span>
                          <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 leading-snug">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Start, Target & End Time Pickers */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Specific Wake-Up Window &amp; Check Schedule
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Alert at {formattedAlert}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                      Window Opens
                    </label>
                    <input
                      id="input-wake-window-start"
                      type="time"
                      value={draft.wakeWindowStart || "06:30"}
                      onChange={(e) => setDraft({ ...draft, wakeWindowStart: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-2 text-white font-mono text-xs font-bold text-center focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-neutral-500 font-mono block text-center mt-0.5">
                      Earliest wake
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-amber-300 font-bold mb-1">
                      Target Check
                    </label>
                    <input
                      id="input-modal-target-time"
                      type="time"
                      value={draft.targetTime}
                      onChange={(e) => setDraft({ ...draft, targetTime: e.target.value })}
                      className="w-full bg-amber-950/30 border border-amber-500/50 rounded-xl px-2 py-2 text-amber-200 font-mono text-xs font-bold text-center focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-[9px] text-amber-400/90 font-mono block text-center mt-0.5">
                      Primary check
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-neutral-400 mb-1">
                      Window Cutoff
                    </label>
                    <input
                      id="input-wake-window-end"
                      type="time"
                      value={draft.wakeWindowEnd || "08:30"}
                      onChange={(e) => setDraft({ ...draft, wakeWindowEnd: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2 py-2 text-white font-mono text-xs font-bold text-center focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-neutral-500 font-mono block text-center mt-0.5">
                      Cortisol cutoff
                    </span>
                  </div>
                </div>

                {/* Advance Pre-Alert Lead Buffer */}
                <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-semibold text-neutral-300">
                      Advance Pre-Alert Preparation Lead Time
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">
                      {draft.leadMinutes || 15} mins before check ({formattedAlert})
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[5, 10, 15, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        id={`btn-lead-mins-${mins}`}
                        onClick={() => setDraft({ ...draft, leadMinutes: mins })}
                        className={`py-1.5 rounded-xl font-mono text-[11px] font-bold border transition-all cursor-pointer ${
                          (draft.leadMinutes || 15) === mins
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        -{mins}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekend Shift & Active Days */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-bold text-white text-xs">
                      Active Days &amp; Weekend Wake-Up Shift
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300">
                    {draft.weekendShiftMinutes ? `+${draft.weekendShiftMinutes}m on Sat/Sun` : "Same daily"}
                  </span>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isActive = (draft.activeDays || [0, 1, 2, 3, 4, 5, 6]).includes(d.day);
                    return (
                      <button
                        key={d.day}
                        type="button"
                        onClick={() => handleToggleDay(d.day)}
                        className={`py-2 rounded-xl font-mono text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center ${
                          isActive
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                            : "bg-neutral-900 border-neutral-800 text-neutral-500"
                        }`}
                      >
                        <span>{d.short}</span>
                        <span className="text-[8.5px] font-normal opacity-80">{d.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Weekend shift selector */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Weekend Sleep-In Window Shift (Saturday &amp; Sunday):
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: "No Shift", val: 0 },
                      { label: "+30 Min", val: 30 },
                      { label: "+60 Min", val: 60 },
                      { label: "+90 Min", val: 90 }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setDraft({ ...draft, weekendShiftMinutes: opt.val })}
                        className={`py-1.5 rounded-xl font-mono text-[10.5px] font-bold border transition-all cursor-pointer ${
                          (draft.weekendShiftMinutes ?? 30) === opt.val
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: SMART SNOOZE INTERVALS */}
          {activeSection === "smart_snooze" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Smart Snooze Algorithm Selector */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                  Smart Snooze Algorithm
                </span>

                <div className="space-y-2">
                  {[
                    {
                      id: "adaptive_decay" as const,
                      title: "Adaptive Decay Snooze (Recommended)",
                      badge: "Progressive Taper",
                      desc: "Automatically shortens each consecutive snooze (e.g. 10m → 5m → 3m) so you complete your handwashing and fasting test before breakfast."
                    },
                    {
                      id: "dawn_guard" as const,
                      title: "Dawn Phenomenon Cortisol Guard",
                      badge: `Clamped to ${formatTime12h(draft.wakeWindowEnd || "08:30")}`,
                      desc: "Dynamically clamps snooze duration so your alert never drifts past your Wake-Up Window Cutoff when hepatic glucose spikes."
                    },
                    {
                      id: "fixed" as const,
                      title: "Fixed Interval Snooze",
                      badge: "Uniform Step",
                      desc: "Uses the exact same minute interval on every snooze tap up to your maximum daily snooze limit."
                    }
                  ].map((modeItem) => {
                    const isSelected = (draft.smartSnoozeMode || "adaptive_decay") === modeItem.id;
                    return (
                      <button
                        key={modeItem.id}
                        type="button"
                        id={`btn-snooze-mode-${modeItem.id}`}
                        onClick={() => setDraft({ ...draft, smartSnoozeMode: modeItem.id })}
                        className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-500/15 border-purple-500/50 text-white shadow-sm"
                            : "bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            {modeItem.title}
                          </span>
                          <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                            {modeItem.badge}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-neutral-400 mt-1 leading-snug">
                          {modeItem.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Base Snooze Interval & Max Snooze Count */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-purple-400" />
                      Initial Snooze Interval Duration
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 font-bold">
                      {draft.snoozeIntervalMinutes || 10} minutes
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[3, 5, 10, 15, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        id={`btn-snooze-interval-${mins}`}
                        onClick={() => setDraft({ ...draft, snoozeIntervalMinutes: mins })}
                        className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                          (draft.snoozeIntervalMinutes || 10) === mins
                            ? "bg-purple-500/25 text-purple-200 border-purple-400"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Maximum Snooze Count */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white">
                      Maximum Snoozes Per Morning
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      Max {draft.maxSnoozeCount || 3} snoozes ({totalSnoozeMinutes}m total cap)
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        id={`btn-max-snooze-${cnt}`}
                        onClick={() => setDraft({ ...draft, maxSnoozeCount: cnt })}
                        className={`py-1.5 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                          (draft.maxSnoozeCount || 3) === cnt
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {cnt}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Step-by-Step Snooze Timeline Preview */}
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-purple-400" />
                      Simulated Morning Snooze Cadence
                    </span>
                    {(draft.currentSnoozeCount || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, currentSnoozeCount: 0, snoozedUntil: null })}
                        className="text-[9.5px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                      >
                        Reset Today ({draft.currentSnoozeCount} used)
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {snoozeSequence.map((mins, idx) => (
                      <React.Fragment key={idx}>
                        <div className="flex-1 min-w-[68px] p-2 rounded-xl bg-neutral-950 border border-purple-500/30 text-center">
                          <span className="text-[9px] font-mono text-neutral-400 block">
                            Snooze #{idx + 1}
                          </span>
                          <span className="text-xs font-extrabold text-purple-300 font-mono">
                            +{mins} min
                          </span>
                        </div>
                        {idx < snoozeSequence.length - 1 && (
                          <span className="text-neutral-500 font-mono text-xs">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: FASTING DURATION & AUDIO ESCALATION */}
          {activeSection === "protocol" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Minimum Water-Only Fasting Window */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">
                    Target Overnight Fasting Duration
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {draft.requireFastHours || 8} Hours Water-Only
                  </span>
                </div>
                <p className="text-[10.5px] text-neutral-400 leading-snug">
                  Displayed on your morning readiness checklist to verify zero caloric intake prior to fingerstick or CGM calibration.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[8, 10, 12, 14].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDraft({ ...draft, requireFastHours: hrs })}
                      className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                        (draft.requireFastHours || 8) === hrs
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {hrs} Hours
                    </button>
                  ))}
                </div>
              </div>

              {/* Progressive Audio & Haptic Escalation */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white text-xs block">
                        Final-Snooze Chime &amp; Haptic Escalation
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Plays a double chime and stronger vibration pulse when final snooze expires
                      </span>
                    </div>
                  </div>
                  <input
                    id="chk-auto-escalate-sound"
                    type="checkbox"
                    checked={draft.autoEscalateSound ?? true}
                    onChange={(e) => setDraft({ ...draft, autoEscalateSound: e.target.checked })}
                    className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/80">
                  <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-[11px] font-bold text-white">Audio Chime</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={draft.soundEnabled}
                      onChange={(e) => setDraft({ ...draft, soundEnabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
                    />
                  </div>
                  <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Vibrate className="w-4 h-4 text-purple-400" />
                      <span className="text-[11px] font-bold text-white">Haptic Pulse</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={draft.vibrationEnabled}
                      onChange={(e) => setDraft({ ...draft, vibrationEnabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Morning Checklist Instructions */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
                <label className="block text-[10.5px] font-mono uppercase text-neutral-300 font-bold">
                  Custom Wake-Up Readiness Instruction
                </label>
                <textarea
                  value={draft.customNotes || ""}
                  onChange={(e) => setDraft({ ...draft, customNotes: e.target.value })}
                  rows={2}
                  placeholder="e.g. Drink 1 glass of plain water upon waking; test ring finger after 5 mins rest..."
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            id="btn-simulate-smart-fasting-alert"
            onClick={handleTest}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 border border-amber-500/30 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Smart Alert Banner</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-advanced-fasting-settings"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-950/40 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {savedBanner ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Advanced Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFastingAlertModal;
