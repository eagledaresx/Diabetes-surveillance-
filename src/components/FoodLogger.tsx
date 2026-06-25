import React, { useState, useMemo } from "react";
import { 
  Utensils, 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  Activity, 
  Sparkles, 
  Link as LinkIcon, 
  Loader2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  FileSpreadsheet, 
  HelpCircle,
  TrendingDown
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Legend as RechartsLegend 
} from "recharts";
import { GlucoseReading, FoodLog } from "../types";

interface FoodLoggerProps {
  readings: GlucoseReading[];
  foodLogs: FoodLog[];
  onAddFoodLog: (log: Omit<FoodLog, "id">) => void;
  onDeleteFoodLog: (id: string) => void;
  onAssociateGlucose: (foodLogId: string, glucoseId: string | undefined) => void;
  onQuickLogGlucose: (value: number, date: string, time: string, type: "fasting" | "post_fasting", notes: string) => void;
  prefilledFood?: {
    mealType: FoodLog["mealType"];
    foodItems: string;
    portionSize?: string;
    impactScale?: FoodLog["impactScale"];
    carbsIntake?: number;
    proteinIntake?: number;
    fatIntake?: number;
  } | null;
  onClearPrefilledFood?: () => void;
}

export default function FoodLogger({
  readings,
  foodLogs,
  onAddFoodLog,
  onDeleteFoodLog,
  onAssociateGlucose,
  onQuickLogGlucose,
  prefilledFood,
  onClearPrefilledFood,
}: FoodLoggerProps) {
  // Input Form State
  const [mealType, setMealType] = useState<FoodLog["mealType"]>("Breakfast");
  const [foodItems, setFoodItems] = useState("");
  const [portionSize, setPortionSize] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [impactScale, setImpactScale] = useState<FoodLog["impactScale"]>("medium");
  const [carbsIntake, setCarbsIntake] = useState("");
  const [proteinIntake, setProteinIntake] = useState("");
  const [fatIntake, setFatIntake] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGlucoseId, setSelectedGlucoseId] = useState<string>("");

  // Optional embedded quick glucose log state
  const [showQuickGlucose, setShowQuickGlucose] = useState(false);
  const [quickGlucoseVal, setQuickGlucoseVal] = useState("");
  const [quickGlucoseType, setQuickGlucoseType] = useState<"fasting" | "post_fasting">("post_fasting");

  // Filter logs for selected day to show relative trends
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [filterMealType, setFilterMealType] = useState<"All" | "Breakfast" | "Lunch" | "Dinner" | "Snack">("All");

  // Collapsible sections
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Auto-fill form if prefilled food is passed from parent/reports
  React.useEffect(() => {
    if (prefilledFood) {
      setMealType(prefilledFood.mealType);
      setFoodItems(prefilledFood.foodItems);
      if (prefilledFood.portionSize) {
        setPortionSize(prefilledFood.portionSize);
      }
      if (prefilledFood.impactScale) {
        setImpactScale(prefilledFood.impactScale);
      }
      if (prefilledFood.carbsIntake !== undefined) {
        setCarbsIntake(String(prefilledFood.carbsIntake));
      } else {
        setCarbsIntake("");
      }
      if (prefilledFood.proteinIntake !== undefined) {
        setProteinIntake(String(prefilledFood.proteinIntake));
      } else {
        setProteinIntake("");
      }
      if (prefilledFood.fatIntake !== undefined) {
        setFatIntake(String(prefilledFood.fatIntake));
      } else {
        setFatIntake("");
      }
      onClearPrefilledFood?.();
    }
  }, [prefilledFood, onClearPrefilledFood]);

  // Suggested preset foods for fast logging clicks with realistic macronutrient profiles
  const presets: Array<{ name: string; portion: string; meal: FoodLog["mealType"]; scale: FoodLog["impactScale"]; carbs?: number; protein?: number; fat?: number }> = [
    { name: "Oatmeal with berries & chia seeds", portion: "1 medium bowl (150g)", meal: "Breakfast", scale: "low", carbs: 25, protein: 6, fat: 3 },
    { name: "Scrambled eggs with spinach & whole wheat toast", portion: "2 eggs + 1 slice", meal: "Breakfast", scale: "low", carbs: 15, protein: 14, fat: 11 },
    { name: "Brown rice with grilled salmon & broccoli", portion: "1 plate (200g salmon, 100g rice)", meal: "Lunch", scale: "low", carbs: 35, protein: 30, fat: 14 },
    { name: "White flour roti with potato & potato curry", portion: "2 rottis (150g)", meal: "Dinner", scale: "high", carbs: 70, protein: 8, fat: 12 },
    { name: "Mixed green salad with grilled chicken & olive dressing", portion: "1 large bowl", meal: "Lunch", scale: "low", carbs: 8, protein: 26, fat: 9 },
    { name: "White rice with lentils & potatoes", portion: "1 large plate", meal: "Lunch", scale: "high", carbs: 85, protein: 12, fat: 4 },
    { name: "Greek yogurt with a handful of almonds", portion: "1 small cup (120g)", meal: "Snack", scale: "low", carbs: 10, protein: 12, fat: 9 },
    { name: "Samosa / sweet traditional deep-fried sweets", portion: "2 standard pieces", meal: "Snack", scale: "high", carbs: 45, protein: 5, fat: 18 },
  ];

  // Helper: Find explicit glucose reading if present, OR look up closest post_fasting glucose reading (within 3 hours on same day)
  const getAssociatedGlucose = (log: FoodLog): GlucoseReading | null => {
    if (log.associatedGlucoseId) {
      const found = readings.find((r) => r.id === log.associatedGlucoseId);
      if (found) return found;
    }

    // Temporal auto-association helper:
    // If no explicit ID, search for the closest reading on the same date that occurs within 3 hours after the meal
    if (!log.time || typeof log.time !== "string" || !log.time.includes(":")) {
      return null;
    }

    const mealTimeParts = log.time.split(":");
    const mealHour = parseInt(mealTimeParts[0], 10);
    const mealMinute = parseInt(mealTimeParts[1], 10);
    if (isNaN(mealHour) || isNaN(mealMinute)) {
      return null;
    }
    const mealSecondsTotal = mealHour * 3600 + mealMinute * 60;

    let closestReading: GlucoseReading | null = null;
    let minDifference = 3 * 3600; // 3 hours in seconds max threshold

    const sameDayReadings = readings.filter((r) => r.date === log.date);
    for (const r of sameDayReadings) {
      if (!r.time || typeof r.time !== "string" || !r.time.includes(":")) {
        continue;
      }
      const rTimeParts = r.time.split(":");
      const rHour = parseInt(rTimeParts[0], 10);
      const rMin = parseInt(rTimeParts[1], 10);
      if (isNaN(rHour) || isNaN(rMin)) {
        continue;
      }
      const rSecondsTotal = rHour * 3600 + rMin * 60;

      const diff = rSecondsTotal - mealSecondsTotal; // positive if reading was taken after meal
      if (diff >= 0 && diff <= minDifference) {
        minDifference = diff;
        closestReading = r;
      }
    }

    return closestReading;
  };

  const handleAddPreset = (p: typeof presets[0]) => {
    setFoodItems(p.name);
    setPortionSize(p.portion);
    setMealType(p.meal);
    setImpactScale(p.scale);
    setCarbsIntake(p.carbs !== undefined ? String(p.carbs) : "");
    setProteinIntake(p.protein !== undefined ? String(p.protein) : "");
    setFatIntake(p.fat !== undefined ? String(p.fat) : "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodItems.trim() || !portionSize.trim()) return;

    const carbsVal = carbsIntake.trim() ? parseInt(carbsIntake, 10) : undefined;
    const proteinVal = proteinIntake.trim() ? parseInt(proteinIntake, 10) : undefined;
    const fatVal = fatIntake.trim() ? parseInt(fatIntake, 10) : undefined;

    onAddFoodLog({
      date,
      time,
      mealType,
      foodItems: foodItems.trim(),
      portionSize: portionSize.trim(),
      associatedGlucoseId: selectedGlucoseId || undefined,
      notes: notes.trim() || undefined,
      impactScale,
      carbsIntake: carbsVal && !isNaN(carbsVal) ? carbsVal : undefined,
      proteinIntake: proteinVal && !isNaN(proteinVal) ? proteinVal : undefined,
      fatIntake: fatVal && !isNaN(fatVal) ? fatVal : undefined,
    });

    // Reset inputs
    setFoodItems("");
    setPortionSize("");
    setCarbsIntake("");
    setProteinIntake("");
    setFatIntake("");
    setNotes("");
    setSelectedGlucoseId("");
    setShowQuickGlucose(false);
    setQuickGlucoseVal("");
  };

  const handleQuickGlucoseSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const valNum = parseInt(quickGlucoseVal, 10);
    if (isNaN(valNum) || valNum <= 0) return;

    // We can predict or compute category inside higher parent component in App.tsx
    // Let's call the utility interface prop
    onQuickLogGlucose(
      valNum,
      date,
      time, // Close timestamp
      quickGlucoseType,
      `Auto-linked to ${mealType}: ${foodItems.slice(0, 30)}`
    );

    // Fetch the newly logged reading to associate immediately
    // Wait, the state updates asynchronously - we can find it by date/time after, 
    // but in raw timing we can auto-associate on next render!
    setShowQuickGlucose(false);
    setQuickGlucoseVal("");
  };

  const getGlucoseStatusColor = (category: string) => {
    switch (category) {
      case "Normal":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Prediabetes":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Hypoglycemia":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "Diabetes":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Severe Hyperglycemia":
        return "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse";
      default:
        return "bg-neutral-800 text-neutral-400";
    }
  };

  const getImpactBadgeColor = (scale?: "low" | "medium" | "high") => {
    switch (scale) {
      case "low":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "high":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold";
      case "medium":
      default:
        return "bg-neutral-800 text-neutral-400 border border-neutral-700";
    }
  };

  // Compute a list of glucose readings that are available for the selected date to associate manually
  const sameDayGlucoseOptions = useMemo(() => {
    return readings.filter((r) => r.date === date);
  }, [readings, date]);

  // Compute stats per meal type to show users which meals have glycemic spikes
  const mealAnalysisStats = useMemo(() => {
    const mealTypesList: Array<FoodLog["mealType"]> = ["Breakfast", "Lunch", "Dinner", "Snack"];
    return mealTypesList.map(type => {
      const logs = foodLogs.filter(l => l.mealType === type);
      let spikeCount = 0;
      let totalGlucoseCount = 0;
      let sumGlucose = 0;
      let maxGlucose = 0;

      logs.forEach(l => {
        const gl = getAssociatedGlucose(l);
        if (gl) {
          totalGlucoseCount++;
          sumGlucose += gl.value;
          if (gl.value >= 140) {
            spikeCount++;
          }
          if (gl.value > maxGlucose) {
            maxGlucose = gl.value;
          }
        }
      });

      return {
        type,
        displayName: type === "Snack" ? "Snacks" : type,
        emoji: type === "Breakfast" ? "🥣" : type === "Lunch" ? "🥗" : type === "Dinner" ? "🍽️" : "🍎",
        totalLogs: logs.length,
        totalWithGlucose: totalGlucoseCount,
        spikeCount,
        averageGlucose: totalGlucoseCount > 0 ? Math.round(sumGlucose / totalGlucoseCount) : null,
        highestGlucose: totalGlucoseCount > 0 ? maxGlucose : null,
        spikeRate: totalGlucoseCount > 0 ? Math.round((spikeCount / totalGlucoseCount) * 100) : 0,
      };
    });
  }, [foodLogs, readings]);

  // Filter food logs by selected date and/or meal type
  const filteredFoodLogs = useMemo(() => {
    return foodLogs.filter((log) => {
      const matchesDate = !filterDate || log.date === filterDate;
      const matchesMeal = filterMealType === "All" || log.mealType === filterMealType;
      return matchesDate && matchesMeal;
    });
  }, [foodLogs, filterDate, filterMealType]);

  // Compute daily total macro counts for the selected filterDate
  const dailyMacroStats = useMemo(() => {
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let mealsWithMacros = 0;

    // Filter logs for the selected date
    const logsForSelectedDay = foodLogs.filter(log => log.date === filterDate);

    logsForSelectedDay.forEach(log => {
      let hasMacro = false;
      if (log.carbsIntake !== undefined && log.carbsIntake > 0) {
        totalCarbs += log.carbsIntake;
        hasMacro = true;
      }
      if (log.proteinIntake !== undefined && log.proteinIntake > 0) {
        totalProtein += log.proteinIntake;
        hasMacro = true;
      }
      if (log.fatIntake !== undefined && log.fatIntake > 0) {
        totalFat += log.fatIntake;
        hasMacro = true;
      }
      if (hasMacro) {
        mealsWithMacros++;
      }
    });

    const totalGrams = totalCarbs + totalProtein + totalFat;
    const carbsCal = totalCarbs * 4;
    const proteinCal = totalProtein * 4;
    const fatCal = totalFat * 9;
    const totalCal = carbsCal + proteinCal + fatCal;

    const chartData = [
      { name: "Carbohydrates", value: totalCarbs, calories: carbsCal, color: "#f59e0b" }, // Amber
      { name: "Protein", value: totalProtein, calories: proteinCal, color: "#10b981" },     // Emerald
      { name: "Fat", value: totalFat, calories: fatCal, color: "#3b82f6" }            // Blue
    ].filter(item => item.value > 0);

    return {
      totalCarbs,
      totalProtein,
      totalFat,
      totalCal,
      totalGrams,
      mealsWithMacros,
      totalMealsToday: logsForSelectedDay.length,
      chartData
    };
  }, [foodLogs, filterDate]);

  // Generate automated smart dietary surveillance remarks based on food items / glycemic response
  const smartAnalysis = useMemo(() => {
    let spikedCount = 0;
    let normalCount = 0;
    let highGlycemicMealsLogged = 0;
    const recommendations: string[] = [];

    foodLogs.forEach((l) => {
      if (l.impactScale === "high") highGlycemicMealsLogged++;
      const gl = getAssociatedGlucose(l);
      if (gl) {
        if (gl.value >= 140) {
          spikedCount++;
        } else if (gl.value >= 70 && gl.value < 130) {
          normalCount++;
        }
      }
    });

    if (spikedCount > 0) {
      recommendations.push(
        `⚠️ Found ${spikedCount} food-related metabolic peaks (Glucose > 140 mg/dL). Consider replacing refined carbs with high-fiber grains like quinoa or steel-cut oats.`
      );
    }
    if (highGlycemicMealsLogged > 0) {
      recommendations.push(
        `💡 You logged ${highGlycemicMealsLogged} meal(s) containing known high glycemic index ingredients. Pairing these with slow-acting proteins or vinegar dressings can blunt the glucose curves.`
      );
    }
    if (normalCount > 0 && spikedCount === 0) {
      recommendations.push(
        "✅ Excellent glucose stabilization observed! Your current food portion configurations are effectively aligned with your diabetic target bounds."
      );
    }
    if (foodLogs.length === 0) {
      recommendations.push(
        "🥣 Begin logging your breakfasts, lunches, and small evening snack templates to discover specific food triggers."
      );
    }

    return { spikedCount, normalCount, recommendations };
  }, [foodLogs, readings]);

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-900/60 border border-neutral-850 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <Utensils className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wider font-mono">Glycemic Nutrition & Diet Association</h3>
            <p className="text-[10px] text-neutral-400 font-mono">Understand meal behaviors & glucose impacts in real-time</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9.5px] font-mono text-neutral-500">Intake Index:</span>
          <span className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded-lg border border-neutral-850 font-bold font-mono text-white">
            {foodLogs.length} Meals Checked
          </span>
        </div>
      </div>

      {/* QUICK MEAL LOGGER & ANALYSIS SIDE-BY-SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* NEW MEAL LOG FORM */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" /> Log Food Intake
            </h4>
            <span className="text-[9px] text-neutral-500 font-mono">Saves Locally</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* MEAL TYPE SELECT & DATE/TIME */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as FoodLog["mealType"])}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-rose-550 focus:outline-none"
                >
                  <option value="Breakfast">Breakfast 🥣</option>
                  <option value="Lunch">Lunch 🥗</option>
                  <option value="Dinner">Dinner 🍽️</option>
                  <option value="Snack">Snack 🍎</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1.5 text-[10px] text-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Time</label>
                <input
                  type="text"
                  required
                  placeholder="HH:MM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1.5 text-[10px] text-center text-white focus:ring-1 focus:ring-rose-550 focus:outline-none"
                />
              </div>
            </div>

            {/* PRESETS QUICK FILL */}
            <div className="space-y-1">
              <span className="block text-[9.5px] text-neutral-500 font-mono uppercase font-bold">Frequently Logged / Indian & Western Presets</span>
              <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto pr-1">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPreset(p)}
                    className="text-[9.5px] bg-neutral-950 border border-neutral-850 hover:border-neutral-750 text-neutral-400 hover:text-white px-2 py-1 rounded-lg transition-all cursor-pointer truncate max-w-[200px]"
                    title={`${p.name} (${p.portion})`}
                  >
                    {p.name.split(" ")[0]}.. - {p.portion.split(" ")[0]} {p.portion.includes("(") ? "(" + p.portion.split("(")[1] : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* FOOD ITEMS & PORTION SIZE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Food Item(s)</label>
                <input
                  id="input-food-items"
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Chicken"
                  value={foodItems}
                  onChange={(e) => setFoodItems(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Portion Sizes & Weight</label>
                <input
                  id="input-portion-size"
                  type="text"
                  required
                  placeholder="e.g. 1 medium bowl, 2 chapatis"
                  value={portionSize}
                  onChange={(e) => setPortionSize(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* MACRONUTRIENT INPUTS */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase flex items-center justify-between">
                  <span>Carbs (g)</span>
                  <span className="text-[8px] text-neutral-500 font-normal lowercase font-sans">Optional</span>
                </label>
                <input
                  id="input-carbs-intake"
                  type="number"
                  min="0"
                  placeholder="e.g. 45"
                  value={carbsIntake}
                  onChange={(e) => setCarbsIntake(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase flex items-center justify-between">
                  <span>Protein (g)</span>
                  <span className="text-[8px] text-neutral-500 font-normal lowercase font-sans">Optional</span>
                </label>
                <input
                  id="input-protein-intake"
                  type="number"
                  min="0"
                  placeholder="e.g. 25"
                  value={proteinIntake}
                  onChange={(e) => setProteinIntake(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase flex items-center justify-between">
                  <span>Fat (g)</span>
                  <span className="text-[8px] text-neutral-500 font-normal lowercase font-sans">Optional</span>
                </label>
                <input
                  id="input-fat-intake"
                  type="number"
                  min="0"
                  placeholder="e.g. 10"
                  value={fatIntake}
                  onChange={(e) => setFatIntake(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* GLYCEMIC ESTIMATE INDEX & EXTRA METADATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-neutral-950/40 p-3 rounded-2xl border border-neutral-850">
              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Estimated Glycemic Impact</label>
                <select
                  value={impactScale}
                  onChange={(e) => setImpactScale(e.target.value as FoodLog["impactScale"])}
                  className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none"
                >
                  <option value="low">Low Glycemic 🟢 (Proteins, leafy greens, healthy fats)</option>
                  <option value="medium">Medium Glycemic 🟡 (Whole grains, starchy veggies)</option>
                  <option value="high">High Glycemic / Spiker 🔴 (White rice, breads, desserts)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-neutral-400 font-mono mb-0.5 font-bold uppercase">Associate Glucose Reading</label>
                
                {showQuickGlucose ? (
                  <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-850 rounded-xl p-1 animate-fadeIn">
                    <input
                      type="number"
                      placeholder="mg/dL"
                      value={quickGlucoseVal}
                      onChange={(e) => setQuickGlucoseVal(e.target.value)}
                      className="w-20 bg-neutral-900 border border-neutral-800 text-xs font-bold text-center text-white focus:outline-none p-1 rounded"
                    />
                    <select
                      value={quickGlucoseType}
                      onChange={(e) => setQuickGlucoseType(e.target.value as any)}
                      className="bg-neutral-900 border border-neutral-850 text-[10px] text-stone-300 p-1 rounded"
                    >
                      <option value="post_fasting">Post-Meal</option>
                      <option value="fasting">Fasting</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleQuickGlucoseSubmit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded"
                    >
                      Log
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuickGlucose(false)}
                      className="text-neutral-500 hover:text-neutral-300 text-[10px] px-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedGlucoseId}
                      onChange={(e) => setSelectedGlucoseId(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-850 rounded-xl px-2.5 py-1.5 text-xs text-stone-300 focus:outline-none"
                    >
                      <option value="">-- Let Auto-Associate Match Closest --</option>
                      {sameDayGlucoseOptions.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.time} - {g.value} mg/dL ({g.type === "fasting" ? "Fasting" : "Post-Meal"})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowQuickGlucose(true)}
                      className="bg-neutral-850 hover:bg-neutral-800 text-[11px] font-mono text-neutral-300 px-2 py-1.5 rounded-xl border border-neutral-800 hover:text-white shrink-0 active:scale-95 transition-all"
                      title="Directly enter glucose level"
                    >
                      + Quick Glucose
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* HEALTH ADHERENCE NOTES */}
            <div>
              <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Preparation or Symptoms Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Walking exercise after eating, homemade without oil, cooked in olive oil"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-605 focus:ring-1 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <button
              id="btn-food-log-submit"
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-600/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none transition-all active:scale-[0.99]"
            >
              <Utensils className="w-4 h-4 text-white" />
              <span>Register Culinary Intake Entry</span>
            </button>
          </form>
        </div>

        {/* DIETARY SURVEILLANCE INTELLIGENCE REMARKS */}
        <div className="lg:col-span-5 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <Sparkles className="w-4.5 h-4.5 animate-pulse shrink-0" />
              <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">Glycemic Response Analysis</h4>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              This analytics console dynamically computes correlations between your logged carbohydrates/portions and the subsequent post-prandial blood sugar readings recorded within 2–3 hours.
            </p>

            {/* Smart stats indicators */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-center">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold block">Post-Meal Spikes</span>
                <span className="text-base font-extrabold text-rose-500 block mt-0.5">{smartAnalysis.spikedCount}</span>
                <span className="text-[8px] text-neutral-600">&ge; 140 mg/dL samples</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                <span className="text-[9px] text-neutral-500 uppercase font-semibold block">Target Achieved</span>
                <span className="text-base font-extrabold text-emerald-400 block mt-0.5">{smartAnalysis.normalCount}</span>
                <span className="text-[8px] text-neutral-600">70 - 130 mg/dL stable</span>
              </div>
            </div>

            {/* Automated recommendations list */}
            <div className="space-y-2 pt-2">
              <span className="text-[9.5px] font-mono text-neutral-500 uppercase font-semibold block">Observations & Remediations:</span>
              
              {smartAnalysis.recommendations.map((rec, keyIdx) => (
                <div 
                  key={keyIdx}
                  className="bg-neutral-950/70 border border-neutral-850 p-3 rounded-xl text-[10.5px] text-stone-300 flex gap-2 line-clamp-3 leading-relaxed"
                >
                  <span className="text-sky-400 font-mono shrink-0 select-none">•</span>
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-bold text-white uppercase block">Temporal Match Algorithm Active</span>
              <p className="text-[9.5px] text-neutral-500 leading-normal">
                If you do not specify a reading manually, the system auto-scans for post-meal values logged shortly after your meals.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* DAILY MACRONUTRIENT BREAKDOWN PIE CHART */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-2">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-widest flex items-center gap-2">
              <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                <Utensils className="w-4 h-4" />
              </span>
              Daily Macronutrient Balance
            </h4>
            <p className="text-[10px] text-neutral-500">
              Selected timeframe balance overview for <strong className="text-neutral-400">{filterDate ? filterDate : "all logged dates"}</strong>
            </p>
          </div>
          {filterDate && (
            <div className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-xl border border-neutral-850 flex items-center gap-2.5">
              <span>Meals logged today: <strong className="text-white">{dailyMacroStats.totalMealsToday}</strong></span>
              {dailyMacroStats.mealsWithMacros > 0 && (
                <>
                  <span className="text-neutral-700">|</span>
                  <span>With Macros: <strong className="text-emerald-400">{dailyMacroStats.mealsWithMacros}</strong></span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Pie Chart Display */}
          <div className="md:col-span-5 flex flex-col items-center justify-center min-h-[220px]">
            {dailyMacroStats.totalGrams > 0 ? (
              <div className="w-full h-[200px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dailyMacroStats.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dailyMacroStats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percent = ((data.value / dailyMacroStats.totalGrams) * 100).toFixed(0);
                          return (
                            <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-[11px] font-sans shadow-lg space-y-1">
                              <p className="font-bold text-white uppercase tracking-wider text-[10px]">{data.name}</p>
                              <p className="text-neutral-300">
                                Weight: <strong className="text-white font-mono">{data.value}g</strong> ({percent}%)
                              </p>
                              <p className="text-neutral-400 text-[10px]">
                                Energy: <strong className="text-white font-mono">{data.calories} kcal</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text showing total logged kcal */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[20px] font-black text-white font-mono leading-none">
                    {dailyMacroStats.totalCal}
                  </span>
                  <span className="text-[9px] text-neutral-500 font-mono uppercase font-bold tracking-widest mt-0.5">
                    Est. Kcal
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-neutral-800 rounded-2xl w-full h-[200px]">
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-neutral-800 flex items-center justify-center text-neutral-600 mb-3 animate-pulse">
                  <Utensils className="w-6 h-6" />
                </div>
                <p className="text-[11px] text-neutral-400 font-bold">No Macronutrient Data</p>
                <p className="text-[9.5px] text-neutral-500 max-w-[200px] mt-1">
                  Add custom Carbs, Proteins, or Fats to display the daily macro balance.
                </p>
              </div>
            )}
          </div>

          {/* Details Column with progress bars and calories */}
          <div className="md:col-span-7 space-y-3">
            <h5 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-black">
              Macronutrient Target Contributions
            </h5>

            <div className="space-y-3.5">
              {/* CARBOHYDRATES */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-neutral-300 font-bold font-sans">Carbohydrates</span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    <span className="text-white font-bold">{dailyMacroStats.totalCarbs}g</span>
                    <span className="text-neutral-600 mx-1">•</span>
                    <span>{dailyMacroStats.totalCarbs * 4} kcal</span>
                    <span className="text-neutral-600 mx-1">•</span>
                    <span className="text-amber-400 font-extrabold font-mono">
                      {dailyMacroStats.totalGrams > 0 
                        ? `${Math.round((dailyMacroStats.totalCarbs / dailyMacroStats.totalGrams) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: dailyMacroStats.totalGrams > 0 
                        ? `${(dailyMacroStats.totalCarbs / dailyMacroStats.totalGrams) * 100}%`
                        : "0%" 
                    }}
                  />
                </div>
              </div>

              {/* PROTEIN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-neutral-300 font-bold font-sans">Protein</span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    <span className="text-white font-bold">{dailyMacroStats.totalProtein}g</span>
                    <span className="text-neutral-600 mx-1">•</span>
                    <span>{dailyMacroStats.totalProtein * 4} kcal</span>
                    <span className="text-neutral-600 mx-1">•</span>
                    <span className="text-emerald-400 font-extrabold font-mono">
                      {dailyMacroStats.totalGrams > 0 
                        ? `${Math.round((dailyMacroStats.totalProtein / dailyMacroStats.totalGrams) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: dailyMacroStats.totalGrams > 0 
                        ? `${(dailyMacroStats.totalProtein / dailyMacroStats.totalGrams) * 100}%`
                        : "0%" 
                    }}
                  />
                </div>
              </div>

              {/* FAT */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-neutral-300 font-bold font-sans">Fat</span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    <span className="text-white font-bold">{dailyMacroStats.totalFat}g</span>
                    <span className="text-neutral-600 mx-1">•</span>
                    <span>{dailyMacroStats.totalFat * 9} kcal</span>
                    <span className="text-neutral-600 mx-1">•</span>
                    <span className="text-blue-400 font-extrabold font-mono">
                      {dailyMacroStats.totalGrams > 0 
                        ? `${Math.round((dailyMacroStats.totalFat / dailyMacroStats.totalGrams) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ 
                      width: dailyMacroStats.totalGrams > 0 
                        ? `${(dailyMacroStats.totalFat / dailyMacroStats.totalGrams) * 100}%`
                        : "0%" 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-1.5 text-[9.5px] text-neutral-500 italic">
              <Info className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
              <span>Calculated based on 4 kcal/g for carbs/protein and 9 kcal/g for fats.</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED CUISINE GLYCEMIC TIMELINE */}
      <div className="space-y-4">
        
        {/* Glycemic Spike Analysis by Meal Type */}
        {foodLogs.length > 0 && (
          <div className="space-y-2 bg-neutral-950/45 p-4 rounded-2xl border border-neutral-805/80 shadow-inner">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] text-neutral-450 font-mono font-black uppercase tracking-wider block">
                Interactive Carb Spike Analytics By Meal Group
              </span>
              <span className="text-[9px] text-neutral-550 font-mono">Select a card to toggle filter</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {mealAnalysisStats.map((stat) => {
                const isSelected = filterMealType === stat.type;
                const hasSpikes = stat.spikeCount > 0;
                return (
                  <button
                    key={stat.type}
                    type="button"
                    id={`btn-meal-card-filter-${stat.type}`}
                    onClick={() => setFilterMealType(isSelected ? "All" : stat.type)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group hover:border-rose-500/30 select-none ${
                      isSelected 
                        ? "bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/25" 
                        : "bg-neutral-900 border-neutral-800 hover:bg-neutral-900/90"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full gap-1">
                      <span className="text-xs font-black flex items-center gap-1.5 text-white">
                        <span>{stat.emoji}</span>
                        <span className="group-hover:text-rose-400 transition-colors">{stat.displayName}</span>
                      </span>
                      {hasSpikes ? (
                        <span className="text-[8px] bg-rose-500/20 text-rose-400 font-extrabold px-1.5 py-0.5 rounded border border-rose-500/30 font-mono uppercase tracking-wide shrink-0">
                          {stat.spikeCount} {stat.spikeCount === 1 ? 'spike' : 'spikes'}
                        </span>
                      ) : (
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono uppercase font-semibold shrink-0">
                          Stable
                        </span>
                      )}
                    </div>

                    <div className="mt-3.5 space-y-1.5 w-full">
                      <div className="flex justify-between text-[9px] leading-none">
                        <span className="text-neutral-500 font-mono">Logged:</span>
                        <span className="text-neutral-300 font-bold font-mono">{stat.totalLogs} logs</span>
                      </div>
                      <div className="flex justify-between text-[9px] leading-none">
                        <span className="text-neutral-500 font-mono">Spike Rate:</span>
                        <span className={`font-mono font-black ${
                          stat.spikeRate >= 50 ? "text-rose-400" :
                          stat.spikeRate > 0 ? "text-amber-400" :
                          "text-emerald-400"
                        }`}>
                          {stat.totalWithGlucose > 0 ? `${stat.spikeRate}%` : "0% (No data)"}
                        </span>
                      </div>
                      {stat.averageGlucose && (
                        <div className="flex justify-between text-[9px] border-t border-neutral-850/40 pt-1 mt-1 font-mono">
                          <span className="text-neutral-500">Avg Glucose:</span>
                          <span className="text-neutral-300 font-bold">{stat.averageGlucose} mg/dL</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-2xl">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-neutral-200 uppercase tracking-widest">Active Dietary Logs Timeline</h3>
            <p className="text-[10px] text-neutral-500">Chronological history mapping meals to metabolic results</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Meal Type filter buttons */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
              {(["All", "Breakfast", "Lunch", "Dinner", "Snack"] as const).map((t) => {
                const isActive = filterMealType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    id={`btn-meal-filter-${t}`}
                    onClick={() => setFilterMealType(t)}
                    className={`text-[9.5px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? "bg-rose-600 text-white font-black hover:bg-rose-600/90"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                    }`}
                  >
                    {t === "All" ? "All" : t === "Snack" ? "Snacks 🍎" : t}
                  </button>
                );
              })}
            </div>

            {/* Date filter field with Clear option */}
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-neutral-950 border border-neutral-850 text-[10px] font-mono tracking-wider rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
              />
              {filterDate && (
                <button
                  type="button"
                  id="btn-clear-date-filter"
                  onClick={() => setFilterDate("")}
                  className="text-[9px] bg-neutral-950 hover:bg-neutral-900 text-white font-bold p-1 px-2 border border-neutral-850 hover:border-neutral-750 transition-all rounded"
                >
                  All Days
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Display filtered results */}
        {foodLogs.length === 0 ? (
          <div className="text-center p-12 bg-neutral-900 rounded-2xl border border-dashed border-neutral-800">
            <FileSpreadsheet className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
            <h4 className="text-xs font-bold text-neutral-300 uppercase font-mono tracking-wider">No food intake records captured</h4>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto leading-normal">
              Food logs allow you to match your plate composition with your CGM or manual fingerprick data to locate specific high-glycemic spikes.
            </p>
          </div>
        ) : filteredFoodLogs.length === 0 ? (
          <div className="text-center p-12 bg-neutral-900 rounded-2xl border border-dashed border-neutral-800">
            <FileSpreadsheet className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-xs font-bold text-neutral-350 uppercase font-mono tracking-wider">No matching logs found</h4>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto leading-normal">
              Your active filters (Date: {filterDate || "All Days"}, Meal Type: {filterMealType === "All" ? "All Meals" : filterMealType}) returned no logs. Try adjusting or clearing filters.
            </p>
            <button
              type="button"
              id="btn-reset-timeline-filters"
              onClick={() => {
                setFilterDate("");
                setFilterMealType("All");
              }}
              className="mt-3 text-[10.5px] cursor-pointer inline-flex items-center gap-1 font-bold bg-neutral-950 border border-neutral-850 hover:border-neutral-700 text-stone-200 px-3 py-1.5 rounded-xl transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
            {/* Sort logs: descending date & time */}
            {[...filteredFoodLogs]
              .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
              .map((log) => {
                const alliedGlucose = getAssociatedGlucose(log);

                return (
                  <div 
                    key={log.id}
                    className="bg-neutral-900 border border-neutral-800/80 p-4 rounded-2xl space-y-3 hover:border-neutral-700 transition-all flex flex-col justify-between"
                  >
                    {/* Header: Date / Time + Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${
                            log.mealType === "Breakfast" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            log.mealType === "Lunch" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                            log.mealType === "Dinner" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/10" :
                            "bg-orange-500/10 text-orange-400 border border-orange-500/10"
                          }`}>
                            {log.mealType}
                          </span>
                          <span className={getImpactBadgeColor(log.impactScale) + " text-[9px] px-2 py-0.5 rounded-full"}>
                            {log.impactScale === "low" ? "Low GI" : log.impactScale === "high" ? "High GI (Spiker)" : "Med GI"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                          <Calendar className="w-3 h-3 text-neutral-500 shrink-0" />
                          <span>{log.date}</span>
                          <Clock className="w-3 h-3 text-neutral-500 shrink-0 ml-1" />
                          <span>{log.time}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteFoodLog(log.id)}
                        className="p-1 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-neutral-950 transition-all cursor-pointer"
                        title="Delete log permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meal items plate */}
                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5">
                        <span className="text-white font-extrabold text-xs tracking-tight">{log.foodItems}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase">Portion:</span>
                          <span className="font-semibold text-neutral-300">{log.portionSize}</span>
                        </div>
                        {log.carbsIntake !== undefined && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-950 border border-neutral-850 rounded-lg">
                            <span className="text-[9px] text-amber-500 font-mono uppercase font-bold">Carbs:</span>
                            <span className="font-bold text-amber-400 font-mono">{log.carbsIntake}g</span>
                          </div>
                        )}
                        {log.proteinIntake !== undefined && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-950 border border-neutral-850 rounded-lg">
                            <span className="text-[9px] text-emerald-500 font-mono uppercase font-bold">Protein:</span>
                            <span className="font-bold text-emerald-400 font-mono">{log.proteinIntake}g</span>
                          </div>
                        )}
                        {log.fatIntake !== undefined && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-neutral-950 border border-neutral-850 rounded-lg">
                            <span className="text-[9px] text-blue-500 font-mono uppercase font-bold">Fat:</span>
                            <span className="font-bold text-blue-400 font-mono">{log.fatIntake}g</span>
                          </div>
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-[10px] italic text-neutral-500 mt-1 bg-neutral-950/50 p-2 rounded-lg border border-neutral-850">
                          &ldquo;{log.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Allied Glucose Blood Sugar Association View */}
                    <div className="border-t border-neutral-850 pt-2.5 mt-1">
                      {alliedGlucose ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-neutral-500 font-mono uppercase font-bold flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-neutral-600" />
                              Synced Glycemic Response
                            </span>
                            <span className="text-neutral-400 font-mono text-[9px] bg-neutral-950 px-1.5 py-0.5 rounded">
                              + {(alliedGlucose.type === "fasting") ? "Fasting Reading" : `Post-Meal (Taken ${alliedGlucose.time})`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-1 bg-neutral-950 p-2.5 rounded-xl border border-neutral-850">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{alliedGlucose.value}</span>
                              <span className="text-[8.5px] text-neutral-500 font-mono uppercase">mg/dL</span>
                              <span className={`text-[8.5px] font-bold border px-2 py-0.5 rounded-full ${getGlucoseStatusColor(alliedGlucose.category)}`}>
                                {alliedGlucose.category}
                              </span>
                            </div>

                            {/* Glycemic health checks feedback */}
                            <div>
                              {alliedGlucose.value >= 140 ? (
                                <div className="text-[9.5px] font-bold text-rose-400 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse shrink-0" />
                                  <span>Spike Warning!</span>
                                </div>
                              ) : (
                                <div className="text-[9.5px] font-semibold text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>Stable Glucose</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick smart substitution checklist suggestion */}
                          {alliedGlucose.value >= 140 && log.impactScale === "high" && (
                            <div className="bg-rose-500/5 text-[9.5px] border border-rose-500/10 text-rose-400/90 p-2 rounded-lg leading-relaxed flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400 animate-pulse" />
                              <span>Substitute white rice/flour with steel-cut grains or quinoa next time to reduce post-meal peaks.</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-neutral-950/60 p-2 rounded-xl text-[10px]">
                          <span className="text-neutral-500 font-mono flex items-center gap-1.5">
                            <LinkIcon className="w-3 h-3 text-neutral-600" /> No linked glucose sample found.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedGlucoseId("");
                              setDate(log.date);
                              setTime(log.time);
                              setMealType(log.mealType);
                              setFoodItems(log.foodItems);
                              setPortionSize(log.portionSize);
                              setShowQuickGlucose(true);
                              document.getElementById("input-glucose-val")?.focus();
                            }}
                            className="text-sky-400 hover:text-sky-300 font-bold transition-all text-[9.5px] cursor-pointer"
                          >
                            + Link reading
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
          </div>
        )}
      </div>

    </div>
  );
}
