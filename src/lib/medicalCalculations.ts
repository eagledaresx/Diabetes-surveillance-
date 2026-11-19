/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Re-engineered Clinical & Medical Calculation Architecture
 * Implements ADA/EASD consensus glycemic metrics, ADAG eAG/HbA1c, Bergenstal GMI,
 * Bessel-corrected glycemic variability (%CV, SD, J-Index), and bi-exponential
 * rapid-acting Insulin-on-Board (IOB) pharmacokinetics.
 */

import { GlucoseReading, MedicationLog, MedicationReminder, UserProfile } from "../types";

export interface StandardizedGlycemicMetrics {
  timeWindowDays: number;
  totalCount: number;
  inRangePct: number;       // 70 - 180 mg/dL (Standard ADA TIR)
  tightInRangePct: number;  // 70 - 140 mg/dL (Tight Glycemic Range)
  hypoPct: number;          // < 70 mg/dL (Level 1 Hypoglycemia)
  severeHypoPct: number;    // < 54 mg/dL (Level 2 Severe Hypoglycemia)
  hyperPct: number;         // > 180 mg/dL (Level 1 Hyperglycemia)
  severeHyperPct: number;   // > 250 mg/dL (Level 2 Severe Hyperglycemia)
  eAG: number;              // Estimated Average Glucose (mg/dL)
  estimatedHbA1c: number;   // ADAG formula: (eAG + 46.7) / 28.7
  gmi: number;              // Glucose Management Indicator: 3.31 + 0.02392 * mean
  sd: number;               // Sample Standard Deviation (mg/dL)
  cvPct: number;            // Coefficient of Variation (%CV = SD / Mean * 100)
  jIndex: number;           // J-Index: 0.001 * (Mean + SD)^2
}

export interface ActiveInsulinInjection {
  id: string;
  name: string;
  administeredHoursAgo: number;
  initialUnits: number;
  remainingUnits: number;
  activityPct: number;
  takenAt: string;
}

export interface PharmacokineticIOBResult {
  activeIOB: number;
  activeInjections: ActiveInsulinInjection[];
}

export interface VariabilityPoint {
  date: string;
  formattedDate: string;
  mean: number;
  sd: number;
  cv: number;
  readingsCount: number;
  latestValue: number;
}

/**
 * Validates and clamps a glucose value to physiological survival bounds (20 - 600 mg/dL).
 */
export function isValidPhysiologicalGlucose(val: number): boolean {
  return typeof val === "number" && Number.isFinite(val) && val >= 20 && val <= 600;
}

/**
 * Classifies a blood glucose reading according to ADA clinical thresholds and personalized patient targets.
 */
export function classifyGlucoseReading(
  value: number,
  type: "fasting" | "post_fasting",
  profile?: Pick<UserProfile, "targetFastingMin" | "targetFastingMax" | "targetPostMin" | "targetPostMax">
): GlucoseReading["category"] {
  const targetFastingMax = profile?.targetFastingMax ?? 100;
  const targetPostMax = profile?.targetPostMax ?? 140;

  if (value < 70) {
    return "Hypoglycemia";
  }

  if (value >= 250) {
    return "Severe Hyperglycemia";
  }

  if (type === "fasting") {
    if (value > Math.max(125, targetFastingMax)) {
      return "Diabetes";
    }
    if (value > targetFastingMax) {
      return "Prediabetes";
    }
    return "Normal";
  } else {
    if (value > Math.max(199, targetPostMax)) {
      return "Diabetes";
    }
    if (value > targetPostMax) {
      return "Prediabetes";
    }
    return "Normal";
  }
}

/**
 * Computes standardized ADA/ATTD consensus glycemic metrics over a specified time window.
 */
export function computeStandardizedGlycemicMetrics(
  readings: GlucoseReading[],
  timeWindowDays: number,
  benchmarkRefMs: number
): StandardizedGlycemicMetrics {
  const days = Math.max(1, timeWindowDays || 30);
  const cutoffMs = benchmarkRefMs - days * 24 * 60 * 60 * 1000;

  const filtered = readings.filter((r) => {
    if (!isValidPhysiologicalGlucose(r.value)) return false;
    const t = Date.parse(`${r.date}T${r.time || "12:00"}`);
    return !Number.isNaN(t) && t >= cutoffMs && t <= benchmarkRefMs + 86400000;
  });

  const count = filtered.length;
  if (count === 0) {
    return {
      timeWindowDays: days,
      totalCount: 0,
      inRangePct: 100,
      tightInRangePct: 100,
      hypoPct: 0,
      severeHypoPct: 0,
      hyperPct: 0,
      severeHyperPct: 0,
      eAG: 100,
      estimatedHbA1c: 5.1,
      gmi: 5.7,
      sd: 0,
      cvPct: 0,
      jIndex: 10.0
    };
  }

  let sum = 0;
  let inRange = 0;
  let tightInRange = 0;
  let hypo = 0;
  let severeHypo = 0;
  let hyper = 0;
  let severeHyper = 0;

  for (const r of filtered) {
    const v = r.value;
    sum += v;
    if (v >= 70 && v <= 180) inRange++;
    if (v >= 70 && v <= 140) tightInRange++;
    if (v < 70) hypo++;
    if (v < 54) severeHypo++;
    if (v > 180) hyper++;
    if (v > 250) severeHyper++;
  }

  const mean = sum / count;
  const eAG = Math.round(mean);

  // Sample Standard Deviation with Bessel's correction (N - 1)
  let varianceSum = 0;
  if (count > 1) {
    for (const r of filtered) {
      const diff = r.value - mean;
      varianceSum += diff * diff;
    }
  }
  const sd = count > 1 ? Math.sqrt(varianceSum / (count - 1)) : 0;
  const cvPct = mean > 0 ? (sd / mean) * 100 : 0;

  // ADAG Study Formula: HbA1c (%) = (eAG + 46.7) / 28.7
  const estimatedHbA1c = Math.round(((mean + 46.7) / 28.7) * 10) / 10;

  // Bergenstal et al. (2018) Glucose Management Indicator: GMI (%) = 3.31 + 0.02392 * mean_mg_dL
  const gmi = Math.round((3.31 + 0.02392 * mean) * 10) / 10;

  // J-Index: 0.001 * (mean + sd)^2
  const jIndex = Math.round(0.001 * Math.pow(mean + sd, 2) * 10) / 10;

  return {
    timeWindowDays: days,
    totalCount: count,
    inRangePct: Math.round((inRange / count) * 100),
    tightInRangePct: Math.round((tightInRange / count) * 100),
    hypoPct: Math.round((hypo / count) * 100),
    severeHypoPct: Math.round((severeHypo / count) * 100),
    hyperPct: Math.round((hyper / count) * 100),
    severeHyperPct: Math.round((severeHyper / count) * 100),
    eAG,
    estimatedHbA1c: Number.isNaN(estimatedHbA1c) ? 5.7 : estimatedHbA1c,
    gmi: Number.isNaN(gmi) ? 5.7 : gmi,
    sd: Math.round(sd * 10) / 10,
    cvPct: Math.round(cvPct * 10) / 10,
    jIndex
  };
}

/**
 * Bi-exponential rapid-acting insulin pharmacokinetic curve (Walsh / Mudaliar model).
 * Models physiological subcutaneous absorption delay, peak action at ~65 minutes,
 * and 4.0-hour Duration of Insulin Action (DIA).
 */
export function computeBiExponentialInsulinFractionRemaining(
  elapsedHours: number,
  diaHours: number = 4.0
): number {
  if (elapsedHours <= 0) return 1.0;
  if (elapsedHours >= diaHours) return 0.0;

  const t = elapsedHours * 60; // minutes
  const td = diaHours * 60;    // 240 minutes
  const tp = 65;               // Peak activity at 65 minutes for rapid-acting analogues

  const tau = (tp * (1 - tp / td)) / (1 - (2 * tp) / td);
  const a = (2 * tau) / td;
  const s = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));

  const fractionUsed =
    s *
    (1 -
      a -
      ((1 - a) * (t / tau + 1) + a * (1 - (t * t) / (2 * tau * tau * (1 - a)))) *
        Math.exp(-t / tau));

  const remaining = 1 - Math.max(0, Math.min(1, fractionUsed));
  return Number.isFinite(remaining) ? Math.max(0, Math.min(1, remaining)) : Math.max(0, 1 - elapsedHours / diaHours);
}

/**
 * Computes active Insulin-on-Board (IOB) across all recent insulin logs within the 4-hour DIA window.
 */
export function computePharmacokineticIOB(
  medLogs: MedicationLog[],
  reminders: MedicationReminder[],
  nowMs: number = Date.now()
): PharmacokineticIOBResult {
  let totalIOB = 0;
  const activeInjections: ActiveInsulinInjection[] = [];
  const diaHours = 4.0;

  for (const log of medLogs) {
    const reminder = reminders.find((rem) => rem.id === log.reminderId);
    const isInsulin =
      Boolean(reminder?.isInsulin) ||
      Boolean(log.medicineName && log.medicineName.toLowerCase().includes("insulin"));

    if (!isInsulin || log.unitsAdministered === undefined || log.unitsAdministered <= 0) {
      continue;
    }

    const logTimeMs = Date.parse(log.takenAt);
    if (Number.isNaN(logTimeMs)) continue;

    const diffHours = (nowMs - logTimeMs) / (1000 * 60 * 60);
    if (diffHours >= 0 && diffHours < diaHours) {
      const fractionRemaining = computeBiExponentialInsulinFractionRemaining(diffHours, diaHours);
      const remaining = log.unitsAdministered * fractionRemaining;
      totalIOB += remaining;

      let takenAtFormatted = "";
      try {
        takenAtFormatted = new Date(logTimeMs).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        });
      } catch {
        takenAtFormatted = log.takenAt.slice(11, 16);
      }

      activeInjections.push({
        id: log.id,
        name: log.medicineName,
        administeredHoursAgo: Math.round(diffHours * 100) / 100,
        initialUnits: log.unitsAdministered,
        remainingUnits: Math.round(remaining * 100) / 100,
        activityPct: Math.round(fractionRemaining * 100),
        takenAt: takenAtFormatted
      });
    }
  }

  activeInjections.sort((a, b) => a.administeredHoursAgo - b.administeredHoursAgo);

  return {
    activeIOB: Math.round(totalIOB * 10) / 10,
    activeInjections
  };
}

/**
 * Computes rolling 30-day glycemic variability series (Mean, SD, %CV).
 */
export function computeRolling30DayVariability(readings: GlucoseReading[]): VariabilityPoint[] {
  if (!readings || readings.length === 0) return [];

  const sorted = [...readings]
    .filter((r) => isValidPhysiologicalGlucose(r.value))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const uniqueDates = Array.from(new Set(sorted.map((r) => r.date))).sort();
  const points: VariabilityPoint[] = [];

  for (const dateStr of uniqueDates) {
    const currentEnd = Date.parse(`${dateStr}T23:59:59`);
    if (Number.isNaN(currentEnd)) continue;
    const windowStart = currentEnd - 30 * 24 * 60 * 60 * 1000;

    const windowReadings = sorted.filter((r) => {
      const rMs = Date.parse(`${r.date}T${r.time || "12:00"}`);
      return !Number.isNaN(rMs) && rMs >= windowStart && rMs <= currentEnd;
    });

    if (windowReadings.length > 0) {
      const values = windowReadings.map((r) => r.value);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;

      let sd = 0;
      if (values.length > 1) {
        const sqDiffs = values.map((v) => Math.pow(v - mean, 2));
        const avgSqDiff = sqDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
        sd = Math.sqrt(avgSqDiff);
      }

      const cv = mean > 0 ? (sd / mean) * 100 : 0;
      const dayReadings = windowReadings.filter((r) => r.date === dateStr);
      const latestForDay =
        dayReadings.length > 0
          ? dayReadings[dayReadings.length - 1].value
          : windowReadings[windowReadings.length - 1].value;

      points.push({
        date: dateStr,
        formattedDate: dateStr.substring(5),
        mean: Math.round(mean * 10) / 10,
        sd: Math.round(sd * 10) / 10,
        cv: Math.round(cv * 10) / 10,
        readingsCount: windowReadings.length,
        latestValue: latestForDay
      });
    }
  }

  return points;
}

/**
 * Numerically stable Ordinary Least Squares (OLS) linear regression.
 */
export function calculateLinearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number } | null {
  if (!points || points.length < 2) return null;
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (Math.abs(denominator) < 1e-9) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
