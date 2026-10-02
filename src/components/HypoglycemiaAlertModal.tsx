import React from "react";
import { AlertTriangle, ShieldAlert, HeartPulse, PhoneCall, Check, X } from "lucide-react";

interface HypoglycemiaAlertModalProps {
  isOpen: boolean;
  value: number;
  dateStr?: string;
  timeStr?: string;
  onClose: () => void;
}

export default function HypoglycemiaAlertModal({
  isOpen,
  value,
  dateStr,
  timeStr,
  onClose
}: HypoglycemiaAlertModalProps) {
  if (!isOpen) return null;

  const isSevere = value < 54;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-rose-500/50 w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
        
        {/* Header Alert */}
        <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isSevere ? "bg-rose-500/20 text-rose-400 animate-pulse" : "bg-rose-500/15 text-rose-300"}`}>
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-rose-400 uppercase tracking-wider">
                {isSevere ? "SEVERE HYPOGLYCEMIA CRISIS ALERT" : "HYPOGLYCEMIA WARNING"}
              </h3>
              <p className="text-[10.5px] font-mono text-neutral-400">
                Blood Glucose Reading: <span className="text-white font-bold">{value} mg/dL</span> {dateStr && `at ${timeStr || ""}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning card */}
        <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
          isSevere 
            ? "bg-rose-950/40 border-rose-800 text-rose-200" 
            : "bg-rose-950/30 border-rose-900/60 text-rose-200"
        }`}>
          <p className="font-semibold">
            {isSevere
              ? "Critical blood sugar drop below 54 mg/dL detected! Immediate treatment with fast-acting carbohydrates is required to prevent neuroglycopenia or loss of consciousness."
              : "Your blood glucose level is below the normal target range (70 mg/dL). Initiate standard hypoglycemia treatment protocol immediately."}
          </p>
        </div>

        {/* 15-15 Rule Protocol Box */}
        <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-400" /> Clinical 15-15 Rule Treatment Protocol
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
              ADA Guideline
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-neutral-300">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-white font-semibold">Consume 15 Grams of Fast-Acting Carbs:</strong>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  • 4 oz (1/2 cup) fruit juice or regular soda<br />
                  • 3–4 glucose tablets or 1 tbsp sugar/honey
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-white font-semibold">Rest & Wait 15 Minutes:</strong>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Allow simple carbohydrates to absorb rapidly into the bloodstream without physical exertion.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-white font-semibold">Recheck Blood Glucose:</strong>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  If glucose remains below 70 mg/dL, repeat 15g carbs and recheck in 15 minutes. Once normalized, eat a snack with protein/complex carbs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            id="btn-call-emergency-contact"
            type="button"
            onClick={() => alert("Emergency protocol active: If experiencing confusion, severe dizziness, or unable to swallow, have someone administer nasal Glucagon or call emergency services immediately.")}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Guidelines</span>
          </button>
          
          <button
            id="btn-dismiss-hypo-alert"
            type="button"
            onClick={onClose}
            className="flex-1 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-200 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer text-center"
          >
            I Have Treated & Acknowledged
          </button>
        </div>
      </div>
    </div>
  );
}
