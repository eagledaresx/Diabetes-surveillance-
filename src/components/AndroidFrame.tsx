import React, { useState, useEffect } from "react";
import { Signal, Wifi, Battery, ChevronLeft, Circle, Square } from "lucide-react";

interface AndroidFrameProps {
  children: React.ReactNode;
  onBackPress?: () => void;
  onHomePress?: () => void;
}

export default function AndroidFrame({ children, onBackPress, onHomePress }: AndroidFrameProps) {
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
    <div className="min-h-screen flex items-center justify-center p-0 md:p-6 font-sans transition-colors duration-300" style={{ backgroundColor: "var(--bg-frame, #020617)" }}>
      {/* Outer Phone Shell Case - Only rendered as mock on desktop/tablet */}
      <div className="w-full max-w-[460px] md:h-[880px] h-screen md:rounded-[48px] md:border-8 md:border-neutral-800 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden transition-all duration-300" style={{ backgroundColor: "var(--bg-shelf, #121214)" }}>
        
        {/* Dynamic Notch / Camera Hole on desktop */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-950/80 rounded-full z-30 flex items-center justify-center border border-white/5">
          <div className="w-3.5 h-3.5 bg-neutral-950 rounded-full border-2 border-neutral-800 mr-8"></div>
          <div className="w-1.5 h-1.5 bg-blue-900/50 rounded-full"></div>
        </div>

        {/* Status Bar */}
        <div className="text-neutral-300 px-6 pt-3 pb-2 flex justify-between items-center text-xs font-medium tracking-wide border-b border-white/5 select-none z-20 shrink-0 transition-colors duration-300" style={{ backgroundColor: "var(--bg-shelf, #121214)" }}>
          <div>{currentTime}</div>
          
          {/* Status Bar Icons */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded font-bold font-mono border border-emerald-500/10">
              SECURE Surveillance
            </span>
            <Signal className="w-3.5 h-3.5 text-neutral-400" />
            <Wifi className="w-3.5 h-3.5 text-neutral-400" />
            <div className="flex items-center gap-1 bg-white/5 px-1 py-0.5 rounded text-[10px] border border-white/5">
              <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>88%</span>
            </div>
          </div>
        </div>

        {/* Live App Screens Inside Phone Structure */}
        <div className="flex-1 overflow-hidden bg-neutral-900 text-neutral-100 flex flex-col relative transition-colors duration-300">
          {children}
        </div>

        {/* Soft Touch Navigation Keys at bottom of Screen */}
        <div className="px-10 py-3 flex justify-between items-center text-neutral-500 border-t border-white/5 select-none shrink-0 z-20 transition-colors duration-300" style={{ backgroundColor: "var(--bg-shelf, #121214)" }}>
          <button 
            id="android-nav-back"
            onClick={onBackPress}
            className="p-1 hover:text-neutral-300 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            id="android-nav-home"
            onClick={onHomePress}
            className="p-1 hover:text-neutral-300 transition-colors cursor-pointer"
            title="Home Screen"
          >
            <Circle className="w-4 h-4 fill-current text-neutral-400" />
          </button>
          
          <button 
            id="android-nav-task"
            className="p-1 hover:text-neutral-300 transition-colors opacity-75 cursor-default"
            title="Overview"
          >
            <Square className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Decorative Home Indicator Bar for modern touch gesture */}
        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-neutral-600 rounded-full z-30"></div>
      </div>
    </div>
  );
}
