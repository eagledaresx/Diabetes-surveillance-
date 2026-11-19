import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  Info,
  ExternalLink,
  AlertTriangle,
  Stethoscope,
  BookOpen,
  FileCheck2,
  Trash2,
} from "lucide-react";

interface MedicalDisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function MedicalDisclaimerModal({
  isOpen,
  onAccept,
}: MedicalDisclaimerModalProps) {
  const [checkedConsent, setCheckedConsent] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/88 backdrop-blur-md z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
          <div className="p-2.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold uppercase">
                Mandatory Regulatory Disclosure
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wide text-white mt-0.5">
              Medical Disclaimer &amp; Informed Consent
            </h3>
            <p className="text-[10px] text-cyan-400 font-mono">
              Google Play Health &amp; Medical Apps Policy Compliance
            </p>
          </div>
        </div>

        {/* Core Non-Medical Device Statement */}
        <div className="bg-neutral-950 border border-amber-500/30 p-3.5 rounded-2xl space-y-2 text-xs leading-relaxed text-neutral-200">
          <p className="font-bold text-white text-[11.5px] flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Not a Medical Device • Informational Self-Monitoring Only</span>
          </p>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            <strong>Diabetes Care &amp; Tracker</strong> is a general wellness, logging, and educational reference application. It is <strong>not</strong> an FDA-cleared or CE-marked medical device and does <strong>not</strong> provide medical diagnosis, clinical treatment orders, or prescription advice. Always consult a licensed physician, endocrinologist, or certified diabetes educator before initiating or modifying any insulin dose, medication schedule, or diet plan.
          </p>
        </div>

        {/* External Hardware Disclosure (Mandatory per Google Play Policy) */}
        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-1.5 text-[11px] text-neutral-300 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>External Medical Hardware Requirement Disclosure</span>
          </div>
          <p className="text-[10.5px] text-neutral-300">
            This smartphone/tablet application <strong>cannot measure blood glucose, blood pressure, or blood oxygen (SpO2) using phone hardware, screens, or cameras alone</strong>. All biometric values must be entered manually by the user from a certified external blood glucose meter (glucometer) or synced from compatible external Continuous Glucose Monitoring (CGM) / wearable hardware (such as Dexcom, Abbott FreeStyle Libre, Accu-Chek, or Contour Next).
          </p>
        </div>

        {/* Peer-Reviewed Clinical Citations (Mandatory per Google Play Medical Policy) */}
        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2 text-[10.5px] text-neutral-300">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Peer-Reviewed Clinical Evidence &amp; Reference Citations</span>
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-neutral-400">
            <li>
              <strong className="text-neutral-200">Glycemic Targets &amp; Time in Range (TIR):</strong> American Diabetes Association (ADA) <em>Standards of Care in Diabetes — Glycemic Goals and Hypoglycemia</em> (Fasting 80–130 mg/dL, Post-Meal &lt;180 mg/dL).{" "}
              <a
                href="https://diabetesjournals.org/care"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>ADA Diabetes Care</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li>
              <strong className="text-neutral-200">Estimated HbA1c (eA1C / ADAG Formula):</strong> Nathan DM, Kuenen J, Borg R, et al. <em>Translating the A1C Assay Into Estimated Average Glucose Values</em>, Diabetes Care 2008; 31(8):1473–1478.{" "}
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/18540046/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>PubMed PMID: 18540046</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li>
              <strong className="text-neutral-200">Insulin Sensitivity (1800/1500 Rules) &amp; Carb Ratio (500 Rule):</strong> Walsh J, Roberts R, Bailey T. <em>Guidelines for Optimal Bolus Calculator Settings in Adults</em>, J Diabetes Sci Technol 2011; 5(1):129–135.{" "}
              <a
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3045232/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>NIH PMC3045232</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
          </ul>
        </div>

        {/* Emergency Warning */}
        <div className="p-3 bg-rose-950/30 border border-rose-500/35 rounded-2xl flex items-start gap-2.5 text-[10.5px] text-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-rose-300 block">Medical Emergency Warning:</strong>
            Do not rely on this application during a medical emergency. If your blood glucose is below 54 mg/dL (Level 2 Severe Hypoglycemia), above 250 mg/dL with ketones, or if you experience dizziness, confusion, or chest pain, call local emergency services (911 / 112 / 999) immediately.
          </div>
        </div>

        {/* Privacy & Data Deletion Links */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[10.5px] font-mono">
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Privacy Policy &amp; Data Safety</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="/delete-account"
            target="_blank"
            rel="noopener noreferrer"
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Data &amp; Account Deletion Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Informed Consent Checkbox */}
        <label className="flex items-start gap-2.5 p-2.5 bg-neutral-950/90 border border-neutral-800 rounded-xl cursor-pointer select-none text-[11px] text-neutral-200">
          <input
            type="checkbox"
            checked={checkedConsent}
            onChange={(e) => setCheckedConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-emerald-500 shrink-0 cursor-pointer"
          />
          <span>
            I acknowledge that this app is for informational self-tracking only, requires an external glucometer/CGM for measurements, and does not replace advice from a licensed physician.
          </span>
        </label>

        <div className="pt-1">
          <button
            id="btn-accept-medical-disclaimer"
            type="button"
            disabled={!checkedConsent}
            onClick={onAccept}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Understand &amp; Accept Medical Disclaimer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
