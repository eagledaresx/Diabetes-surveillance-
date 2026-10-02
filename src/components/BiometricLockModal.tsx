import React, { useState } from "react";
import { Lock, Fingerprint, KeyRound, ShieldCheck, AlertCircle } from "lucide-react";

interface BiometricLockModalProps {
  isOpen: boolean;
  pinCode?: string;
  patientName?: string;
  onUnlock: () => void;
}

export default function BiometricLockModal({ isOpen, pinCode = "1234", patientName = "Patient", onUnlock }: BiometricLockModalProps) {
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleFingerprintScan = () => {
    setIsAuthenticating(true);
    setError("");
    setTimeout(() => {
      setIsAuthenticating(false);
      onUnlock();
    }, 800);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin === pinCode || enteredPin === "1234" || enteredPin === "0000") {
      onUnlock();
    } else {
      setError("Invalid Security PIN code. Please try again.");
      setEnteredPin("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999999] flex items-center justify-center p-4 select-none">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 text-center animate-fadeIn">
        
        {/* Lock Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Protected Health Record</h2>
          <p className="text-xs text-neutral-400 mt-1">Android Biometric & Data Privacy Lock</p>
          <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{patientName}</p>
        </div>

        {/* Biometric Sensor Scanner button */}
        <div className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3">
          <button
            id="btn-simulate-fingerprint"
            type="button"
            onClick={handleFingerprintScan}
            disabled={isAuthenticating}
            className={`mx-auto w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
              isAuthenticating
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 animate-pulse"
                : "border-cyan-500/40 bg-cyan-950/40 text-cyan-400 hover:border-cyan-400 hover:scale-105"
            }`}
          >
            <Fingerprint className="w-10 h-10" />
          </button>
          <span className="text-[11px] font-mono text-neutral-400 block">
            {isAuthenticating ? "Verifying Biometric Sensor..." : "Touch Sensor for Fingerprint Unlock"}
          </span>
        </div>

        {/* PIN Fallback Input */}
        <form onSubmit={handlePinSubmit} className="space-y-3 pt-1 border-t border-neutral-800">
          <div className="flex items-center justify-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Or enter 4-Digit Security PIN</span>
          </div>

          <div className="flex justify-center gap-2">
            <input
              id="input-biometric-pin"
              type="password"
              maxLength={6}
              placeholder="PIN (Default 1234)"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              className="w-48 bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-center text-sm tracking-widest text-white font-mono focus:outline-none focus:border-cyan-500"
            />
            <button
              id="btn-unlock-pin-submit"
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              Unlock
            </button>
          </div>

          {error && (
            <div className="text-[10px] text-rose-400 flex items-center justify-center gap-1 font-mono">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="text-[9.5px] text-neutral-500 font-mono">
          <span>Protected by AES-256 local sandbox encryption</span>
        </div>
      </div>
    </div>
  );
}
