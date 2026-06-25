import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, Coffee, Sparkles, Bell } from "lucide-react";

interface FastingTimerProps {
  readings: Array<{
    date: string;
    type: "fasting" | "post_fasting";
    value: number;
  }>;
}

export default function FastingTimer({ readings }: FastingTimerProps) {
  // Configurable alert hour: Default to 7:00 AM
  const [targetHour, setTargetHour] = useState<number>(() => {
    const cached = localStorage.getItem("fasting_target_hour");
    return cached ? parseInt(cached, 10) : 7;
  });

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [todayChecked, setTodayChecked] = useState(false);

  // Check if fasting recorded today
  useEffect(() => {
    const nowLocalDateStr = new Date().toISOString().split("T")[0];
    const hasTodayFastingCheck = readings.some(
      (r) => r.date === nowLocalDateStr && r.type === "fasting"
    );
    setTodayChecked(hasTodayFastingCheck);
  }, [readings]);

  // Update target hours in local storage
  const handleHourChange = (hour: number) => {
    setTargetHour(hour);
    localStorage.setItem("fasting_target_hour", hour.toString());
  };

  // Timer loop
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      
      // Target time for today
      const target = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        targetHour,
        0,
        0
      );

      // If already past the target for today, set target to tomorrow
      if (now.getTime() >= target.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const difference = target.getTime() - now.getTime();
      
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetHour]);

  // Determine current period of day for contextual message
  const nowHour = new Date().getHours();
  let helperMessage = "Perform check immediately upon waking up prior to drinking or eating.";
  if (nowHour >= 6 && nowHour < 10) {
    helperMessage = "Optimal morning slot is now! Avoid any breakfast carbs before checking.";
  } else if (nowHour >= 18 || nowHour < 4) {
    helperMessage = "Keep a clean fast of 8-12 hours tonight for highly accurate morning surveillance.";
  }

  return (
    <div className="bg-gradient-to-br from-[#121214] to-[#1a1a1f] border border-neutral-800 p-4 rounded-2xl relative overflow-hidden shadow-lg">
      {/* Decorative ambient subtle circle glow */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
      
      {/* Upper header section */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Fasting Schedule Timer</h3>
            <span className="text-[10px] text-amber-500 font-mono font-semibold block uppercase">Morning Surveillance Queue</span>
          </div>
        </div>

        {/* Checked Badge vs Countdown target setup */}
        {todayChecked ? (
          <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-xl text-[10px] text-emerald-400 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed Today</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-neutral-400 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-xl">
            <span>Target:</span>
            <select
              value={targetHour}
              onChange={(e) => handleHourChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer text-[10px]"
              aria-label="Select Target Morning Hour"
            >
              <option value="5" className="bg-neutral-900">05:00 AM</option>
              <option value="6" className="bg-neutral-900">06:00 AM</option>
              <option value="7" className="bg-neutral-900">07:00 AM</option>
              <option value="8" className="bg-neutral-900">08:00 AM</option>
              <option value="9" className="bg-neutral-900">09:00 AM</option>
              <option value="10" className="bg-neutral-900">10:00 AM</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Countdown Display */}
      <div className="bg-neutral-950/65 border border-neutral-900 p-3.5 rounded-xl flex items-center justify-between mb-3.5">
        <div className="space-y-0.5">
          <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest block font-mono">
            {todayChecked ? "Next Recommended Check in" : "Fasting Check countdown"}
          </span>
          
          <div className="flex items-baseline gap-1 mt-1">
            {/* Hours digit */}
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {timeLeft.hours.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono mr-1">h</span>

            <span className="text-xl font-bold font-mono text-neutral-700">:</span>

            {/* Minutes digit */}
            <span className="text-2xl font-black font-mono text-amber-400 tracking-tight">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono mr-1">m</span>

            <span className="text-xl font-bold font-mono text-neutral-700">:</span>

            {/* Seconds digit */}
            <span className="text-2xl font-black font-mono text-neutral-400 tracking-tight">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">s</span>
          </div>
        </div>

        {/* Auxiliary morning layout button/trigger */}
        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold">Breakfast Rule</span>
          </div>
          <span className="text-[9px] text-amber-500/80 font-semibold font-mono block mt-1">
            NPO (No food by mouth)
          </span>
        </div>
      </div>

      {/* Contextual Medical guidance alert advice */}
      <div className="p-2.5 bg-neutral-950/40 border border-neutral-900 rounded-lg flex items-start gap-2.5 text-[10.5px] leading-relaxed text-neutral-300">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-neutral-400 leading-snug">
          <span className="text-neutral-200 font-semibold uppercase tracking-wide text-[9px] mr-1 inline-block bg-neutral-800 px-1 rounded-sm">Guideline</span>
          {helperMessage} Typical target morning schedules range from <span className="text-white">6:00 AM to 8:30 AM</span>.
        </p>
      </div>
    </div>
  );
}
