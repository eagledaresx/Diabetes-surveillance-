import React, { useState } from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  HeartPulse, 
  PhoneCall, 
  Check, 
  X, 
  Droplets, 
  Clock, 
  Activity, 
  AlertOctagon,
  Stethoscope,
  ChevronRight
} from "lucide-react";
import { UserProfile } from "../types";

export interface DangerousGlucoseAlertData {
  isOpen: boolean;
  value: number;
  dateStr?: string;
  timeStr?: string;
  type?: "fasting" | "post_fasting";
}

interface DangerousGlucoseAlertModalProps {
  alertData: DangerousGlucoseAlertData;
  onClose: () => void;
  profile: UserProfile;
}

export const DangerousGlucoseAlertModal: React.FC<DangerousGlucoseAlertModalProps> = ({
  alertData,
  onClose,
  profile
}) => {
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60); // 15 min Rule of 15
  const [ketoneChecked, setKetoneChecked] = useState<boolean>(false);
  const [waterTaken, setWaterTaken] = useState<boolean>(false);

  if (!alertData.isOpen) return null;

  const val = alertData.value;
  const isHypo = val < 70;
  const isSevereHypo = val < 54;
  const isSevereHyper = val >= 250;
  const isHyper = val > 180;

  // If neither hypo nor hyper, shouldn't trigger
  if (!isHypo && !isHyper) return null;

  const doctorPhone = profile.doctorPhone || "911";
  const doctorName = profile.doctorName || "Primary Care Physician";
  const emergencyPhone = profile.emergencyContactPhone || profile.doctorPhone || "911";
  const emergencyName = profile.emergencyContactName || "Emergency Contact";

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-3 animate-fadeIn">
      <div className={`bg-neutral-900 border w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto ${
        isSevereHypo || isSevereHyper 
          ? "border-rose-500/80 shadow-rose-950/40" 
          : "border-orange-500/50 shadow-orange-950/30"
      }`}>
        
        {/* Header Alert */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              isSevereHypo || isSevereHyper
                ? "bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/40"
                : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
            }`}>
              {isSevereHypo || isSevereHyper ? (
                <AlertOctagon className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <div>
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${
                isSevereHypo || isSevereHyper ? "text-rose-400" : "text-orange-300"
              }`}>
                {isSevereHypo ? "CRITICAL CLINICAL CRISIS" :
                 isSevereHyper ? "CRITICAL HYPERGLYCEMIA / DKA RISK" :
                 isHypo ? "HYPOGLYCEMIA ALERT" : "ELEVATED HYPERGLYCEMIA"}
              </span>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                {isHypo ? "Low Blood Sugar Warning" : "Dangerous High Blood Sugar"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Value Callout Card */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
          isHypo
            ? "bg-rose-950/30 border-rose-800 text-rose-200"
            : isSevereHyper
            ? "bg-rose-950/40 border-rose-800 text-rose-200"
            : "bg-orange-950/30 border-orange-800/80 text-orange-200"
        }`}>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider block opacity-80">Recorded Level</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono text-white">{val}</span>
              <span className="text-xs font-mono font-bold">mg/dL</span>
            </div>
            <span className="text-[10px] font-mono opacity-75">
              {alertData.dateStr || "Today"} at {alertData.timeStr || "Now"} • {alertData.type === "fasting" ? "Fasting" : "Post-Meal"}
            </span>
          </div>

          <div className="text-right">
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase font-mono border ${
              isSevereHypo || isSevereHyper
                ? "bg-rose-500/25 border-rose-500/40 text-rose-300"
                : "bg-orange-500/25 border-orange-500/40 text-orange-300"
            }`}>
              {isSevereHypo ? "Immediate Fast Carbs Required" :
               isSevereHyper ? "Immediate Clinical Action" :
               isHypo ? "Mild Hypoglycemia" : "High Glycemic Spike"}
            </span>
          </div>
        </div>

        {/* CLINICAL PROTOCOL INSTRUCTIONS */}
        {isHypo ? (
          /* HYPOGLYCEMIA "RULE OF 15" PROTOCOL */
          <div className="space-y-3">
            <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-teal-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>ADA "Rule of 15" Emergency Protocol</span>
              </h4>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {isSevereHypo 
                  ? "⚠️ Blood sugar under 54 mg/dL represents severe neuroglycopenia. Treat immediately with fast-acting sugar to prevent loss of consciousness. If unable to swallow, administer emergency Glucagon."
                  : "Follow these steps immediately to safely raise blood glucose without rebounding high:"}
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2 text-xs text-neutral-200">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong>Consume 15g of fast-acting carbs:</strong> 1/2 cup (4 oz) fruit juice, 1/2 can regular soda, 3-4 glucose tablets, or 1 tablespoon honey/sugar. Avoid chocolate or fats as fat delays absorption.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-neutral-200">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong>Rest & wait 15 minutes:</strong> Do not drive or engage in physical exertion.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-neutral-200">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong>Recheck blood sugar:</strong> If still &lt; 70 mg/dL, take another 15g carbs and repeat cycle. Once &gt; 70 mg/dL, eat a small protein-carb snack (e.g., crackers with peanut butter).</span>
                </div>
              </div>
            </div>

            {/* 15-Minute Retest Timer */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-xs font-bold text-white block">15-Minute Retest Timer</span>
                  <span className="text-[10px] text-neutral-400 font-mono">Remind me to recheck glucose</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTimerStarted(!timerStarted)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                  timerStarted 
                    ? "bg-teal-600 text-white" 
                    : "bg-neutral-800 hover:bg-neutral-700 text-teal-300"
                }`}
              >
                {timerStarted ? "Timer Active (15:00)" : "Start Timer"}
              </button>
            </div>
          </div>
        ) : (
          /* HYPERGLYCEMIA & DKA PREVENTION PROTOCOL */
          <div className="space-y-3">
            <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-orange-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>Clinical High Glucose Protocol</span>
              </h4>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {isSevereHyper
                  ? "⚠️ High risk of Diabetic Ketoacidosis (DKA) or Hyperosmolar Hyperglycemic State (HHS). Take immediate corrective action:"
                  : "Blood sugar is significantly above target range (>180 mg/dL). Follow clinical stabilization guidelines below:"}
              </p>

              <div className="space-y-2 pt-1 text-xs text-neutral-200">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <div>
                    <strong>Hydrate with zero-carb fluids:</strong> Drink 16–24 oz (500–750 mL) of water immediately to support renal clearance of excess glucose and prevent hypovolemia.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <div>
                    <strong>Ketone Check:</strong> If glucose remains &gt; 250 mg/dL, check urine or blood ketones immediately. If moderate or high ketones appear, seek urgent medical care.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <div>
                    <strong>Correction Dose:</strong> If prescribed rapid-acting insulin or correction scale, administer only as instructed by your endocrinologist. <em>Do not stack doses without waiting 3-4 hours.</em>
                  </div>
                </div>

                {isSevereHyper && (
                  <div className="mt-2 p-2.5 bg-rose-950/30 border border-rose-800/80 rounded-xl text-[10.5px] text-rose-200 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-rose-300">
                      <AlertOctagon className="w-3.5 h-3.5" /> DKA Warning Signs Checklist:
                    </span>
                    <p>Nausea/vomiting • Fruity/acetone breath • Rapid labored breathing (Kussmaul) • Confusion or dizziness • Severe abdominal pain.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick action checkboxes */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setWaterTaken(!waterTaken)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-mono transition-all cursor-pointer ${
                  waterTaken ? "bg-teal-950/30 border-teal-500 text-teal-300" : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <Droplets className="w-4 h-4 text-teal-400" />
                <span>{waterTaken ? "Drank 500ml Water ✓" : "Drink 500ml Water"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKetoneChecked(!ketoneChecked)}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-mono transition-all cursor-pointer ${
                  ketoneChecked ? "bg-teal-950/30 border-teal-500 text-teal-300" : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <Check className="w-4 h-4 text-teal-400" />
                <span>{ketoneChecked ? "Ketones Checked ✓" : "Check Ketones"}</span>
              </button>
            </div>
          </div>
        )}

        {/* EMERGENCY CONTACT & CLINICIAN CALL BUTTONS */}
        <div className="pt-1 border-t border-neutral-800 space-y-2">
          <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono uppercase tracking-wider font-bold">
            <span>Clinical Contacts</span>
            <span>Direct Dial</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={`tel:${doctorPhone}`}
              className="p-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-xl flex items-center justify-between text-xs text-white transition-all"
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <div className="text-left">
                  <span className="block font-bold text-xs truncate max-w-[130px]">{doctorName}</span>
                  <span className="text-[9.5px] text-neutral-500 font-mono">Healthcare Provider</span>
                </div>
              </div>
              <PhoneCall className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </a>

            <a
              href={`tel:${emergencyPhone}`}
              className="p-2.5 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-xl flex items-center justify-between text-xs text-white transition-all"
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <div className="text-left">
                  <span className="block font-bold text-xs truncate max-w-[130px]">{emergencyName}</span>
                  <span className="text-[9.5px] text-neutral-500 font-mono">Emergency / Family</span>
                </div>
              </div>
              <PhoneCall className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            </a>
          </div>
        </div>

        {/* Footer Acknowledgement */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-neutral-800 hover:bg-neutral-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>I Understand & Have Taken Action</span>
          </button>
        </div>
      </div>
    </div>
  );
};
