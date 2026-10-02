/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Crown,
  Sparkles,
  Check,
  X,
  Zap,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  Bell,
  Stethoscope,
  HeartPulse,
  ShoppingBag,
  Building,
  HelpCircle,
  Clock,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Lock,
  Gift
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
  onUpdateTier
}) => {
  const [activeTab, setActiveTab] = useState<"plans" | "how_to_earn" | "calculator" | "matrix">("plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [usersCount, setUsersCount] = useState<number>(3500);
  const [conversionRate, setConversionRate] = useState<number>(4.5); // 4.5% standard health app conversion
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = profile.membershipTier || "free";

  const handleSelectTier = (tier: "free" | "pro" | "caregiver_plus") => {
    onUpdateTier(tier);
    const tierName = tier === "pro" ? "Pro Patient" : tier === "caregiver_plus" ? "Family Caregiver Plus" : "Free Starter";
    setSuccessToast(`Tier updated to ${tierName}!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Calculator figures
  const payingUsers = Math.round(usersCount * (conversionRate / 100));
  const avgMonthlyRevPerUser = 8.5; // weighted average of $7.99 Pro & $14.99 Family
  const monthlySubscriptionRev = Math.round(payingUsers * avgMonthlyRevPerUser);
  const annualSubscriptionRev = monthlySubscriptionRev * 12;
  const estimatedAffiliateRev = Math.round(usersCount * 0.45); // ~$0.45 per active user/mo on test strip / sensor reorders
  const totalAnnualRev = annualSubscriptionRev + estimatedAffiliateRev * 12;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl shadow-cyan-950/40 overflow-hidden my-auto animate-scaleUp">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/80 via-neutral-900 to-cyan-950/80 border-b border-neutral-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
              <Crown className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider">
                  Monetization & Premium Tiers
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  currentTier === "pro" 
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : currentTier === "caregiver_plus"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : "bg-neutral-800 text-neutral-400 border-neutral-700"
                }`}>
                  Current: {currentTier.toUpperCase()}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                GlucoGuard Monetization & Pro Membership Hub
              </h2>
              <p className="text-xs text-neutral-300 mt-0.5">
                Turn your diabetes surveillance app into a profitable health business.
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
            onClick={() => setActiveTab("plans")}
            className={`flex-1 min-w-[110px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "plans"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Pricing Plans</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("how_to_earn")}
            className={`flex-1 min-w-[130px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "how_to_earn"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>How to Earn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 min-w-[125px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "calculator"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue Calc</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`flex-1 min-w-[125px] py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "matrix"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Feature Matrix</span>
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mx-4 mt-3 p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono text-center animate-fadeIn flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* TAB 1: PRICING PLANS */}
        {activeTab === "plans" && (
          <div className="p-4 sm:p-5 space-y-4 text-xs">
            {/* Monthly / Annual Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={`text-[11px] font-mono ${billingCycle === "monthly" ? "text-white font-bold" : "text-neutral-400"}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                className="w-12 h-6 bg-neutral-800 rounded-full p-0.5 border border-neutral-700 relative transition-colors cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-amber-400 transition-transform ${
                    billingCycle === "annual" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-mono ${billingCycle === "annual" ? "text-white font-bold" : "text-neutral-400"}`}>
                  Annual Billing
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                  Save 30%
                </span>
              </div>
            </div>

            {/* 3 Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* FREE TIER */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                currentTier === "free"
                  ? "bg-neutral-900 border-neutral-700 ring-1 ring-neutral-500"
                  : "bg-neutral-950/60 border-neutral-850 hover:border-neutral-800"
              }`}>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Free Starter</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white font-mono">$0</span>
                      <span className="text-[10px] text-neutral-500 font-mono">/ forever</span>
                    </div>
                    <p className="text-[10.5px] text-neutral-400 mt-1 leading-snug">
                      Core glucose surveillance for newly diagnosed individuals.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Fasting & post-meal manual log</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>7-day glucose trend graphs</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Basic medication checklists</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-500">
                      <X className="w-3.5 h-3.5 text-neutral-600 shrink-0 mt-0.5" />
                      <span>No 15-min push notifications</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-500">
                      <X className="w-3.5 h-3.5 text-neutral-600 shrink-0 mt-0.5" />
                      <span>No clinical PDF doctor reports</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTier("free")}
                    className={`w-full py-2 px-3 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
                      currentTier === "free"
                        ? "bg-neutral-800 text-white border border-neutral-700"
                        : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    {currentTier === "free" ? "Current Plan" : "Switch to Free"}
                  </button>
                </div>
              </div>

              {/* PRO PATIENT TIER (FEATURED) */}
              <div className={`p-4 rounded-2xl border relative flex flex-col justify-between transition-all ${
                currentTier === "pro"
                  ? "bg-gradient-to-b from-amber-950/40 to-neutral-900 border-amber-500/60 ring-2 ring-amber-500/40 shadow-lg shadow-amber-950/50"
                  : "bg-neutral-900/90 border-amber-500/40 hover:border-amber-400"
              }`}>
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                  Most Popular
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">GlucoGuard Pro</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white font-mono">
                        {billingCycle === "annual" ? "$5.75" : "$7.99"}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        / mo {billingCycle === "annual" && "(billed $69/yr)"}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-amber-200/90 mt-1 leading-snug">
                      Complete clinical grade surveillance & automation suite.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5 text-white font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>🌅 15-Min Fasting Push Alerts & Chime</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Clinical Doctor PDF Reports (AGP, TIR)</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>AI Dawn Phenomenon & Spike Detector</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Diabetic Meal Plans & Carb Forecaster</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Bluetooth Glucometer & IoT sync</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTier("pro")}
                    className={`w-full py-2.5 px-3 rounded-xl font-mono text-[11px] font-black transition-all cursor-pointer shadow-md ${
                      currentTier === "pro"
                        ? "bg-amber-500 text-neutral-950 ring-2 ring-white/50"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 active:scale-[0.98]"
                    }`}
                  >
                    {currentTier === "pro" ? "✓ Pro Active" : "Upgrade to Pro"}
                  </button>
                </div>
              </div>

              {/* FAMILY & CAREGIVER TIER */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                currentTier === "caregiver_plus"
                  ? "bg-gradient-to-b from-purple-950/40 to-neutral-900 border-purple-500/60 ring-2 ring-purple-500/40 shadow-lg shadow-purple-950/50"
                  : "bg-neutral-950/80 border-purple-500/30 hover:border-purple-400"
              }`}>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">Caregiver Guard</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white font-mono">
                        {billingCycle === "annual" ? "$11.99" : "$14.99"}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">/ mo</span>
                    </div>
                    <p className="text-[10.5px] text-purple-200/90 mt-1 leading-snug">
                      Remote peace of mind for families, parents, and caregivers.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-start gap-1.5 text-white font-semibold">
                      <Users className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>All Pro Features Included</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Multi-Patient Remote Profiles (5 users)</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Instant WhatsApp & SMS Hypo Alerts</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Physician & Clinic direct EHR portal</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-neutral-200">
                      <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>Encrypted Cloud Backup & HIPAA sync</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleSelectTier("caregiver_plus")}
                    className={`w-full py-2.5 px-3 rounded-xl font-mono text-[11px] font-black transition-all cursor-pointer ${
                      currentTier === "caregiver_plus"
                        ? "bg-purple-500 text-white ring-2 ring-white/50"
                        : "bg-purple-600 hover:bg-purple-500 text-white active:scale-[0.98]"
                    }`}
                  >
                    {currentTier === "caregiver_plus" ? "✓ Caregiver Active" : "Get Family Guard"}
                  </button>
                </div>
              </div>
            </div>

            {/* In-App Simulator Info */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono text-neutral-400">
                💡 <strong>Investor / Developer Demo Mode:</strong> Tap any plan button above to simulate live tier unlocking across the entire app.
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: HOW TO EARN MONEY (BLUEPRINT) */}
        {activeTab === "how_to_earn" && (
          <div className="p-4 sm:p-5 space-y-4 text-xs animate-fadeIn">
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">5 High-Yield Revenue Streams for This App</h3>
                <p className="text-[11px] text-neutral-300 mt-0.5 leading-relaxed">
                  Chronic diabetes management is a $40B+ global digital health market. Here is the operational monetization blueprint for GlucoGuard:
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Stream 1 */}
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-mono font-bold text-[10px]">
                      1
                    </span>
                    <h4 className="font-bold text-white text-xs">Direct Consumer Subscriptions (IAP / Stripe)</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    65% of Total Revenue
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug">
                  Charge patients <strong>$7.99/mo or $69/yr</strong> for advanced surveillance features: the 15-minute advance morning fasting alerts with chime tones, automated AGP doctor reports, and AI Dawn Phenomenon detection. With 5,000 active users and a 4% conversion rate, this generates <strong>$16,000+ in annual recurring revenue (ARR)</strong> on subscriptions alone.
                </p>
              </div>

              {/* Stream 2 */}
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-mono font-bold text-[10px]">
                      2
                    </span>
                    <h4 className="font-bold text-white text-xs">Family & Remote Caregiver Monitoring Subscriptions</h4>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    $14.99 / month
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug">
                  Adult children caring for aging diabetic parents readily pay <strong>$14.99/mo</strong> for peace of mind. The app's built-in WhatsApp & SMS emergency hypo notifications, multi-patient profiles, and remote check logs are marketed directly to family caregivers.
                </p>
              </div>

              {/* Stream 3 */}
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono font-bold text-[10px]">
                      3
                    </span>
                    <h4 className="font-bold text-white text-xs">Affiliate Commerce: CGM Sensors, Glucometers & Strips</h4>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    8% - 15% Comm.
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug">
                  Diabetes patients consume 30-100 test strips and lancets monthly, or wear 14-day continuous glucose monitors (Dexcom G7, Abbott FreeStyle Libre, Stelo). Partner with medical distributors or Amazon Associates to earn recurring commissions every time users reorder supplies through the app's hardware and handbook tabs.
                </p>
              </div>

              {/* Stream 4 */}
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-mono font-bold text-[10px]">
                      4
                    </span>
                    <h4 className="font-bold text-white text-xs">B2B Remote Patient Monitoring (RPM) Medicare Codes</h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    $55 - $120 / patient / mo
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug">
                  Clinics and endocrinologists can bill US Medicare & private insurers using RPM CPT codes (CPT 99453 for device setup, CPT 99454 for 16 days of monthly data transmission, CPT 99457 for 20 mins clinical review). License this app to outpatient clinics as their patient-facing RPM portal.
                </p>
              </div>

              {/* Stream 5 */}
              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono font-bold text-[10px]">
                      5
                    </span>
                    <h4 className="font-bold text-white text-xs">Telehealth & Certified Diabetes Educator (CDE) Marketplace</h4>
                  </div>
                  <span className="text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    $15 - $25 cut / consult
                  </span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-snug">
                  Allow users to book 15-minute virtual review sessions with registered dietitians or CDEs to review their monthly AGP report and personalized diet plan. The platform retains a 25-30% platform booking fee per consult.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REVENUE CALCULATOR */}
        {activeTab === "calculator" && (
          <div className="p-4 sm:p-5 space-y-4 text-xs animate-fadeIn">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Projected Earnings Calculator</h3>
                  <p className="text-[10.5px] text-neutral-400">
                    Adjust user base & conversion parameters to estimate monthly and annual revenue.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  SaaS Economics
                </span>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1 font-mono text-[11px]">
                    <span className="text-neutral-400">Monthly Active Users (MAU):</span>
                    <span className="text-white font-bold">{usersCount.toLocaleString()} users</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={usersCount}
                    onChange={(e) => setUsersCount(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                    <span>500 (Early launch)</span>
                    <span>15,000 (Growth)</span>
                    <span>50,000 (Scale)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 font-mono text-[11px]">
                    <span className="text-neutral-400">Paid Subscriber Conversion Rate:</span>
                    <span className="text-amber-400 font-bold">{conversionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-0.5">
                    <span>1% (Conservative)</span>
                    <span>4.5% (Health Apps Avg)</span>
                    <span>10% (Top Quartile)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
                <span className="text-[9px] font-mono text-neutral-400 uppercase block">Paying Users</span>
                <span className="text-lg font-black text-white font-mono mt-0.5 block">{payingUsers}</span>
                <span className="text-[9px] text-neutral-500 font-mono">active subs</span>
              </div>

              <div className="p-3 bg-neutral-950 border border-emerald-500/30 rounded-2xl text-center bg-gradient-to-b from-emerald-950/20 to-neutral-950">
                <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold block">Monthly MRR</span>
                <span className="text-lg font-black text-emerald-300 font-mono mt-0.5 block">
                  ${monthlySubscriptionRev.toLocaleString()}
                </span>
                <span className="text-[9px] text-emerald-500/80 font-mono">recurring/mo</span>
              </div>

              <div className="p-3 bg-neutral-950 border border-amber-500/30 rounded-2xl text-center bg-gradient-to-b from-amber-950/20 to-neutral-950">
                <span className="text-[9px] font-mono text-amber-400 uppercase font-bold block">Annual ARR</span>
                <span className="text-lg font-black text-amber-300 font-mono mt-0.5 block">
                  ${annualSubscriptionRev.toLocaleString()}
                </span>
                <span className="text-[9px] text-amber-500/80 font-mono">recurring/yr</span>
              </div>

              <div className="p-3 bg-neutral-950 border border-cyan-500/30 rounded-2xl text-center bg-gradient-to-b from-cyan-950/20 to-neutral-950">
                <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold block">Total + Affiliates</span>
                <span className="text-lg font-black text-cyan-300 font-mono mt-0.5 block">
                  ${totalAnnualRev.toLocaleString()}
                </span>
                <span className="text-[9px] text-cyan-500/80 font-mono">est. annual gross</span>
              </div>
            </div>

            <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1 text-[10.5px] text-neutral-400 leading-snug">
              <span className="text-white font-bold block">Key SaaS Takeaway:</span>
              Chronic illness apps boast significantly higher retention and lower churn (under 4% monthly) than fitness or calorie counting apps because diabetes monitoring is essential daily healthcare.
            </div>
          </div>
        )}

        {/* TAB 4: FEATURE MATRIX */}
        {activeTab === "matrix" && (
          <div className="p-4 sm:p-5 space-y-3 text-xs animate-fadeIn overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-2">Feature Entitlement Matrix</h3>
            
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-neutral-800 font-mono text-neutral-400 text-[10px]">
                  <th className="py-2 px-2.5">Feature & Capability</th>
                  <th className="py-2 px-2 text-center">Free Starter</th>
                  <th className="py-2 px-2 text-center text-amber-400">Pro ($7.99/mo)</th>
                  <th className="py-2 px-2 text-center text-purple-400">Caregiver ($14.99)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                <tr>
                  <td className="py-2 px-2.5 text-neutral-200">Fasting & Post-Meal Glucose Log</td>
                  <td className="py-2 px-2 text-center text-emerald-400">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-400">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-400">✓</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 text-neutral-200">7-Day Local History & Charts</td>
                  <td className="py-2 px-2 text-center text-emerald-400">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-400">✓</td>
                  <td className="py-2 px-2 text-center text-emerald-400">✓</td>
                </tr>
                <tr className="bg-amber-500/5">
                  <td className="py-2 px-2.5 text-white font-semibold">🌅 15-Min Advance Fasting Alarm & Web Push</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-amber-400 font-bold">✓ Pro</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Pro</td>
                </tr>
                <tr className="bg-amber-500/5">
                  <td className="py-2 px-2.5 text-white font-semibold">🩺 Clinical AGP & PDF Doctor Report Export</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-amber-400 font-bold">✓ Pro</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Pro</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 text-neutral-200">🤖 AI Dawn Phenomenon & Glycemic Volatility</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-amber-400 font-bold">✓ Pro</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Pro</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 text-neutral-200">🍽️ Personalized Diabetic Meal Planner & Carbs</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-amber-400 font-bold">✓ Pro</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Pro</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 text-neutral-200">⌚ Bluetooth Glucometer & IoT Wearables Sync</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-amber-400 font-bold">✓ Pro</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Pro</td>
                </tr>
                <tr className="bg-purple-500/5">
                  <td className="py-2 px-2.5 text-white font-semibold">👨‍👩‍👧 Multi-Patient Remote Monitoring (5 users)</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Guard</td>
                </tr>
                <tr className="bg-purple-500/5">
                  <td className="py-2 px-2.5 text-white font-semibold">🚨 WhatsApp & SMS Caregiver Hypo Alerts</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Guard</td>
                </tr>
                <tr>
                  <td className="py-2 px-2.5 text-neutral-200">☁️ Encrypted Cloud Sync & Daily Backup</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-neutral-600">✕</td>
                  <td className="py-2 px-2 text-center text-purple-400 font-bold">✓ Guard</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info & close */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Secure 256-bit encryption • Cancel anytime</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-white font-mono text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
