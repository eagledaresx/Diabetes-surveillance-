import React, { useState, useEffect, useMemo } from "react";
import { GlassWater, Droplet, Plus, Trash2, RotateCcw, Info, Sparkles, AlertTriangle, Flame } from "lucide-react";
import confetti from "canvas-confetti";

interface WaterLog {
  id: string;
  amount: number;
  time: string;
}

export default function HydrationTracker() {
  const [unit, setUnit] = useState<"ml" | "oz">(() => {
    return (localStorage.getItem("hydration_unit") as "ml" | "oz") || "ml";
  });

  const [goal, setGoal] = useState<number>(() => {
    const cached = localStorage.getItem("hydration_goal");
    if (cached) return parseInt(cached, 10);
    return unit === "ml" ? 2000 : 64;
  });

  const [logs, setLogs] = useState<WaterLog[]>(() => {
    const cached = localStorage.getItem("hydration_logs");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Clean out older logs outside today
        const todayStr = new Date().toISOString().split("T")[0];
        const cachedDay = localStorage.getItem("hydration_last_date");
        if (cachedDay === todayStr) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [completedDates, setCompletedDates] = useState<string[]>(() => {
    const cached = localStorage.getItem("hydration_completed_dates");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [inputVal, setInputVal] = useState("");
  const [feedback, setFeedback] = useState("");

  const totalIntake = logs.reduce((acc, log) => acc + log.amount, 0);

  // Sync completion for "today"
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const isCompletedNow = totalIntake >= goal;
    const isAlreadyMarked = completedDates.includes(todayStr);

    if (isCompletedNow && !isAlreadyMarked) {
      setCompletedDates((prev) => {
        if (prev.includes(todayStr)) return prev;
        const next = [...prev, todayStr];
        localStorage.setItem("hydration_completed_dates", JSON.stringify(next));
        return next;
      });

      // Fire a glorious double-cannon celebratory confetti burst!
      try {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.8 },
          colors: ["#3b82f6", "#60a5fa", "#2563eb", "#fbbf24", "#f59e0b", "#10b981"]
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.8 },
          colors: ["#3b82f6", "#60a5fa", "#2563eb", "#fbbf24", "#f59e0b", "#10b981"]
        });
      } catch (err) {
        console.error("Confetti tracking trigger failed:", err);
      }

      setFeedback("🎉 Goal Achieved! Magnificent job meeting your hydration target today! Keep it up! 💧🔥");
      setTimeout(() => setFeedback(""), 6000);
    } else if (!isCompletedNow && isAlreadyMarked) {
      setCompletedDates((prev) => {
        const next = prev.filter((d) => d !== todayStr);
        localStorage.setItem("hydration_completed_dates", JSON.stringify(next));
        return next;
      });
    }
  }, [totalIntake, goal]);

  // Dynamic consecutive days streak calculation (using UTC matching to getUtcDateStr/toISOString split)
  const currentStreak = useMemo(() => {
    if (completedDates.length === 0) return 0;

    const uniqueDates = Array.from(new Set(completedDates)).sort();
    const todayStr = new Date().toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const hasToday = uniqueDates.includes(todayStr);
    const hasYesterday = uniqueDates.includes(yesterdayStr);

    if (!hasToday && !hasYesterday) {
      return 0;
    }

    let streak = 0;
    const checkDate = hasToday ? new Date() : yesterday;

    while (true) {
      const checkDateStr = checkDate.toISOString().split("T")[0];
      if (uniqueDates.includes(checkDateStr)) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [completedDates]);

  // Persist Date, logs, unit, goal in localStorage
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem("hydration_last_date", todayStr);
    localStorage.setItem("hydration_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("hydration_unit", unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("hydration_goal", goal.toString());
  }, [goal]);

  // Adjust goals when changing units to approximate equivalence
  const handleToggleUnit = (newUnit: "ml" | "oz") => {
    if (newUnit === unit) return;
    setUnit(newUnit);
    if (newUnit === "oz") {
      setGoal(64); // standard 64 oz
    } else {
      setGoal(2000); // standard 2000 ml
    }
  };

  const handleAddQuickAmount = (amount: number) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newLog: WaterLog = {
      id: "water_" + Date.now(),
      amount,
      time: timeFormatted,
    };
    
    setLogs((prev) => [...prev, newLog]);
    setFeedback(`Log successful: added ${amount} ${unit}!`);
    setTimeout(() => setFeedback(""), 3500);
  };

  const handleAddCustomAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputVal, 10);
    if (!parsed || parsed <= 0) return;

    handleAddQuickAmount(parsed);
    setInputVal("");
  };

  const handleDeleteLog = (id: string) => {
    setLogs((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset today's water intake progress?")) {
      setLogs([]);
      setFeedback("Intake tracking reset to 0.");
      setTimeout(() => setFeedback(""), 3500);
    }
  };

  const progressPercent = Math.min(100, Math.round((totalIntake / goal) * 100));

  // Determine standard recommended presets based on units
  const presets = unit === "ml" 
    ? [ { label: "Small Cup", val: 250 }, { label: "Standard Mug", val: 350 }, { label: "Standard Bottle", val: 500 }, { label: "Large Tumbler", val: 750 } ]
    : [ { label: "Small Cup", val: 8 }, { label: "Standard Mug", val: 12 }, { label: "Standard Bottle", val: 16 }, { label: "Large Tumbler", val: 24 } ];

  return (
    <div className="bg-gradient-to-br from-[#111827] to-[#0f172a] border border-neutral-800 p-4 rounded-2xl space-y-4 shadow-xl relative overflow-hidden">
      {/* Wave pattern effect in background on completion */}
      {progressPercent >= 100 && (
        <div className="absolute right-0 top-0 bg-blue-500/5 rotate-12 p-8 rounded-full translate-x-4 -translate-y-4 animate-pulse">
          <Sparkles className="w-16 h-16 text-blue-400/25" />
        </div>
      )}

      {/* Header section */}
      <div className="flex justify-between items-start pb-2 border-b border-neutral-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <Droplet className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">Daily Hydration Goal</h3>
            <span className="text-[9.5px] text-blue-400 font-mono font-semibold block uppercase">Osmotic Diuresis Safety</span>
          </div>
        </div>

        {/* Streak & Units Switcher Group */}
        <div className="flex items-center gap-2">
          {currentStreak > 0 ? (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-400 animate-fadeIn select-none shadow-sm h-6">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse shrink-0" />
              <span>{currentStreak}d Streak</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-neutral-900/40 border border-neutral-850 px-2 py-0.5 rounded-lg text-[10px] font-semibold text-neutral-500 select-none h-6">
              <Flame className="w-3 h-3 text-neutral-600 shrink-0" />
              <span>No Streak</span>
            </div>
          )}

          {/* Units Switcher */}
          <div className="flex bg-neutral-900 border border-neutral-850 p-0.5 rounded-lg text-[9px] font-mono leading-none h-6 items-center">
            <button
              onClick={() => handleToggleUnit("ml")}
              className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
                unit === "ml" ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              ML
            </button>
            <button
              onClick={() => handleToggleUnit("oz")}
              className={`px-1.5 py-0.5 rounded-md font-bold transition-all ${
                unit === "oz" ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              OZ
            </button>
          </div>
        </div>
      </div>

      {/* Grid Dashboard - Progress Wave Visualizer & Active Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Visual Cup filling up */}
        <div className="md:col-span-4 flex flex-col items-center justify-center py-2 relative">
          
          {/* Sizable Dynamic Graphic Glass */}
          <div className="w-24 h-36 border-4 border-slate-750 bg-[#070b13] rounded-b-3xl rounded-t-lg relative overflow-hidden flex items-end shadow-inner">
            
            {/* Water liquid filler */}
            <div 
              className="w-full bg-gradient-to-t from-blue-700 via-blue-500 to-sky-400 relative transition-all duration-700 ease-out"
              style={{ height: `${progressPercent}%` }}
            >
              {/* Animated Wave overlay */}
              {progressPercent > 0 && progressPercent < 100 && (
                <div className="absolute -top-3 left-0 right-0 h-4 bg-sky-300/40 animate-pulse rounded-full opacity-60 blur-xs" />
              )}
            </div>

            {/* Float percent badge centered on glass */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none bg-black/5">
              <span className="text-2xl font-black text-white font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {progressPercent}%
              </span>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider font-mono drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.85)]">
                {totalIntake} / {goal} {unit}
              </span>
            </div>
          </div>

          {/* Target setup button logs */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 font-mono text-[10px]">
            <span className="text-neutral-500 font-bold uppercase tracking-wider">Goal:</span>
            <input 
              aria-label="Set Hydration Target Goal Value"
              type="number"
              value={goal}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val > 0) setGoal(val);
              }}
              className="w-14 bg-neutral-900 border border-neutral-800 rounded-md px-1 py-0.5 text-center text-blue-400 font-black focus:outline-none"
            />
            <span className="text-neutral-500 font-extrabold">{unit}</span>
          </div>

          {currentStreak > 0 && (
            <span className="text-[9.5px] text-amber-400 font-semibold font-mono mt-1 text-center animate-fadeIn block leading-tight">
              🔥 {currentStreak}-day streak active!
            </span>
          )}
        </div>

        {/* Presets and custom logger inputs */}
        <div className="md:col-span-8 space-y-3">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono block">Log Water Preset:</span>
          
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAddQuickAmount(p.val)}
                className="bg-neutral-900 hover:bg-slate-900 border border-neutral-800 hover:border-blue-900/60 transition-all p-2.5 rounded-xl flex items-center justify-between group text-left cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-300 group-hover:text-white transition-colors">{p.label}</span>
                  <span className="text-[8.5px] text-neutral-500 font-mono mt-0.5">Preset index</span>
                </div>
                <div className="flex items-center gap-1">
                  <Plus className="w-3 h-3 text-neutral-500 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                  <span className="text-xs font-black font-mono text-blue-400">+{p.val}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom addition input form */}
          <form onSubmit={handleAddCustomAmount} className="flex gap-2">
            <input
              type="number"
              required
              placeholder={`Enter customized volume (${unit})...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-3 py-1.5 text-xs text-blue-400 placeholder-neutral-700 font-mono focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-650 text-white text-xs font-bold px-4 rounded-xl cursor-pointer select-none transition-all flex items-center gap-1.5"
            >
              <GlassWater className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </form>
        </div>
      </div>

      {/* Logs and Details Drawer panel */}
      {logs.length > 0 && (
        <div className="bg-neutral-950/70 border border-neutral-900/80 rounded-xl p-3 space-y-2 max-h-36 overflow-y-auto">
          <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">Today's Intake Log History:</span>
            <button
              onClick={handleResetProgress}
              className="text-[9px] font-extrabold text-[#f43f5e] hover:underline flex items-center gap-1 cursor-pointer select-none"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset Today
            </button>
          </div>

          <div className="space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center text-xs font-mono py-1 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <Droplet className="w-3 h-3 text-blue-400 fill-current" />
                  <span className="text-white font-bold">+{log.amount} {unit}</span>
                  <span className="text-neutral-500 text-[10px]">({log.time})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLog(log.id)}
                  className="text-neutral-600 hover:text-red-400 p-1 rounded hover:bg-neutral-900"
                  aria-label="Delete water intake log"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* clinical advice note linking blood sugar to dehydration */}
      <div className="p-3 bg-blue-955/20 border border-blue-500/15 rounded-xl flex items-start gap-2.5 text-[10.5px] leading-relaxed text-slate-300">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-blue-300 block mb-0.5 text-[9.5px] uppercase tracking-wide">Dehydration & Glucose Connection</span>
          <p className="text-[10px] text-slate-400 leading-normal">
            Elevated blood sugar forces kidneys to excrete excess glucose, extracting cell-water in the process (<span className="text-slate-200">osmotic diuresis</span>). Staying fully hydrated naturally dilutes excessive serum concentrations and helps prevent complications.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-lg animate-fadeIn flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
