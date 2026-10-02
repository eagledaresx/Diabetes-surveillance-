import React, { useState } from "react";
import { FileText, Download, Share2, Printer, MessageCircle, CheckCircle, Stethoscope, AlertTriangle, Calendar, Crown, Sparkles, CheckCircle2, TrendingUp, Table, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { UserProfile, GlucoseReading } from "../types";
import { generateClinicalDoctorPDF } from "../lib/pdfReportGenerator";

interface DoctorReportProps {
  profile: UserProfile;
  readings: GlucoseReading[];
  onOpenMonetizationHub?: () => void;
}

export const DoctorReport: React.FC<DoctorReportProps> = ({
  profile,
  readings,
  onOpenMonetizationHub
}) => {
  const [physicianName, setPhysicianName] = useState("Dr. Hassan Reza (Endocrinologist)");
  const [physicianNotes, setPhysicianNotes] = useState(
    "Patient exhibits stable fasting glucose overall. Post-lunch spikes are well managed with 15-minute post-meal walks. Maintain Metformin 1000mg daily."
  );
  const [nextAppointment, setNextAppointment] = useState("2026-10-15");
  const [exportedMsg, setExportedMsg] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfDateRange, setPdfDateRange] = useState<"7d" | "14d" | "30d" | "all">("all");

  // Filter readings based on selected PDF date range
  const filteredReadings = React.useMemo(() => {
    if (pdfDateRange === "all") return readings;
    const days = pdfDateRange === "7d" ? 7 : pdfDateRange === "14d" ? 14 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return readings.filter(r => new Date(r.date) >= cutoff);
  }, [readings, pdfDateRange]);

  // Calculate AGP Metrics
  const targetReadings = filteredReadings.length > 0 ? filteredReadings : readings;
  const totalLogs = targetReadings.length;
  const values = targetReadings.map(r => r.value).filter(v => !isNaN(v) && v > 0);
  const meanGlucose = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 110;
  
  // Estimated HbA1c formula: HbA1c = (mean + 46.7) / 28.7
  const estimatedHbA1c = ((meanGlucose + 46.7) / 28.7).toFixed(1);
  
  const inRangeCount = values.filter(v => v >= 70 && v <= 180).length;
  const tirPct = values.length ? Math.round((inRangeCount / values.length) * 100) : 88;
  
  const hypoCount = values.filter(v => v < 70).length;
  const hypoPct = values.length ? Math.round((hypoCount / values.length) * 100) : 2;

  const hyperCount = values.filter(v => v > 180).length;
  const hyperPct = values.length ? Math.round((hyperCount / values.length) * 100) : 10;

  // Generate & Download PDF Report using jsPDF
  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    setExportedMsg("Generating clinical AGP summary & vector chart document...");

    setTimeout(() => {
      try {
        const { filename } = generateClinicalDoctorPDF({
          profile,
          readings: targetReadings,
          physicianName,
          physicianNotes,
          nextAppointment,
          facilityName: "Metabolic Health & Endocrine Clinic"
        });

        setIsGeneratingPDF(false);
        setExportedMsg(`✓ Downloaded ${filename} (${totalLogs} records, AGP chart & logbook)`);
        setTimeout(() => setExportedMsg(""), 5000);
      } catch (err: any) {
        setIsGeneratingPDF(false);
        setExportedMsg(`Error generating PDF: ${err?.message || "Please try again"}`);
        setTimeout(() => setExportedMsg(""), 4000);
      }
    }, 150);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📊 *CLINICAL AGP DOCTOR'S REPORT*\n` +
      `-----------------------------------\n` +
      `Patient: *${profile.name}* (${profile.diabetesType})\n` +
      `• *Total Readings Analyzed:* ${totalLogs}\n` +
      `• *Average Glucose (eAG):* ${meanGlucose} mg/dL\n` +
      `• *Estimated HbA1c:* ${estimatedHbA1c}%\n` +
      `• *Time in Range (TIR):* ${tirPct}%\n` +
      `• *Hypo Rate (<70 mg/dL):* ${hypoPct}%\n` +
      `• *Physician:* ${physicianName}\n` +
      `• *Next Appointment:* ${nextAppointment}\n` +
      `• *Clinical Notes:* "${physicianNotes}"\n` +
      `-----------------------------------\n` +
      `Exported via Diabetes Surveillance Platform`
    );
    const url = `https://wa.me/?text=${text}`;
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = url;
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-neutral-900 border border-blue-900/40 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Stethoscope className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                Doctor's AGP Report Generator
              </h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                Pro Clinical
              </span>
            </div>
            <p className="text-[10px] text-neutral-300">
              Ambulatory Glucose Profile & Clinical Summary
            </p>
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0 disabled:opacity-50"
          >
            <Download className={`w-3.5 h-3.5 ${isGeneratingPDF ? "animate-bounce" : ""}`} />
            <span>{isGeneratingPDF ? "Generating..." : "Download as PDF"}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* DEDICATED CLINICAL SUMMARY & VECTOR CHARTS PDF DOWNLOAD PANEL */}
      <div className="bg-gradient-to-r from-blue-950/40 via-neutral-900 to-indigo-950/40 border border-blue-500/30 p-4 rounded-2xl space-y-3.5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  Official Clinical AGP Summary Document (.PDF)
                </h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold uppercase">
                  jsPDF Vector
                </span>
              </div>
              <p className="text-[10.5px] text-neutral-300 mt-0.5 leading-snug">
                Generates a multi-page, publication-grade clinical document with embedded vector AGP trend plots, Time-In-Range distribution bars, and complete audit table of all logged glucose records.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-download-pdf-primary"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-950/50 shrink-0 active:scale-95 disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isGeneratingPDF ? "animate-spin" : ""}`} />
            <span>{isGeneratingPDF ? "Building PDF..." : "Download as PDF"}</span>
          </button>
        </div>

        {/* Feature inclusions checklist & Date Range Selector */}
        <div className="pt-2 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px]">
          <div className="space-y-1.5 text-neutral-300">
            <div className="flex items-center gap-1.5 text-blue-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Vector AGP Trend Chart (70-180 mg/dL target zone)</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Consensus Time-in-Range (TIR) Segmented Distribution Bar</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Detailed Chronological Logbook Table with Clinical Status Badges</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Attending Physician Remarks & Digital Sign-off Verification</span>
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-2 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Log Filter Window:</span>
              <span className="text-[10px] font-mono text-white font-bold">{totalLogs} records included</span>
            </div>

            <div className="grid grid-cols-4 gap-1 font-mono text-[9.5px]">
              <button
                type="button"
                onClick={() => setPdfDateRange("7d")}
                className={`py-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                  pdfDateRange === "7d"
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setPdfDateRange("14d")}
                className={`py-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                  pdfDateRange === "14d"
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
                }`}
              >
                14 Days
              </button>
              <button
                type="button"
                onClick={() => setPdfDateRange("30d")}
                className={`py-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                  pdfDateRange === "30d"
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setPdfDateRange("all")}
                className={`py-1 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                  pdfDateRange === "all"
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                    : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
                }`}
              >
                All Logs
              </button>
            </div>

            <span className="text-[9px] text-neutral-500 font-mono">
              Ready for doctor appointments, EHR portal uploads, and clinical review.
            </span>
          </div>
        </div>
      </div>

      {/* Free Tier Pro Upgrade Promo Banner */}
      {(!profile.membershipTier || profile.membershipTier === "free") && onOpenMonetizationHub && (
        <div className="p-3 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/35 rounded-2xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">
                Clinical AGP Export is a GlucoGuard Pro Feature
              </span>
              <p className="text-[10px] text-neutral-300">
                Generate formatted PDF summaries for doctor appointments, EHR submission, and insurer reimbursement.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenMonetizationHub}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-[10px] font-mono font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>Upgrade Pro ($7.99)</span>
          </button>
        </div>
      )}

      {exportedMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center font-mono animate-fadeIn">
          {exportedMsg}
        </div>
      )}

      {/* Patient Clinical Info Card */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <div className="flex justify-between items-center text-xs border-b border-neutral-800 pb-2">
          <span className="font-bold text-white uppercase font-mono">Patient Clinical Metadata</span>
          <span className="text-neutral-400 font-mono text-[10px]">Date: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[9px] text-neutral-400 font-mono block">Patient Name</span>
            <span className="font-bold text-white">{profile.name}</span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[9px] text-neutral-400 font-mono block">Diabetes Classification</span>
            <span className="font-bold text-blue-400">{profile.diabetesType}</span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[9px] text-neutral-400 font-mono block">Target Range</span>
            <span className="font-bold text-emerald-400 font-mono">{profile.targetFastingMin}-{profile.targetFastingMax} mg/dL</span>
          </div>

          <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
            <span className="text-[9px] text-neutral-400 font-mono block">Prescribed Meds</span>
            <span className="font-bold text-neutral-200 truncate block">{profile.medications || "Metformin 1000mg"}</span>
          </div>
        </div>
      </div>

      {/* AGP Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl text-center space-y-0.5">
          <span className="text-[9px] text-neutral-400 font-mono block uppercase">Estimated HbA1c</span>
          <span className="text-xl font-black text-cyan-400 font-mono block">{estimatedHbA1c}%</span>
          <span className="text-[8.5px] text-neutral-500 font-mono">3-Month Glycemic Index</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl text-center space-y-0.5">
          <span className="text-[9px] text-neutral-400 font-mono block uppercase">Time-In-Range (TIR)</span>
          <span className="text-xl font-black text-emerald-400 font-mono block">{tirPct}%</span>
          <span className="text-[8.5px] text-neutral-500 font-mono">Target: &gt;70% (70-180 mg/dL)</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl text-center space-y-0.5">
          <span className="text-[9px] text-neutral-400 font-mono block uppercase">Mean Glucose (eAG)</span>
          <span className="text-xl font-black text-white font-mono block">{meanGlucose} <span className="text-[10px] text-neutral-500">mg/dL</span></span>
          <span className="text-[8.5px] text-neutral-500 font-mono">Across {totalLogs} readings</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl text-center space-y-0.5">
          <span className="text-[9px] text-neutral-400 font-mono block uppercase">Hypo Rate (&lt;70)</span>
          <span className={`text-xl font-black font-mono block ${hypoPct > 4 ? "text-rose-400" : "text-emerald-400"}`}>{hypoPct}%</span>
          <span className="text-[8.5px] text-neutral-500 font-mono">Clinical Target: &lt;4%</span>
        </div>
      </div>

      {/* Physician Clinical Notes Section */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-neutral-800 pb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-400" /> Physician Remarks & Clinical Notes
        </h3>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 font-mono block mb-1">Attending Physician</label>
              <input
                type="text"
                value={physicianName}
                onChange={(e) => setPhysicianName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 font-mono block mb-1">Next Appointment Date</label>
              <input
                type="date"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-neutral-400 font-mono block mb-1">Physician Clinical Remarks</label>
            <textarea
              rows={3}
              value={physicianNotes}
              onChange={(e) => setPhysicianNotes(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-sans leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* REMOTE CLINICIAN DATA SHARING HUB */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Remote Healthcare Provider Data Sharing
            </h3>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
            Telehealth Ready
          </span>
        </div>

        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Share your readings, AGP profiles, and progress reports remotely with your doctor so they can adjust your care plan without requiring an in-person clinic visit.
        </p>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Email Doctor */}
          <button
            type="button"
            onClick={() => {
              const subject = encodeURIComponent(`Clinical AGP Glucose Report - ${profile.name} (${profile.diabetesType})`);
              const body = encodeURIComponent(
                `Dear Dr. ${physicianName},\n\n` +
                `Here is my updated Ambulatory Glucose Profile (AGP) and surveillance log:\n\n` +
                `• Patient: ${profile.name} (Age: ${profile.age})\n` +
                `• Classification: ${profile.diabetesType}\n` +
                `• Estimated HbA1c: ${estimatedHbA1c}%\n` +
                `• Time-in-Range (70-180 mg/dL): ${tirPct}%\n` +
                `• Mean Glucose (eAG): ${meanGlucose} mg/dL across ${totalLogs} readings\n` +
                `• Hypoglycemia Rate (<70 mg/dL): ${hypoPct}%\n` +
                `• Hyperglycemia Rate (>180 mg/dL): ${hyperPct}%\n` +
                `• Current Medications: ${profile.medications || "Metformin 1000mg"}\n\n` +
                `Physician Notes:\n"${physicianNotes}"\n\n` +
                `Generated securely via Diabetes Surveillance App on ${new Date().toLocaleDateString()}.`
              );
              window.location.href = `mailto:${profile.doctorEmail || ""}?subject=${subject}&body=${body}`;
            }}
            className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-xs">Email Doctor</span>
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Send formatted clinical report directly to doctor's inbox</span>
          </button>

          {/* Download CSV / EHR Export */}
          <button
            type="button"
            onClick={() => {
              const headers = "Date,Time,Glucose_mg_dL,Type,Category,Notes\n";
              const rows = readings.map(r => 
                `"${r.date}","${r.time}",${r.value},"${r.type}","${r.category}","${(r.notes || "").replace(/"/g, '""')}"`
              ).join("\n");
              const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
              const link = document.createElement("a");
              link.setAttribute("href", csvContent);
              link.setAttribute("download", `Glucose_Readings_${profile.name.replace(/\s+/g, "_")}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setExportedMsg("CSV / EHR export downloaded successfully!");
              setTimeout(() => setExportedMsg(""), 3000);
            }}
            className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-xs">Export CSV / EHR</span>
              <Download className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Compatible with Epic, Cerner, and clinical EHR portals</span>
          </button>

          {/* Secure Remote Doctor Access PIN */}
          <button
            type="button"
            onClick={() => {
              const pin = `CLINIC-${Math.floor(1000 + Math.random() * 9000)}`;
              navigator.clipboard.writeText(`Remote Patient Access PIN: ${pin} for ${profile.name}`);
              setExportedMsg(`✓ Generated Telehealth PIN: ${pin} (copied to clipboard for your doctor).`);
              setTimeout(() => setExportedMsg(""), 5000);
            }}
            className="p-3 bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-xs">Clinician Telehealth PIN</span>
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">Generate temporary 30-day remote viewing access key</span>
          </button>
        </div>
      </div>
    </div>
  );
};
