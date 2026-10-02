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
  Droplet,
  ShieldCheck,
  ArrowRight,
  BellRing,
  RotateCcw
} from "lucide-react";
import { FastingReminderConfig } from "../types";
import { calculatePreAlertTime } from "../lib/notifications";

interface FastingAlertBannerProps {
  config: FastingReminderConfig;
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (minutes: number) => void;
  onLogFastingNow: () => void;
}

export const FastingAlertBanner: React.FC<FastingAlertBannerProps> = ({
  config,
  isOpen,
  onClose,
  onSnooze,
  onLogFastingNow
}) => {
  if (!isOpen) return null;

  const { formattedTarget, formattedAlert } = calculatePreAlertTime(
    config.targetTime,
    config.leadMinutes
  );

  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (stepIdx: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepIdx]: !prev[stepIdx]
    }));
  };

  const steps = [
    { id: 1, text: "Wash and dry hands thoroughly with warm water (removes skin sugars)." },
    { id: 2, text: "Sit calmly for 5 minutes to stabilize morning cortisol and baseline pulse." },
    { id: 3, text: "Confirm 8h strict water-only fast (no tea, milk, or snacks)." },
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
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                  15-Min Advance Alert
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {formattedAlert}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Morning Fasting Check in 15 Minutes
              </h3>
              <p className="text-xs text-amber-200/90 mt-0.5">
                Target scheduled check at <strong className="text-white font-mono">{formattedTarget}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 text-xs">
          <p className="text-neutral-300 leading-relaxed text-[11.5px]">
            Good morning! Your scheduled morning fasting blood glucose test is in 15 minutes. Take this window to complete the clinical readiness steps:
          </p>

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
                id="btn-alert-snooze-5"
                onClick={() => onSnooze(5)}
                className="flex-1 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs rounded-xl border border-neutral-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                <span>Snooze 5 Min</span>
              </button>
              <button
                type="button"
                id="btn-alert-dismiss"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-xs rounded-xl border border-neutral-750 transition-colors cursor-pointer text-center"
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
