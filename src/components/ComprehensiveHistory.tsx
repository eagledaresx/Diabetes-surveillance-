import React, { useState, useMemo } from "react";
import { GlucoseReading, MedicationLog, FoodLog, ActivityLog } from "../types";
import { 
  Calendar, 
  Clock, 
  Activity, 
  Pill, 
  Utensils, 
  TrendingUp, 
  SlidersHorizontal, 
  Trash2, 
  Plus, 
  X, 
  ChevronDown, 
  ArrowUpDown, 
  Dumbbell, 
  Sparkles,
  Search,
  Flame
} from "lucide-react";

interface ComprehensiveHistoryProps {
  readings: GlucoseReading[];
  onDeleteReading: (id: string) => void;
  medLogs: MedicationLog[];
  onDeleteMedLog: (id: string) => void;
  foodLogs: FoodLog[];
  onDeleteFoodLog: (id: string) => void;
  activityLogs: ActivityLog[];
  onAddActivityLog: (newLog: Omit<ActivityLog, "id">) => void;
  onDeleteActivityLog: (id: string) => void;
}

export default function ComprehensiveHistory({
  readings,
  onDeleteReading,
  medLogs,
  onDeleteMedLog,
  foodLogs,
  onDeleteFoodLog,
  activityLogs,
  onDeleteActivityLog,
  onAddActivityLog
}: ComprehensiveHistoryProps) {
  // Filter States
  const [filterType, setFilterType] = useState<"all" | "glucose" | "medication" | "food" | "activity">("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Activity Form States
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [actType, setActType] = useState("Walking");
  const [actCustomType, setActCustomType] = useState("");
  const [actDuration, setActDuration] = useState("30");
  const [actIntensity, setActIntensity] = useState<"low" | "medium" | "high">("medium");
  const [actCalories, setActCalories] = useState("");
  const [actNotes, setActNotes] = useState("");
  const [actDate, setActDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [actTime, setActTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // Combine and normalize all logs
  const combinedHistory = useMemo(() => {
    const items: Array<{
      id: string;
      date: string;
      time: string;
      type: "glucose" | "medication" | "food" | "activity";
      original: any;
    }> = [];

    // 1. Glucose Readings
    readings.forEach(r => {
      items.push({
        id: r.id,
        date: r.date,
        time: r.time,
        type: "glucose",
        original: r
      });
    });

    // 2. Medication Logs
    medLogs.forEach(m => {
      let extractedTime = "--:--";
      if (m.takenAt) {
        try {
          const tPart = m.takenAt.split("T")[1];
          if (tPart) {
            extractedTime = tPart.substring(0, 5);
          }
        } catch (e) {
          // ignore
        }
      }
      items.push({
        id: m.id,
        date: m.dateStamp,
        time: extractedTime,
        type: "medication",
        original: m
      });
    });

    // 3. Food Logs
    foodLogs.forEach(f => {
      items.push({
        id: f.id,
        date: f.date,
        time: f.time || "12:00",
        type: "food",
        original: f
      });
    });

    // 4. Activity Logs
    activityLogs.forEach(a => {
      items.push({
        id: a.id,
        date: a.date,
        time: a.time || "12:00",
        type: "activity",
        original: a
      });
    });

    return items;
  }, [readings, medLogs, foodLogs, activityLogs]);

  // Filter and Sort the combined items
  const filteredAndSortedHistory = useMemo(() => {
    let result = [...combinedHistory];

    // Filter by type
    if (filterType !== "all") {
      result = result.filter(item => item.type === filterType);
    }

    // Filter by date range
    if (startDate) {
      result = result.filter(item => item.date >= startDate);
    }
    if (endDate) {
      result = result.filter(item => item.date <= endDate);
    }

    // Filter by text search (notes, names, items, etc.)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        if (item.type === "glucose") {
          const g: GlucoseReading = item.original;
          return (
            g.category.toLowerCase().includes(query) ||
            (g.notes && g.notes.toLowerCase().includes(query)) ||
            g.type.toLowerCase().includes(query)
          );
        } else if (item.type === "medication") {
          const m: MedicationLog = item.original;
          return m.medicineName.toLowerCase().includes(query);
        } else if (item.type === "food") {
          const f: FoodLog = item.original;
          return (
            f.foodItems.toLowerCase().includes(query) ||
            f.mealType.toLowerCase().includes(query) ||
            (f.notes && f.notes.toLowerCase().includes(query))
          );
        } else if (item.type === "activity") {
          const a: ActivityLog = item.original;
          return (
            a.activityType.toLowerCase().includes(query) ||
            (a.notes && a.notes.toLowerCase().includes(query))
          );
        }
        return false;
      });
    }

    // Sort chronologically
    result.sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time}`;
      const dateTimeB = `${b.date}T${b.time}`;
      if (sortOrder === "newest") {
        return dateTimeB.localeCompare(dateTimeA);
      } else {
        return dateTimeA.localeCompare(dateTimeB);
      }
    });

    return result;
  }, [combinedHistory, filterType, startDate, endDate, sortOrder, searchQuery]);

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalType = actType === "Other" ? (actCustomType || "Exercise") : actType;
    const durVal = parseInt(actDuration) || 30;
    const calVal = actCalories ? parseInt(actCalories) : undefined;

    onAddActivityLog({
      date: actDate,
      time: actTime,
      activityType: finalType,
      duration: durVal,
      intensity: actIntensity,
      caloriesBurned: calVal,
      notes: actNotes.trim() || undefined
    });

    // Reset Form
    setShowAddActivity(false);
    setActCustomType("");
    setActNotes("");
    setActCalories("");
  };

  const handleDeleteItem = (item: typeof combinedHistory[0]) => {
    if (!confirm(`Are you sure you want to delete this ${item.type} log?`)) {
      return;
    }
    if (item.type === "glucose") {
      onDeleteReading(item.id);
    } else if (item.type === "medication") {
      onDeleteMedLog(item.id);
    } else if (item.type === "food") {
      onDeleteFoodLog(item.id);
    } else if (item.type === "activity") {
      onDeleteActivityLog(item.id);
    }
  };

  // Helper to render beautiful category tags
  const renderLogBadge = (item: typeof combinedHistory[0]) => {
    switch (item.type) {
      case "glucose": {
        const g: GlucoseReading = item.original;
        const isFasting = g.type === "fasting";
        return (
          <div className="flex items-center gap-1.5">
            <span className={`p-1 rounded-lg ${isFasting ? "bg-cyan-500/10 text-cyan-400" : "bg-rose-500/10 text-rose-400"}`}>
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <div className="text-left">
              <span className="font-semibold text-neutral-200">Glucose Reading</span>
              <span className="text-[10px] text-neutral-400 font-mono block">
                {isFasting ? "Fasting (Morning)" : "Post-Meal"} • <span className={
                  g.category === "Normal" ? "text-green-400 font-bold" :
                  g.category === "Hypoglycemia" ? "text-amber-400 font-bold" : "text-rose-400 font-bold"
                }>{g.category}</span>
              </span>
            </div>
          </div>
        );
      }
      case "medication": {
        const m: MedicationLog = item.original;
        return (
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-pink-500/10 text-pink-400">
              <Pill className="w-3.5 h-3.5" />
            </span>
            <div className="text-left">
              <span className="font-semibold text-neutral-200">Medication Taken</span>
              <span className="text-[10px] text-neutral-400 font-mono block">
                {m.medicineName} {m.unitsAdministered ? `• ${m.unitsAdministered} units` : ""}
              </span>
            </div>
          </div>
        );
      }
      case "food": {
        const f: FoodLog = item.original;
        return (
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Utensils className="w-3.5 h-3.5" />
            </span>
            <div className="text-left">
              <span className="font-semibold text-neutral-200">Culinary Intake</span>
              <span className="text-[10px] text-neutral-400 font-mono block">
                {f.mealType} • {f.portionSize}
              </span>
            </div>
          </div>
        );
      }
      case "activity": {
        const a: ActivityLog = item.original;
        return (
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
              <Dumbbell className="w-3.5 h-3.5" />
            </span>
            <div className="text-left">
              <span className="font-semibold text-neutral-200">Physical Activity</span>
              <span className="text-[10px] text-neutral-400 font-mono block">
                {a.activityType} • {a.duration} mins ({a.intensity} intensity)
              </span>
            </div>
          </div>
        );
      }
    }
  };

  const renderLogDetails = (item: typeof combinedHistory[0]) => {
    switch (item.type) {
      case "glucose": {
        const g: GlucoseReading = item.original;
        return (
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">{g.value}</span>
              <span className="text-[9.5px] text-neutral-500 font-mono uppercase">mg/dL</span>
            </div>
            {g.notes && (
              <p className="text-[10.5px] text-neutral-400 italic bg-neutral-950/40 p-1.5 rounded-lg border border-neutral-800/40">
                "{g.notes}"
              </p>
            )}
          </div>
        );
      }
      case "medication": {
        return (
          <div className="mt-2 text-stone-300 font-mono text-[11px] bg-neutral-950/30 px-2 py-1.5 rounded-lg border border-neutral-850">
            Intake confirmed and timestamp logged.
          </div>
        );
      }
      case "food": {
        const f: FoodLog = item.original;
        return (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-bold text-stone-200">{f.foodItems}</p>
            {f.notes && (
              <p className="text-[10.5px] text-neutral-400 italic bg-neutral-950/40 p-1.5 rounded-lg border border-neutral-800/40">
                "{f.notes}"
              </p>
            )}
            <div className="flex gap-2 text-[9.5px] font-mono text-neutral-500 mt-1">
              {f.carbsIntake !== undefined && <span>Carbs: {f.carbsIntake}g</span>}
              {f.proteinIntake !== undefined && <span>Protein: {f.proteinIntake}g</span>}
              {f.fatIntake !== undefined && <span>Fat: {f.fatIntake}g</span>}
            </div>
          </div>
        );
      }
      case "activity": {
        const a: ActivityLog = item.original;
        return (
          <div className="mt-2 space-y-1">
            {a.caloriesBurned && (
              <div className="flex items-center gap-1 text-[10.5px] text-rose-400 font-semibold font-mono">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                <span>Burned approx. {a.caloriesBurned} kcal</span>
              </div>
            )}
            {a.notes && (
              <p className="text-[10.5px] text-neutral-400 italic bg-neutral-950/40 p-1.5 rounded-lg border border-neutral-800/40">
                "{a.notes}"
              </p>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
      
      {/* Upper Title Area */}
      <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-850 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white">Comprehensive Health History</h2>
          <p className="text-[11px] text-neutral-400 font-mono">Chronological timeline surveillance</p>
        </div>
        <button
          id="btn-trigger-activity-form"
          onClick={() => setShowAddActivity(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Interactive Controls & Filters panel */}
      <div className="p-3 bg-neutral-900 border-b border-neutral-850 space-y-3 shrink-0">
        
        {/* Date Filter Inputs */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <label className="block text-neutral-400 font-mono mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-white text-[11px] focus:outline-none"
            />
          </div>
        </div>

        {/* Search and Sort Row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 px-2.5 py-1.5 rounded-xl text-xs font-bold hover:text-white flex items-center gap-1"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] hidden sm:inline">
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </span>
          </button>
        </div>

        {/* Sub-Tab Filter Toggles */}
        <div className="flex flex-wrap gap-1 select-none">
          {[
            { value: "all", label: "All Logs", icon: SlidersHorizontal },
            { value: "glucose", label: "Glucose", icon: TrendingUp },
            { value: "medication", label: "Medication", icon: Pill },
            { value: "food", label: "Food Intake", icon: Utensils },
            { value: "activity", label: "Activities", icon: Dumbbell }
          ].map((btn) => {
            const Icon = btn.icon;
            const isSel = filterType === btn.value;
            return (
              <button
                key={btn.value}
                onClick={() => setFilterType(btn.value as any)}
                className={`py-1.5 px-2.5 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                  isSel
                    ? "bg-amber-600/15 border-amber-500 text-amber-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-300"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Timeline Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filteredAndSortedHistory.length === 0 ? (
          <div className="text-center py-12 px-4 bg-neutral-900/30 rounded-2xl border border-dashed border-neutral-850">
            <Activity className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs text-neutral-400 font-mono italic">
              No matching records found within active filters.
            </p>
            {(startDate || endDate || searchQuery) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="mt-3 text-[11px] font-bold text-amber-400 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="relative border-l border-neutral-800 ml-3.5 pl-4 space-y-4 py-2">
            {filteredAndSortedHistory.map((item) => (
              <div key={item.id} className="relative group">
                
                {/* Timeline node icon placeholder */}
                <span className="absolute -left-[25.5px] top-1 w-3.5 h-3.5 rounded-full bg-neutral-950 border-2 border-neutral-800 group-hover:border-amber-500 transition-colors z-10"></span>
                
                {/* Outer Card */}
                <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-2xl hover:border-neutral-700/80 transition-all shadow-sm">
                  
                  {/* Card Header row */}
                  <div className="flex justify-between items-start gap-2">
                    {renderLogBadge(item)}

                    <div className="flex items-center gap-2 shrink-0 font-mono text-[9.5px] text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.time}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800/85 transition-all cursor-pointer shrink-0 ml-1"
                        title="Delete this record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body Details */}
                  {renderLogDetails(item)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Log Activity dialog Modal */}
      {showAddActivity && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-neutral-850 w-full max-w-sm rounded-2xl flex flex-col shadow-2xl animate-scaleUp">
            
            {/* Header */}
            <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase text-white tracking-widest font-mono">Log Physical Activity</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddActivity(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleActivitySubmit} className="p-4 space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Time</label>
                  <input
                    type="time"
                    required
                    value={actTime}
                    onChange={(e) => setActTime(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Exercise / Activity Type</label>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value="Walking">Walking</option>
                  <option value="Running">Running</option>
                  <option value="Jogging">Jogging</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Strength Training">Strength Training</option>
                  <option value="Gym Workout">Gym Workout</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Gardening">Gardening</option>
                  <option value="Other">Other (Custom Type)</option>
                </select>
              </div>

              {actType === "Other" && (
                <div className="animate-fadeIn">
                  <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Specify Custom Activity</label>
                  <input
                    type="text"
                    required
                    value={actCustomType}
                    onChange={(e) => setActCustomType(e.target.value)}
                    placeholder="e.g. HIIT Workout, Pilates"
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Duration (mins)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={actDuration}
                    onChange={(e) => setActDuration(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Est. Calories (kcal)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={actCalories}
                    onChange={(e) => setActCalories(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((intensity) => (
                    <button
                      key={intensity}
                      type="button"
                      onClick={() => setActIntensity(intensity)}
                      className={`py-1.5 rounded-xl border font-bold font-mono uppercase text-[9.5px] tracking-wider transition-all text-center cursor-pointer ${
                        actIntensity === intensity
                          ? "bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm"
                          : "bg-neutral-950 border-neutral-850 text-neutral-500 hover:text-neutral-400"
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-mono font-semibold text-[10px] uppercase">Progress Notes / Details</label>
                <textarea
                  value={actNotes}
                  onChange={(e) => setActNotes(e.target.value)}
                  placeholder="e.g. Felt good, heart rate reached 140bpm"
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-xl px-3 py-1.5 text-white placeholder-neutral-600 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2.5 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setShowAddActivity(false)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-neutral-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Activity</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
