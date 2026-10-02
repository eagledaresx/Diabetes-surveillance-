import React from "react";
import { ShieldAlert, CheckCircle2, Info } from "lucide-react";

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function MedicalDisclaimerModal({ isOpen, onAccept }: MedicalDisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md rounded-2xl p-5 shadow-none space-y-4 animate-scaleUp">
        
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
          <div className="p-2.5 bg-cyan-500/15 text-cyan-400 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Prominent Medical Disclaimer</h3>
            <p className="text-[10px] text-cyan-400 font-mono">Google Play Health & Medical Policy Mandate</p>
          </div>
        </div>

        <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl space-y-2 text-xs leading-relaxed text-neutral-200">
          <p className="font-semibold text-white text-[11.5px]">
            &ldquo;This application is intended for informational and self-monitoring purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making clinical decisions.&rdquo;
          </p>
        </div>

        <div className="space-y-2 text-[11px] text-neutral-300 leading-relaxed">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Glucose logs, fasting trends, and AI surveillance observations are for reference only and do not replace professional medical evaluations.</span>
          </div>
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>Never adjust prescription drugs or insulin dosages without direct guidance from your licensed doctor or care team.</span>
          </div>
        </div>

        <div className="pt-2 border-t border-neutral-800">
          <button
            id="btn-accept-medical-disclaimer"
            type="button"
            onClick={onAccept}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider shadow-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Understand & Accept Terms</span>
          </button>
        </div>
      </div>
    </div>
  );
}
