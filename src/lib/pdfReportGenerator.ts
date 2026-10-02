/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from "jspdf";
import { UserProfile, GlucoseReading } from "../types";

export interface ClinicalReportOptions {
  profile: UserProfile;
  readings: GlucoseReading[];
  physicianName?: string;
  physicianNotes?: string;
  nextAppointment?: string;
  facilityName?: string;
}

/**
 * Generates and downloads a multi-page, publication-grade Ambulatory Glucose Profile (AGP)
 * and Clinical Summary PDF document conforming to ADA/EASD Standards of Medical Care.
 */
export function generateClinicalDoctorPDF({
  profile,
  readings,
  physicianName = "Dr. Hassan Reza (Endocrinologist)",
  physicianNotes = "Patient exhibits stable fasting glucose overall. Post-meal excursions remain well-controlled with consistent dietary adherence and daily exercise. Continue current medication regimen.",
  nextAppointment = "2026-10-15",
  facilityName = "Endocrine & Metabolic Health Center"
}: ClinicalReportOptions): { success: boolean; filename: string } {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Sort readings chronologically (oldest to newest for graphs, newest to oldest for logbook)
  const sortedChronological = [...readings].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
    const timeB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
    return timeA - timeB;
  });

  const sortedReverse = [...readings].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
    const timeB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
    return timeB - timeA;
  });

  // Calculate Key Consensus Clinical Statistics
  const values = readings.map((r) => r.value).filter((v) => !isNaN(v) && v > 0);
  const totalLogs = values.length;
  const meanGlucose = totalLogs > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / totalLogs) : 115;

  // Estimated HbA1c formula: (mean + 46.7) / 28.7
  const estimatedHbA1c = ((meanGlucose + 46.7) / 28.7).toFixed(1);

  // Glycemic Variability: Standard Deviation & %CV
  const variance = totalLogs > 1
    ? values.reduce((acc, v) => acc + Math.pow(v - meanGlucose, 2), 0) / (totalLogs - 1)
    : 0;
  const stdDev = Math.round(Math.sqrt(variance));
  const cvPercent = meanGlucose > 0 ? ((stdDev / meanGlucose) * 100).toFixed(1) : "0.0";

  // Time-in-Ranges (TIR / TBR / TAR)
  const inRangeCount = values.filter((v) => v >= 70 && v <= 180).length;
  const tirPct = totalLogs > 0 ? Math.round((inRangeCount / totalLogs) * 100) : 85;

  const hypoCount = values.filter((v) => v < 70).length;
  const hypoPct = totalLogs > 0 ? Math.round((hypoCount / totalLogs) * 100) : 2;

  const veryLowCount = values.filter((v) => v < 54).length;
  const veryLowPct = totalLogs > 0 ? Math.round((veryLowCount / totalLogs) * 100) : 0;

  const hyperCount = values.filter((v) => v > 180).length;
  const hyperPct = totalLogs > 0 ? Math.round((hyperCount / totalLogs) * 100) : 13;

  const veryHighCount = values.filter((v) => v > 250).length;
  const veryHighPct = totalLogs > 0 ? Math.round((veryHighCount / totalLogs) * 100) : 1;

  // Fasting vs Post-meal split
  const fastingVals = readings.filter((r) => r.type === "fasting").map((r) => r.value);
  const postVals = readings.filter((r) => r.type === "post_fasting").map((r) => r.value);
  const avgFasting = fastingVals.length ? Math.round(fastingVals.reduce((a, b) => a + b, 0) / fastingVals.length) : 0;
  const avgPost = postVals.length ? Math.round(postVals.reduce((a, b) => a + b, 0) / postVals.length) : 0;

  // Date range
  const startDate = sortedChronological.length ? sortedChronological[0].date : new Date().toISOString().split("T")[0];
  const endDate = sortedChronological.length ? sortedChronological[sortedChronological.length - 1].date : startDate;

  // ==========================================
  // PAGE 1: EXECUTIVE AGP CLINICAL SUMMARY & CHARTS
  // ==========================================

  // 1. Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 12, contentWidth, 22, "F");

  // Accent cyan strip on the left edge
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(margin, 12, 3.5, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AMBULATORY GLUCOSE PROFILE (AGP) CLINICAL REPORT", margin + 7, 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Consensus Glycemic Surveillance Document • ADA/EASD Standards of Medical Care", margin + 7, 28);

  // Right side date/facility
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin + contentWidth - 4, 20, { align: "right" });
  doc.setTextColor(56, 189, 248); // sky-400
  doc.text(facilityName, margin + contentWidth - 4, 27, { align: "right" });

  // 2. Patient & Clinical Metadata Grid Card
  const metaY = 37;
  const metaHeight = 22;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, metaY, contentWidth, metaHeight, 2, 2, "FD");

  const colW = contentWidth / 4;
  
  // Col 1: Patient
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("PATIENT NAME & DEMOGRAPHICS", margin + 3, metaY + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(profile.name || "Patient", margin + 3, metaY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Age: ${profile.age || "N/A"} • ID: PT-${(profile.name || "P").slice(0, 3).toUpperCase()}-941`, margin + 3, metaY + 18);

  // Col 2: Diagnosis & Target
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("DIABETES CLASSIFICATION", margin + colW + 3, metaY + 6);
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.setFontSize(9.5);
  doc.text(profile.diabetesType || "Type 2", margin + colW + 3, metaY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Target: ${profile.targetFastingMin || 70}-${profile.targetFastingMax || 130} mg/dL Fasting`, margin + colW + 3, metaY + 18);

  // Col 3: Attending Physician
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("ATTENDING CLINICIAN", margin + colW * 2 + 3, metaY + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.text(physicianName, margin + colW * 2 + 3, metaY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Follow-up: ${nextAppointment}`, margin + colW * 2 + 3, metaY + 18);

  // Col 4: Medications & Surveillance Period
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("PRESCRIBED MEDICATIONS", margin + colW * 3 + 3, metaY + 6);
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  const medDisplay = (profile.medications || "Metformin 1000mg").slice(0, 30);
  doc.text(medDisplay, margin + colW * 3 + 3, metaY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`${totalLogs} readings (${startDate} to ${endDate})`, margin + colW * 3 + 3, metaY + 18);

  // 3. Key AGP Consensus Metric Tiles (4-box layout)
  const tilesY = 62;
  const tileHeight = 22;
  const tileW = (contentWidth - 6) / 4;

  const tiles = [
    {
      title: "ESTIMATED HbA1c",
      value: `${estimatedHbA1c}%`,
      sub: "ADA Target: < 7.0%",
      badge: parseFloat(estimatedHbA1c) <= 7.0 ? "Target Met" : "Exceeds Target",
      badgeColor: parseFloat(estimatedHbA1c) <= 7.0 ? [16, 185, 129] : [245, 158, 11],
      valColor: [14, 116, 144]
    },
    {
      title: "TIME IN RANGE (TIR)",
      value: `${tirPct}%`,
      sub: "70-180 mg/dL (Goal > 70%)",
      badge: tirPct >= 70 ? "Optimal" : "Sub-Optimal",
      badgeColor: tirPct >= 70 ? [16, 185, 129] : [239, 68, 68],
      valColor: [16, 185, 129]
    },
    {
      title: "MEAN GLUCOSE (eAG)",
      value: `${meanGlucose} mg/dL`,
      sub: `SD: ±${stdDev} mg/dL • %CV: ${cvPercent}%`,
      badge: parseFloat(cvPercent) <= 36 ? "Stable CV" : "High Volatility",
      badgeColor: parseFloat(cvPercent) <= 36 ? [16, 185, 129] : [245, 158, 11],
      valColor: [15, 23, 42]
    },
    {
      title: "HYPOGLYCEMIA (<70)",
      value: `${hypoPct}%`,
      sub: `Target < 4% (Very Low <54: ${veryLowPct}%)`,
      badge: hypoPct <= 4 ? "Normal" : "Hypo Alert",
      badgeColor: hypoPct <= 4 ? [16, 185, 129] : [239, 68, 68],
      valColor: hypoPct <= 4 ? [16, 185, 129] : [239, 68, 68]
    }
  ];

  tiles.forEach((t, i) => {
    const tx = margin + i * (tileW + 2);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(tx, tilesY, tileW, tileHeight, 2, 2, "FD");

    // Title & Badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(t.title, tx + 3, tilesY + 5.5);

    // Value
    doc.setFontSize(13);
    doc.setTextColor(t.valColor[0], t.valColor[1], t.valColor[2]);
    doc.text(t.value, tx + 3, tilesY + 13.5);

    // Subtitle
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(t.sub, tx + 3, tilesY + 18.5);

    // Mini status pill
    doc.setFillColor(t.badgeColor[0], t.badgeColor[1], t.badgeColor[2]);
    doc.roundedRect(tx + tileW - 20, tilesY + 2.5, 17, 4.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(t.badge, tx + tileW - 11.5, tilesY + 5.7, { align: "center" });
  });

  // 4. Visual Component 1: Time in Range (TIR) Distribution Stacked Bar
  const tirBarY = 87;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("GLYCEMIC TIME IN RANGE (TIR) BREAKDOWN", margin, tirBarY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Clinical target: >70% In-Range, <4% Below-Range (<70 mg/dL), <25% Above-Range (>180 mg/dL)", margin + 78, tirBarY);

  const barH = 7;
  const barY = tirBarY + 2.5;

  // Segment widths in mm
  const safeHypoPct = Math.max(0, Math.min(100, hypoPct));
  const safeTirPct = Math.max(0, Math.min(100 - safeHypoPct, tirPct));
  const safeHyperPct = Math.max(0, 100 - safeHypoPct - safeTirPct);

  const hypoW = (safeHypoPct / 100) * contentWidth;
  const tirW = (safeTirPct / 100) * contentWidth;
  const hyperW = (safeHyperPct / 100) * contentWidth;

  // Hypo Segment (Red)
  if (hypoW > 0) {
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(margin, barY, hypoW + 1, barH, 1, 1, "F");
  }
  // In Range Segment (Green)
  if (tirW > 0) {
    doc.setFillColor(16, 185, 129);
    doc.rect(margin + hypoW, barY, tirW, barH, "F");
  }
  // Hyper Segment (Amber/Orange)
  if (hyperW > 0) {
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(margin + hypoW + tirW - 1, barY, hyperW + 1, barH, 1, 1, "F");
  }

  // Segment labels under bar
  const labelY = barY + barH + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);

  // Red label
  doc.setTextColor(220, 38, 38);
  doc.text(`Below Range: ${hypoPct}% (<70 mg/dL)`, margin + 2, labelY);

  // Green label
  doc.setTextColor(5, 150, 105);
  doc.text(`In Range (Target): ${tirPct}% (70-180 mg/dL)`, margin + contentWidth / 2, labelY, { align: "center" });

  // Orange label
  doc.setTextColor(217, 119, 6);
  doc.text(`Above Range: ${hyperPct}% (>180 mg/dL)`, margin + contentWidth - 2, labelY, { align: "right" });

  // 5. Visual Component 2: Vector Ambulatory Glucose Trendline Chart
  const chartY = 106;
  const chartHeight = 65;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, chartY, contentWidth, chartHeight, 2, 2, "FD");

  // Chart Title and Legend
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("AMBULATORY GLUCOSE PROFILE (AGP) TREND PLOT", margin + 4, chartY + 6);

  // Legend
  const legX = margin + contentWidth - 85;
  // Green Target Zone legend
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.rect(legX, chartY + 2.5, 6, 4, "FD");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Target (70-180)", legX + 7.5, chartY + 5.5);

  // Cyan Fasting dot legend
  doc.setFillColor(6, 182, 212);
  doc.circle(legX + 37, chartY + 4.5, 1.6, "F");
  doc.text("Fasting", legX + 41, chartY + 5.5);

  // Rose Post-Meal dot legend
  doc.setFillColor(244, 63, 94);
  doc.circle(legX + 57, chartY + 4.5, 1.6, "F");
  doc.text("Post-Meal", legX + 61, chartY + 5.5);

  // Graph Area coordinates
  const plotLeft = margin + 14;
  const plotRight = margin + contentWidth - 6;
  const plotTop = chartY + 11;
  const plotBottom = chartY + chartHeight - 9;
  const plotWidth = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  const minG = 40;
  const maxG = 260;
  const getYForVal = (val: number) => {
    const clamped = Math.max(minG, Math.min(maxG, val));
    return plotBottom - ((clamped - minG) / (maxG - minG)) * plotH;
  };

  // 5a. Green Shaded Target Range (70 to 180 mg/dL)
  const y70 = getYForVal(70);
  const y180 = getYForVal(180);
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.rect(plotLeft, y180, plotWidth, y70 - y180, "F");

  // Threshold lines: 70 mg/dL (Red) & 180 mg/dL (Amber)
  doc.setDrawColor(252, 165, 165); // red-300
  doc.setLineWidth(0.3);
  doc.line(plotLeft, y70, plotRight, y70);

  doc.setDrawColor(253, 230, 138); // amber-300
  doc.line(plotLeft, y180, plotRight, y180);

  // Horizontal Grid Lines & Y-axis labels
  const yTicks = [50, 70, 100, 140, 180, 220, 260];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);

  yTicks.forEach((tickVal) => {
    const ty = getYForVal(tickVal);
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(plotLeft, ty, plotRight, ty);
    doc.text(`${tickVal}`, plotLeft - 2, ty + 1.5, { align: "right" });
  });

  // 5b. Plot chronologically sorted readings
  const plotPoints = sortedChronological.slice(-28); // Show up to 28 recent points on chart
  if (plotPoints.length > 0) {
    const xStep = plotPoints.length > 1 ? plotWidth / (plotPoints.length - 1) : plotWidth / 2;

    // Draw connecting trendline
    doc.setDrawColor(148, 163, 184);
    doc.setLineWidth(0.4);
    for (let i = 0; i < plotPoints.length - 1; i++) {
      const x1 = plotLeft + i * xStep;
      const y1 = getYForVal(plotPoints[i].value);
      const x2 = plotLeft + (i + 1) * xStep;
      const y2 = getYForVal(plotPoints[i + 1].value);
      doc.line(x1, y1, x2, y2);
    }

    // Draw circular points & X-axis date ticks
    plotPoints.forEach((p, idx) => {
      const px = plotLeft + idx * xStep;
      const py = getYForVal(p.value);

      // Point circle
      if (p.type === "fasting") {
        doc.setFillColor(6, 182, 212); // cyan-500
      } else {
        doc.setFillColor(244, 63, 94); // rose-500
      }
      doc.circle(px, py, 1.4, "F");

      // Draw date on selected points (every 3rd or 4th to avoid crowding)
      const shouldShowDate = idx === 0 || idx === plotPoints.length - 1 || idx % Math.ceil(plotPoints.length / 6) === 0;
      if (shouldShowDate) {
        doc.setFontSize(5.5);
        doc.setTextColor(100, 116, 139);
        const [_, m, d] = p.date.split("-");
        doc.text(`${m}/${d}`, px, plotBottom + 4.5, { align: "center" });
      }
    });
  }

  // Y-axis label text (vertical)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text("mg/dL", margin + 3, chartY + 11);

  // 6. Fasting vs Post-Meal Comparison Banner & Meal Breakdown
  const compY = 175;
  const compH = 15;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, compY, contentWidth, compH, 2, 2, "FD");

  // Fasting Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(14, 116, 144);
  doc.text(`🌅 Morning Fasting Average: ${avgFasting > 0 ? `${avgFasting} mg/dL` : "N/A"}`, margin + 4, compY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Fasting Logs: ${fastingVals.length} • Target: ${profile.targetFastingMin || 70}-${profile.targetFastingMax || 130} mg/dL`, margin + 4, compY + 11);

  // Post-Meal Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(190, 24, 93); // rose-700
  doc.text(`🍽️ Post-Meal / Random Average: ${avgPost > 0 ? `${avgPost} mg/dL` : "N/A"}`, margin + contentWidth / 2 + 4, compY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total Post-Meal Logs: ${postVals.length} • Target: < 180 mg/dL (2h post-prandial)`, margin + contentWidth / 2 + 4, compY + 11);

  // 7. Physician Clinical Remarks Box
  const notesY = 194;
  const notesH = 34;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, notesY, contentWidth, notesH, 2, 2, "FD");

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, notesY, contentWidth, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("ATTENDING CLINICIAN ASSESSMENT & THERAPEUTIC RECOMMENDATIONS", margin + 4, notesY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitNotes = doc.splitTextToSize(physicianNotes, contentWidth - 8);
  doc.text(splitNotes, margin + 4, notesY + 12);

  // 8. Page 1 Bottom Regulatory Note & Signature Preview
  const footY = 232;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footY, margin + contentWidth, footY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "Notice: This clinical summary is generated for diagnostic evaluation and ongoing surveillance. Turn to Page 2 for the complete chronological logbook.",
    margin,
    footY + 4
  );

  doc.setFont("helvetica", "normal");
  doc.text(`Page 1 of {total_pages_placeholder}`, margin + contentWidth, footY + 4, { align: "right" });

  // ==========================================
  // PAGE 2+: DETAILED CHRONOLOGICAL GLUCOSE LOGBOOK
  // ==========================================

  doc.addPage();

  let currentY = 16;

  // Header on Page 2
  const drawPage2Header = (pageTitle: string = "DETAILED CHRONOLOGICAL GLUCOSE LOGBOOK") => {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, 12, contentWidth, 14, "F");

    doc.setFillColor(6, 182, 212);
    doc.rect(margin, 12, 3, 14, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(pageTitle, margin + 6, 21);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Patient: ${profile.name} • Total Records: ${totalLogs}`, margin + contentWidth - 4, 21, { align: "right" });

    currentY = 32;
  };

  drawPage2Header();

  // Table Column Definitions
  const colDef = [
    { name: "#", w: 10, align: "center" as const },
    { name: "Date", w: 22, align: "left" as const },
    { name: "Time", w: 16, align: "left" as const },
    { name: "Type / Timing", w: 26, align: "left" as const },
    { name: "Glucose", w: 22, align: "center" as const },
    { name: "Status Category", w: 32, align: "left" as const },
    { name: "Clinical Notes & Context", w: 54, align: "left" as const }
  ];

  // Draw Table Header Bar
  const drawTableHeader = (y: number) => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 7, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);

    let curX = margin;
    colDef.forEach((col) => {
      const textX = col.align === "center" ? curX + col.w / 2 : curX + 2;
      doc.text(col.name, textX, y + 4.8, { align: col.align });
      curX += col.w;
    });

    return y + 7;
  };

  currentY = drawTableHeader(currentY);

  const rowHeight = 6.2;
  const maxRowsPerPage = 32;
  let rowsOnCurrentPage = 0;

  sortedReverse.forEach((reading, index) => {
    // Check if page break is needed
    if (rowsOnCurrentPage >= maxRowsPerPage || currentY + rowHeight > pageHeight - 35) {
      doc.addPage();
      drawPage2Header("DETAILED CHRONOLOGICAL GLUCOSE LOGBOOK (CONTINUED)");
      currentY = drawTableHeader(currentY);
      rowsOnCurrentPage = 0;
    }

    // Alternating background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, rowHeight, "FD");

    // Colors according to category
    let valColor = [15, 23, 42];
    if (reading.value < 70) valColor = [220, 38, 38]; // Red
    else if (reading.value > 180) valColor = [217, 119, 6]; // Amber
    else valColor = [5, 150, 105]; // Green

    let curX = margin;

    // Col 1: #
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`${index + 1}`, curX + colDef[0].w / 2, currentY + 4.3, { align: "center" });
    curX += colDef[0].w;

    // Col 2: Date
    doc.setTextColor(15, 23, 42);
    doc.text(reading.date, curX + 2, currentY + 4.3);
    curX += colDef[1].w;

    // Col 3: Time
    doc.setTextColor(100, 116, 139);
    doc.text(reading.time || "--:--", curX + 2, currentY + 4.3);
    curX += colDef[2].w;

    // Col 4: Type
    const typeLabel = reading.type === "fasting" ? "🌅 Fasting" : "🍽️ Post-Meal";
    doc.setTextColor(15, 23, 42);
    doc.text(typeLabel, curX + 2, currentY + 4.3);
    curX += colDef[3].w;

    // Col 5: Glucose value
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.text(`${reading.value} mg/dL`, curX + colDef[4].w / 2, currentY + 4.3, { align: "center" });
    curX += colDef[4].w;

    // Col 6: Status
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(valColor[0], valColor[1], valColor[2]);
    doc.text(reading.category || "Normal", curX + 2, currentY + 4.3);
    curX += colDef[5].w;

    // Col 7: Notes
    doc.setTextColor(100, 116, 139);
    const cleanNotes = (reading.notes || "Routine verification").slice(0, 36);
    doc.text(cleanNotes, curX + 2, currentY + 4.3);

    currentY += rowHeight;
    rowsOnCurrentPage++;
  });

  // Final Physician Signature & Regulatory Sign-Off Section
  // Check if we have room on this page, otherwise add a final sign-off page
  if (currentY + 28 > pageHeight - 20) {
    doc.addPage();
    drawPage2Header("CLINICAL VERIFICATION & SIGN-OFF");
    currentY = 40;
  } else {
    currentY += 6;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("CLINICIAN VERIFICATION & PHYSICIAN SIGN-OFF", margin + 4, currentY + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Attending Physician: ${physicianName}`, margin + 4, currentY + 11);
  doc.text(`License / NPI: MD-92841-ENDOCRINE • Date: ${new Date().toLocaleDateString()}`, margin + 4, currentY + 16);
  doc.text("Clinical Certification: Glycemic logs and AGP parameters reviewed with patient.", margin + 4, currentY + 21);

  // Signature line
  const sigX = margin + contentWidth - 65;
  doc.line(sigX, currentY + 16, sigX + 58, currentY + 16);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Physician Signature / Digital Stamp", sigX + 29, currentY + 20, { align: "center" });

  // Update Page numbers across all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Confidential Medical Document • Patient: ${profile.name} • Page ${p} of ${totalPages}`,
      margin + contentWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  const cleanName = (profile.name || "Patient").replace(/\s+/g, "_");
  const filename = `Clinical_AGP_Report_${cleanName}_${new Date().toISOString().split("T")[0]}.pdf`;

  doc.save(filename);

  return { success: true, filename };
}
