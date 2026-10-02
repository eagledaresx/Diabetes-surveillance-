import React, { useState } from "react";
import { 
  Target, 
  Award, 
  TrendingDown, 
  CheckCircle2, 
  Flame, 
  Calendar, 
  X, 
  Save, 
  Sparkles,
  Sliders,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { UserProfile, GlucoseReading } from "../types";

interface GoalsAndProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  readings: GlucoseReading[];
  onSaveProfile: (updated: Partial<UserProfile>) => void;
}

export const GoalsAndProgressModal: React.FC<GoalsAndProgressModalProps> = ({
  isOpen,
  onClose,
  profile,
  readings,
  onSaveProfile
}) => {
  const [targetHbA1c, setTargetHbA1c] = useState<number>(profile.targetHbA1c || 6.5);
  const [targetTIR, setTargetTIR] = useState<number>(profile.targetTimeInRange || 75);
  const [targetFastingMin, setTargetFastingMin] = useState<number>(profile.targetFastingMin || 70);
  const [targetFastingMax, setTargetFastingMax] = useState<number>(profile.targetFastingMax || 100);
  const [targetPostMin, setTargetPostMin] = useState<number>(profile.targetPostMin || 100);
  const [targetPostMax, setTargetPostMax] = useState<number>(profile.targetPostMax || 140);
  const [targetDailyLogs, setTargetDailyLogs] = useState<number>(profile.targetDailyLogs || 3);
  const [activeTab, setActiveTab] = useState<"progress" | "settings">("progress");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Calculate actual clinical performance
  const values = readings.map(r => r.value);
  const meanGlucose = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 115;
  const currentEstimatedHbA1c = parseFloat(((meanGlucose + 46.7) / 28.7).toFixed(1));

  // Time in Range (70 - 180 mg/dL)
  const inRangeCount = values.filter(v => v >= 70 && v <= 180).length;
  const currentTIR = values.length ? Math.round((inRangeCount / values.length) * 100) : 85;

  // Today's log count
  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogsCount = readings.filter(r => r.date === todayStr).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      targetHbA1c,
      targetTimeInRange: targetTIR,
      targetFastingMin,
      targetFastingMax,
      targetPostMin,
      targetPostMax,
      targetDailyLogs
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab("progress");
    }, 1200);
  };

  const hba1cDiff = (currentEstimatedHbA1c - targetHbA1c).toFixed(1);
  const isHbA1cAchieved = currentEstimatedHbA1c <= targetHbA1c;
  const isTIRAchieved = currentTIR >= targetTIR;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Glycemic Goals &amp; Progress Reports
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Set personalized HbA1c &amp; daily glucose targets to track your success
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-4 pt-3 flex gap-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setActiveTab("progress")}
            className={`pb-2 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "progress"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Progress Report &amp; Scorecard
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-2 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "settings"
                ? "border-teal-500 text-teal-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Configure Target Goals
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === "progress" ? (
            <div className="space-y-4">
              
              {/* Motivational Encouragement Banner */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-300 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs block">
                    {isHbA1cAchieved && isTIRAchieved
                      ? "Outstanding Progress! You are meeting all clinical targets."
                      : "Steady Momentum! You are actively moving toward your targets."}
                  </span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {isHbA1cAchieved
                      ? `Your estimated HbA1c (${currentEstimatedHbA1c}%) is currently at or below your goal (${targetHbA1c}%). Keep up consistent logging and meal pacing!`
                      : `Current estimated HbA1c is ${currentEstimatedHbA1c}%, just ${Math.abs(parseFloat(hba1cDiff))}% away from your ${targetHbA1c}% goal. Consistent daily tracking is proven to lower HbA1c by 0.5–1.0%.`}
                  </p>
                </div>
              </div>

              {/* Visual Progress Cards */}
              <div className="space-y-3">
                {/* 1. HbA1c Progress */}
                <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold block">
                        Estimated HbA1c vs Target Goal
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-black font-mono text-white">{currentEstimatedHbA1c}%</span>
                        <span className="text-xs font-mono text-neutral-400">Target: {targetHbA1c}%</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isHbA1cAchieved
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-teal-500/15 text-teal-300 border-teal-500/30"
                    }`}>
                      {isHbA1cAchieved ? "Goal Achieved ✓" : "In Progress"}
                    </span>
                  </div>

                  {/* Progress bar visual */}
                  <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isHbA1cAchieved ? "bg-emerald-500" : "bg-teal-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(15, 100 - (currentEstimatedHbA1c - targetHbA1c) * 25))}%` }}
                    />
                  </div>
                </div>

                {/* 2. Time in Range (TIR) Progress */}
                <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold block">
                        Time-In-Range (70 - 180 mg/dL)
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xl font-black font-mono text-white">{currentTIR}%</span>
                        <span className="text-xs font-mono text-neutral-400">Target: ≥{targetTIR}%</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isTIRAchieved
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-orange-500/15 text-orange-300 border-orange-500/30"
                    }`}>
                      {isTIRAchieved ? "Within Target Range" : "Needs Attention"}
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <div 
                      className="h-full bg-teal-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, currentTIR)}%` }}
                    />
                  </div>
                </div>

                {/* 3. Daily Logging Consistency Goal */}
                <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold block">
                        Daily Logging Consistency
                      </span>
                      <span className="text-sm font-bold text-white">
                        {todayLogsCount} of {targetDailyLogs} readings entered today
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[10.5px] font-mono font-bold border ${
                    todayLogsCount >= targetDailyLogs
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-neutral-850 text-neutral-400 border-neutral-700"
                  }`}>
                    {todayLogsCount >= targetDailyLogs ? "Daily Target Met!" : `${targetDailyLogs - todayLogsCount} remaining`}
                  </span>
                </div>
              </div>

              {/* Target Ranges Summary pill table */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2">
                <span className="text-[10px] text-neutral-400 font-mono uppercase font-bold block">
                  Active Glucose Targets (Doctor Recommended)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <span className="text-neutral-500 block text-[9.5px]">Morning Fasting Target:</span>
                    <span className="text-teal-300 font-bold">{targetFastingMin} – {targetFastingMax} mg/dL</span>
                  </div>
                  <div className="p-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <span className="text-neutral-500 block text-[9.5px]">Post-Meal (2h) Target:</span>
                    <span className="text-teal-300 font-bold">{targetPostMin} – {targetPostMax} mg/dL</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("settings")}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-teal-400" />
                <span>Adjust Target Numbers</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-teal-400 uppercase font-mono tracking-wider">
                  HbA1c &amp; Time-In-Range Goals
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase font-bold mb-1">
                      Target HbA1c (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="5.0"
                      max="10.0"
                      value={targetHbA1c}
                      onChange={(e) => setTargetHbA1c(parseFloat(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-[9.5px] text-neutral-500 font-mono">ADA default is &lt;7.0%</span>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase font-bold mb-1">
                      Target TIR (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="50"
                      max="95"
                      value={targetTIR}
                      onChange={(e) => setTargetTIR(parseInt(e.target.value, 10))}
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:ring-1 focus:ring-teal-500"
                    />
                    <span className="text-[9.5px] text-neutral-500 font-mono">Standard goal: ≥70%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-mono uppercase font-bold mb-1">
                    Target Daily Readings Count
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="8"
                    value={targetDailyLogs}
                    onChange={(e) => setTargetDailyLogs(parseInt(e.target.value, 10))}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[9.5px] text-neutral-500 font-mono">e.g. Morning fasting, post-lunch, post-dinner</span>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-teal-400 uppercase font-mono tracking-wider">
                  Target Glucose Ranges (mg/dL)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase font-bold mb-1">
                      Fasting Min (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={targetFastingMin}
                      onChange={(e) => setTargetFastingMin(parseInt(e.target.value, 10))}
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase font-bold mb-1">
                      Fasting Max (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={targetFastingMax}
                      onChange={(e) => setTargetFastingMax(parseInt(e.target.value, 10))}
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase font-bold mb-1">
                      Post-Meal Min (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={targetPostMin}
                      onChange={(e) => setTargetPostMin(parseInt(e.target.value, 10))}
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-mono uppercase font-bold mb-1">
                      Post-Meal Max (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={targetPostMax}
                      onChange={(e) => setTargetPostMax(parseInt(e.target.value, 10))}
                      className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("progress")}
                  className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saveSuccess ? "Goals Saved!" : "Save Target Goals"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
