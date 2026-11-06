import React, { useState, useEffect } from "react";
import { Signal, Wifi, Battery, ChevronLeft, Circle, Square, Smartphone, Maximize2, Minimize2 } from "lucide-react";

interface AndroidFrameProps {
  children: React.ReactNode;
  onBackPress?: () => void;
  onHomePress?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenAndroidModal?: () => void;
}

export default function AndroidFrame({ 
  children, 
  onBackPress, 
  onHomePress,
  isFullscreen = false,
  onToggleFullscreen,
  onOpenAndroidModal
}: AndroidFrameProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // first hour is 12
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`h-dvh max-h-dvh w-full max-w-full flex items-center justify-center overflow-hidden font-sans transition-colors duration-300 ${
        isFullscreen ? "p-0" : "p-0 md:p-2 lg:p-3"
      }`} 
      style={{ backgroundColor: "var(--bg-frame, #020617)" }}
    >
      {/* Phone Shell Case: expands to 100% when isFullscreen is true, otherwise fits cleanly within viewport */}
      <div 
        className={`w-full relative flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? "max-w-none h-full max-h-full rounded-none border-0 shadow-none" 
            : "max-w-[480px] h-full max-h-full md:max-h-[calc(100dvh-1.5rem)] md:rounded-[36px] md:border-[5px] md:border-neutral-800 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]"
        }`} 
        style={{ backgroundColor: "var(--bg-shelf, #121214)" }}
      >
        
        {/* Dynamic Notch / Camera Hole on desktop (only in chassis mode) */}
        {!isFullscreen && (
          <div className="hidden md:flex absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-neutral-950/80 rounded-full z-30 items-center justify-center border border-white/5 pointer-events-none">
            <div className="w-2.5 h-2.5 bg-neutral-950 rounded-full border-2 border-neutral-800 mr-5"></div>
            <div className="w-1.5 h-1.5 bg-blue-900/50 rounded-full"></div>
          </div>
        )}

        {/* Android Status Bar */}
        <div className="text-neutral-300 px-3 sm:px-4 pt-2 pb-1.5 flex justify-between items-center text-xs font-medium tracking-wide border-b border-white/5 select-none z-20 shrink-0 transition-colors duration-300" style={{ backgroundColor: "var(--bg-shelf, #121214)" }}>
          <div className="flex items-center gap-2">
            <span>{currentTime}</span>
            {onOpenAndroidModal && (
              <button
                type="button"
                id="btn-android-app-badge"
                onClick={onOpenAndroidModal}
                className="hidden sm:flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-full font-bold font-mono border border-emerald-500/20 transition-all cursor-pointer"
                title="Launch as Android App"
              >
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>Android App</span>
              </button>
            )}
          </div>
          
          {/* Status Bar Icons + Viewport Switcher */}
          <div className="flex items-center gap-2">
            {onToggleFullscreen && (
              <button
                type="button"
                id="btn-toggle-android-view"
                onClick={onToggleFullscreen}
                className="p-1 text-neutral-400 hover:text-white rounded transition-colors cursor-pointer"
                title={isFullscreen ? "Switch to Phone Mockup Chassis" : "Switch to Fullscreen Android Mode"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            )}
            <Signal className="w-3.5 h-3.5 text-neutral-400" />
            <Wifi className="w-3.5 h-3.5 text-neutral-400" />
            <div className="flex items-center gap-1 bg-white/5 px-1 py-0.5 rounded text-[10px] border border-white/5">
              <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>88%</span>
            </div>
          </div>
        </div>

        {/* Live App Screens Inside Phone Structure */}
        <div className="flex-1 min-h-0 w-full overflow-hidden bg-neutral-900 text-neutral-100 flex flex-col relative transition-colors duration-300">
          {children}
        </div>

        {/* Soft Touch Navigation Keys at bottom of Screen */}
        <div className="px-10 py-1.5 flex justify-between items-center text-neutral-500 border-t border-white/5 select-none shrink-0 z-20 transition-colors duration-300" style={{ backgroundColor: "var(--bg-shelf, #121214)" }}>
          <button 
            id="android-nav-back"
            onClick={onBackPress}
            className="p-1 hover:text-neutral-300 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            id="android-nav-home"
            onClick={onHomePress}
            className="p-1 hover:text-neutral-300 transition-colors cursor-pointer"
            title="Home Screen"
          >
            <Circle className="w-3.5 h-3.5 fill-current text-neutral-400" />
          </button>
          
          <button 
            id="android-nav-task"
            onClick={onOpenAndroidModal}
            className="p-1 hover:text-neutral-300 transition-colors cursor-pointer"
            title="Android App Options"
          >
            <Square className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-300" />
          </button>
        </div>

        {/* Decorative Home Indicator Bar for modern touch gesture */}
        {!isFullscreen && (
          <div className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-neutral-600 rounded-full z-30 pointer-events-none"></div>
        )}
      </div>
    </div>
  );
}
