import React, { useState, useMemo, useRef } from "react";
import {
  TrendingUp,
  Camera,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Calendar,
  Activity,
  ShieldCheck,
  Info,
  Maximize2,
  X,
  HeartPulse,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ReferenceLine
} from "recharts";
import html2canvas from "html2canvas";
import { GlucoseReading, UserProfile } from "../types";

interface RollingAverageChartProps {
  readings: GlucoseReading[];
  profile: UserProfile;
}

interface RollingPoint {
  date: string;
  displayDate: string;
  timestamp: number;
  rollingAvg: number;
  rollingFastingAvg: number | null;
  rollingPostMealAvg: number | null;
  dailyAvg: number | null;
  dailyFasting: number | null;
  dailyPostMeal: number | null;
  count7d: number;
  tirPct7d: number;
  sd7d: number;
}

export const RollingAverageChart: React.FC<RollingAverageChartProps> = ({
  readings,
  profile
}) => {
  const [timeWindow, setTimeWindow] = useState<"7d" | "14d" | "30d" | "all">("30d");
  const [showFastingPostBreakdown, setShowFastingPostBreakdown] = useState(true);
  const [showDailyDots, setShowDailyDots] = useState(true);
  const [showTargetCorridor, setShowTargetCorridor] = useState(true);

  // Snapshot modal states
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState("");
  const [aiSummaryNote, setAiSummaryNote] = useState<string>("");
  const [isLoadingAiNote, setIsLoadingAiNote] = useState(false);

  const snapshotRef = useRef<HTMLDivElement>(null);

  // Target ranges based on profile
  const targetMin = profile.targetFastingMin || 70;
  const targetMax = profile.targetPostMax || 140;

  // 1. Process and compute rolling 7-day data
  const { rollingData, currentMetrics } = useMemo(() => {
    if (!readings || readings.length === 0) {
      return { rollingData: [], currentMetrics: null };
    }

    // Sort all readings chronologically
    const sortedReadings = [...readings].sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const timeB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return timeA - timeB;
    });

    // Group readings by day
    const dayMap = new Map<string, GlucoseReading[]>();
    sortedReadings.forEach(r => {
      if (!dayMap.has(r.date)) {
        dayMap.set(r.date, []);
      }
      dayMap.get(r.date)!.push(r);
    });

    // Get sorted unique dates
    const uniqueDates = Array.from(dayMap.keys()).sort();
    if (uniqueDates.length === 0) {
      return { rollingData: [], currentMetrics: null };
    }

    // Determine earliest and latest dates to construct a continuous daily timeline
    const firstDateObj = new Date(uniqueDates[0]);
    const lastDateObj = new Date(uniqueDates[uniqueDates.length - 1]);

    const allDays: string[] = [];
    const cur = new Date(firstDateObj);
    while (cur <= lastDateObj) {
      allDays.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }

    // For each day, look back 7 calendar days (inclusive of current day)
    const points: RollingPoint[] = [];

    allDays.forEach(dayStr => {
      const dayEnd = new Date(`${dayStr}T23:59:59.999Z`).getTime();
      const sevenDaysAgoStart = dayEnd - 7 * 24 * 60 * 60 * 1000;

      // Filter readings that occurred within the 7-day lookback window
      const windowReadings = sortedReadings.filter(r => {
        const rTime = new Date(`${r.date}T${r.time || "12:00"}`).getTime();
        return rTime >= sevenDaysAgoStart && rTime <= dayEnd;
      });

      // Daily readings for the current day specifically
      const daySpecificReadings = dayMap.get(dayStr) || [];
      const dailyVals = daySpecificReadings.map(r => r.value).filter(v => v > 0);
      const dailyAvg = dailyVals.length ? Math.round(dailyVals.reduce((a, b) => a + b, 0) / dailyVals.length) : null;

      const dailyFastingVals = daySpecificReadings.filter(r => r.type === "fasting").map(r => r.value);
      const dailyPostVals = daySpecificReadings.filter(r => r.type === "post_fasting").map(r => r.value);

      // Only calculate rolling points if there is at least 1 reading in the window or on this day
      if (windowReadings.length > 0) {
        const windowVals = windowReadings.map(r => r.value).filter(v => v > 0);
        const rollingAvg = Math.round(windowVals.reduce((a, b) => a + b, 0) / windowVals.length);

        const windowFasting = windowReadings.filter(r => r.type === "fasting").map(r => r.value);
        const rollingFastingAvg = windowFasting.length 
          ? Math.round(windowFasting.reduce((a, b) => a + b, 0) / windowFasting.length) 
          : null;

        const windowPost = windowReadings.filter(r => r.type === "post_fasting").map(r => r.value);
        const rollingPostMealAvg = windowPost.length 
          ? Math.round(windowPost.reduce((a, b) => a + b, 0) / windowPost.length) 
          : null;

        // Time In Range % in 7d window
        const inRangeCount = windowVals.filter(v => v >= targetMin && v <= targetMax).length;
        const tirPct7d = Math.round((inRangeCount / windowVals.length) * 100);

        // Standard deviation in 7d window
        const variance = windowVals.reduce((sum, v) => sum + Math.pow(v - rollingAvg, 2), 0) / windowVals.length;
        const sd7d = Math.round(Math.sqrt(variance));

        const dateParts = dayStr.split("-");
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mIdx = parseInt(dateParts[1], 10) - 1;
        const displayDate = `${monthNames[mIdx]} ${parseInt(dateParts[2], 10)}`;

        points.push({
          date: dayStr,
          displayDate,
          timestamp: new Date(dayStr).getTime(),
          rollingAvg,
          rollingFastingAvg,
          rollingPostMealAvg,
          dailyAvg,
          dailyFasting: dailyFastingVals.length ? Math.round(dailyFastingVals[0]) : null,
          dailyPostMeal: dailyPostVals.length ? Math.round(dailyPostVals[0]) : null,
          count7d: windowReadings.length,
          tirPct7d,
          sd7d
        });
      }
    });

    if (points.length === 0) {
      return { rollingData: [], currentMetrics: null };
    }

    // Filter points based on selected timeWindow
    const nowMs = points[points.length - 1].timestamp;
    let windowedPoints = points;
    if (timeWindow === "7d") {
      const cutoff = nowMs - 7 * 24 * 60 * 60 * 1000;
      windowedPoints = points.filter(p => p.timestamp >= cutoff);
    } else if (timeWindow === "14d") {
      const cutoff = nowMs - 14 * 24 * 60 * 60 * 1000;
      windowedPoints = points.filter(p => p.timestamp >= cutoff);
    } else if (timeWindow === "30d") {
      const cutoff = nowMs - 30 * 24 * 60 * 60 * 1000;
      windowedPoints = points.filter(p => p.timestamp >= cutoff);
    }

    // Current metrics summary
    const latest = points[points.length - 1];
    const prev7dPoint = points.length >= 8 ? points[points.length - 8] : points[0];
    const deltaAvg = latest.rollingAvg - prev7dPoint.rollingAvg;
    const estA1c = ((latest.rollingAvg + 46.7) / 28.7).toFixed(1);
    const cvPct = Math.round((latest.sd7d / latest.rollingAvg) * 100);

    return {
      rollingData: windowedPoints,
      currentMetrics: {
        currentRollingAvg: latest.rollingAvg,
        deltaAvg,
        tirPct: latest.tirPct7d,
        sd: latest.sd7d,
        cvPct,
        estA1c,
        totalWindowReadings: latest.count7d,
        fastingAvg: latest.rollingFastingAvg,
        postAvg: latest.rollingPostMealAvg,
        latestDate: latest.displayDate,
        dateRangeSpan: `${points[Math.max(0, points.length - 7)].displayDate} - ${latest.displayDate}`
      }
    };
  }, [readings, profile, timeWindow, targetMin, targetMax]);

  // Request AI clinical summary note for the snapshot card
  const handleFetchAiSnapshotNote = async () => {
    if (!currentMetrics) return;
    setIsLoadingAiNote(true);
    try {
      const res = await fetch("/api/surveillance-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readings: readings.slice(-15),
          userProfile: {
            name: profile.name,
            age: profile.age,
            diabetesType: profile.diabetesType,
            targetFastingMin: targetMin,
            targetPostMax: targetMax,
            rolling7DayAvg: currentMetrics.currentRollingAvg,
            timeInRange: currentMetrics.tirPct
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.summary) {
          setAiSummaryNote(data.summary);
        } else {
          setAiSummaryNote(`Patient demonstrates a 7-day rolling glucose of ${currentMetrics.currentRollingAvg} mg/dL with ${currentMetrics.tirPct}% time in target range (${targetMin}-${targetMax} mg/dL).`);
        }
      } else {
        setAiSummaryNote(`Patient demonstrates a 7-day rolling glucose of ${currentMetrics.currentRollingAvg} mg/dL with ${currentMetrics.tirPct}% time in target range (${targetMin}-${targetMax} mg/dL). Glycemic stability index is ${currentMetrics.cvPct}%.`);
      }
    } catch {
      setAiSummaryNote(`Patient demonstrates a 7-day rolling glucose of ${currentMetrics.currentRollingAvg} mg/dL with ${currentMetrics.tirPct}% time in target range (${targetMin}-${targetMax} mg/dL). Glycemic stability index is ${currentMetrics.cvPct}%.`);
    } finally {
      setIsLoadingAiNote(false);
    }
  };

  // Export Snapshot as PNG image using html2canvas
  const handleDownloadSnapshotPNG = async () => {
    if (!snapshotRef.current) return;
    setIsExportingImage(true);
    setExportSuccessMessage("");

    try {
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#090d16",
        logging: false
      });

      const imageURL = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      downloadLink.download = `diabetes-care-7day-rolling-snapshot-${dateStr}.png`;
      downloadLink.href = imageURL;
      downloadLink.click();

      setExportSuccessMessage("Snapshot card image saved successfully!");
      setTimeout(() => setExportSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Failed to generate canvas snapshot:", err);
      setExportSuccessMessage("Snapshot failed to render. Please try again.");
    } finally {
      setIsExportingImage(false);
    }
  };

  // Share via Web Share API or fallback to clipboard
  const handleShareSnapshot = async () => {
    if (!snapshotRef.current || !currentMetrics) return;
    setIsExportingImage(true);

    try {
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#090d16",
        logging: false
      });

      canvas.toBlob(async blob => {
        if (!blob) return;

        const file = new File([blob], `glucose-7day-snapshot-${new Date().toISOString().split("T")[0]}.png`, {
          type: "image/png"
        });

        const shareData = {
          title: "7-Day Rolling Glucose Snapshot",
          text: `📊 7-Day Rolling Glucose Summary for ${profile.name}:\n• Rolling Avg: ${currentMetrics.currentRollingAvg} mg/dL\n• Time in Range: ${currentMetrics.tirPct}%\n• Est. HbA1c: ${currentMetrics.estA1c}%\n• Glycemic Variability: ±${currentMetrics.sd} mg/dL\nGenerated via Diabetes Care & Tracker.`,
          files: navigator.canShare && navigator.canShare({ files: [file] }) ? [file] : undefined
        };

        if (navigator.share && (!shareData.files || navigator.canShare({ files: [file] }))) {
          await navigator.share(shareData);
          setExportSuccessMessage("Shared snapshot card!");
        } else {
          // Fallback: Copy summary to clipboard & trigger download
          await navigator.clipboard.writeText(shareData.text);
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = `glucose-7day-snapshot.png`;
          link.click();
          setExportSuccessMessage("Summary copied to clipboard & image downloaded!");
        }
        setTimeout(() => setExportSuccessMessage(""), 4000);
      });
    } catch (err) {
      console.error("Share error:", err);
      setExportSuccessMessage("Could not open native share sheet.");
    } finally {
      setIsExportingImage(false);
    }
  };

  // Copy snapshot text or image
  const handleCopySnapshotText = async () => {
    if (!currentMetrics) return;
    const text = `📊 *Diabetes Care & Tracker • 7-Day Rolling Summary*\n` +
      `Patient: ${profile.name} (${profile.diabetesType})\n` +
      `Span: ${currentMetrics.dateRangeSpan}\n` +
      `-----------------------------------\n` +
      `• 7-Day Rolling Glucose: ${currentMetrics.currentRollingAvg} mg/dL (${currentMetrics.deltaAvg > 0 ? `+${currentMetrics.deltaAvg}` : currentMetrics.deltaAvg} mg/dL vs prior 7D)\n` +
      `• Time In Range (TIR): ${currentMetrics.tirPct}% (Target: ${targetMin}-${targetMax} mg/dL)\n` +
      `• Estimated HbA1c: ${currentMetrics.estA1c}%\n` +
      `• Glycemic Variability (CV): ${currentMetrics.cvPct}%\n` +
      `• Fasting 7D Avg: ${currentMetrics.fastingAvg ? `${currentMetrics.fastingAvg} mg/dL` : "N/A"}\n` +
      `• Post-Meal 7D Avg: ${currentMetrics.postAvg ? `${currentMetrics.postAvg} mg/dL` : "N/A"}\n` +
      `-----------------------------------\n` +
      `Generated securely via Diabetes Care & Tracker.`;

    await navigator.clipboard.writeText(text);
    setExportSuccessMessage("Clinical text copied to clipboard!");
    setTimeout(() => setExportSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner Card with Title & 'Export Snapshot' Button */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-sky-950/20 border border-neutral-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950/50 border border-cyan-800/40 px-2 py-0.5 rounded-full">
                Rolling 7-Day Horizon
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Continuous Smoothing</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
              Rolling 7-Day Glucose Average
            </h2>
            <p className="text-xs text-neutral-400">
              Eliminates daily erratic swings to reveal true glycemic trajectory
            </p>
          </div>
        </div>

        {/* 'Export Snapshot' Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-export-rolling-snapshot"
            onClick={() => {
              setShowSnapshotModal(true);
              if (!aiSummaryNote) {
                handleFetchAiSnapshotNote();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-mono text-xs font-bold rounded-xl shadow-md hover:shadow-cyan-500/20 transition-all cursor-pointer active:scale-95 border border-cyan-400/30"
            title="Create a shareable visual summary card of this chart"
          >
            <Camera className="w-4 h-4 text-cyan-100" />
            <span>Export Snapshot</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Primary Key Metrics Strip */}
      {currentMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Current 7-Day Rolling Avg */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">7D Rolling Avg</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                {currentMetrics.currentRollingAvg}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">mg/dL</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-mono">
              {currentMetrics.deltaAvg < 0 ? (
                <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                  <ArrowDownRight className="w-3 h-3" />
                  {Math.abs(currentMetrics.deltaAvg)} mg/dL
                </span>
              ) : currentMetrics.deltaAvg > 0 ? (
                <span className="text-rose-400 flex items-center gap-0.5 font-bold">
                  <ArrowUpRight className="w-3 h-3" />
                  +{currentMetrics.deltaAvg} mg/dL
                </span>
              ) : (
                <span className="text-neutral-400 font-bold">Stable</span>
              )}
              <span className="text-neutral-500 text-[9px]">vs prior 7D</span>
            </div>
          </div>

          {/* Time In Target Range */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">7D Time in Range</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-black font-mono ${
                currentMetrics.tirPct >= 70 ? "text-emerald-400" : currentMetrics.tirPct >= 50 ? "text-amber-400" : "text-rose-400"
              }`}>
                {currentMetrics.tirPct}%
              </span>
              <span className="text-[10px] font-mono text-neutral-400">TIR</span>
            </div>
            <div className="mt-1 text-[9px] font-mono text-neutral-400">
              Target: {targetMin}-{targetMax} mg/dL
            </div>
          </div>

          {/* 7-Day Estimated HbA1c */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">7D Est. HbA1c</span>
              <HeartPulse className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-purple-300 font-mono">
                {currentMetrics.estA1c}%
              </span>
              <span className="text-[10px] font-mono text-neutral-400">eA1c</span>
            </div>
            <div className="mt-1 text-[9px] font-mono text-neutral-400">
              Formula: (Avg + 46.7)/28.7
            </div>
          </div>

          {/* Glycemic Variability (CV %) */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Stability (CV)</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                {currentMetrics.cvPct}%
              </span>
              <span className="text-[10px] font-mono text-neutral-400">CV</span>
            </div>
            <div className="mt-1 text-[9px] font-mono">
              <span className={`font-bold ${currentMetrics.cvPct <= 36 ? "text-emerald-400" : "text-amber-400"}`}>
                {currentMetrics.cvPct <= 36 ? "Stable (<36%)" : "Variable (>36%)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Interactive Controls Bar */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Time Window Selector */}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider mr-1">Span:</span>
          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[10px] font-mono font-bold">
            {(["7d", "14d", "30d", "all"] as const).map(w => (
              <button
                key={w}
                onClick={() => setTimeWindow(w)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeWindow === w
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-800/50 shadow-sm font-extrabold"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {w.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Visibility Toggles */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <button
            onClick={() => setShowFastingPostBreakdown(!showFastingPostBreakdown)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
              showFastingPostBreakdown
                ? "bg-neutral-800 text-sky-300 border-sky-800/60"
                : "bg-neutral-950 text-neutral-500 border-neutral-850"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showFastingPostBreakdown ? "bg-sky-400" : "bg-neutral-600"}`}></span>
            <span>Fasting & Post-Meal Lines</span>
          </button>

          <button
            onClick={() => setShowDailyDots(!showDailyDots)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
              showDailyDots
                ? "bg-neutral-800 text-neutral-200 border-neutral-700"
                : "bg-neutral-950 text-neutral-500 border-neutral-850"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showDailyDots ? "bg-neutral-300" : "bg-neutral-600"}`}></span>
            <span>Daily Dots</span>
          </button>

          <button
            onClick={() => setShowTargetCorridor(!showTargetCorridor)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-all cursor-pointer ${
              showTargetCorridor
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/50"
                : "bg-neutral-950 text-neutral-500 border-neutral-850"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showTargetCorridor ? "bg-emerald-400" : "bg-neutral-600"}`}></span>
            <span>Target Corridor ({targetMin}-{targetMax})</span>
          </button>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-neutral-850 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">Glycemic Moving Average Curve</span>
            <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-full font-mono">
              {rollingData.length} timeline points
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <div className="flex items-center gap-1">
              <span className="w-3 h-1 bg-cyan-400 rounded-full"></span>
              <span className="text-cyan-300 font-bold">7D Rolling Avg</span>
            </div>
            {showFastingPostBreakdown && (
              <>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-sky-400 border-dashed"></span>
                  <span className="text-sky-400">Fasting 7D</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-rose-400 border-dashed"></span>
                  <span className="text-rose-400">Post 7D</span>
                </div>
              </>
            )}
          </div>
        </div>

        {rollingData.length > 0 ? (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rollingData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="rollingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.08} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.6} />
                <XAxis
                  dataKey="displayDate"
                  stroke="#737373"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#404040" }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={10}
                  domain={[50, (dataMax: number) => Math.max(220, Math.ceil(dataMax / 20) * 20)]}
                  tickLine={false}
                  axisLine={{ stroke: "#404040" }}
                />

                {/* Target Range Reference Lines */}
                {showTargetCorridor && (
                  <>
                    <ReferenceLine
                      y={targetMax}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                      strokeWidth={1.5}
                      label={{ value: `Target High (${targetMax})`, fill: "#10b981", fontSize: 9, position: "insideBottomLeft" }}
                    />
                    <ReferenceLine
                      y={targetMin}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                      strokeWidth={1.5}
                      label={{ value: `Target Low (${targetMin})`, fill: "#10b981", fontSize: 9, position: "insideTopLeft" }}
                    />
                  </>
                )}

                {/* Hyperglycemia & Hypoglycemia reference thresholds */}
                <ReferenceLine
                  y={180}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{ value: "Hyper (180)", fill: "#ef4444", fontSize: 9, position: "insideTopRight" }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                  label={{ value: "Hypo (70)", fill: "#f59e0b", fontSize: 9, position: "insideBottomRight" }}
                />

                {/* Primary 7-Day Rolling Average Smoothed Area */}
                <Area
                  type="monotone"
                  dataKey="rollingAvg"
                  name="7D Rolling Avg"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fill="url(#rollingGradient)"
                  isAnimationActive={true}
                />

                {/* Optional Fasting 7-Day Line */}
                {showFastingPostBreakdown && (
                  <Line
                    type="monotone"
                    dataKey="rollingFastingAvg"
                    name="Fasting 7D Avg"
                    stroke="#38bdf8"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls={true}
                  />
                )}

                {/* Optional Post-Meal 7-Day Line */}
                {showFastingPostBreakdown && (
                  <Line
                    type="monotone"
                    dataKey="rollingPostMealAvg"
                    name="Post-Meal 7D Avg"
                    stroke="#fb7185"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls={true}
                  />
                )}

                {/* Optional Raw Daily Scatter Dots */}
                {showDailyDots && (
                  <Scatter
                    dataKey="dailyAvg"
                    name="Daily Mean"
                    fill="#cbd5e1"
                    shape="circle"
                  />
                )}

                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RollingPoint;
                      return (
                        <div className="bg-neutral-950/95 border border-cyan-800/50 p-3 rounded-xl shadow-2xl backdrop-blur font-mono text-xs space-y-1.5 min-w-[200px]">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-1">
                            <span className="font-bold text-white">{data.displayDate} ({data.date})</span>
                            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950 px-1.5 py-0.5 rounded">
                              {data.count7d} logs in 7D
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-cyan-300">
                            <span className="text-neutral-400">7-Day Rolling Avg:</span>
                            <span className="font-bold text-sm text-cyan-300">{data.rollingAvg} mg/dL</span>
                          </div>

                          {data.rollingFastingAvg !== null && (
                            <div className="flex justify-between items-center text-sky-400 text-[11px]">
                              <span className="text-neutral-400">Fasting 7D Avg:</span>
                              <span className="font-semibold">{data.rollingFastingAvg} mg/dL</span>
                            </div>
                          )}

                          {data.rollingPostMealAvg !== null && (
                            <div className="flex justify-between items-center text-rose-400 text-[11px]">
                              <span className="text-neutral-400">Post-Meal 7D Avg:</span>
                              <span className="font-semibold">{data.rollingPostMealAvg} mg/dL</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-neutral-300 text-[11px] pt-1 border-t border-neutral-850">
                            <span className="text-neutral-400">Time in Range:</span>
                            <span className={`font-bold ${data.tirPct7d >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
                              {data.tirPct7d}%
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-neutral-400 text-[10px]">
                            <span>Daily Mean:</span>
                            <span>{data.dailyAvg ? `${data.dailyAvg} mg/dL` : "No log today"}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-neutral-500 font-mono text-xs">
            No blood glucose records found to calculate the 7-day rolling window. Log readings to visualize trend.
          </div>
        )}

        <div className="text-[10px] text-neutral-400 font-mono bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-850 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Clinical Rule: Rolling average smooths postprandial variance to reveal baseline glycemic direction.</span>
          </div>
          <span className="text-cyan-400 font-bold hidden sm:inline">Target: 70–140 mg/dL</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SNAPSHOT EXPORT MODAL WITH VISUAL SUMMARY CARD */}
      {/* ============================================================ */}
      {showSnapshotModal && currentMetrics && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Visual Snapshot Summary Card</h3>
                  <p className="text-[10px] text-neutral-400 font-mono">
                    High-resolution shareable glycemic card with 7-day rolling curve
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSnapshotModal(false)}
                className="p-1.5 rounded-xl bg-neutral-850 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              
              {/* THE EXPORTABLE SNAPSHOT CARD ELEMENT */}
              <div
                ref={snapshotRef}
                id="rolling-glucose-snapshot-card"
                className="bg-[#090d16] text-white p-5 rounded-2xl border-2 border-cyan-800/40 shadow-2xl space-y-4 font-sans select-none"
              >
                {/* Card Top Branding & Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono tracking-widest uppercase font-bold text-cyan-400 block">
                        CLINICAL SURVEILLANCE REPORT
                      </span>
                      <h4 className="text-base font-extrabold text-white tracking-tight">
                        Diabetes Care &amp; Tracker
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 px-2.5 py-1 rounded-full font-bold">
                      7-Day Rolling Snapshot
                    </span>
                    <p className="text-[9px] font-mono text-slate-400 mt-1">
                      {currentMetrics.dateRangeSpan}
                    </p>
                  </div>
                </div>

                {/* Patient Profile Ribbon */}
                <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block">PATIENT</span>
                    <span className="font-bold text-white">{profile.name}</span>
                    <span className="text-slate-400 text-[10px] ml-1">({profile.age}y, {profile.diabetesType})</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-400 block">TARGET CORRIDOR</span>
                    <span className="font-bold text-emerald-400 font-mono">{targetMin} – {targetMax} mg/dL</span>
                  </div>
                </div>

                {/* Key Metric Highlights Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">7D Rolling Avg</span>
                    <span className="text-xl font-black text-cyan-300 font-mono block">
                      {currentMetrics.currentRollingAvg}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">mg/dL</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Time In Range</span>
                    <span className={`text-xl font-black font-mono block ${
                      currentMetrics.tirPct >= 70 ? "text-emerald-400" : "text-amber-400"
                    }`}>
                      {currentMetrics.tirPct}%
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">TIR (&gt;70%)</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Est. HbA1c</span>
                    <span className="text-xl font-black text-purple-300 font-mono block">
                      {currentMetrics.estA1c}%
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">eA1c</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-center">
                    <span className="text-[9px] font-mono uppercase text-slate-400 block">Stability (CV)</span>
                    <span className="text-xl font-black text-amber-300 font-mono block">
                      {currentMetrics.cvPct}%
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">&plusmn;{currentMetrics.sd} mg/dL</span>
                  </div>
                </div>

                {/* Embedded Mini-Chart of 7-Day Rolling Average */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1.5">
                    <span className="font-bold text-slate-300 uppercase">Rolling Glycemic Trajectory</span>
                    <span className="text-cyan-400">{rollingData.length} timeline points</span>
                  </div>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={rollingData.slice(-14)} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                        <XAxis dataKey="displayDate" stroke="#64748b" fontSize={9} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={9} domain={[60, 220]} tickLine={false} />
                        <ReferenceLine y={targetMax} stroke="#10b981" strokeDasharray="2 2" strokeOpacity={0.6} />
                        <ReferenceLine y={targetMin} stroke="#10b981" strokeDasharray="2 2" strokeOpacity={0.6} />
                        <Area type="monotone" dataKey="rollingAvg" stroke="#06b6d4" strokeWidth={2.5} fill="url(#cardGrad)" />
                        <Line type="monotone" dataKey="rollingFastingAvg" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth={1.5} dot={false} connectNulls />
                        <Line type="monotone" dataKey="rollingPostMealAvg" stroke="#fb7185" strokeDasharray="3 3" strokeWidth={1.5} dot={false} connectNulls />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Clinical Note Section */}
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CLINICAL OBSERVATION</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {aiSummaryNote || `7-day rolling mean is ${currentMetrics.currentRollingAvg} mg/dL with ${currentMetrics.tirPct}% readings falling within target limits. ${currentMetrics.cvPct <= 36 ? "Glycemic variability is low (optimal stability)." : "Glycemic swings detected."}`}
                  </p>
                </div>

                {/* Verified Compliance & Safety Footer */}
                <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 border-t border-slate-800/80 pt-2">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified via Diabetes Care &amp; Tracker</span>
                  </div>
                  <span>Exported {new Date().toLocaleDateString()} &bull; HIPAA Client Model</span>
                </div>
              </div>

              {/* Status Message */}
              {exportSuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{exportSuccessMessage}</span>
                </div>
              )}

              {/* AI Refresh Action */}
              <div className="flex items-center justify-between bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-neutral-300 font-mono text-xs">Need an AI clinical commentary on this card?</span>
                </div>
                <button
                  onClick={handleFetchAiSnapshotNote}
                  disabled={isLoadingAiNote}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-cyan-300 border border-cyan-800/40 text-[11px] font-mono font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  {isLoadingAiNote ? "Generating..." : "Generate AI Note"}
                </button>
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-2.5">
              <button
                onClick={handleCopySnapshotText}
                className="px-3 py-2 rounded-xl bg-neutral-850 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareSnapshot}
                  disabled={isExportingImage}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Card</span>
                </button>

                <button
                  onClick={handleDownloadSnapshotPNG}
                  disabled={isExportingImage}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExportingImage ? "Rendering..." : "Download PNG"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
export default RollingAverageChart;
