import React, { useState } from "react";
import { Smartphone, Download, Check } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface PWAInstallButtonProps {
  onOpenAndroidModal?: () => void;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenAndroidModal,
  className = ""
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed in standalone mode, show subtle badge or button
  if (isInstalled) {
    return (
      <button
        type="button"
        onClick={onOpenAndroidModal}
        className={`flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold transition-all cursor-pointer shrink-0 ${className}`}
        title="Android App Options"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-mono">APK</span>
      </button>
    );
  }

  const handleClick = async () => {
    if (onOpenAndroidModal) {
      onOpenAndroidModal();
    } else if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    }
  };

  if (justInstalled) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold shrink-0">
        <Check className="w-3.5 h-3.5 shrink-0" />
        <span>OK</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      id="btn-install-android-pwa"
      onClick={handleClick}
      className={`flex items-center gap-1 px-2 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[10px] shadow-md shadow-emerald-950/40 transition-all cursor-pointer active:scale-95 shrink-0 ${className}`}
      title="Launch & Install as Android App"
    >
      <Smartphone className="w-3.5 h-3.5 shrink-0" />
      <span className="font-mono">APK</span>
    </button>
  );
};
