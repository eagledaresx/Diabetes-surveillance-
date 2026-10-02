import React, { useState, useEffect } from "react";
import { Footprints, Play, Pause, RotateCcw, Flame, Timer, Award, TrendingUp, CheckCircle, PlusCircle, Calendar } from "lucide-react";
import { ActivityLog } from "../types";

interface WalkingTrackerProps {
  activityLogs: ActivityLog[];
  onAddActivity: (activity: Omit<ActivityLog, "id">) => void;
}

export const WalkingTracker: React.FC<WalkingTrackerProps> = ({
  activityLogs,
  onAddActivity
}) => {
  // Step Counter Simulation State
  const [dailySteps, setDailySteps] = useState(8740);
  const stepGoal = 10000;
  const distanceKm = (dailySteps * 0.00075).toFixed(2);
  const caloriesBurned = Math.round(dailySteps * 0.04);
  const stepPct = Math.min(100, Math.round((dailySteps / stepGoal) * 100));

  // Post-Meal Walk Timer State (15 mins = 900 seconds)
  const [timerSeconds, setTimerSeconds] = useState(15 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // Quick activity log form
  const [activityType, setActivityType] = useState("Walking");
  const [durationMins, setDurationMins] = useState(15);
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("medium");
  const [notes, setNotes] = useState("Post-lunch 15-min walk to reduce sugar spike");

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
        setDailySteps(prev => prev + 2); // simulate steps increment during walk!
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      alert("🎉 Post-Meal Walk Complete! Great job flattening your glucose spike!");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity({
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
      activityType,
      duration: durationMins,
      intensity,
      caloriesBurned: Math.round(durationMins * (intensity === "high" ? 7 : intensity === "medium" ? 5 : 3.5)),
      notes
    });
    setDailySteps(prev => prev + durationMins * 100);
    setShowLogModal(false);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-neutral-900 to-teal-950 border border-emerald-900/40 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Footprints className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
              Walking & Activity Tracker
            </h2>
            <p className="text-[10px] text-neutral-300">
              Non-Insulin GLUT4 Glucose Clearance Engine
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Step Goal & Metrics Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <div className="flex justify-between items-center text-xs border-b border-neutral-800 pb-2">
          <span className="font-bold text-white uppercase tracking-wider font-mono">Today's Step Goal</span>
          <span className="text-emerald-400 font-bold font-mono">{dailySteps.toLocaleString()} / {stepGoal.toLocaleString()} Steps</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${stepPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9.5px] font-mono text-neutral-400">
            <span>{stepPct}% Completed</span>
            <span>{(stepGoal - dailySteps) > 0 ? `${(stepGoal - dailySteps).toLocaleString()} steps left` : "Goal Achieved! 🎉"}</span>
          </div>
        </div>

        {/* Stat Badges Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
            <span className="text-[9px] text-neutral-400 block uppercase font-mono">Distance</span>
            <span className="text-sm font-black text-white font-mono mt-0.5 block">{distanceKm} <span className="text-[9px] text-neutral-500">km</span></span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
            <span className="text-[9px] text-neutral-400 block uppercase font-mono">Calories</span>
            <span className="text-sm font-black text-rose-400 font-mono mt-0.5 block">{caloriesBurned} <span className="text-[9px] text-neutral-500">kcal</span></span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
            <span className="text-[9px] text-neutral-400 block uppercase font-mono">Active Walk</span>
            <span className="text-sm font-black text-teal-400 font-mono mt-0.5 block">45 <span className="text-[9px] text-neutral-500">mins</span></span>
          </div>
        </div>
      </div>

      {/* Post-Meal Walk Timer Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-teal-900/40 p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-500/10 text-teal-400 rounded-lg">
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">15-Min Post-Meal Walk Timer</h3>
              <p className="text-[9.5px] text-neutral-400 font-mono">Walk 10–15 mins after lunch/dinner to drop sugar spikes</p>
            </div>
          </div>
        </div>

        {/* Big Display & Controls */}
        <div className="flex flex-col items-center justify-center py-3 bg-neutral-950 rounded-2xl border border-neutral-800 space-y-3">
          <div className="text-3xl font-black font-mono tracking-widest text-teal-400">
            {formatTimer(timerSeconds)}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isTimerRunning
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-teal-600 hover:bg-teal-700 text-white"
              }`}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? "Pause Walk" : "Start Post-Meal Walk"}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(15 * 60);
              }}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Clinical Tip */}
        <div className="p-2.5 bg-teal-950/20 border border-teal-900/30 rounded-xl text-[10px] text-teal-300 leading-relaxed font-sans flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong>Medical Mechanism:</strong> Light physical activity within 30 minutes after meals triggers GLUT4 protein translocation in skeletal muscles, absorbing glucose directly without relying on insulin.
          </span>
        </div>
      </div>

      {/* Activity Logs History */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-neutral-800 pb-2">
          Recent Activity Logs
        </h3>

        {activityLogs.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-xs space-y-1">
            <p>No activity logged yet today.</p>
            <p className="text-[10px] text-neutral-600 font-mono">Log a 15-minute walk after meals to keep glucose steady!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activityLogs.map((act) => (
              <div key={act.id} className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{act.activityType}</span>
                    <span className="text-[9.5px] text-neutral-400 font-mono">{act.date} at {act.time} • {act.notes || "Routine walk"}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold block">{act.duration} mins</span>
                  <span className="text-[9px] text-neutral-500">{act.caloriesBurned} kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-sm w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-emerald-400" /> Log Physical Activity
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-neutral-400 font-mono block mb-1">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Walking">Walking (Post-Meal)</option>
                  <option value="Bisk Walk">Brisk Walking</option>
                  <option value="Jogging">Jogging</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Yoga / Stretching">Yoga / Stretching</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono block mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-mono block mb-1">Intensity</label>
                  <select
                    value={intensity}
                    onChange={(e) => setIntensity(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="low">Low (Light Walk)</option>
                    <option value="medium">Medium (Brisk)</option>
                    <option value="high">High (Vigorous)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-mono block mb-1">Notes / Meal Relation</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  placeholder="e.g., Walked 15 mins after lunch"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-md"
              >
                Save Activity Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
