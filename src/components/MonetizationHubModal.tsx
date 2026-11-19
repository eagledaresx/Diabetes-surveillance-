/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Check,
  X,
  Users,
  Stethoscope,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Trash2,
  FileCheck2,
  HeartPulse,
  Lock,
} from "lucide-react";
import { UserProfile } from "../types";

interface MonetizationHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateTier: (tier: "free" | "pro" | "caregiver_plus") => void;
}

export const MonetizationHubModal: React.FC<MonetizationHubModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateTier,
}) => {
  const [activeTab, setActiveTab] = useState<"modes" | "compliance" | "citations">("modes");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = profile.membershipTier || "free";

  const handleSelectTier = (tier: "free" | "pro" | "caregiver_plus") => {
    onUpdateTier(tier);
    const tierName =
      tier === "pro"
        ? "Advanced Clinical Surveillance Mode"
        : tier === "caregiver_plus"
        ? "Family & Caregiver Guard Mode"
        : "Standard Self-Care Mode";
    setSuccessToast(`Active care profile switched to ${tierName} (100% Free Community Access).`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto animate-scaleUp">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-cyan-950/80 border-b border-neutral-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider">
                  100% Free Community Edition • No Paid Subscriptions
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Mode: {currentTier.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Clinical Care Modes &amp; Google Play Policy Compliance
              </h2>
              <p className="text-xs text-neutral-300 mt-0.5">
                All surveillance tools, reports, and caregiver alerts are completely free with zero in-app purchases or ads.
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

        {/* Navigation Sub-Tabs */}
        <div className="flex bg-neutral-950/90 border-b border-neutral-800 p-1.5 gap-1 overflow-x-auto no-scrollbar text-xs font-mono select-none">
          <button
            type="button"
            onClick={() => setActiveTab("modes")}
            className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "modes"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Care Modes (Free)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("compliance")}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "compliance"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Play Store Policies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("citations")}
            className={`flex-1 min-w-[140px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "citations"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Clinical Citations</span>
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono text-center animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* TAB 1: FREE CLINICAL CARE MODES */}
        {activeTab === "modes" && (
          <div className="p-4 sm:p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* STANDARD MODE */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  currentTier === "free"
                    ? "bg-neutral-900 border-emerald-500/50 ring-1 ring-emerald-500/40"
                    : "bg-neutral-950/60 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                      Standard Mode
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-white font-mono">Free</span>
                      <span className="text-[10px] text-emerald-400 font-mono">• Essential</span>
                    </div>
                    <p className="text-[10.5px] text-neutral-400 mt-1 leading-snug">
                      Streamlined daily blood glucose logging and medication reminders.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Fasting &amp; post-meal manual log</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>7-day glucose trend graphs</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Medication &amp; hydration tracker</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTier("free")}
                    className={`w-full py-2 px-3 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
                      currentTier === "free"
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                    }`}
                  >
                    {currentTier === "free" ? "✓ Active Mode" : "Select Standard"}
                  </button>
                </div>
              </div>

              {/* ADVANCED CLINICAL SURVEILLANCE MODE */}
              <div
                className={`p-4 rounded-2xl border relative flex flex-col justify-between transition-all ${
                  currentTier === "pro"
                    ? "bg-gradient-to-b from-amber-950/40 to-neutral-900 border-amber-500/60 ring-2 ring-amber-500/40"
                    : "bg-neutral-900/90 border-amber-500/35 hover:border-amber-400"
                }`}
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Clinical Pro Mode
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-white font-mono">Free</span>
                      <span className="text-[10px] text-amber-300 font-mono">• Unlocked</span>
                    </div>
                    <p className="text-[10.5px] text-amber-200/90 mt-1 leading-snug">
                      Full clinical surveillance, AGP PDF reports, and smart morning fasting alarms.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5 text-white font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Morning Fasting Wake-Up Alerts</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Clinical Doctor PDF &amp; CSV Reports</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>ADAG HbA1c &amp; Bolus Reference Tools</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTier("pro")}
                    className={`w-full py-2 px-3 rounded-xl font-mono text-[11px] font-black transition-all cursor-pointer ${
                      currentTier === "pro"
                        ? "bg-amber-500 text-neutral-950"
                        : "bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-neutral-950 border border-amber-500/40"
                    }`}
                  >
                    {currentTier === "pro" ? "✓ Pro Mode Active" : "Enable Pro Mode (Free)"}
                  </button>
                </div>
              </div>

              {/* FAMILY & CAREGIVER MODE */}
              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  currentTier === "caregiver_plus"
                    ? "bg-gradient-to-b from-purple-950/40 to-neutral-900 border-purple-500/60 ring-2 ring-purple-500/40"
                    : "bg-neutral-950/80 border-purple-500/30 hover:border-purple-400"
                }`}
              >
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                      Caregiver Guard Mode
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-white font-mono">Free</span>
                      <span className="text-[10px] text-purple-300 font-mono">• Family Care</span>
                    </div>
                    <p className="text-[10.5px] text-purple-200/90 mt-1 leading-snug">
                      Multi-profile switching and WhatsApp/SMS family emergency sharing.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5 text-white font-semibold">
                      <Users className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>All Clinical Pro Features Included</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Multi-Patient Family Profiles</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>WhatsApp &amp; SMS Caregiver Summaries</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTier("caregiver_plus")}
                    className={`w-full py-2 px-3 rounded-xl font-mono text-[11px] font-black transition-all cursor-pointer ${
                      currentTier === "caregiver_plus"
                        ? "bg-purple-500 text-white"
                        : "bg-purple-600/25 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40"
                    }`}
                  >
                    {currentTier === "caregiver_plus" ? "✓ Care+ Mode Active" : "Enable Care+ Mode (Free)"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE PLAY POLICY COMPLIANCE */}
        {activeTab === "compliance" && (
          <div className="p-4 sm:p-5 space-y-3 text-xs">
            <div className="p-3.5 bg-neutral-950 border border-emerald-500/30 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 font-mono text-[11px] uppercase">
                  Google Play Developer Program Policy Audit
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  COMPLIANT
                </span>
              </div>
              <ul className="space-y-2 text-[11px] text-neutral-300 pt-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Health &amp; Medical Apps Policy:</strong> Prominent first-launch and persistent medical disclaimer states the app is not a diagnostic medical device and requires external FDA/CE-cleared glucometers or CGMs.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Payments &amp; Monetization Policy:</strong> 100% Free application with zero non-Play-Billing checkout flows, zero hidden fees, and zero third-party ad networks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>User Data &amp; Account Deletion Policy:</strong> Health logs are encrypted locally via AES-256-GCM. Users can permanently wipe all local and server-synced records in 1 click inside the Profile tab or at <code className="text-cyan-300">/delete-account</code>.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Permissions Policy:</strong> Only requests standard, non-restricted Android permissions (<code className="text-cyan-300">INTERNET</code>, <code className="text-cyan-300">VIBRATE</code>, <code className="text-cyan-300">POST_NOTIFICATIONS</code>). No background location, contacts, SMS, or high-risk permissions.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-cyan-300 font-mono text-[11px] flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Open Public Privacy Policy (/privacy-policy)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/delete-account"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/35 rounded-xl text-rose-300 font-mono text-[11px] flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Open Data Deletion Portal (/delete-account)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: CLINICAL EVIDENCE & CITATIONS */}
        {activeTab === "citations" && (
          <div className="p-4 sm:p-5 space-y-3 text-xs">
            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2.5 text-[11px] text-neutral-300">
              <div className="flex items-center gap-2 text-white font-bold">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span>Published Peer-Reviewed Medical Methodology</span>
              </div>
              <p className="text-neutral-400">
                Every calculation in this app is deterministic and based on peer-reviewed clinical guidelines:
              </p>
              <div className="space-y-2 pt-1">
                <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
                  <strong className="text-white block">1. Estimated HbA1c (ADAG Linear Regression Formula)</strong>
                  <span className="text-neutral-400 block mt-0.5">
                    eA1C (%) = (Mean Glucose mg/dL + 46.7) / 28.7. Source: Nathan DM et al., <em>Diabetes Care</em> 2008; 31(8):1473–1478 (PMID: 18540046).
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
                  <strong className="text-white block">2. Glucose Management Indicator (GMI)</strong>
                  <span className="text-neutral-400 block mt-0.5">
                    GMI (%) = 3.31 + 0.02392 × Mean Glucose (mg/dL). Source: Bergenstal RM et al., <em>Diabetes Care</em> 2018; 41(11):2275–2280.
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800">
                  <strong className="text-white block">3. Insulin Sensitivity (1800/1500 Rules) &amp; Carb Ratio (500 Rule)</strong>
                  <span className="text-neutral-400 block mt-0.5">
                    ISF = 1800 / TDD (rapid-acting) or 1500 / TDD (regular); ICR = 500 / TDD. Source: Walsh J et al., <em>J Diabetes Sci Technol</em> 2011; 5(1):129–135.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer info & close */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-mono">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AES-256-GCM Local Vault • Google Play Compliant</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
