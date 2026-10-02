import React, { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 rounded-full bg-amber-600/90 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-xl border border-amber-400/30 animate-bounce">
      <WifiOff className="w-3.5 h-3.5 text-amber-200" />
      <span>Android Offline Mode: Using local database</span>
    </div>
  );
};
