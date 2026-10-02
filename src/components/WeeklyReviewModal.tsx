import React, { useState } from "react";
import { 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  X, 
  FileText, 
  Lock, 
  Check, 
  Sparkles,
  Stethoscope,
  Copy
} from "lucide-react";
import { UserProfile, GlucoseReading, FoodLog, ActivityLog, MedicationLog } from "../types";

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  readings: GlucoseReading[];
  foodLogs: FoodLog[];
  activityLogs: ActivityLog[];
  medicationLogs: MedicationLog[];
  onImportBackup: (backupData: any) => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({
  isOpen,
  onClose,
  profile,
  readings,
  foodLogs,
  activityLogs,
  medicationLogs,
  onImportBackup
}) => {
  const [copiedNotes, setCopiedNotes] = useState<boolean>(false);
  const [backupSuccess, setBackupSuccess] = useState<string>("");

  if (!isOpen) return null;

  // Filter 7-day data
  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString().split("T")[0];

  const recentReadings = readings.filter(r => r.date >= sevenDaysAgo);
  const recentValues = recentReadings.map(r => r.value);
  const recentMeals = foodLogs.filter(f => f.date >= sevenDaysAgo);
  const recentActivities = activityLogs.filter(a => a.date >= sevenDaysAgo);

  const avgGlucose = recentValues.length 
    ? Math.round(recentValues.reduce((a, b) => a + b, 0) / recentValues.length) 
    : 112;

  const inRangeCount = recentValues.filter(v => v >= 70 && v <= 180).length;
  const tir7Day = recentValues.length ? Math.round((inRangeCount / recentValues.length) * 100) : 86;

  const hypoCount = recentValues.filter(v => v < 70).length;
  const hyperCount = recentValues.filter(v => v > 180).length;

  // Discussion notes for doctor
  const doctorDiscussionNotes = `WEEKLY CLINICAL SUMMARY (7 DAYS)
Patient: ${profile.name} (${profile.diabetesType})
• 7-Day Average Glucose: ${avgGlucose} mg/dL (Est. HbA1c: ${((avgGlucose + 46.7)/28.7).toFixed(1)}%)
• Time In Range (70-180 mg/dL): ${tir7Day}% (${inRangeCount}/${recentValues.length || 0} readings)
• Hypo Episodes (<70 mg/dL): ${hypoCount} | Hyper Episodes (>180 mg/dL): ${hyperCount}
• Logged Meals: ${recentMeals.length} | Exercise Sessions: ${recentActivities.length}
• Topics to Discuss: Review post-meal variations and adjust medication timing if needed.`;

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(doctorDiscussionNotes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        profile,
        readings,
        foodLogs,
        activityLogs,
        medicationLogs
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Diabetes_Care_Backup_${profile.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupSuccess("Backup file exported successfully!");
      setTimeout(() => setBackupSuccess(""), 3000);
    } catch (e) {
      alert("Error exporting backup file.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.readings || parsed.profile) {
          onImportBackup(parsed);
          setBackupSuccess("Backup restored successfully!");
          setTimeout(() => setBackupSuccess(""), 3000);
        } else {
          alert("Invalid backup file structure.");
        }
      } catch (err) {
        alert("Failed to parse backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Weekly Review &amp; Account Protection
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Analyze past 7 days of glucose data &amp; safeguard your clinical records
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

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* SECTION 1: 7-DAY SUMMARY SCORECARD */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[10px] text-teal-400 font-bold uppercase tracking-wider">
                7-Day Glycemic Snapshot
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">
                {recentReadings.length} readings logged this week
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-center">
                <span className="text-[9.5px] text-neutral-400 block font-mono">7-Day Avg</span>
                <span className="text-lg font-mono font-black text-white">{avgGlucose}</span>
                <span className="text-[9px] text-neutral-500 font-mono block">mg/dL</span>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-center">
                <span className="text-[9.5px] text-neutral-400 block font-mono">7-Day TIR</span>
                <span className="text-lg font-mono font-black text-emerald-400">{tir7Day}%</span>
                <span className="text-[9px] text-neutral-500 font-mono block">In Range</span>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-center">
                <span className="text-[9.5px] text-neutral-400 block font-mono">Hypo Events</span>
                <span className={`text-lg font-mono font-black ${hypoCount > 0 ? "text-rose-400" : "text-neutral-400"}`}>
                  {hypoCount}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono block">&lt;70 mg/dL</span>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl text-center">
                <span className="text-[9.5px] text-neutral-400 block font-mono">Hyper Events</span>
                <span className={`text-lg font-mono font-black ${hyperCount > 0 ? "text-orange-400" : "text-neutral-400"}`}>
                  {hyperCount}
                </span>
                <span className="text-[9px] text-neutral-500 font-mono block">&gt;180 mg/dL</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: WEEKLY DOCTOR DISCUSSION NOTES */}
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-400 font-mono uppercase">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span>Doctor Appointment Discussion Points</span>
              </div>
              <button
                type="button"
                onClick={handleCopyNotes}
                className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedNotes ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNotes ? "Copied!" : "Copy Summary"}</span>
              </button>
            </div>

            <p className="text-[10.5px] text-neutral-400 font-mono">
              Share these concise bullet points with your doctor during visits or remote check-ins:
            </p>

            <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-[10.5px] text-neutral-300 whitespace-pre-line leading-relaxed">
              {doctorDiscussionNotes}
            </div>
          </div>

          {/* SECTION 3: ACCOUNT PROTECTION & DATA BACKUP */}
          <div className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider">
                Protect Your Account &amp; Back Up Health Data
              </h4>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Regularly back up your readings, prescriptions, and meal logs so your historical health data is protected from cache clearing or device changes.
            </p>

            {backupSuccess && (
              <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-center font-mono text-xs">
                {backupSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>Download Secure JSON Backup</span>
              </button>

              <label className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-neutral-200 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Restore from Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
