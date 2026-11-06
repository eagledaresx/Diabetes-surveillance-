/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sun,
  Clock,
  CheckCircle2,
  X,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Sunrise
} from "lucide-react";
import { FastingReminderConfig } from "../types";
import {
  calculatePreAlertTime,
  calculateNextSmartSnoozeMinutes,
  getEffectiveWakeWindow
} from "../lib/notifications";

interface FastingAlertBannerProps {
  config: FastingReminderConfig;
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (minutes: number) => void;
  onLogFastingNow: () => void;
  onOpenAdvancedSettings?: () => void;
}

export const FastingAlertBanner: React.FC<FastingAlertBannerProps> = ({
  config,
  isOpen,
  onClose,
  onSnooze,
  onLogFastingNow,
  onOpenAdvancedSettings
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const leadMins = config.leadMinutes || 15;
  const { formattedTarget, formattedAlert } = calculatePreAlertTime(
    config.targetTime,
    leadMins
  );

  const wakeWindow = getEffectiveWakeWindow(config);
  const smartSnooze = calculateNextSmartSnoozeMinutes(config);
  const fastHours = config.requireFastHours || 8;

  const toggleStep = (stepIdx: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepIdx]: !prev[stepIdx]
    }));
  };

  const steps = [
    { id: 1, text: "Wash and dry hands thoroughly with warm water (removes skin sugars)." },
    { id: 2, text: "Sit calmly for 5 minutes to stabilize morning cortisol and baseline pulse." },
    { id: 3, text: `Confirm ${fastHours}h strict water-only fast (no tea, milk, or snacks).` },
    { id: 4, text: "Insert fresh test strip into glucometer and cock sterile lancet." }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-neutral-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl shadow-amber-950/60 overflow-hidden my-auto animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/60 border-b border-amber-500/30 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                  {leadMins}-Min Advance Alert
                </span>
                <span className="text-[10px] font-mono text-neutral-300">
                  {formattedAlert}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Morning Fasting Check in {leadMins} Minutes
              </h3>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Target scheduled check at <strong className="text-white font-mono">{formattedTarget}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenAdvancedSettings && (
              <button
                type="button"
                id="btn-banner-open-advanced-fasting"
                onClick={onOpenAdvancedSettings}
                title="Configure Wake-Up Window & Smart Snooze"
                className="p-1.5 text-amber-300 hover:text-white rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* Wake-Up Window & Smart Snooze Status Bar */}
          {config.wakeWindowEnabled !== false && (
            <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between gap-2 text-[10.5px]">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Sunrise className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Wake Window:{" "}
                  <strong className="text-amber-300 font-mono">
                    {wakeWindow.formattedStart} – {wakeWindow.formattedEnd}
                  </strong>
                </span>
              </div>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                {smartSnooze.modeLabel}
              </span>
            </div>
          )}

          {/* Checklist */}
          <div className="space-y-2 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block mb-1">
              Readiness Checklist (Tap to tick)
            </span>
            {steps.map((step) => {
              const isChecked = !!checkedSteps[step.id];
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className={`w-full p-2 rounded-xl text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    isChecked
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-neutral-300"
                      : "bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-400 text-neutral-950"
                        : "border-neutral-700 bg-neutral-950"
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className={`text-[11px] leading-snug ${isChecked ? "text-neutral-200 line-through" : "text-neutral-300"}`}>
                    {step.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Note if provided */}
          {config.customNotes && (
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] flex items-start gap-2">
              <span className="font-bold text-amber-400 shrink-0 font-mono">Note:</span>
              <p className="italic">{config.customNotes}</p>
            </div>
          )}

          {/* Smart Snooze Panel */}
          <div className="p-3 bg-neutral-950 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                Smart Snooze Interval ({smartSnooze.remainingSnoozes}/{smartSnooze.maxSnoozes} left)
              </span>
              {onOpenAdvancedSettings && (
                <button
                  type="button"
                  onClick={onOpenAdvancedSettings}
                  className="text-[9.5px] font-mono text-amber-300 hover:text-amber-200 underline cursor-pointer"
                >
                  Customize
                </button>
              )}
            </div>
            <p className="text-[10px] text-neutral-400 leading-snug">
              {smartSnooze.reason}
            </p>
            {smartSnooze.remainingSnoozes > 0 && (
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {[3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onSnooze(mins)}
                    className={`py-1.5 rounded-lg font-mono text-[10.5px] font-bold border transition-all cursor-pointer ${
                      smartSnooze.nextMinutes === mins
                        ? "bg-purple-500/25 text-purple-200 border-purple-400"
                        : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white"
                    }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              id="btn-alert-log-fasting"
              onClick={onLogFastingNow}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span>Log Fasting Glucose Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                id="btn-alert-snooze-smart"
                disabled={smartSnooze.remainingSnoozes <= 0}
                onClick={() => onSnooze(smartSnooze.nextMinutes)}
                className={`flex-1 py-2.5 px-3 font-bold text-xs rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                  smartSnooze.remainingSnoozes > 0
                    ? "bg-purple-950/50 hover:bg-purple-900/60 text-purple-200 border-purple-500/40 cursor-pointer"
                    : "bg-neutral-900 text-neutral-500 border-neutral-800 cursor-not-allowed"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {smartSnooze.remainingSnoozes > 0
                    ? `Smart Snooze (${smartSnooze.nextMinutes} Min)`
                    : "Max Snoozes Used"}
                </span>
              </button>
              <button
                type="button"
                id="btn-alert-dismiss"
                onClick={onClose}
                className="py-2.5 px-4 bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-xs rounded-xl border border-neutral-750 transition-colors cursor-pointer text-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

