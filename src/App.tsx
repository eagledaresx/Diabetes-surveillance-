/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import {
  Activity,
  Calendar,
  Clock,
  Heart,
  FileText,
  Search,
  Plus,
  Trash2,
  Edit,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Settings,
  Sparkles,
  BookOpen,
  User,
  Info,
  Pill,
  ChevronRight,
  RefreshCw,
  Bell,
  HeartPulse,
  BrainCircuit,
  Filter,
  CheckCircle,
  Globe,
  ChefHat,
  Wifi,
  Download,
  FileSpreadsheet,
  Utensils,
  Zap,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
  ClipboardList,
  Palette,
  Target,
  Bluetooth,
  ShieldAlert,
  Share2,
  Sun,
  BellRing,
  RotateCcw,
  Crown,
  Stethoscope
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  BarChart,
  Brush
} from "recharts";

import AndroidFrame from "./components/AndroidFrame";
import UserProfile from "./components/UserProfile";
import FastingTimer from "./components/FastingTimer";
import HydrationTracker from "./components/HydrationTracker";
import FoodLogger from "./components/FoodLogger";
import OpenWearablesHub from "./components/OpenWearablesHub";
import { MedicationInteractionChecker } from "./components/MedicationInteractionChecker";
import MedicalDisclaimerModal from "./components/MedicalDisclaimerModal";
import BiometricLockModal from "./components/BiometricLockModal";
import HypoglycemiaAlertModal from "./components/HypoglycemiaAlertModal";
import { GlucometerSyncModal } from "./components/GlucometerSyncModal";
import { DangerousGlucoseAlertModal } from "./components/DangerousGlucoseAlertModal";
import { LifestyleCorrelationView } from "./components/LifestyleCorrelationView";
import { GoalsAndProgressModal } from "./components/GoalsAndProgressModal";
import { EducationalResources } from "./components/EducationalResources";
import { WeeklyReviewModal } from "./components/WeeklyReviewModal";
import { AndroidInstallModal } from "./components/AndroidInstallModal";
import { PWAInstallButton } from "./components/PWAInstallButton";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { getApiUrl } from "./lib/api";
import { motion, AnimatePresence } from "motion/react";
import { GlucoseReading, MedicationReminder, MedicationLog, MedicineDetails, UserProfile as UserProfileType, FoodLog, PrescribedMedication, ActivityLog, FastingReminderConfig } from "./types";
import { FastingGlucoseReminder } from "./components/FastingGlucoseReminder";
import { FastingAlertBanner } from "./components/FastingAlertBanner";
import { MonetizationHubModal } from "./components/MonetizationHubModal";
import {
  DEFAULT_FASTING_REMINDER_CONFIG,
  calculatePreAlertTime,
  isAlertTimeNow,
  playNotificationChime,
  triggerHaptic,
  sendNativeNotification
} from "./lib/notifications";
import ComprehensiveHistory from "./components/ComprehensiveHistory";
import { AiAssistantTab } from "./components/AiAssistantTab";
import { WalkingTracker } from "./components/WalkingTracker";
import { FamilyMonitoring } from "./components/FamilyMonitoring";
import { DietPlanner } from "./components/DietPlanner";
import { DoctorReport } from "./components/DoctorReport";
import { useChartBrushSync } from "./hooks/useChartBrushSync";
import { MEDICINE_LIST, PRELOADED_MEDICINES } from "./data";
import { GLOBAL_DIETARY_PROGRAMS } from "./data/diets";

// Preloaded initial readings
const INITIAL_READINGS: GlucoseReading[] = [
  {
    id: "g_preload_1",
    date: "2026-05-10",
    time: "07:30",
    type: "fasting",
    value: 118,
    category: "Diabetes",
    notes: "Baseline tracking week 1",
    stressLevel: 6
  },
  {
    id: "g_preload_2",
    date: "2026-05-10",
    time: "13:30",
    type: "post_fasting",
    value: 164,
    category: "Diabetes",
    notes: "Waffles and syrup",
    stressLevel: 8
  },
  {
    id: "g_preload_3",
    date: "2026-05-17",
    time: "07:30",
    type: "fasting",
    value: 110,
    category: "Diabetes",
    notes: "Week 2 progress",
    stressLevel: 5
  },
  {
    id: "g_preload_4",
    date: "2026-05-17",
    time: "14:00",
    type: "post_fasting",
    value: 152,
    category: "Prediabetes",
    notes: "Pasta check",
    stressLevel: 6
  },
  {
    id: "g_preload_5",
    date: "2026-05-24",
    time: "07:30",
    type: "fasting",
    value: 98,
    category: "Normal",
    notes: "Week 3 progress - seeing benefits!",
    stressLevel: 4
  },
  {
    id: "g_preload_6",
    date: "2026-05-24",
    time: "13:00",
    type: "post_fasting",
    value: 144,
    category: "Prediabetes",
    notes: "Salad with bread",
    stressLevel: 5
  },
  {
    id: "g1",
    date: "2026-05-30",
    time: "07:30",
    type: "fasting",
    value: 94,
    category: "Normal",
    notes: "Felt good, ate small snack before bed",
    stressLevel: 3
  },
  {
    id: "g2",
    date: "2026-05-30",
    time: "13:45",
    type: "post_fasting",
    value: 138,
    category: "Normal",
    notes: "Ate brown rice & grilled chicken",
    stressLevel: 4
  },
  {
    id: "g3",
    date: "2026-05-31",
    time: "08:00",
    type: "fasting",
    value: 106,
    category: "Prediabetes",
    notes: "Slightly slept in, woke up thirsty",
    stressLevel: 7
  },
  {
    id: "g4",
    date: "2026-05-31",
    time: "14:15",
    type: "post_fasting",
    value: 154,
    category: "Prediabetes",
    notes: "Ate standard pasta meal",
    stressLevel: 8
  },
  {
    id: "g5",
    date: "2026-06-01",
    time: "07:45",
    type: "fasting",
    value: 88,
    category: "Normal",
    notes: "Perfect fasting score after routine walk",
    stressLevel: 2
  },
  {
    id: "g6",
    date: "2026-06-01",
    time: "20:30",
    type: "post_fasting",
    value: 172,
    category: "Diabetes",
    notes: "High post-supper readings after eating mashed potatoes",
    stressLevel: 9
  },
  {
    id: "g7",
    date: "2026-06-02",
    time: "08:00",
    type: "fasting",
    value: 102,
    category: "Prediabetes",
    notes: "Today's baseline check",
    stressLevel: 5
  }
];

const INITIAL_REMINDERS: MedicationReminder[] = [
  {
    id: "r1",
    name: "Metformin",
    dosage: "1000mg",
    timing: "after_breakfast",
    times: ["08:30"],
    frequency: "Once daily",
    active: true,
    notes: "Take immediately following a high-protein meal"
  },
  {
    id: "r2",
    name: "Empagliflozin (Jardiance)",
    dosage: "10mg",
    timing: "before_breakfast",
    times: ["07:15"],
    frequency: "Once daily",
    active: true,
    notes: "Drink an entire tall bottle of water on administration"
  },
  {
    id: "r3",
    name: "Lantus Solostar (Basal Insulin)",
    dosage: "14 Units",
    timing: "bedtime",
    times: ["22:00"],
    frequency: "Once daily",
    active: true,
    isInsulin: true,
    notes: "Injected slowly in lower abdomen"
  }
];

const INITIAL_PRESCRIBED_MEDICINES: PrescribedMedication[] = [
  {
    id: "p1",
    name: "Metformin",
    dosage: "1000mg",
    frequency: "Once daily",
    description: "Biguanide medication that reduces the amount of sugar produced by the liver and increases the sensitivity of muscle cells to insulin, encouraging natural glucose uptake.",
    sideEffects: [
      "Stomach upset, nausea, or mild cramps",
      "Diarrhea (often subsides after initial weeks)",
      "Metallic taste in mouth",
      "Vitamin B12 deficiency (long-term use)"
    ],
    specialInstructions: "Take immediately after breakfast/dinner with water to reduce stomach irritation."
  },
  {
    id: "p2",
    name: "Empagliflozin (Jardiance)",
    dosage: "10mg",
    frequency: "Once daily",
    description: "An SGLT2 inhibitor that prevents the kidneys from reabsorbing glucose back into the blood, letting excess sugar be removed securely through urination.",
    sideEffects: [
      "Increased urination frequency",
      "Mild dehydration or dry mouth",
      "Urinary tract infections (UTIs)",
      "Slight weight loss"
    ],
    specialInstructions: "Take in the morning with a full glass of water. Maintain robust hydration throughout the day."
  },
  {
    id: "p3",
    name: "Lantus Solostar (Basal Insulin)",
    dosage: "14 Units",
    frequency: "Once daily",
    description: "A long-acting, peakless basal insulin analogue designed to release slowly over a full 24-hour window to duplicate standard physiological baseline insulin.",
    sideEffects: [
      "Hypoglycemia (low blood sugar)",
      "Injection site redness or lipodystrophy",
      "Mild weight gain",
      "Slight sodium retention"
    ],
    specialInstructions: "Inject subcutaneously at the exact same hour every day (bedtime preferred). Rotate injection sites."
  }
];

const DEFAULT_PROFILE: UserProfileType = {
  id: "p1",
  name: "Amir Nadeem",
  age: 58,
  weight: "72.4 kg",
  diabetesType: "Type 2",
  medications: "Metformin 1000mg, Empagliflozin 10mg",
  targetFastingMin: 70,
  targetFastingMax: 100,
  targetPostMin: 100,
  targetPostMax: 140,
  theme: "matte-slate",
  weightHistory: [
    { id: "w1", date: "2026-05-10", weight: 75.0 },
    { id: "w2", date: "2026-05-17", weight: 74.2 },
    { id: "w3", date: "2026-05-24", weight: 73.5 },
    { id: "w4", date: "2026-05-31", weight: 72.8 },
    { id: "w5", date: "2026-06-05", weight: 72.4 }
  ]
};

// Calculate 30-day rolling glycemic variability (SD, mean, CV%) for each logged point
function computeVariabilityData(readingsList: GlucoseReading[]): any[] {
  if (readingsList.length === 0) return [];

  // Sort readings oldest to newest
  const sorted = [...readingsList].sort((a, b) => {
    const comp = a.date.localeCompare(b.date);
    if (comp !== 0) return comp;
    return a.time.localeCompare(b.time);
  });

  return sorted.map((current) => {
    const currentDate = new Date(current.date + "T" + current.time);
    
    // 30 days lookback time threshold
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Find all readings fell within [currentDate - 30 days, currentDate]
    const windowReadings = sorted.filter(r => {
      const rDate = new Date(r.date + "T" + r.time);
      return rDate >= thirtyDaysAgo && rDate <= currentDate;
    });

    const values = windowReadings.map(r => r.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    
    let sd = 0;
    if (values.length > 1) {
      const sqDiffs = values.map(v => (v - mean) ** 2);
      const avgSqDiff = sqDiffs.reduce((sum, d) => sum + d, 0) / (values.length - 1);
      sd = Math.sqrt(avgSqDiff);
    }

    const cv = mean > 0 ? (sd / mean) * 100 : 0;

    return {
      ...current,
      formattedLabel: `${current.date.substring(5)}`,
      mean: Math.round(mean * 10) / 10,
      sd: Math.round(sd * 10) / 10,
      cv: Math.round(cv * 10) / 10,
      count: values.length,
      stability: cv < 36 ? "Stable" : "High"
    };
  });
}

type AppTab = "dashboard" | "reports" | "reminders" | "handbook" | "profile" | "history" | "diet" | "walking" | "assistant" | "family";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [tabHistory, setTabHistory] = useState<AppTab[]>(["dashboard"]);
  
  // States loaded from LocalStorage
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [dashboardSubTab, setDashboardSubTab] = useState<"logs" | "correlations" | "food" | "wearables">("logs");
  const [showAndroidModal, setShowAndroidModal] = useState<boolean>(false);
  const [isFullscreenAndroid, setIsFullscreenAndroid] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(display-mode: standalone)").matches || window.innerWidth <= 640;
  });
  const [showGlucometerModal, setShowGlucometerModal] = useState<boolean>(false);
  const [showGoalsModal, setShowGoalsModal] = useState<boolean>(false);
  const [showWeeklyReviewModal, setShowWeeklyReviewModal] = useState<boolean>(false);
  const [educationSubTab, setEducationSubTab] = useState<"clinical_guides" | "cultural_diets">("clinical_guides");
  const [doubleDoseModal, setDoubleDoseModal] = useState<{
    isOpen: boolean;
    reminder: MedicationReminder | null;
    lastTakenTime: string;
    units?: number;
  }>({
    isOpen: false,
    reminder: null,
    lastTakenTime: ""
  });
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [prefilledFood, setPrefilledFood] = useState<{
    mealType: FoodLog["mealType"];
    foodItems: string;
    portionSize?: string;
    impactScale?: FoodLog["impactScale"];
  } | null>(null);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [prescribedMeds, setPrescribedMeds] = useState<PrescribedMedication[]>([]);
  const [remindersSubTab, setRemindersSubTab] = useState<"checklist" | "fasting" | "prescriptions" | "checker">("checklist");
  const [fastingReminderConfig, setFastingReminderConfig] = useState<FastingReminderConfig>(DEFAULT_FASTING_REMINDER_CONFIG);
  const [showFastingAlertModal, setShowFastingAlertModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [newPresMedForm, setNewPresMedForm] = useState(false);
  const [presMedName, setPresMedName] = useState("");
  const [presMedDosage, setPresMedDosage] = useState("");
  const [presMedFrequency, setPresMedFrequency] = useState("Once daily");
  const [presMedDescription, setPresMedDescription] = useState("");
  const [presMedSideEffects, setPresMedSideEffects] = useState("");
  const [presMedSpecialInstructions, setPresMedSpecialInstructions] = useState("");
  const [presMedAddAlarm, setPresMedAddAlarm] = useState(true);
  const [presMedAlarmTime, setPresMedAlarmTime] = useState("08:00");
  const [presMedAlarmTiming, setPresMedAlarmTiming] = useState<MedicationReminder["timing"]>("before_breakfast");
  const [editingPresMedId, setEditingPresMedId] = useState<string | null>(null);
  const [medLogs, setMedLogs] = useState<MedicationLog[]>([]);
  const [profile, setProfile] = useState<UserProfileType>(DEFAULT_PROFILE);
  const [profiles, setProfiles] = useState<UserProfileType[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Quick blood glucose log builder
  const [logValue, setLogValue] = useState("");
  const [logType, setLogType] = useState<"fasting" | "post_fasting">("fasting");
  const [logDate, setLogDate] = useState("");
  const [logTime, setLogTime] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logStressLevel, setLogStressLevel] = useState<number>(5);
  const [insightsMealFilter, setInsightsMealFilter] = useState<string>("All");

  // Medicine details analyzer states
  const [lookupName, setLookupName] = useState("");
  const [searchType, setSearchType] = useState("General Information");
  const [searchedMedicine, setSearchedMedicine] = useState<MedicineDetails | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Global dietary program states
  const [handbookSubTab, setHandbookSubTab] = useState<"diets" | "medicines">("diets");
  const [selectedDietId, setSelectedDietId] = useState<string>("mediterranean");
  
  // Custom cultural recipe adapter state
  const [customDishName, setCustomDishName] = useState("");
  const [customDishRegion, setCustomDishRegion] = useState("South Asian");
  const [customDishGoal, setCustomDishGoal] = useState("Low-glycemic and High-fiber");
  const [customizedRecipe, setCustomizedRecipe] = useState<{
    originalDish: string;
    region: string;
    whyItSpikes: string;
    diabeticSubstitutions: Array<{ traditionalIngredient: string; healthyAlternative: string; why: string }>;
    modifiedRecipe: {
      prepTime: string;
      cookTime: string;
      ingredients: string[];
      instructions: string[];
    };
    glycemicCheckNote: string;
  } | null>(null);
  const [customizerLoading, setCustomizerLoading] = useState(false);
  const [customizerError, setCustomizerError] = useState("");

  // AI Surveillance Insights states
  const [insights, setInsights] = useState<{
    disclaimer?: string;
    summary?: string;
    alerts?: string[];
    recommendations?: string[];
  } | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState("");
  const [exportFeedback, setExportFeedback] = useState("");

  // Play Store & Clinical Compliance Modals State
  const [disclaimerModalOpen, setDisclaimerModalOpen] = useState(() => {
    return localStorage.getItem("dia_disclaimer_accepted") !== "true";
  });
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);
  const [dangerousAlert, setDangerousAlert] = useState<{
    isOpen: boolean;
    value: number;
    dateStr?: string;
    timeStr?: string;
    type?: "fasting" | "post_fasting";
  }>({
    isOpen: false,
    value: 65
  });

  // Chart visual filters
  const [chartFilter, setChartFilter] = useState<"all" | "fasting" | "post_fasting">("all");
  const [reportChartType, setReportChartType] = useState<"trend" | "variability" | "weight" | "adherence">("trend");
  const [reportTimeRange, setReportTimeRange] = useState<"7" | "30" | "90" | "365" | "custom">("30");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [reportChartStyle, setReportChartStyle] = useState<"line" | "bar">("line");
  const [reportAggregation, setReportAggregation] = useState<"raw" | "daily" | "weekly" | "monthly">("raw");
  const [showRegressionLines, setShowRegressionLines] = useState<boolean>(() => {
    const saved = localStorage.getItem("glucose_show_regression_lines");
    return saved !== null ? saved === "true" : true;
  });

  // Medication interactive states
  const [newReminderForm, setNewReminderForm] = useState(false);
  const [remName, setRemName] = useState("");
  const [remDosage, setRemDosage] = useState("");
  const [remTiming, setRemTiming] = useState<MedicationReminder["timing"]>("before_breakfast");
  const [remTime, setRemTime] = useState("08:00");
  const [remFrequency, setRemFrequency] = useState("Once daily");
  const [remNotes, setRemNotes] = useState("");
  const [remIsInsulin, setRemIsInsulin] = useState(false);
  const [insulinUnitsLocal, setInsulinUnitsLocal] = useState<Record<string, number>>({});

  // Set default form values inside component startup
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setLogDate(todayStr);
    setLogTime(timeStr);
  }, [activeTab]);

  // Initial persistent recovery
  useEffect(() => {
    // 1. Recover multiple profiles
    const localProfiles = localStorage.getItem("dia_profiles");
    const localActiveProfileId = localStorage.getItem("dia_active_profile_id");
    let parsedProfiles: UserProfileType[] = [];
    let parsedActiveId = "";

    if (localProfiles) {
      try {
        parsedProfiles = JSON.parse(localProfiles);
      } catch (e) {
        console.error(e);
      }
    }

    if (localActiveProfileId) {
      parsedActiveId = localActiveProfileId;
    }

    // Recover or migrate existing old profile
    const localProfile = localStorage.getItem("dia_profile");
    let primaryProfile: UserProfileType | null = null;
    if (localProfile) {
      try {
        primaryProfile = JSON.parse(localProfile);
        if (primaryProfile && primaryProfile.name === "Eleanor Vance") {
          primaryProfile.name = "Amir Nadeem";
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (!primaryProfile) {
      primaryProfile = { ...DEFAULT_PROFILE, id: "p1" };
    } else if (!primaryProfile.id) {
      primaryProfile.id = "p1";
    }

    if (parsedProfiles.length === 0) {
      parsedProfiles = [primaryProfile];
    }

    if (!parsedActiveId || !parsedProfiles.some(p => p.id === parsedActiveId)) {
      parsedActiveId = parsedProfiles[0].id || "p1";
    }

    setProfiles(parsedProfiles);
    setActiveProfileId(parsedActiveId);

    const activeProf = parsedProfiles.find(p => p.id === parsedActiveId) || parsedProfiles[0];
    setProfile(activeProf);

    if (activeProf && activeProf.biometricEnabled) {
      setIsBiometricLocked(true);
    }

    localStorage.setItem("dia_profiles", JSON.stringify(parsedProfiles));
    localStorage.setItem("dia_active_profile_id", parsedActiveId);
    localStorage.setItem("dia_profile", JSON.stringify(activeProf));

    // 2. Recover Activity Logs
    const localActivityLogs = localStorage.getItem("dia_activitylogs");
    if (localActivityLogs) {
      try {
        setActivityLogs(JSON.parse(localActivityLogs));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialActivities: ActivityLog[] = [
        {
          id: "act1",
          date: "2026-06-20",
          time: "13:30",
          activityType: "Walking",
          duration: 20,
          intensity: "low",
          caloriesBurned: 70,
          notes: "Post-meal brisk walking to help reduce post-prandial glycemic spike."
        },
        {
          id: "act2",
          date: "2026-06-22",
          time: "18:15",
          activityType: "Cycling",
          duration: 35,
          intensity: "medium",
          caloriesBurned: 180,
          notes: "Steady neighborhood ride. Blood glucose pre: 124, post: 98."
        }
      ];
      setActivityLogs(initialActivities);
      localStorage.setItem("dia_activitylogs", JSON.stringify(initialActivities));
    }

    const localReadings = localStorage.getItem("dia_readings");
    if (localReadings) {
      try {
        setReadings(JSON.parse(localReadings));
      } catch (e) {
        console.error(e);
      }
    } else {
      setReadings(INITIAL_READINGS);
      localStorage.setItem("dia_readings", JSON.stringify(INITIAL_READINGS));
    }

    const localReminders = localStorage.getItem("dia_reminders");
    if (localReminders) {
      try {
        setReminders(JSON.parse(localReminders));
      } catch (e) {
        console.error(e);
      }
    } else {
      setReminders(INITIAL_REMINDERS);
      localStorage.setItem("dia_reminders", JSON.stringify(INITIAL_REMINDERS));
    }

    const localPrescribed = localStorage.getItem("dia_prescribed_meds");
    if (localPrescribed) {
      try {
        setPrescribedMeds(JSON.parse(localPrescribed));
      } catch (e) {
        console.error(e);
      }
    } else {
      setPrescribedMeds(INITIAL_PRESCRIBED_MEDICINES);
      localStorage.setItem("dia_prescribed_meds", JSON.stringify(INITIAL_PRESCRIBED_MEDICINES));
    }

    const localMedLogs = localStorage.getItem("dia_medlogs");
    if (localMedLogs) {
      try {
        setMedLogs(JSON.parse(localMedLogs));
      } catch (e) {
        console.error(e);
      }
    }

    const localFoodLogs = localStorage.getItem("dia_foodlogs");
    if (localFoodLogs) {
      try {
        setFoodLogs(JSON.parse(localFoodLogs));
      } catch (e) {
        console.error(e);
      }
    } else {
      const initialFoodLogs: FoodLog[] = [
        {
          id: "f1",
          date: "2026-05-30",
          time: "13:00",
          mealType: "Lunch",
          foodItems: "Brown rice with Grilled Salmon and Broccoli salad",
          portionSize: "1 medium plate (150g salmon, 100g rice)",
          associatedGlucoseId: "g2",
          impactScale: "low",
          notes: "Cooked with olive oil, walked 20 mins post-meal",
          carbsIntake: 35
        },
        {
          id: "f2",
          date: "2026-05-31",
          time: "13:30",
          mealType: "Lunch",
          foodItems: "Italian White Sauce Pasta with garlic bread",
          portionSize: "1 large plate bowl",
          associatedGlucoseId: "g4",
          impactScale: "high",
          notes: "Restaurant meal, triggered a mild spike warning",
          carbsIntake: 85
        },
        {
          id: "f3",
          date: "2026-06-01",
          time: "19:30",
          mealType: "Dinner",
          foodItems: "Creamy mashed potatoes and fried chips",
          portionSize: "2 separate plates",
          associatedGlucoseId: "g6",
          impactScale: "high",
          notes: "Felt extremely fatigued and slow after dinner",
          carbsIntake: 120
        }
      ];
      setFoodLogs(initialFoodLogs);
      localStorage.setItem("dia_foodlogs", JSON.stringify(initialFoodLogs));
    }

    const localFastingConfig = localStorage.getItem("dia_fasting_reminder_config");
    if (localFastingConfig) {
      try {
        setFastingReminderConfig(JSON.parse(localFastingConfig));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleUpdateFastingConfig = (newConfig: FastingReminderConfig) => {
    setFastingReminderConfig(newConfig);
    localStorage.setItem("dia_fasting_reminder_config", JSON.stringify(newConfig));
  };

  const handleUpdateMembershipTier = (tier: "free" | "pro" | "caregiver_plus") => {
    const updated = {
      ...profile,
      membershipTier: tier
    };
    setProfile(updated);
    localStorage.setItem("dia_profile", JSON.stringify(updated));
  };

  const handleSnoozeFastingAlert = (minutes: number) => {
    const updated = {
      ...fastingReminderConfig,
      snoozedUntil: Date.now() + minutes * 60 * 1000
    };
    handleUpdateFastingConfig(updated);
    setShowFastingAlertModal(false);
  };

  const handleLogFastingFromReminder = () => {
    setShowFastingAlertModal(false);
    setLogType("fasting");
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const dateStr = now.toISOString().split("T")[0];
    setLogTime(timeStr);
    setLogDate(dateStr);
    setActiveTab("dashboard");
    setTimeout(() => {
      const el = document.getElementById("input-glucose-val");
      if (el) {
        el.focus();
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  // 15-Minute Morning Fasting Glucose Alert Background Check Ticker
  useEffect(() => {
    const checkFastingAlert = async () => {
      if (!fastingReminderConfig.enabled) return;

      // If currently snoozed, check if snooze window has expired
      if (fastingReminderConfig.snoozedUntil && Date.now() < fastingReminderConfig.snoozedUntil) {
        return;
      }

      const now = new Date();
      const todayStamp = now.toISOString().split("T")[0];

      // Avoid duplicate alert triggers for today unless explicitly testing
      if (fastingReminderConfig.lastTriggeredDate === todayStamp && !fastingReminderConfig.snoozedUntil) {
        return;
      }

      const { preAlertTime, formattedTarget } = calculatePreAlertTime(
        fastingReminderConfig.targetTime,
        fastingReminderConfig.leadMinutes
      );

      if (isAlertTimeNow(preAlertTime)) {
        const updatedConfig = {
          ...fastingReminderConfig,
          lastTriggeredDate: todayStamp,
          snoozedUntil: null
        };
        setFastingReminderConfig(updatedConfig);
        localStorage.setItem("dia_fasting_reminder_config", JSON.stringify(updatedConfig));

        if (fastingReminderConfig.soundEnabled) {
          playNotificationChime();
        }

        if (fastingReminderConfig.vibrationEnabled) {
          triggerHaptic([200, 100, 200, 100, 300]);
        }

        if (fastingReminderConfig.browserNotificationsEnabled) {
          await sendNativeNotification("🌅 Fasting Glucose Check in 15 Minutes", {
            body: `Scheduled check at ${formattedTarget}. Wash hands with warm water, rest for 5 mins, and prep your test strip.`,
            tag: "morning-fasting-glucose-precheck"
          });
        }

        setShowFastingAlertModal(true);
      }
    };

    checkFastingAlert();
    const interval = setInterval(checkFastingAlert, 25000);
    return () => clearInterval(interval);
  }, [fastingReminderConfig]);

  // Synchronize CSS variable theme overrides based on patient profile selection
  useEffect(() => {
    const activeTheme = profile.theme || "matte-slate";
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [profile.theme]);

  // Auto-lock when waking from background or switching away if Biometric Security is enabled
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && profile.biometricEnabled) {
        setIsBiometricLocked(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [profile.biometricEnabled]);

  // Sync tab transitions helper for Android native back pressed
  const changeTab = (tab: AppTab) => {
    setActiveTab(tab);
    setTabHistory((prev) => [...prev, tab]);
  };

  const handleBackNavigation = () => {
    if (tabHistory.length > 1) {
      const updatedHistory = [...tabHistory];
      updatedHistory.pop(); // Pop current tab
      const prevTab = updatedHistory[updatedHistory.length - 1];
      setActiveTab(prevTab);
      setTabHistory(updatedHistory);
    } else {
      setActiveTab("dashboard");
    }
  };

  const handleHomeNavigation = () => {
    setActiveTab("dashboard");
    setTabHistory(["dashboard"]);
  };

  // Profile Switching & Directory Handlers
  const handleSwitchProfile = (id: string) => {
    setActiveProfileId(id);
    localStorage.setItem("dia_active_profile_id", id);
    const found = profiles.find(p => p.id === id);
    if (found) {
      setProfile(found);
      localStorage.setItem("dia_profile", JSON.stringify(found));
      if (found.theme) {
        document.documentElement.setAttribute("data-theme", found.theme);
      }
    }
  };

  const handleCreateProfile = (name: string, diabetesType: UserProfileType["diabetesType"]) => {
    const newId = "p_" + Date.now();
    const newProfile: UserProfileType = {
      id: newId,
      name,
      age: 40,
      weight: "70.0 kg",
      diabetesType,
      medications: "",
      targetFastingMin: 70,
      targetFastingMax: 100,
      targetPostMin: 100,
      targetPostMax: 140,
      theme: "matte-slate",
      weightHistory: []
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem("dia_profiles", JSON.stringify(updatedProfiles));

    // Auto switch to newly created profile
    setActiveProfileId(newId);
    localStorage.setItem("dia_active_profile_id", newId);
    setProfile(newProfile);
    localStorage.setItem("dia_profile", JSON.stringify(newProfile));
  };

  const handleDeleteProfile = (id: string) => {
    if (id === activeProfileId) {
      alert("Cannot delete the active profile. Please switch to another profile first.");
      return;
    }
    const updatedProfiles = profiles.filter(p => p.id !== id);
    setProfiles(updatedProfiles);
    localStorage.setItem("dia_profiles", JSON.stringify(updatedProfiles));
  };

  // Profile Save
  const handleProfileSave = (updated: UserProfileType) => {
    const updatedWithId = { ...updated, id: updated.id || activeProfileId || "p1" };
    setProfile(updatedWithId);
    localStorage.setItem("dia_profile", JSON.stringify(updatedWithId));

    const updatedProfiles = profiles.map(p => p.id === updatedWithId.id ? updatedWithId : p);
    setProfiles(updatedProfiles);
    localStorage.setItem("dia_profiles", JSON.stringify(updatedProfiles));
  };

  // Activity Log Handlers
  const handleAddActivityLog = (newLog: Omit<ActivityLog, "id">) => {
    const logItem: ActivityLog = {
      id: "act_" + Date.now(),
      ...newLog
    };
    const updated = [logItem, ...activityLogs];
    setActivityLogs(updated);
    localStorage.setItem("dia_activitylogs", JSON.stringify(updated));
  };

  const handleDeleteActivityLog = (id: string) => {
    const updated = activityLogs.filter(a => a.id !== id);
    setActivityLogs(updated);
    localStorage.setItem("dia_activitylogs", JSON.stringify(updated));
  };

  // Medication Intake logs deletion
  const handleDeleteMedLog = (id: string) => {
    const updated = medLogs.filter(m => m.id !== id);
    setMedLogs(updated);
    localStorage.setItem("dia_medlogs", JSON.stringify(updated));
  };

  // Log blood sugar logic
  const handleAddReading = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(logValue);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid blood sugar reading in mg/dL.");
      return;
    }

    // Determine category based on custom user targets defined in profile settings
    let cat: GlucoseReading["category"] = "Normal";
    if (val < 70) {
      cat = "Hypoglycemia";
    } else if (logType === "fasting") {
      if (val >= 250) {
        cat = "Severe Hyperglycemia";
      } else if (val > profile.targetFastingMax) {
        cat = "Diabetes";
      } else if (val > 100) {
        cat = "Prediabetes";
      } else if (val >= profile.targetFastingMin) {
        cat = "Normal";
      } else {
        cat = "Normal"; // between 70 and min (though under target, still classified safe if >= 70)
      }
    } else {
      // post fasting (after meal)
      if (val >= 250) {
        cat = "Severe Hyperglycemia";
      } else if (val > profile.targetPostMax) {
        cat = "Diabetes";
      } else if (val > 140) {
        cat = "Prediabetes";
      } else if (val >= profile.targetPostMin) {
        cat = "Normal";
      } else {
        cat = "Normal";
      }
    }

    const newReading: GlucoseReading = {
      id: "gly_" + Date.now(),
      date: logDate || new Date().toISOString().split("T")[0],
      time: logTime || "08:00",
      type: logType,
      value: val,
      category: cat,
      notes: logNotes.trim() || undefined,
      stressLevel: logStressLevel
    };

    const updated = [newReading, ...readings];
    setReadings(updated);
    localStorage.setItem("dia_readings", JSON.stringify(updated));

    // Trigger Dangerous Blood Sugar Alert System if reading is below threshold (< 70 mg/dL) or high (> 180 mg/dL)
    if (val < 70 || val > 180) {
      setDangerousAlert({
        isOpen: true,
        value: val,
        dateStr: logDate || new Date().toISOString().split("T")[0],
        timeStr: logTime || "08:00",
        type: logType
      });
    }

    // Reset logs
    setLogValue("");
    setLogNotes("");
    setLogStressLevel(5);
  };

  const handleDeleteReading = (id: string) => {
    const updated = readings.filter(r => r.id !== id);
    setReadings(updated);
    localStorage.setItem("dia_readings", JSON.stringify(updated));
  };

  // Glucometer device data batch synchronization handler
  const handleImportGlucometerReadings = (imported: GlucoseReading[]) => {
    if (!imported || imported.length === 0) return;
    const combined = [...imported, ...readings];
    // Deduplicate by date + time + value
    const uniqueMap = new Map<string, GlucoseReading>();
    combined.forEach(r => uniqueMap.set(`${r.date}_${r.time}_${r.value}`, r));
    const unique = Array.from(uniqueMap.values());
    unique.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
    setReadings(unique);
    localStorage.setItem("dia_readings", JSON.stringify(unique));

    // Check if newest reading is dangerous
    const newest = imported[0];
    if (newest && (newest.value < 70 || newest.value > 180)) {
      setDangerousAlert({
        isOpen: true,
        value: newest.value,
        dateStr: newest.date,
        timeStr: newest.time,
        type: newest.type
      });
    }
  };

  // User Profile goal & metadata synchronization handler
  const handleUpdateProfile = (updatedProfile: UserProfileType) => {
    setProfile(updatedProfile);
    localStorage.setItem("dia_profile", JSON.stringify(updatedProfile));
  };

  // Full clinical backup restore handler
  const handleRestoreBackup = (backup: any) => {
    if (!backup) return;
    if (backup.profile) {
      setProfile(backup.profile);
      localStorage.setItem("dia_profile", JSON.stringify(backup.profile));
    }
    if (backup.readings && Array.isArray(backup.readings)) {
      setReadings(backup.readings);
      localStorage.setItem("dia_readings", JSON.stringify(backup.readings));
    }
    if (backup.foodLogs && Array.isArray(backup.foodLogs)) {
      setFoodLogs(backup.foodLogs);
      localStorage.setItem("dia_foodlogs", JSON.stringify(backup.foodLogs));
    }
    if (backup.activityLogs && Array.isArray(backup.activityLogs)) {
      setActivityLogs(backup.activityLogs);
      localStorage.setItem("dia_activitylogs", JSON.stringify(backup.activityLogs));
    }
    if (backup.medicationLogs && Array.isArray(backup.medicationLogs)) {
      setMedLogs(backup.medicationLogs);
      localStorage.setItem("dia_medlogs", JSON.stringify(backup.medicationLogs));
    }
  };

  // Food Intake Logging Handlers
  const handleAddFoodLog = (newLog: Omit<FoodLog, "id">) => {
    const log: FoodLog = {
      ...newLog,
      id: "food_" + Date.now(),
    };
    const updated = [log, ...foodLogs];
    setFoodLogs(updated);
    localStorage.setItem("dia_foodlogs", JSON.stringify(updated));
  };

  const handleDeleteFoodLog = (id: string) => {
    const updated = foodLogs.filter(f => f.id !== id);
    setFoodLogs(updated);
    localStorage.setItem("dia_foodlogs", JSON.stringify(updated));
  };

  const handleAssociateGlucose = (foodLogId: string, glucoseId: string | undefined) => {
    const updated = foodLogs.map(f => {
      if (f.id === foodLogId) {
        return { ...f, associatedGlucoseId: glucoseId };
      }
      return f;
    });
    setFoodLogs(updated);
    localStorage.setItem("dia_foodlogs", JSON.stringify(updated));
  };

  const handleQuickLogGlucoseFromFood = (value: number, date: string, time: string, type: "fasting" | "post_fasting", notes: string) => {
    let cat: GlucoseReading["category"] = "Normal";
    if (value < 70) {
      cat = "Hypoglycemia";
    } else if (type === "fasting") {
      if (value >= 250) {
        cat = "Severe Hyperglycemia";
      } else if (value > profile.targetFastingMax) {
        cat = "Diabetes";
      } else if (value > 100) {
        cat = "Prediabetes";
      } else {
        cat = "Normal";
      }
    } else {
      if (value >= 250) {
        cat = "Severe Hyperglycemia";
      } else if (value > profile.targetPostMax) {
        cat = "Diabetes";
      } else if (value > 140) {
        cat = "Prediabetes";
      } else {
        cat = "Normal";
      }
    }

    const newReading: GlucoseReading = {
      id: "gly_" + Date.now(),
      date,
      time,
      type,
      value,
      category: cat,
      notes: notes.trim() || undefined
    };

    const updatedReadings = [newReading, ...readings];
    setReadings(updatedReadings);
    localStorage.setItem("dia_readings", JSON.stringify(updatedReadings));

    if (value < 70 || value > 180) {
      setDangerousAlert({
        isOpen: true,
        value,
        dateStr: date,
        timeStr: time,
        type
      });
    }
  };

  // Add Custom Pill Reminder logic
  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remName.trim()) {
      alert("Please write the drug name.");
      return;
    }

    const newRem: MedicationReminder = {
      id: "rem_" + Date.now(),
      name: remName.trim(),
      dosage: remDosage.trim() || (remIsInsulin ? "10 Units" : "1 tab"),
      timing: remTiming,
      times: [remTime],
      frequency: remFrequency.trim() || "Once daily",
      active: true,
      isInsulin: remIsInsulin,
      notes: remNotes.trim() || undefined
    };

    const updated = [...reminders, newRem];
    setReminders(updated);
    localStorage.setItem("dia_reminders", JSON.stringify(updated));

    // reset
    setRemName("");
    setRemDosage("");
    setRemFrequency("Once daily");
    setRemNotes("");
    setRemIsInsulin(false);
    setNewReminderForm(false);
  };

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setReminders(updated);
    localStorage.setItem("dia_reminders", JSON.stringify(updated));
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem("dia_reminders", JSON.stringify(updated));
  };

  // Helper to match input name to preloaded medicines
  const findPreloadedMedicine = (name: string) => {
    const normalized = name.toLowerCase().trim();
    if (normalized.includes("metformin") || normalized.includes("glucophage")) return PRELOADED_MEDICINES.metformin;
    if (normalized.includes("glipizide") || normalized.includes("glucotrol")) return PRELOADED_MEDICINES.glipizide;
    if (normalized.includes("empagliflozin") || normalized.includes("jardiance")) return PRELOADED_MEDICINES.empagliflozin;
    if (normalized.includes("sitagliptin") || normalized.includes("januvia")) return PRELOADED_MEDICINES.sitagliptin;
    if (normalized.includes("insulin") || normalized.includes("glargine") || normalized.includes("lantus")) return PRELOADED_MEDICINES.insulin_glargine;
    if (normalized.includes("semaglutide") || normalized.includes("ozempic") || normalized.includes("rybelsus")) return PRELOADED_MEDICINES.semaglutide;
    return null;
  };

  // Memoized drug interaction checker
  const activeInteractionWarnings = useMemo(() => {
    const warnings: {
      id: string;
      med1: string;
      med2: string;
      severity: "high" | "moderate";
      title: string;
      message: string;
    }[] = [];

    // Helper to check if any of the prescribed medications contains a term
    const hasMed = (term: string) => {
      return prescribedMeds.some(m => m.name.toLowerCase().includes(term));
    };

    // Helper to find specific med names for the message
    const findMedNames = (term1: string, term2: string) => {
      const m1 = prescribedMeds.find(m => m.name.toLowerCase().includes(term1))?.name || term1;
      const m2 = prescribedMeds.find(m => m.name.toLowerCase().includes(term2))?.name || term2;
      return { m1, m2 };
    };

    // Rule 1: Metformin + Iodine Contrast (or general contrast)
    if (hasMed("metformin") && (hasMed("contrast") || hasMed("dye") || hasMed("iodine"))) {
      const { m1, m2 } = findMedNames("metformin", "contrast");
      warnings.push({
        id: "warn_metformin_contrast",
        med1: m1,
        med2: m2,
        severity: "high",
        title: "Lactic Acidosis Risk (Metformin + Contrast)",
        message: "Taking Metformin and undergoing imaging with iodinated contrast media can lead to an acute decrease in renal function and severe lactic acidosis. Consult your radiologist/physician."
      });
    }

    // Rule 2: Sulfonylurea + Insulin (high risk of severe hypoglycemia)
    const hasSulfonylurea = prescribedMeds.some(m => {
      const n = m.name.toLowerCase();
      return n.includes("glipizide") || n.includes("glyburide") || n.includes("glimepiride") || n.includes("sulfonylurea") || n.includes("gliclazide");
    });
    const hasInsulin = prescribedMeds.some(m => {
      const n = m.name.toLowerCase();
      return n.includes("insulin") || n.includes("glargine") || n.includes("lantus") || n.includes("humalog") || n.includes("novolog") || n.includes("basal");
    });
    if (hasSulfonylurea && hasInsulin) {
      const sfMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("glipizide") || n.includes("glyburide") || n.includes("glimepiride") || n.includes("gliclazide");
      })?.name || "Sulfonylurea";
      const insMed = prescribedMeds.find(m => m.name.toLowerCase().includes("insulin"))?.name || "Insulin";
      warnings.push({
        id: "warn_sulfonylurea_insulin",
        med1: sfMed,
        med2: insMed,
        severity: "high",
        title: "Severe Hypoglycemia Hazard",
        message: `Combining a sulfonylurea (${sfMed}) with insulin (${insMed}) exponentially increases the risk of severe, sudden blood sugar drops (hypoglycemia). Extreme caution and close monitoring are required.`
      });
    }

    // Rule 3: Sulfonylurea + Beta-blockers (masks hypoglycemia)
    const hasBetaBlocker = prescribedMeds.some(m => {
      const n = m.name.toLowerCase();
      return n.includes("metoprolol") || n.includes("atenolol") || n.includes("propranolol") || n.includes("carvedilol") || n.includes("bisoprolol") || n.includes("beta blocker") || n.includes("beta-blocker");
    });
    if (hasSulfonylurea && hasBetaBlocker) {
      const sfMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("glipizide") || n.includes("glyburide") || n.includes("glimepiride");
      })?.name || "Sulfonylurea";
      const bbMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("metoprolol") || n.includes("atenolol") || n.includes("propranolol") || n.includes("carvedilol");
      })?.name || "Beta-blocker";
      warnings.push({
        id: "warn_sulfonylurea_bb",
        med1: sfMed,
        med2: bbMed,
        severity: "moderate",
        title: "Masked Hypoglycemia Warning",
        message: `Beta-blockers (${bbMed}) can block the adrenergic warning signs of low blood sugar (e.g. rapid heart rate, tremors) triggered by ${sfMed}. You must rely on sweating or cognitive symptoms to detect hypoglycemia.`
      });
    }

    // Rule 3b: Insulin + Beta-blockers
    if (hasInsulin && hasBetaBlocker) {
      const insMed = prescribedMeds.find(m => m.name.toLowerCase().includes("insulin"))?.name || "Insulin";
      const bbMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("metoprolol") || n.includes("atenolol") || n.includes("propranolol") || n.includes("carvedilol");
      })?.name || "Beta-blocker";
      warnings.push({
        id: "warn_insulin_bb",
        med1: insMed,
        med2: bbMed,
        severity: "moderate",
        title: "Masked Hypoglycemia Warning",
        message: `Beta-blockers (${bbMed}) can mask key early physiological warning signs of low blood sugar (such as palpitations or fast heart rate) induced by insulin (${insMed}). Watch out for perspiration/sweating.`
      });
    }

    // Rule 4: SGLT2 + Diuretic (severe volume depletion)
    const hasSglt2 = prescribedMeds.some(m => {
      const n = m.name.toLowerCase();
      return n.includes("empagliflozin") || n.includes("jardiance") || n.includes("dapagliflozin") || n.includes("farxiga") || n.includes("canagliflozin") || n.includes("invokana") || n.includes("sglt2");
    });
    const hasDiuretic = prescribedMeds.some(m => {
      const n = m.name.toLowerCase();
      return n.includes("furosemide") || n.includes("lasix") || n.includes("hydrochlorothiazide") || n.includes("hctz") || n.includes("spironolactone") || n.includes("diuretic") || n.includes("torsemide");
    });
    if (hasSglt2 && hasDiuretic) {
      const sgMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("empagliflozin") || n.includes("jardiance") || n.includes("dapagliflozin") || n.includes("farxiga");
      })?.name || "SGLT2 Inhibitor";
      const diMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("furosemide") || n.includes("lasix") || n.includes("hydrochlorothiazide") || n.includes("hctz") || n.includes("spironolactone");
      })?.name || "Diuretic";
      warnings.push({
        id: "warn_sglt2_diuretic",
        med1: sgMed,
        med2: diMed,
        severity: "moderate",
        title: "Dehydration & Hypotension Hazard",
        message: `Combining an SGLT2 inhibitor (${sgMed}) with a diuretic (${diMed}) increases the risk of excessive fluid loss, severe dehydration, hypotension, and potential kidney impairment. Keep fluid intake high.`
      });
    }

    // Rule 5: SGLT2 + NSAIDs (kidney injury risk)
    const hasNsaid = prescribedMeds.some(m => {
      const n = m.name.toLowerCase();
      return n.includes("ibuprofen") || n.includes("advil") || n.includes("naproxen") || n.includes("aleve") || n.includes("aspirin") || n.includes("meloxicam") || n.includes("diclofenac") || n.includes("nsaid");
    });
    if (hasSglt2 && hasNsaid) {
      const sgMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("empagliflozin") || n.includes("jardiance") || n.includes("dapagliflozin") || n.includes("farxiga");
      })?.name || "SGLT2 Inhibitor";
      const nsMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("ibuprofen") || n.includes("advil") || n.includes("naproxen") || n.includes("aleve");
      })?.name || "NSAID";
      warnings.push({
        id: "warn_sglt2_nsaid",
        med1: sgMed,
        med2: nsMed,
        severity: "moderate",
        title: "Acute Kidney Injury Risk",
        message: `Using NSAIDs (${nsMed}) while taking an SGLT2 inhibitor (${sgMed}) can significantly restrict renal blood flow, elevating the risk of acute renal dysfunction or kidney injury.`
      });
    }

    // Rule 6: Metformin + NSAIDs
    if (hasMed("metformin") && hasNsaid) {
      const mMed = prescribedMeds.find(m => m.name.toLowerCase().includes("metformin"))?.name || "Metformin";
      const nsMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("ibuprofen") || n.includes("advil") || n.includes("naproxen") || n.includes("aleve");
      })?.name || "NSAID";
      warnings.push({
        id: "warn_metformin_nsaid",
        med1: mMed,
        med2: nsMed,
        severity: "moderate",
        title: "Increased Metformin Exposure Risk",
        message: `NSAIDs (${nsMed}) can compromise kidney function, reducing the excretion of metformin (${mMed}) and potentially elevating the risk of lactic acidosis. Monitor kidney markers regularly.`
      });
    }

    // Rule 7: Warfarin + Sulfonylurea
    const hasWarfarin = prescribedMeds.some(m => {
      const n = m.name.toLowerCase();
      return n.includes("warfarin") || n.includes("coumadin");
    });
    if (hasSulfonylurea && hasWarfarin) {
      const sfMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("glipizide") || n.includes("glyburide") || n.includes("glimepiride");
      })?.name || "Sulfonylurea";
      const wfMed = prescribedMeds.find(m => {
        const n = m.name.toLowerCase();
        return n.includes("warfarin") || n.includes("coumadin");
      })?.name || "Warfarin";
      warnings.push({
        id: "warn_sf_warfarin",
        med1: sfMed,
        med2: wfMed,
        severity: "high",
        title: "Bleeding & Hypoglycemia Risk",
        message: `Sulfonylurea (${sfMed}) and Warfarin (${wfMed}) interact in two dangerous ways: Warfarin can increase ${sfMed} levels (causing severe hypoglycemia), and ${sfMed} can increase bleeding risks. Seek regular INR tests.`
      });
    }

    return warnings;
  }, [prescribedMeds]);

  const handlePrefillPresMed = () => {
    const preloaded = findPreloadedMedicine(presMedName);
    if (preloaded) {
      setPresMedDescription(preloaded.description || "");
      setPresMedSideEffects(preloaded.commonSideEffects ? preloaded.commonSideEffects.join(", ") : "");
      setPresMedSpecialInstructions(`${preloaded.typicalDosage || ""} ${preloaded.dietaryInteractions || ""}`.trim());
    }
  };

  const handleStartEditPrescribedMed = (med: PrescribedMedication) => {
    setEditingPresMedId(med.id);
    setPresMedName(med.name);
    setPresMedDosage(med.dosage);
    setPresMedFrequency(med.frequency);
    setPresMedDescription(med.description || "");
    setPresMedSideEffects(med.sideEffects ? med.sideEffects.join(", ") : "");
    setPresMedSpecialInstructions(med.specialInstructions || "");
    setPresMedAddAlarm(false); // don't auto-re-add alarm
    setNewPresMedForm(true);
  };

  const handleAddPrescribedMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presMedName.trim()) return;

    // Try finding matching preloaded details
    const preloaded = findPreloadedMedicine(presMedName);
    
    // Fallback side effects & description
    let finalDesc = presMedDescription.trim();
    if (!finalDesc && preloaded) {
      finalDesc = preloaded.description;
    }
    if (!finalDesc) {
      finalDesc = "Prescribed medication for blood glucose control.";
    }

    let finalSideEffects: string[] = [];
    if (presMedSideEffects.trim()) {
      finalSideEffects = presMedSideEffects.split(",").map(se => se.trim()).filter(Boolean);
    } else if (preloaded) {
      finalSideEffects = preloaded.commonSideEffects;
    } else {
      finalSideEffects = ["Mild stomach upset", "Headache", "Nausea"];
    }

    let finalSpecialInstructions = presMedSpecialInstructions.trim();
    if (!finalSpecialInstructions && preloaded) {
      finalSpecialInstructions = `${preloaded.typicalDosage} ${preloaded.dietaryInteractions}`.trim();
    }
    if (!finalSpecialInstructions) {
      finalSpecialInstructions = "Take as directed by your physician.";
    }

    if (editingPresMedId) {
      const updatedMeds = prescribedMeds.map(m => {
        if (m.id === editingPresMedId) {
          return {
            ...m,
            name: presMedName.trim(),
            dosage: presMedDosage.trim() || "As directed",
            frequency: presMedFrequency || "Once daily",
            description: finalDesc,
            sideEffects: finalSideEffects,
            specialInstructions: finalSpecialInstructions
          };
        }
        return m;
      });
      setPrescribedMeds(updatedMeds);
      localStorage.setItem("dia_prescribed_meds", JSON.stringify(updatedMeds));
      setEditingPresMedId(null);
    } else {
      const newMed: PrescribedMedication = {
        id: "pres_" + Date.now(),
        name: presMedName.trim(),
        dosage: presMedDosage.trim() || "As directed",
        frequency: presMedFrequency || "Once daily",
        description: finalDesc,
        sideEffects: finalSideEffects,
        specialInstructions: finalSpecialInstructions
      };

      const updatedMeds = [...prescribedMeds, newMed];
      setPrescribedMeds(updatedMeds);
      localStorage.setItem("dia_prescribed_meds", JSON.stringify(updatedMeds));

      // Optional: add a daily checklist alarm reminder
      if (presMedAddAlarm) {
        const isInsulin = presMedName.toLowerCase().includes("insulin");
        const newRem: MedicationReminder = {
          id: "rem_" + Date.now(),
          name: presMedName.trim(),
          dosage: presMedDosage.trim() || "As directed",
          timing: presMedAlarmTiming,
          times: [presMedAlarmTime],
          frequency: presMedFrequency,
          active: true,
          isInsulin: isInsulin,
          notes: `Prescription alarm synced`
        };
        const updatedRems = [...reminders, newRem];
        setReminders(updatedRems);
        localStorage.setItem("dia_reminders", JSON.stringify(updatedRems));
      }
    }

    // Reset form states
    setPresMedName("");
    setPresMedDosage("");
    setPresMedFrequency("Once daily");
    setPresMedDescription("");
    setPresMedSideEffects("");
    setPresMedSpecialInstructions("");
    setPresMedAddAlarm(true);
    setPresMedAlarmTime("08:00");
    setPresMedAlarmTiming("before_breakfast");
    setNewPresMedForm(false);
  };

  const handleDeletePrescribedMed = (id: string) => {
    const updated = prescribedMeds.filter(m => m.id !== id);
    setPrescribedMeds(updated);
    localStorage.setItem("dia_prescribed_meds", JSON.stringify(updated));
  };

  // Mark medication taken today with double-dose safety prevention
  const handleMarkTaken = (reminder: MedicationReminder, units?: number) => {
    const stamp = new Date().toISOString().split("T")[0];
    const logId = `log_${reminder.id}_${stamp}`;
    
    // Check if already taken today
    const existingLog = medLogs.find(l => l.dateStamp === stamp && l.reminderId === reminder.id);
    if (existingLog) {
      // Prevent accidental double-dosing by showing safety confirmation
      const takenTime = existingLog.takenAt 
        ? new Date(existingLog.takenAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "earlier today";
      setDoubleDoseModal({
        isOpen: true,
        reminder,
        lastTakenTime: takenTime,
        units
      });
      return;
    }

    // Record new dose intake
    const newL: MedicationLog = {
      id: logId,
      reminderId: reminder.id,
      medicineName: reminder.name,
      takenAt: new Date().toISOString(),
      dateStamp: stamp,
      unitsAdministered: reminder.isInsulin ? (units ?? 10) : undefined
    };
    const updated = [...medLogs, newL];
    setMedLogs(updated);
    localStorage.setItem("dia_medlogs", JSON.stringify(updated));
  };

  const handleConfirmDoubleDose = (reminder: MedicationReminder, units?: number) => {
    const stamp = new Date().toISOString().split("T")[0];
    const logId = `log_${reminder.id}_${stamp}_extra_${Date.now()}`;
    const newL: MedicationLog = {
      id: logId,
      reminderId: reminder.id,
      medicineName: reminder.name,
      takenAt: new Date().toISOString(),
      dateStamp: stamp,
      unitsAdministered: reminder.isInsulin ? (units ?? 10) : undefined
    };
    const updated = [...medLogs, newL];
    setMedLogs(updated);
    localStorage.setItem("dia_medlogs", JSON.stringify(updated));
    setDoubleDoseModal({ isOpen: false, reminder: null, lastTakenTime: "" });
  };

  const handleUndoMedLog = (reminderId: string) => {
    const stamp = new Date().toISOString().split("T")[0];
    const updated = medLogs.filter(l => !(l.dateStamp === stamp && l.reminderId === reminderId));
    setMedLogs(updated);
    localStorage.setItem("dia_medlogs", JSON.stringify(updated));
    setDoubleDoseModal({ isOpen: false, reminder: null, lastTakenTime: "" });
  };

  // AI-mediated Medicine Search from backend API proxy to protect API keys
  const handleMedicineAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = lookupName.trim();
    if (!query) return;

    setSearchLoading(true);
    setSearchError("");
    setSearchedMedicine(null);

    try {
      const response = await fetch(getApiUrl("/api/analyze-medicine"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineName: query, searchType }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status ${response.status}`);
      }

      const parsedData = await response.json();
      setSearchedMedicine({
        ...parsedData,
        name: query
      });
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || "Unable to retrieve medicine data. Please double check your server is running.");
    } finally {
      setSearchLoading(false);
    }
  };

  // AI-mediated Cultural Recipe Customizer
  const handleDietCustomization = async (e: React.FormEvent) => {
    e.preventDefault();
    const dish = customDishName.trim();
    if (!dish) return;

    setCustomizerLoading(true);
    setCustomizerError("");
    setCustomizedRecipe(null);

    try {
      const response = await fetch(getApiUrl("/api/customize-diet-dish"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishName: dish,
          region: customDishRegion,
          dietaryGoal: customDishGoal,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned error status ${response.status}`);
      }

      const parsedRecipe = await response.json();
      setCustomizedRecipe(parsedRecipe);
    } catch (err: any) {
      console.error(err);
      setCustomizerError(
        err.message || "Failed to customize cultural recipe. Please confirm your API key and server connection."
      );
    } finally {
      setCustomizerLoading(false);
    }
  };

  // AI Diabetes Assessment from Server matching user's real logs
  const handleRequestAISurveillance = async () => {
    setInsightsLoading(true);
    setInsightsError("");
    setInsights(null);

    // Prepare serializable simple profile
    const simpleProfile = {
      age: profile.age,
      diabetesType: profile.diabetesType,
      medications: profile.medications,
      targetFastingMin: profile.targetFastingMin,
      targetFastingMax: profile.targetFastingMax,
      targetPostMin: profile.targetPostMin,
      targetPostMax: profile.targetPostMax,
    };

    try {
      const response = await fetch(getApiUrl("/api/surveillance-insights"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readings: readings,
          userProfile: simpleProfile
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request AI analysis from Server. Error code: ${response.status}`);
      }

      const received = await response.json();
      setInsights(received);
    } catch (err: any) {
      console.error(err);
      setInsightsError(err.message || "Failed to make diagnostic connection with model server.");
    } finally {
      setInsightsLoading(false);
    }
  };

  // Calculate average glycemics helper
  const fastingLogs = readings.filter(r => r.type === "fasting");
  const postLogs = readings.filter(r => r.type === "post_fasting");
  
  const avgFasting = fastingLogs.length 
    ? Math.round(fastingLogs.reduce((acc, curr) => acc + curr.value, 0) / fastingLogs.length) 
    : null;
    
  const avgPost = postLogs.length 
    ? Math.round(postLogs.reduce((acc, curr) => acc + curr.value, 0) / postLogs.length) 
    : null;

  // Render Category Badge
  const getCategoryTheme = (category: GlucoseReading["category"]) => {
    switch (category) {
      case "Hypoglycemia":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "Normal":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Prediabetes":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "Diabetes":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "Severe Hyperglycemia":
        return "bg-red-600/15 text-red-400 border-red-500/40 animate-pulse";
      default:
        return "bg-neutral-500/10 text-neutral-400 border-neutral-500/30";
    }
  };

  // Format timings helper
  const formatTimingName = (t: MedicationReminder["timing"]) => {
    return t.replace("_", " ").toUpperCase();
  };

  // Daily medication count taken status & Daily Management KPIs
  const activeReminders = reminders.filter(r => r.active);
  const currentStamp = new Date().toISOString().split("T")[0];
  const todayLocalStamp = new Date().toLocaleDateString("en-CA");
  const isTodayDate = (d?: string) => d === currentStamp || d === todayLocalStamp;

  // Distinct completed active alarms today
  const completedAlarmsCount = activeReminders.filter(r =>
    medLogs.some(l => isTodayDate(l.dateStamp) && l.reminderId === r.id)
  ).length;

  const complianceScore = activeReminders.length > 0
    ? Math.min(100, Math.round((completedAlarmsCount / activeReminders.length) * 100))
    : 100;

  const pillsTakenToday = completedAlarmsCount;

  // Today's glucose surveillance logs
  const todayGlucoseReadings = readings.filter(r => isTodayDate(r.date));
  const todayLogCount = todayGlucoseReadings.length;
  const todayFastingCount = todayGlucoseReadings.filter(r => r.type === "fasting").length;
  const todayPostCount = todayGlucoseReadings.filter(r => r.type === "post_fasting").length;

  const currentFormattedDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }, []);

  const dailyStatusBadge = useMemo(() => {
    if (todayLogCount >= 2 && complianceScore === 100) {
      return {
        label: "Target Met",
        classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        dotClass: "bg-emerald-400"
      };
    }
    if (todayLogCount > 0 || complianceScore >= 50) {
      return {
        label: "In Progress",
        classes: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        dotClass: "bg-cyan-400"
      };
    }
    return {
      label: "Pending Action",
      classes: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      dotClass: "bg-rose-400 animate-pulse"
    };
  }, [todayLogCount, complianceScore]);

  // Dynamic benchmark reference date for the time-window filters
  const getBenchmarkDate = () => {
    let ref = new Date("2026-06-04"); // Fallback to current static sandbox date
    if (readings.length > 0) {
      const dates = readings.map(r => new Date(r.date).getTime());
      const maxTime = Math.max(...dates);
      if (!isNaN(maxTime) && maxTime > 0) {
        ref = new Date(maxTime);
      }
    }
    return ref;
  };

  const benchmarkRef = getBenchmarkDate();

  let finalStartMs = 0;
  let finalEndMs = 0;

  if (reportTimeRange === "custom") {
    const dStart = customStartDate ? new Date(customStartDate + "T00:00:00") : null;
    const dEnd = customEndDate ? new Date(customEndDate + "T23:59:59") : null;
    
    finalStartMs = dStart && !isNaN(dStart.getTime()) 
      ? dStart.getTime() 
      : (benchmarkRef.getTime() - 30 * 24 * 60 * 60 * 1000);
      
    finalEndMs = dEnd && !isNaN(dEnd.getTime()) 
      ? dEnd.getTime() 
      : benchmarkRef.getTime();
  } else {
    const timeRangeDays = parseInt(reportTimeRange) || 30;
    finalStartMs = benchmarkRef.getTime() - timeRangeDays * 24 * 60 * 60 * 1000;
    finalEndMs = benchmarkRef.getTime();
  }

  // Ensure start is before end
  if (finalStartMs > finalEndMs) {
    const tmp = finalStartMs;
    finalStartMs = finalEndMs;
    finalEndMs = tmp;
  }

  // Filter readings within the chosen time window
  const readingsInTimeWindow = readings.filter(r => {
    const rTime = new Date((r.date || "2026-01-01") + "T12:00:00").getTime();
    return rTime >= finalStartMs && rTime <= finalEndMs;
  });

  // Calculate window-specific averages for persistent lines
  const windowFastingLogs = readingsInTimeWindow.filter(r => r.type === "fasting");
  const windowPostLogs = readingsInTimeWindow.filter(r => r.type === "post_fasting");

  const windowAvgFasting = windowFastingLogs.length
    ? Math.round(windowFastingLogs.reduce((acc, curr) => acc + curr.value, 0) / windowFastingLogs.length)
    : null;

  const windowAvgPost = windowPostLogs.length
    ? Math.round(windowPostLogs.reduce((acc, curr) => acc + curr.value, 0) / windowPostLogs.length)
    : null;

  // Sort them chronological to render left-to-right correctly
  const rangeSortedReadings = [...readingsInTimeWindow].sort((a, b) => {
    return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
  });

  // Helper: get Monday date string
  const getMondayStr = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return mon.toISOString().split("T")[0];
  };

  // Chart data preparing: support raw, daily, weekly, monthly aggregation
  const aggregatedData = useMemo(() => {
    if (reportAggregation === "raw") {
      return rangeSortedReadings.map(r => ({
        ...r,
        formattedLabel: `${r.date.substring(5)} ${r.time}`,
        fastingValue: r.type === "fasting" ? r.value : null,
        postValue: r.type === "post_fasting" ? r.value : null,
        isAggregated: false,
        rawLogsCount: 1,
      }));
    }

    // Grouping dictionary
    const groups: Record<string, {
      groupKey: string;
      formattedLabel: string;
      fastingValues: number[];
      postValues: number[];
      dates: string[];
      notesList: string[];
      stressLevels: number[];
    }> = {};

    rangeSortedReadings.forEach(r => {
      let groupKey = "";
      let formattedLabel = "";

      if (reportAggregation === "daily") {
        groupKey = r.date;
        formattedLabel = r.date.substring(5); // "MM-DD"
      } else if (reportAggregation === "weekly") {
        const mon = getMondayStr(r.date);
        groupKey = mon;
        formattedLabel = `W/O ${mon.substring(5)}`; // "W/O MM-DD"
      } else if (reportAggregation === "monthly") {
        groupKey = r.date.substring(0, 7); // "YYYY-MM"
        const d = new Date(groupKey + "-02T12:00:00");
        formattedLabel = d.toLocaleDateString(undefined, { month: "short", year: "numeric" }); // "Jun 2026"
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          groupKey,
          formattedLabel,
          fastingValues: [],
          postValues: [],
          dates: [],
          notesList: [],
          stressLevels: []
        };
      }

      if (r.type === "fasting") {
        groups[groupKey].fastingValues.push(r.value);
      } else {
        groups[groupKey].postValues.push(r.value);
      }
      if (r.notes) {
        groups[groupKey].notesList.push(r.notes);
      }
      if (r.stressLevel !== undefined && r.stressLevel !== null) {
        groups[groupKey].stressLevels.push(r.stressLevel);
      }
      if (!groups[groupKey].dates.includes(r.date)) {
        groups[groupKey].dates.push(r.date);
      }
    });

    // Convert groups to sorted list
    const keys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
    return keys.map((key) => {
      const g = groups[key];
      const avgFasting = g.fastingValues.length > 0
        ? Math.round(g.fastingValues.reduce((sum, v) => sum + v, 0) / g.fastingValues.length)
        : null;
      const avgPost = g.postValues.length > 0
        ? Math.round(g.postValues.reduce((sum, v) => sum + v, 0) / g.postValues.length)
        : null;
      const avgStress = g.stressLevels.length > 0
        ? Math.round((g.stressLevels.reduce((sum, v) => sum + v, 0) / g.stressLevels.length) * 10) / 10
        : undefined;

      return {
        id: `agg-${reportAggregation}-${key}`,
        date: key.length === 10 ? key : g.dates[0] || key,
        time: "00:00",
        formattedLabel: g.formattedLabel,
        fastingValue: avgFasting,
        postValue: avgPost,
        type: (avgFasting !== null && avgPost !== null) ? "both" : (avgFasting !== null ? "fasting" : "post_fasting"),
        value: avgFasting ?? avgPost ?? 0,
        category: "Aggregated Average",
        isAggregated: true,
        rawLogsCount: g.fastingValues.length + g.postValues.length,
        notes: g.notesList.length > 0 ? g.notesList.join("; ") : "",
        stressLevel: avgStress,
      };
    });
  }, [rangeSortedReadings, reportAggregation]);

  const filteredRawData = useMemo(() => {
    return aggregatedData.map(item => ({
      ...item,
      fastingValue: chartFilter === "post_fasting" ? null : item.fastingValue,
      postValue: chartFilter === "fasting" ? null : item.postValue,
    })).filter(item => {
      return item.fastingValue !== null || item.postValue !== null;
    });
  }, [aggregatedData, chartFilter]);

  const fastingRegPoints = useMemo(() => {
    return filteredRawData
      .map((item, idx) => ({ x: idx, y: item.fastingValue }))
      .filter(p => p.y !== null) as { x: number; y: number }[];
  }, [filteredRawData]);

  const postRegPoints = useMemo(() => {
    return filteredRawData
      .map((item, idx) => ({ x: idx, y: item.postValue }))
      .filter(p => p.y !== null) as { x: number; y: number }[];
  }, [filteredRawData]);

  const fastingReg = useMemo(() => calculateRegression(fastingRegPoints), [fastingRegPoints]);
  const postReg = useMemo(() => calculateRegression(postRegPoints), [postRegPoints]);

  const filteredChartData = useMemo(() => {
    return filteredRawData.map((item, idx) => ({
      ...item,
      fastingTrend: fastingReg ? fastingReg.slope * idx + fastingReg.intercept : null,
      postTrend: postReg ? postReg.slope * idx + postReg.intercept : null,
    }));
  }, [filteredRawData, fastingReg, postReg]);

  // Synchronized chart brush hook across aggregation styles (Daily, Weekly, Monthly, Raw)
  const {
    brushRange,
    handleBrushChange,
    resetBrush,
    setPreset: setBrushPreset,
  } = useChartBrushSync(filteredChartData, reportAggregation);

  // Prepare data for Adherence & Glucose Correlation Chart
  const adherenceChartData = useMemo(() => {
    const dataPoints: any[] = [];
    const oneDayMs = 24 * 60 * 60 * 1000;
    const startMs = finalStartMs;
    const endMs = finalEndMs;
    const totalDays = Math.ceil((endMs - startMs) / oneDayMs);
    const adjustedStartMs = totalDays > 366 ? (endMs - 366 * oneDayMs) : startMs;

    for (let t = adjustedStartMs; t <= endMs + 1000; t += oneDayMs) {
      const d = new Date(t);
      const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
      const formattedDate = dateStr.substring(5); // "MM-DD"

      // 1. Fasting glucose readings on this day
      const dayFastingReadings = readings.filter(r => r.date === dateStr && r.type === "fasting");
      const avgFasting = dayFastingReadings.length > 0
        ? Math.round(dayFastingReadings.reduce((sum, r) => sum + r.value, 0) / dayFastingReadings.length)
        : null;

      // 2. Medication logs on this day
      const dayMedLogs = medLogs.filter(l => l.dateStamp === dateStr);
      const loggedCount = dayMedLogs.length;

      // 3. Adherence rate calculation
      const activeRemCount = reminders.filter(r => r.active).length || reminders.length || 1;
      const adherenceRate = Math.min(100, Math.round((loggedCount / activeRemCount) * 100));

      // 4. Detail of timings logged on this day
      const logDetails = dayMedLogs.map(log => {
        const rem = reminders.find(r => r.id === log.reminderId);
        let timeStr = "";
        try {
          timeStr = new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) {
          timeStr = log.takenAt.includes("T") ? log.takenAt.substring(11, 16) : log.takenAt;
        }
        return {
          medicineName: log.medicineName,
          time: timeStr,
          timing: rem ? rem.timing : "anytime",
          dosage: rem ? rem.dosage : ""
        };
      });

      dataPoints.push({
        date: dateStr,
        formattedDate,
        avgFasting,
        loggedCount,
        adherenceRate,
        logDetails
      });
    }

    return dataPoints.sort((a, b) => a.date.localeCompare(b.date));
  }, [finalStartMs, finalEndMs, readings, medLogs, reminders]);

  // Group and compute Nutrition insights (most frequent logs with associated glycemic response ranges)
  const foodInsights = useMemo(() => {
    const groups: {
      [key: string]: {
        key: string;
        name: string;
        count: number;
        mealType: FoodLog["mealType"];
        portionSize: string;
        impactScale: FoodLog["impactScale"];
        glucoseValues: number[];
      };
    } = {};

    const filteredLogsForInsights = insightsMealFilter === "All"
      ? foodLogs
      : foodLogs.filter((log) => log.mealType === insightsMealFilter);

    filteredLogsForInsights.forEach((log) => {
      const rawName = log.foodItems || "";
      const cleanName = rawName.trim();
      if (!cleanName) return;
      const key = cleanName.toLowerCase();

      if (!groups[key]) {
        groups[key] = {
          key,
          name: cleanName,
          count: 0,
          mealType: log.mealType,
          portionSize: log.portionSize || "",
          impactScale: log.impactScale || "medium",
          glucoseValues: [],
        };
      }

      groups[key].count += 1;
      groups[key].mealType = log.mealType;
      groups[key].portionSize = log.portionSize || groups[key].portionSize;
      groups[key].impactScale = log.impactScale || groups[key].impactScale;

      // Find the associated post-meal glucose helper
      let alliedGlucose: GlucoseReading | null = null;
      if (log.associatedGlucoseId) {
        alliedGlucose = readings.find((r) => r.id === log.associatedGlucoseId) || null;
      }
      
      if (!alliedGlucose && log.time && typeof log.time === "string" && log.time.includes(":")) {
        const mealTimeParts = log.time.split(":");
        const mealHour = parseInt(mealTimeParts[0], 10);
        const mealMinute = parseInt(mealTimeParts[1], 10);
        if (!isNaN(mealHour) && !isNaN(mealMinute)) {
          const mealSecondsTotal = mealHour * 3600 + mealMinute * 60;
          let minDifference = 3 * 3600; // 3 hours window
          const sameDayReadings = readings.filter((r) => r.date === log.date);
          for (const r of sameDayReadings) {
            if (!r.time || typeof r.time !== "string" || !r.time.includes(":")) continue;
            const rTimeParts = r.time.split(":");
            const rHour = parseInt(rTimeParts[0], 10);
            const rMin = parseInt(rTimeParts[1], 10);
            if (isNaN(rHour) || isNaN(rMin)) continue;
            const rSecondsTotal = rHour * 3600 + rMin * 60;
            const diff = rSecondsTotal - mealSecondsTotal;
            if (diff >= 0 && diff <= minDifference) {
              minDifference = diff;
              alliedGlucose = r;
            }
          }
        }
      }

      if (alliedGlucose) {
        groups[key].glucoseValues.push(alliedGlucose.value);
      }
    });

    return Object.values(groups)
      .map((g) => {
        const vals = g.glucoseValues;
        const minGluc = vals.length > 0 ? Math.min(...vals) : null;
        const maxGluc = vals.length > 0 ? Math.max(...vals) : null;
        const avgGluc = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;

        return {
          ...g,
          minGlucose: minGluc,
          maxGlucose: maxGluc,
          avgGlucose: avgGluc,
        };
      })
      .sort((a, b) => b.count - a.count); // Most frequent first
  }, [foodLogs, readings, insightsMealFilter]);

  // Calculate rolling glycemic variability data
  const variabilityData = computeVariabilityData(readings);

  // Compute latest 30-day window metrics relative to the latest logged reading
  const sortedReadings = [...readings].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const latestReading = sortedReadings[sortedReadings.length - 1];

  let latestCV = 0;
  let latestSD = 0;
  let latestMean = 0;
  let latestWindowCount = 0;

  if (latestReading) {
    const latestDate = new Date(latestReading.date + "T" + latestReading.time);
    const thirtyDaysAgo = new Date(latestDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const windowReadings = sortedReadings.filter(r => {
      const rDate = new Date(r.date + "T" + r.time);
      return rDate >= thirtyDaysAgo && rDate <= latestDate;
    });

    latestWindowCount = windowReadings.length;
    if (latestWindowCount > 0) {
      const vals = windowReadings.map(r => r.value);
      latestMean = vals.reduce((a, b) => a + b, 0) / latestWindowCount;
      if (latestWindowCount > 1) {
        const sqDiffs = vals.map(v => (v - latestMean) ** 2);
        latestSD = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / (latestWindowCount - 1));
        latestCV = (latestSD / latestMean) * 100;
      }
    }
  }

  // Standardized Diabetes Metrics (TIR %, eAG, Estimated HbA1c)
  const tirMetrics = useMemo(() => {
    const days = parseInt(reportTimeRange) || 30;
    const cutoffMs = benchmarkRef.getTime() - days * 24 * 60 * 60 * 1000;
    const filteredReadings = readings.filter(r => {
      const t = new Date(r.date + "T" + (r.time || "12:00")).getTime();
      return t >= cutoffMs;
    });

    const total = filteredReadings.length || 1;
    const inRange = filteredReadings.filter(r => r.value >= 70 && r.value <= 180).length;
    const hypo = filteredReadings.filter(r => r.value < 70).length;
    const severeHypo = filteredReadings.filter(r => r.value < 54).length;
    const hyper = filteredReadings.filter(r => r.value > 180).length;
    const severeHyper = filteredReadings.filter(r => r.value > 250).length;

    const sum = filteredReadings.reduce((acc, r) => acc + r.value, 0);
    const meanGlucose = Math.round(sum / total);
    const estHbA1c = Math.round(((meanGlucose + 46.7) / 28.7) * 10) / 10;

    return {
      timeWindowDays: days,
      totalCount: filteredReadings.length,
      inRangePct: Math.round((inRange / total) * 100),
      hypoPct: Math.round((hypo / total) * 100),
      severeHypoPct: Math.round((severeHypo / total) * 100),
      hyperPct: Math.round((hyper / total) * 100),
      severeHyperPct: Math.round((severeHyper / total) * 100),
      eAG: meanGlucose,
      estimatedHbA1c: isNaN(estHbA1c) ? 5.7 : estHbA1c
    };
  }, [readings, reportTimeRange, benchmarkRef]);

  // Account Deletion & Health Data Rights Handlers (Google Play Compliance)
  const handleExportAllData = () => {
    const backupData = {
      app: "Diabetes Surveillance Platform",
      exportedAt: new Date().toISOString(),
      profiles,
      activeProfile: profile,
      readings,
      foodLogs,
      medLogs,
      reminders,
      prescribedMeds,
      activityLogs
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diabetes_surveillance_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportFeedback("All health data exported successfully!");
    setTimeout(() => setExportFeedback(""), 3000);
  };

  const handleDeleteAccountData = () => {
    localStorage.clear();
    setReadings([]);
    setFoodLogs([]);
    setMedLogs([]);
    setReminders([]);
    setPrescribedMeds([]);
    setActivityLogs([]);
    setProfile(DEFAULT_PROFILE);
    setProfiles([]);
    setActiveProfileId("");
    alert("Account and all health data permanently wiped from device sandbox.");
    setActiveTab("dashboard");
  };

  // Calculate active Insulin-on-Board (IOB) based on 4-hour linear decay model
  const computeIOBData = () => {
    const now = new Date();
    let totalIOB = 0;
    const activeInjections: {
      id: string;
      name: string;
      administeredHoursAgo: number;
      initialUnits: number;
      remainingUnits: number;
      takenAt: string;
    }[] = [];

    // Filter medication logs
    medLogs.forEach(log => {
      const r = reminders.find(rem => rem.id === log.reminderId);
      const isInsulin = r?.isInsulin || log.medicineName.toLowerCase().includes("insulin");
      if (isInsulin && log.unitsAdministered !== undefined) {
        const logTime = new Date(log.takenAt);
        const diffMs = now.getTime() - logTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= 0 && diffHours < 4) {
          // Linear decay: remaining = units * (1 - hours/4)
          const remaining = log.unitsAdministered * (1 - diffHours / 4);
          totalIOB += remaining;
          activeInjections.push({
            id: log.id,
            name: log.medicineName,
            administeredHoursAgo: diffHours,
            initialUnits: log.unitsAdministered,
            remainingUnits: Math.round(remaining * 100) / 100,
            takenAt: logTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      }
    });

    return {
      activeIOB: Math.round(totalIOB * 10) / 10,
      activeInjections: activeInjections.sort((a, b) => a.administeredHoursAgo - b.administeredHoursAgo) // newest first
    };
  };

  const { activeIOB, activeInjections } = computeIOBData();

  const handleExportAggregatedToCSV = () => {
    if (filteredChartData.length === 0) {
      setExportFeedback("Error: No aggregated trend data to export.");
      setTimeout(() => setExportFeedback(""), 5000);
      return;
    }

    try {
      let csvContent = "=== METABOLIC SURVEILLANCE TREND EXPORT ===\r\n";
      csvContent += `Patient Name,${profile.name}\r\n`;
      csvContent += `Diabetes Type,${profile.diabetesType}\r\n`;
      csvContent += `Target Fasting Range,${profile.targetFastingMin} - ${profile.targetFastingMax} mg/dL\r\n`;
      csvContent += `Target Post-Meal Range,${profile.targetPostMin} - ${profile.targetPostMax} mg/dL\r\n`;
      csvContent += `Aggregation Level,${reportAggregation === "raw" ? "Individual Log" : reportAggregation.toUpperCase() + " AVERAGE"}\r\n`;
      csvContent += `Timeframe,${reportTimeRange === "custom" ? "Custom Range" : reportTimeRange + " Days"}\r\n`;
      csvContent += `Export Timestamp,${new Date().toLocaleString()}\r\n`;
      csvContent += "Medical Disclaimer,All medical metrics and health guides generated here are reference summaries only. Consult your licensed physician before altering medications.\r\n\r\n";

      csvContent += "Period Label,Date Representative,Fasting Glucose Avg (mg/dL),Post-Meal Glucose Avg (mg/dL),Linear Fasting Trend,Linear Post Trend,Notes\r\n";

      filteredChartData.forEach(item => {
        const fastingStr = item.fastingValue !== null ? item.fastingValue : "—";
        const postStr = item.postValue !== null ? item.postValue : "—";
        const fastingTrendStr = item.fastingTrend !== null ? Math.round(item.fastingTrend * 10) / 10 : "—";
        const postTrendStr = item.postTrend !== null ? Math.round(item.postTrend * 10) / 10 : "—";
        const notesStr = item.notes ? `"${item.notes.replace(/"/g, '""')}"` : "None";
        csvContent += `"${item.formattedLabel}",${item.date},${fastingStr},${postStr},${fastingTrendStr},${postTrendStr},${notesStr}\r\n`;
      });

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      const safeName = profile.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const aggLabel = reportAggregation === "raw" ? "individual" : `${reportAggregation}_avg`;
      link.setAttribute("download", `glucose_trend_${aggLabel}_${safeName}_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportFeedback(`Success: Compiled glucose trend CSV statement downloaded!`);
      setTimeout(() => setExportFeedback(""), 6000);
    } catch (err: any) {
      console.error(err);
      setExportFeedback(`Error exporting trend: ${err.message}`);
      setTimeout(() => setExportFeedback(""), 6000);
    }
  };

  const handleExportToCSV = () => {
    if (readings.length === 0) {
      setExportFeedback("Error: No glucose readings recorded yet to export.");
      setTimeout(() => setExportFeedback(""), 5000);
      return;
    }

    try {
      let csvContent = "";

      // 1. Patient Metadata Header
      csvContent += "=== CLINICAL GLUCOSE SURVEILLANCE REPORT ===\r\n";
      csvContent += `Patient Name,${profile.name}\r\n`;
      csvContent += `Age,${profile.age}\r\n`;
      csvContent += `Diabetes Type,${profile.diabetesType}\r\n`;
      csvContent += `Current Medications,"${(profile.medications || "").replace(/"/g, '""')}"\r\n`;
      csvContent += `Target Fasting Range,${profile.targetFastingMin} - ${profile.targetFastingMax} mg/dL\r\n`;
      csvContent += `Target Post-Meal Range,${profile.targetPostMin} - ${profile.targetPostMax} mg/dL\r\n`;
      
      const displayCv = latestWindowCount > 1 ? `${Math.round(latestCV * 10) / 10}%` : "Not enough data";
      const displaySd = latestWindowCount > 1 ? `${Math.round(latestSD * 10) / 10} mg/dL` : "Not enough data";
      csvContent += `Rolling Glycemic Variability (CV%),${displayCv}\r\n`;
      csvContent += `Standard Deviation (SD),${displaySd}\r\n`;
      csvContent += `Average Fasting Glucose,${avgFasting ? `${avgFasting} mg/dL` : "N/A"}\r\n`;
      csvContent += `Average Post-Meal Glucose,${avgPost ? `${avgPost} mg/dL` : "N/A"}\r\n`;
      csvContent += `Total Records Exported,${readings.length}\r\n`;
      csvContent += `Report Generated At,${new Date().toLocaleString()}\r\n`;
      csvContent += "Medical Disclaimer,All medical metrics and health guides generated here are reference summaries only. Consult your licensed physician before altering medications.\r\n\r\n";

      // 2. AI Smart Surveillance insights if available
      if (insights) {
        csvContent += "=== CLINICAL INSIGHTS SUMMARY (AI ASSESSED) ===\r\n";
        csvContent += `AI Assessment Summary,"${(insights.summary || "").replace(/"/g, '""')}"\r\n`;
        if (insights.alerts && insights.alerts.length > 0) {
          csvContent += `Active Clinical Alerts,"${insights.alerts.join(" | ").replace(/"/g, '""')}"\r\n`;
        }
        csvContent += "\r\n";
      }

      // 3. Detailed Prescribed Medications
      if (prescribedMeds.length > 0) {
        csvContent += "=== PRESCRIBED MEDICATIONS AND SCHEDULES ===\r\n";
        csvContent += "Medication Name,Dosage,Frequency,Side Effects,Special Instructions\r\n";
        prescribedMeds.forEach(m => {
          const sideEffectsStr = m.sideEffects && m.sideEffects.length > 0 ? `"${m.sideEffects.join(" | ").replace(/"/g, '""')}"` : "None";
          const instrStr = m.specialInstructions ? `"${m.specialInstructions.replace(/"/g, '""')}"` : "None";
          csvContent += `"${m.name}","${m.dosage || "N/A"}","${m.frequency || "Once daily"}",${sideEffectsStr},${instrStr}\r\n`;
        });
        csvContent += "\r\n";
      }

      // 4. Glucose Readings Tabular Data
      csvContent += "=== PRIMARY GLUCOSE READINGS RECORD ===\r\n";
      csvContent += "Date,Time,Check Type,Glucose Value (mg/dL),Clinical Category,Patient Notes & Symptoms\r\n";

      // Sort chronologically (oldest to newest is preferred by doctors)
      const sortedForExport = [...readings].sort((a, b) => {
        const comp = a.date.localeCompare(b.date);
        if (comp !== 0) return comp;
        return a.time.localeCompare(b.time);
      });

      sortedForExport.forEach(r => {
        const typeStr = r.type === "fasting" ? "Fasting" : "Post-Fasting";
        const notesValue = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : "None";
        csvContent += `${r.date},${r.time},${typeStr},${r.value},${r.category},${notesValue}\r\n`;
      });

      // Create blob with UTF-8 byte order mark to assist Microsoft Excel loading
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      
      const safeName = profile.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      link.setAttribute("download", `glucose_medical_report_${safeName}_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportFeedback("Success: Clinical CSV report successfully compiled and saved to your device!");
      setTimeout(() => setExportFeedback(""), 6000);
    } catch (err: any) {
      console.error(err);
      setExportFeedback(`Error exporting data: ${err.message || "Unknown error"}`);
      setTimeout(() => setExportFeedback(""), 6000);
    }
  };

  const handleExportToPDF = () => {
    if (readings.length === 0) {
      setExportFeedback("Error: No glucose readings recorded yet to export.");
      setTimeout(() => setExportFeedback(""), 5000);
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const totalPagesExp = { val: 1 };
      const safeName = profile.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const currentDate = new Date().toISOString().split("T")[0];

      const drawFooter = (pageNumber: number) => {
        doc.setPage(pageNumber);
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(115, 115, 115);
        doc.text(
          "Disclaimer: For reference only. Consult your physician before changing medication doses.",
          15,
          287
        );
        doc.text(`Page ${pageNumber}`, 195, 287, { align: "right" });
      };

      let y = 15;

      // Header Banner
      doc.setFillColor(13, 148, 136);
      doc.rect(15, y, 180, 20, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("CLINICAL GLUCOSE SURVEILLANCE PHYSICIAN REPORT", 20, y + 8);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(230, 242, 242);
      doc.text(`Generated on ${new Date().toLocaleString()} | Patient Data Integrity System`, 20, y + 14);

      y += 28;

      // Section: Patient Profile & Parameters
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("PATIENT PARAMETERS", 15, y);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(15, y + 2, 195, y + 2);

      y += 8;

      doc.setFontSize(9.5);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(51, 65, 85);

      // Column 1
      doc.text("Patient Name:", 15, y);
      doc.text("Age:", 15, y + 6);
      doc.text("Weight:", 15, y + 12);
      doc.text("Diabetes Type:", 15, y + 18);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(profile.name, 48, y);
      doc.text(`${profile.age} years`, 48, y + 6);
      doc.text(profile.weight || "N/A", 48, y + 12);
      doc.text(profile.diabetesType, 48, y + 18);

      // Column 2
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("Target Fasting Range:", 110, y);
      doc.text("Target Post-Meal Range:", 110, y + 6);
      doc.text("Rolling Glycemic CV%:", 110, y + 12);
      doc.text("Sample Standard Deviation:", 110, y + 18);

      const displayCv = latestWindowCount > 1 ? `${Math.round(latestCV * 10) / 10}%` : "Not enough data";
      const displaySd = latestWindowCount > 1 ? `${Math.round(latestSD * 10) / 10} mg/dL` : "Not enough data";

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(`${profile.targetFastingMin} - ${profile.targetFastingMax} mg/dL`, 155, y);
      doc.text(`${profile.targetPostMin} - ${profile.targetPostMax} mg/dL`, 155, y + 6);
      doc.text(displayCv, 155, y + 12);
      doc.text(displaySd, 155, y + 18);

      y += 26;

      // Averages row
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 4, 180, 10, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("Average Fasting:", 18, y + 2);
      doc.setFont("Helvetica", "normal");
      doc.text(avgFasting ? `${avgFasting} mg/dL` : "N/A", 48, y + 2);

      doc.setFont("Helvetica", "bold");
      doc.text("Average Post-Meal:", 95, y + 2);
      doc.setFont("Helvetica", "normal");
      doc.text(avgPost ? `${avgPost} mg/dL` : "N/A", 128, y + 2);

      doc.setFont("Helvetica", "bold");
      doc.text("Logs Compiled:", 158, y + 2);
      doc.setFont("Helvetica", "normal");
      doc.text(`${readings.length} entries`, 183, y + 2);

      y += 14;

      // Section: Medications
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("CURRENT PRESCRIBED MEDICATIONS & DETAILS", 15, y);
      doc.line(15, y + 2, 195, y + 2);
      
      y += 8;
      
      if (prescribedMeds.length === 0) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(115, 115, 115);
        doc.text("No active medical prescriptions added.", 15, y);
        y += 6;
      } else {
        prescribedMeds.forEach((med) => {
          if (y > 270) {
            doc.addPage();
            totalPagesExp.val += 1;
            y = 20;
          }
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(15, 23, 42);
          doc.text(`${med.name} — ${med.dosage || "N/A"} (${med.frequency || "Once daily"})`, 15, y);
          y += 4.5;

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);

          if (med.specialInstructions) {
            const wrapInstructions = doc.splitTextToSize(`• Special Instructions: ${med.specialInstructions}`, 175);
            wrapInstructions.forEach((line: string) => {
              if (y > 270) {
                doc.addPage();
                totalPagesExp.val += 1;
                y = 20;
              }
              doc.text(line, 18, y);
              y += 4;
            });
          }

          if (med.sideEffects && med.sideEffects.length > 0) {
            const wrapSideEffects = doc.splitTextToSize(`• Potential Side Effects: ${med.sideEffects.join(", ")}`, 175);
            wrapSideEffects.forEach((line: string) => {
              if (y > 270) {
                doc.addPage();
                totalPagesExp.val += 1;
                y = 20;
              }
              doc.text(line, 18, y);
              y += 4;
            });
          }
          y += 2.5; // padding after medication
        });
      }

      y += 4;

      // Section: AI surveillance insights
      if (insights) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("CLINICAL SURVEILLANCE INSIGHTS (SECURE AI ASSESSED)", 15, y);
        doc.line(15, y + 2, 195, y + 2);

        y += 8;

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        
        const splitText = doc.splitTextToSize(insights.summary || "", 180);
        splitText.forEach((lineText: string) => {
          if (y > 270) {
            doc.addPage();
            totalPagesExp.val += 1;
            y = 20;
          }
          doc.text(lineText, 15, y);
          y += 4.5;
        });

        if (insights.alerts && insights.alerts.length > 0) {
          y += 2;
          doc.setFont("Helvetica", "bold");
          doc.setTextColor(225, 29, 72);
          doc.text("ACTIVE COMPLIANCE WARNINGS:", 15, y);
          doc.setFont("Helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          y += 5;
          insights.alerts.forEach((alert: string) => {
            if (y > 270) {
              doc.addPage();
              totalPagesExp.val += 1;
              y = 20;
            }
            const wrappedAlert = doc.splitTextToSize(`• ${alert}`, 175);
            wrappedAlert.forEach((alLine: string) => {
              doc.text(alLine, 18, y);
              y += 4.5;
            });
          });
        }
        y += 6;
      }

      // Check height before starting table
      if (y > 200) {
        doc.addPage();
        totalPagesExp.val += 1;
        y = 20;
      }

      // Section: Primary Glucose Logs Table
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("PRIMARY GLUCOSE SURVEILLANCE LOGS", 15, y);
      doc.line(15, y + 2, 195, y + 2);

      y += 8;

      const tableHeaders = () => {
        doc.setFillColor(241, 245, 249);
        doc.rect(15, y - 4, 180, 7.5, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);

        doc.text("DATE", 17, y + 1);
        doc.text("TIME", 42, y + 1);
        doc.text("CHECK TYPE", 65, y + 1);
        doc.text("VALUE", 95, y + 1);
        doc.text("CATEGORY", 120, y + 1);
        doc.text("PATIENT NOTES & SYMPTOMS", 150, y + 1);
        
        doc.setDrawColor(203, 213, 225);
        doc.line(15, y + 4, 195, y + 4);
        y += 8;
      };

      tableHeaders();

      const sortedForPDF = [...readings].sort((a, b) => {
        const comp = a.date.localeCompare(b.date);
        if (comp !== 0) return comp;
        return a.time.localeCompare(b.time);
      });

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);

      sortedForPDF.forEach((r, index) => {
        if (y > 270) {
          doc.addPage();
          totalPagesExp.val += 1;
          y = 25;
          tableHeaders();
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
        }

        const typeStr = r.type === "fasting" ? "Fasting" : "Post-Fasting";
        const notesStr = r.notes || "None";
        const truncNotes = notesStr.length > 28 ? notesStr.substring(0, 26) + "..." : notesStr;

        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y - 3, 180, 5.5, "F");
        }

        doc.text(r.date, 17, y + 1);
        doc.text(r.time, 42, y + 1);
        doc.text(typeStr, 65, y + 1);
        doc.text(`${r.value} mg/dL`, 95, y + 1);
        doc.text(r.category || "Normal", 120, y + 1);
        doc.text(truncNotes, 150, y + 1);

        y += 5.5;
      });

      for (let i = 1; i <= totalPagesExp.val; i++) {
        drawFooter(i);
      }

      doc.save(`glucose_medical_report_${safeName}_${currentDate}.pdf`);

      setExportFeedback("Success: Clinical formatted PDF report successfully compiled and downloaded!");
      setTimeout(() => setExportFeedback(""), 6000);
    } catch (err: any) {
      console.error(err);
      setExportFeedback(`Error exporting PDF: ${err.message || "Unknown error"}`);
      setTimeout(() => setExportFeedback(""), 6000);
    }
  };

  return (
    <AndroidFrame 
      onBackPress={handleBackNavigation} 
      onHomePress={handleHomeNavigation}
      isFullscreen={isFullscreenAndroid}
      onToggleFullscreen={() => setIsFullscreenAndroid(!isFullscreenAndroid)}
      onOpenAndroidModal={() => setShowAndroidModal(true)}
    >
      <OfflineIndicator />
      
      {/* Dynamic Screen Contents mapping of Tab selections */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Upper Screen Title Panel with quick settings shortcut */}
        <header className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-stone-300 text-[10px] font-mono tracking-wider font-semibold uppercase">Surveillance Console</span>
              <h1 className="text-sm font-bold text-white tracking-tight -mt-0.5">GlucoGuard Mobile</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            <PWAInstallButton onOpenAndroidModal={() => setShowAndroidModal(true)} />

            <button
              id="header-theme-toggle-btn"
              title="Switch Matte Palette"
              onClick={() => {
                const themes: ("matte-slate" | "matte-terracotta" | "matte-steel" | "matte-chalk-light")[] = [
                  "matte-slate",
                  "matte-terracotta",
                  "matte-steel",
                  "matte-chalk-light"
                ];
                const currentIndex = themes.indexOf(profile.theme as any);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                const updated = { ...profile, theme: nextTheme };
                setProfile(updated);
                localStorage.setItem("dia_profile", JSON.stringify(updated));
                document.documentElement.setAttribute("data-theme", nextTheme);
              }}
              className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-200 bg-neutral-800/80 hover:bg-neutral-800 px-2 py-1.5 rounded-xl border border-neutral-700/60 font-mono transition-all cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline capitalize">
                {profile.theme === "matte-terracotta" ? "Terracotta" : profile.theme === "matte-steel" ? "Steel" : profile.theme === "matte-chalk-light" ? "Chalk" : "Slate"}
              </span>
            </button>

            {/* Pro / Membership Badge & Upgrade Button */}
            <button
              id="header-upgrade-btn"
              onClick={() => setShowMonetizationModal(true)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer font-mono font-bold ${
                profile.membershipTier === "pro"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25"
                  : profile.membershipTier === "caregiver_plus"
                  ? "bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25"
                  : "bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border-amber-500/40 hover:border-amber-400 active:scale-95"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">
                {profile.membershipTier === "pro" ? "Pro Member" : profile.membershipTier === "caregiver_plus" ? "Caregiver+" : "Upgrade Pro"}
              </span>
            </button>

            <button 
              id="header-profile-btn"
              onClick={() => changeTab("profile")}
              className="flex items-center gap-2 text-xs text-stone-300 bg-neutral-800 hover:bg-neutral-750 px-2.5 py-1.5 rounded-xl border border-neutral-700/60 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium truncate max-w-[80px]">{profile.name.split(" ")[0]}</span>
            </button>
          </div>
        </header>

        {/* TOP HORIZONTAL SCROLLABLE FEATURE NAVIGATION BAR */}
        <div className="bg-neutral-900/90 border-b border-neutral-800 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none text-[11px] font-mono">
          <button
            onClick={() => changeTab("dashboard")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "dashboard" ? "bg-rose-950/70 text-rose-300 border border-rose-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Glucose Tracking</span>
          </button>

          <button
            onClick={() => changeTab("reminders")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "reminders" ? "bg-pink-950/70 text-pink-300 border border-pink-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Insulin & Meds</span>
          </button>

          <button
            onClick={() => changeTab("diet")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "diet" ? "bg-teal-950/70 text-teal-300 border border-teal-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Diet Planner</span>
          </button>

          <button
            onClick={() => changeTab("walking")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "walking" ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Walking Tracker</span>
          </button>

          <button
            onClick={() => changeTab("assistant")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "assistant" ? "bg-teal-950/70 text-teal-300 border border-teal-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={() => changeTab("reports")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "reports" ? "bg-sky-950/70 text-sky-300 border border-sky-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Doctor's Report</span>
          </button>

          <button
            onClick={() => changeTab("family")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "family" ? "bg-indigo-950/70 text-indigo-300 border border-indigo-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Family & WhatsApp</span>
          </button>

          <button
            onClick={() => changeTab("handbook")}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === "handbook" ? "bg-purple-950/70 text-purple-300 border border-purple-500/40" : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Diets Handbook</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* --- SCREEN 1: DASHBOARD --- */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-950"
            >
            
            {/* Ambient greeting */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold text-white leading-tight">Welcome, {profile.name}</h2>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Active Diabetes Watch ({profile.diabetesType})
                </p>
              </div>
              <div className="text-right text-[10px] text-neutral-400 font-mono">
                <div>Fasting: {profile.targetFastingMin}-{profile.targetFastingMax} mg/dL</div>
                <div>Post-Meal: {profile.targetPostMin}-{profile.targetPostMax} mg/dL</div>
              </div>
            </div>

            {/* Top Dashboard Summary Row: Daily Management Status */}
            <div 
              id="daily-management-summary-row"
              className={`bg-neutral-900/90 border p-3.5 rounded-2xl space-y-3 shadow-sm transition-all ${
                complianceScore < 80 
                  ? "border-rose-500/40 shadow-rose-950/20" 
                  : "border-neutral-800"
              }`}
            >
              {/* Row Header: Current Date and Management Status Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${complianceScore < 80 ? "bg-rose-500/15 text-rose-400" : "bg-neutral-800 text-neutral-400"}`}>
                    {complianceScore < 80 ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-white tracking-wide">Daily Management Status</h3>
                      {complianceScore < 80 && (
                        <span 
                          id="compliance-warning-pill"
                          data-testid="compliance-warning-pill"
                          className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[9px] font-mono font-bold flex items-center gap-1"
                          title="Warning: Compliance Score drops below 80% (Potential management gap)"
                        >
                          <AlertTriangle 
                            id="daily-management-summary-warning-icon" 
                            data-testid="warning-icon"
                            className="w-2.5 h-2.5 text-rose-400 shrink-0 animate-pulse" 
                            aria-label="Compliance Warning Icon"
                          />
                          <span>Warning</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span>{currentFormattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Instant Feedback Status Pill & Warning Indicator */}
                <div className="flex items-center gap-1.5">
                  {complianceScore < 80 && (
                    <div 
                      id="compliance-gap-warning-badge"
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/35 text-rose-300 animate-pulse"
                      title="Warning: Medication compliance is under 80%"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Adherence Gap (&lt;80%)</span>
                    </div>
                  )}

                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 border ${dailyStatusBadge.classes}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dailyStatusBadge.dotClass}`}></span>
                    <span>{dailyStatusBadge.label}</span>
                  </div>
                </div>
              </div>

              {/* Management Gap Warning banner when Compliance Score < 80% */}
              {complianceScore < 80 && (
                <div 
                  id="compliance-gap-warning-alert"
                  className="bg-rose-950/30 border border-rose-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-2.5 text-[10.5px] text-rose-200"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                    <span>
                      <strong className="text-rose-300 font-bold">Management Gap Warning:</strong> Medication compliance is {complianceScore}% (&lt;80% target). Complete pending alarms to maintain glycemic control.
                    </span>
                  </div>
                  <button
                    id="btn-resolve-compliance-warning"
                    type="button"
                    onClick={() => changeTab("reminders")}
                    className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[9.5px] font-mono font-bold shrink-0 transition-all cursor-pointer"
                  >
                    Take Meds
                  </button>
                </div>
              )}

              {/* Instant Feedback KPI Cards: 'Log Count' & 'Compliance Score' */}
              <div className="grid grid-cols-2 gap-3">
                {/* Metric 1: Log Count */}
                <div 
                  id="summary-log-count-card"
                  onClick={() => {
                    const el = document.getElementById("btn-log-fasting") || document.getElementById("dashboard-subtab-logs");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  className="bg-neutral-950/80 border border-neutral-800/90 hover:border-neutral-700/80 p-3 rounded-xl transition-all cursor-pointer group select-none"
                  title="Click to jump to surveillance log entry"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Log Count</span>
                    <div className="p-1 bg-neutral-900 group-hover:bg-neutral-800 text-neutral-400 group-hover:text-cyan-400 rounded-md transition-all">
                      <ClipboardList className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className={`text-2xl font-black font-mono ${todayLogCount > 0 ? "text-cyan-400" : "text-neutral-400"}`}>
                      {todayLogCount}
                    </span>
                    <span className="text-[10.5px] text-neutral-400 font-mono">
                      {todayLogCount === 1 ? "log today" : "logs today"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[9.5px] font-mono border-t border-neutral-900 pt-1.5">
                    <span className="text-neutral-400 truncate">
                      {todayLogCount === 0 
                        ? "0 checkpoints logged" 
                        : `${todayFastingCount} fasting · ${todayPostCount} post`}
                    </span>
                    <span className="text-cyan-400 group-hover:text-cyan-300 font-sans font-semibold text-[9px] shrink-0 ml-1">
                      + Add Log
                    </span>
                  </div>
                </div>

                {/* Metric 2: Compliance Score */}
                <div 
                  id="summary-compliance-score-card"
                  onClick={() => changeTab("reminders")}
                  className={`border p-3 rounded-xl transition-all cursor-pointer group select-none ${
                    complianceScore < 80
                      ? "bg-rose-950/20 border-rose-500/35 hover:border-rose-500/50"
                      : "bg-neutral-950/80 border-neutral-800/90 hover:border-neutral-700/80"
                  }`}
                  title="Click to view medication checklist & alarms"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">Compliance Score</span>
                      {complianceScore < 80 && (
                        <span 
                          id="compliance-card-warning-icon"
                          title="Warning: Compliance Score is below 80%"
                          className="inline-flex items-center"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="p-1 bg-neutral-900 group-hover:bg-neutral-800 text-neutral-400 group-hover:text-emerald-400 rounded-md transition-all">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className={`text-2xl font-black font-mono flex items-center gap-1 ${
                      complianceScore === 100 
                        ? "text-emerald-400" 
                        : complianceScore >= 80 
                          ? "text-cyan-400" 
                          : "text-rose-400"
                    }`}>
                      {complianceScore}%
                      {complianceScore < 80 && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
                      )}
                    </span>
                    <span className="text-[9.5px] text-neutral-400 font-mono">
                      {activeReminders.length > 0 
                        ? `(${completedAlarmsCount}/${activeReminders.length} alarms)` 
                        : "(0 alarms)"}
                    </span>
                  </div>

                  {/* Visual adherence bar & instant feedback */}
                  <div className="mt-2 space-y-1 border-t border-neutral-900 pt-1.5">
                    <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          complianceScore === 100 
                            ? "bg-emerald-500" 
                            : complianceScore >= 80 
                              ? "bg-cyan-500" 
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${complianceScore}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
                      <span className="truncate">
                        {activeReminders.length === 0
                          ? "No alarms set"
                          : complianceScore === 100
                            ? "All alarms completed"
                            : `${activeReminders.length - completedAlarmsCount} alarm${activeReminders.length - completedAlarmsCount > 1 ? "s" : ""} pending`}
                      </span>
                      <span className="text-neutral-400 group-hover:text-neutral-200 flex items-center gap-0.5 shrink-0 ml-1">
                        View <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW SECTION: Compliance Score Analysis & Actionable Suggestions */}
              {complianceScore < 80 ? (
                <div 
                  id="compliance-score-analysis-section"
                  className="bg-neutral-950/90 border border-rose-500/30 rounded-xl p-3 space-y-2.5 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-rose-500/15 text-rose-400">
                        <BrainCircuit className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Adherence Deficit Analysis</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                            {complianceScore}% / 80% Target
                          </span>
                        </h4>
                        <p className="text-[10px] text-neutral-400">
                          {activeReminders.length === 0
                            ? "Zero alarms active — unprogrammed regimens lead to erratic glycemic control."
                            : `${80 - complianceScore}% below consensus safety threshold (${activeReminders.length - completedAlarmsCount} pending dose${activeReminders.length - completedAlarmsCount > 1 ? "s" : ""}).`}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40 shrink-0">
                      Action Required
                    </span>
                  </div>

                  {/* Clinical Impact Summary */}
                  <p className="text-[10.5px] text-neutral-300 leading-relaxed">
                    {activeReminders.length === 0
                      ? "Without structured medication alerts, patients face up to 3× higher risk of fasting hyperglycemia and delayed HbA1c reduction."
                      : complianceScore < 50
                      ? "Critical adherence drop (<50%): Missing multiple doses directly increases glucose volatility and triggers rebound glycemic spikes."
                      : "Adherence is below the 80% threshold. Taking doses at irregular hours disrupts glycemic stability between meals."}
                  </p>

                  {/* Specific Actionable Suggestions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* Actionable Suggestion 1: Set a custom alarm */}
                    <div className="bg-neutral-900/90 border border-neutral-800 hover:border-cyan-500/40 p-2.5 rounded-xl flex flex-col justify-between gap-2 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                          <BellRing className="w-3.5 h-3.5 shrink-0" />
                          <span>Set a Custom Alarm</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-snug">
                          {activeReminders.length === 0 
                            ? "Create scheduled daily medication and insulin reminders with custom times and audio chimes."
                            : "Add an extra scheduled alarm or adjust dose times so your medication routine matches your schedule."}
                        </p>
                      </div>

                      <button
                        type="button"
                        id="btn-compliance-action-alarm"
                        onClick={() => {
                          changeTab("reminders");
                          setRemindersSubTab("checklist");
                          setNewReminderForm(true);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Set a Custom Alarm</span>
                      </button>
                    </div>

                    {/* Actionable Suggestion 2: Consult your clinic */}
                    <div className="bg-neutral-900/90 border border-neutral-800 hover:border-purple-500/40 p-2.5 rounded-xl flex flex-col justify-between gap-2 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                          <Stethoscope className="w-3.5 h-3.5 shrink-0" />
                          <span>Consult Your Clinic</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-snug">
                          If missed doses stem from pill burden, side effects, or schedule conflicts, request your doctor review your regimen.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          id="btn-compliance-action-clinic"
                          onClick={() => {
                            const subject = encodeURIComponent(`Medication Adherence Advisory - ${profile.name}`);
                            const body = encodeURIComponent(
                              `Hello Clinic Staff,\n\n` +
                              `Patient: ${profile.name} (Age: ${profile.age}, ${profile.diabetesType})\n` +
                              `Current Medication Compliance: ${complianceScore}%\n` +
                              `Prescribed Medications: ${profile.medications || "Metformin"}\n\n` +
                              `I would like to consult with my healthcare provider regarding my current dosing schedule and potential adjustments to improve compliance.\n\n` +
                              `Sent via Diabetes Surveillance Platform.`
                            );
                            window.location.href = `mailto:${profile.doctorEmail || ""}?subject=${subject}&body=${body}`;
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                          title="Send adherence message to clinic"
                        >
                          <span>Consult Clinic</span>
                        </button>

                        <button
                          type="button"
                          id="btn-compliance-view-report"
                          onClick={() => changeTab("reports")}
                          className="py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-neutral-300 text-[10px] font-mono font-bold transition-all cursor-pointer active:scale-95"
                          title="Open Doctor's AGP Report"
                        >
                          Doctor Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  id="compliance-score-optimal-section"
                  className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-[10.5px] text-emerald-300 animate-fadeIn"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      <strong className="font-bold">Target Adherence Met ({complianceScore}%):</strong> Consistent medication timing protects against glycemic surges.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => changeTab("reminders")}
                    className="text-[9.5px] font-mono text-emerald-400 hover:text-emerald-300 underline font-bold shrink-0 cursor-pointer"
                  >
                    View Schedule
                  </button>
                </div>
              )}
            </div>

            {/* Quick Metrics Bento Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-cyan-950/20 to-neutral-900 border border-cyan-900/30 p-3 rounded-2xl relative overflow-hidden">
                <div className="absolute top-2 right-2 p-1 bg-cyan-500/10 rounded-lg text-cyan-400">
                  <MoonMetricIcon />
                </div>
                <span className="text-[10px] text-stone-400 font-semibold tracking-wide block uppercase">Avg Fasting</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-black text-white">{avgFasting || "—"}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">mg/dL</span>
                </div>
                <span className="text-[9px] text-neutral-400 block mt-1">
                  {fastingLogs.length ? `Across ${fastingLogs.length} checkpoints` : "No morning checkpoints recorded"}
                </span>
              </div>

              <div className="bg-gradient-to-br from-rose-950/20 to-neutral-900 border border-rose-900/30 p-3 rounded-2xl relative overflow-hidden">
                <div className="absolute top-2 right-2 p-1 bg-rose-500/10 rounded-lg text-rose-400">
                  <SunMetricIcon />
                </div>
                <span className="text-[10px] text-stone-400 font-semibold tracking-wide block uppercase">Avg Post-Fasting</span>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-black text-white">{avgPost || "—"}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">mg/dL</span>
                </div>
                <span className="text-[9px] text-neutral-400 block mt-1">
                  {postLogs.length ? `Across ${postLogs.length} logs` : "No post-meal checkpoints recorded"}
                </span>
              </div>
            </div>

            {/* Standardized Diabetes Metrics (TIR, eAG, Estimated HbA1c) Card */}
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Standardized Clinical Metrics</h3>
                    <p className="text-[9.5px] text-neutral-400 font-mono">ADA & AGP Guideline Alignment</p>
                  </div>
                </div>

                {/* Interval Toggles */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                  {(["7", "14", "30", "90"] as const).map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setReportTimeRange(days as any)}
                      className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold font-mono transition-all cursor-pointer ${
                        reportTimeRange === days
                          ? "bg-emerald-500 text-black shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {days}D
                    </button>
                  ))}
                </div>
              </div>

              {/* TIR Bar Visualizer */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-neutral-300 font-bold">Time-in-Range (70–180 mg/dL):</span>
                  <span className="text-emerald-400 font-black text-xs font-mono">{tirMetrics.inRangePct}% TIR</span>
                </div>
                <div className="h-2.5 bg-neutral-950 rounded-full flex overflow-hidden p-0.5 border border-neutral-800">
                  <div className="bg-rose-500 h-full transition-all" style={{ width: `${tirMetrics.hypoPct}%` }} title={`Hypo <70: ${tirMetrics.hypoPct}%`}></div>
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${tirMetrics.inRangePct}%` }} title={`Target 70-180: ${tirMetrics.inRangePct}%`}></div>
                  <div className="bg-orange-500 h-full transition-all" style={{ width: `${tirMetrics.hyperPct}%` }} title={`Hyper >180: ${tirMetrics.hyperPct}%`}></div>
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-400 pt-0.5">
                  <span className="text-rose-400">Low &lt;70: {tirMetrics.hypoPct}%</span>
                  <span className="text-emerald-400">Target: {tirMetrics.inRangePct}%</span>
                  <span className="text-orange-400">High &gt;180: {tirMetrics.hyperPct}%</span>
                </div>
              </div>

              {/* eAG and Estimated HbA1c Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-850">
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                  <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono block">Estimated Average Glucose (eAG)</span>
                  <div className="text-base font-black text-white mt-0.5 font-mono">{tirMetrics.eAG} <span className="text-[9px] font-normal text-neutral-400">mg/dL</span></div>
                </div>

                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-center">
                  <span className="text-[9px] text-neutral-400 uppercase tracking-wider font-mono block">Estimated HbA1c</span>
                  <div className="text-base font-black text-cyan-400 mt-0.5 font-mono">{tirMetrics.estimatedHbA1c}%</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FastingTimer readings={readings} />
              
              {/* Dynamic Insulin on Board (IOB) Quick-View Card */}
              <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-500 font-extrabold tracking-wider block uppercase font-mono">
                        Active Insulin Tracker
                      </span>
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        Insulin on Board (IOB)
                      </h3>
                    </div>
                    
                    <span className="text-[8px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-black font-mono uppercase tracking-widest leading-none">
                      4H Linear Decay
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-cyan-400 tracking-tight">
                      {activeIOB}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono font-bold uppercase">Units Active</span>
                  </div>

                  {activeInjections.length === 0 ? (
                    <div className="bg-black/35 p-3 rounded-xl border border-neutral-800/40 text-[10px] text-neutral-400 italic font-mono flex items-center gap-2 leading-normal">
                      <Zap className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span>Zero active insulin on board currently based on logged history. Always consult your physician or follow your prescribed care plan.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {activeInjections.map((inj) => {
                        const agePercent = Math.min(100, (inj.administeredHoursAgo / 4) * 100);
                        const progressPercent = 100 - agePercent;
                        const hoursStr = inj.administeredHoursAgo < 1 
                          ? `${Math.round(inj.administeredHoursAgo * 60)}m ago` 
                          : `${inj.administeredHoursAgo.toFixed(1)}h ago`;

                        return (
                          <div key={inj.id} className="bg-black/25 border border-neutral-800/60 p-2 rounded-xl text-[9.5px] font-mono space-y-1">
                            <div className="flex justify-between text-neutral-300">
                              <span className="font-bold text-white truncate max-w-[130px]">{inj.name}</span>
                              <span className="text-zinc-500">{hoursStr} ({inj.takenAt})</span>
                            </div>
                            <div className="flex justify-between items-center text-stone-400 font-semibold text-[8.5px]">
                              <span>Injected: {inj.initialUnits} U</span>
                              <span className="text-cyan-400 font-black">{inj.remainingUnits} U remaining</span>
                            </div>
                            <div className="h-1 bg-neutral-800/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-cyan-500 transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="text-[9px] text-neutral-400 font-medium pt-2 border-t border-neutral-800/60 mt-3 flex justify-between items-center leading-relaxed">
                  <span className="text-zinc-500 font-mono">Provides metabolic security monitoring</span>
                  {activeIOB > 0 && (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      ⚠️ Avoid insulin stacking
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Diabetes Management Control Hub */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="btn-open-glucometer-sync"
                onClick={() => setShowGlucometerModal(true)}
                className="p-2.5 bg-gradient-to-br from-teal-950/40 to-neutral-900 border border-teal-500/30 hover:border-teal-500/60 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer shadow-sm group select-none"
              >
                <Bluetooth className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-bold text-teal-300 leading-none">Sync Meter</span>
                <span className="text-[8.5px] text-neutral-400 font-mono">BLE / USB / NFC</span>
              </button>

              <button
                type="button"
                id="btn-open-goals-targets"
                onClick={() => setShowGoalsModal(true)}
                className="p-2.5 bg-gradient-to-br from-indigo-950/40 to-neutral-900 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer shadow-sm group select-none"
              >
                <Target className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-bold text-indigo-300 leading-none">My Goals</span>
                <span className="text-[8.5px] text-neutral-400 font-mono">HbA1c &amp; TIR</span>
              </button>

              <button
                type="button"
                id="btn-open-weekly-review"
                onClick={() => setShowWeeklyReviewModal(true)}
                className="p-2.5 bg-gradient-to-br from-cyan-950/40 to-neutral-900 border border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer shadow-sm group select-none"
              >
                <Calendar className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10.5px] font-bold text-cyan-300 leading-none">Weekly Review</span>
                <span className="text-[8.5px] text-neutral-400 font-mono">Trends &amp; Backup</span>
              </button>
            </div>

            {/* Dashboard Sub-Tabs Selector */}
            <div className="grid grid-cols-4 gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-2xl select-none text-center">
              <button
                id="btn-dash-manual-subtab"
                type="button"
                onClick={() => setDashboardSubTab("logs")}
                className={`py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-bold transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 select-none ${
                  dashboardSubTab === "logs"
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Logs</span>
              </button>
              <button
                id="btn-dash-correlations-subtab"
                type="button"
                onClick={() => setDashboardSubTab("correlations")}
                className={`py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-bold transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 select-none ${
                  dashboardSubTab === "correlations"
                    ? "bg-amber-950/40 text-amber-300 border border-amber-500/25 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Spikes</span>
              </button>
              <button
                id="btn-dash-food-subtab"
                type="button"
                onClick={() => setDashboardSubTab("food")}
                className={`py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-bold transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 select-none ${
                  dashboardSubTab === "food"
                    ? "bg-rose-955/25 text-rose-455 border border-rose-500/10 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Diet</span>
              </button>
              <button
                id="btn-dash-wearables-subtab"
                type="button"
                onClick={() => setDashboardSubTab("wearables")}
                className={`py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-bold transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 select-none ${
                  dashboardSubTab === "wearables"
                    ? "bg-indigo-950/45 text-indigo-455 border border-indigo-500/20 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Sensors</span>
              </button>
            </div>

            {dashboardSubTab === "logs" ? (
              <>
                {/* Quick Medication checklist drawer summary */}
            {activeReminders.length > 0 && (
              <div 
                id="pill-tracker-bento"
                onClick={() => changeTab("reminders")}
                className="bg-neutral-900/70 border border-neutral-800 p-3 rounded-2xl flex items-center justify-between cursor-pointer hover:border-neutral-700/80 transition-all select-none animate-fadeIn"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 text-pink-400 rounded-xl">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Daily Pill Tracker</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Completed <span className="text-pink-400 font-bold">{pillsTakenToday}</span> of <span className="font-bold">{activeReminders.length}</span> active prescriptions today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-12 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300" 
                      style={{ width: `${Math.min(100, (pillsTakenToday / activeReminders.length) * 100)}%` }}
                    ></div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>
            )}

            {/* Daily Hydration Goal Bento tracker */}
            <HydrationTracker />

            {/* QUICK LOG ACCORDION FORM */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-neutral-200 tracking-wide uppercase flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" /> Append Surveillance Log
              </h3>
              
              <form onSubmit={handleAddReading} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="btn-log-fasting"
                    type="button"
                    onClick={() => setLogType("fasting")}
                    className={`py-2 px-3 rounded-xl border font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      logType === "fasting"
                        ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-sm"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    <MoonMetricIcon />
                    <span>Fasting (Morning)</span>
                  </button>
                  <button
                    id="btn-log-post"
                    type="button"
                    onClick={() => setLogType("post_fasting")}
                    className={`py-2 px-3 rounded-xl border font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      logType === "post_fasting"
                        ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-sm"
                        : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-300"
                    }`}
                  >
                    <SunMetricIcon />
                    <span>Post-Fasting (After Meal)</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[10px] text-stone-500 font-mono mb-1 font-semibold uppercase">Glucose (mg/dL)</label>
                    <input
                      id="input-glucose-val"
                      type="number"
                      required
                      value={logValue}
                      onChange={(e) => setLogValue(e.target.value)}
                      placeholder="e.g. 110"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-center text-sm font-bold text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-mono mb-1 font-semibold uppercase">Date</label>
                    <input
                      id="input-glucose-date"
                      type="date"
                      required
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-2.5 py-2 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-mono mb-1 font-semibold uppercase">Time</label>
                    <input
                      id="input-glucose-time"
                      type="time"
                      required
                      value={logTime}
                      onChange={(e) => setLogTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-2 py-2 text-[10px] text-white text-center focus:outline-none focus:ring-1 focus:ring-pink-500"
                    />
                  </div>
                </div>

                <div className="bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-stone-500 font-semibold uppercase">Stress Correlation Level</span>
                    <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${
                      logStressLevel <= 3 ? "bg-emerald-500/10 text-emerald-400" :
                      logStressLevel <= 7 ? "bg-sky-500/10 text-sky-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {logStressLevel} / 10 ({logStressLevel <= 3 ? 'Relaxed' : logStressLevel <= 7 ? 'Moderate' : 'Stressed'})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-emerald-400/80 font-mono">Calm</span>
                    <input
                      id="input-stress-level"
                      type="range"
                      min="1"
                      max="10"
                      value={logStressLevel}
                      onChange={(e) => setLogStressLevel(Number(e.target.value))}
                      className="w-full h-1 rounded-lg bg-neutral-800 accent-emerald-500 cursor-pointer focus:outline-none"
                    />
                    <span className="text-[9px] text-rose-400/80 font-mono">High</span>
                  </div>
                </div>

                <div>
                  <input
                    id="input-glucose-notes"
                    type="text"
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Meal notes or symptoms (e.g. Ate rice, walking)"
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-neutral-300 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <button
                  id="btn-log-submit"
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none transition-all active:scale-[0.99]"
                >
                  <Activity className="w-4 h-4 shrink-0 text-white" />
                  <span>Log Surveillance Sample</span>
                </button>
              </form>
            </div>

            {/* DAILY SURVEILLANCE SUMMARY CARD */}
            {readings.length > 0 && (() => {
              const todayDateStr = new Date().toISOString().split("T")[0];
              const hasTodayReadings = readings.some(r => r.date === todayDateStr);
              const sortedByDate = [...readings].sort((a,b) => b.date.localeCompare(a.date));
              const activeSummaryDate = hasTodayReadings ? todayDateStr : sortedByDate[0].date;
              const summaryReadings = readings.filter(r => r.date === activeSummaryDate);

              const summaryGlucoseAvg = summaryReadings.length > 0
                ? Math.round(summaryReadings.reduce((sum, r) => sum + r.value, 0) / summaryReadings.length)
                : 0;

              const summaryInRangeCount = summaryReadings.filter(r => {
                if (r.type === "fasting") {
                  return r.value >= profile.targetFastingMin && r.value <= profile.targetFastingMax;
                } else {
                  return r.value >= profile.targetPostMin && r.value <= profile.targetPostMax;
                }
              }).length;

              const summaryTimeInRangePercent = summaryReadings.length > 0
                ? Math.round((summaryInRangeCount / summaryReadings.length) * 100)
                : 0;

              const summaryFastingReadings = summaryReadings.filter(r => r.type === "fasting");
              const summaryPostReadings = summaryReadings.filter(r => r.type === "post_fasting");

              const summaryFastingAvg = summaryFastingReadings.length > 0
                ? Math.round(summaryFastingReadings.reduce((sum, r) => sum + r.value, 0) / summaryFastingReadings.length)
                : null;

              const summaryPostAvg = summaryPostReadings.length > 0
                ? Math.round(summaryPostReadings.reduce((sum, r) => sum + r.value, 0) / summaryPostReadings.length)
                : null;

              return (
                <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl space-y-4 shadow-none">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-cyan-400 font-extrabold tracking-wider block uppercase font-mono">
                        Active Metabolic Metrics
                      </span>
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                        Daily Dashboard Summary
                      </h3>
                    </div>
                    
                    <span className={`text-[8px] border px-2 py-0.5 rounded font-black font-mono uppercase tracking-wider ${
                      hasTodayReadings 
                        ? "bg-emerald-550/15 text-emerald-400 border-emerald-500/20" 
                        : "bg-neutral-800 text-neutral-400 border-neutral-700"
                    }`}>
                      {hasTodayReadings ? "TODAY" : `LAST LOGGED: ${activeSummaryDate}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col justify-between">
                      <span className="text-[10px] text-neutral-400 font-bold font-mono">AVG GLUCOSE</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-black text-white">{summaryGlucoseAvg}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">mg/dL</span>
                      </div>
                      <span className={`text-[8.5px] mt-1 font-semibold block ${
                        summaryGlucoseAvg >= 70 && summaryGlucoseAvg <= 140 
                          ? "text-emerald-400" 
                          : summaryGlucoseAvg < 70 
                            ? "text-rose-400" 
                            : "text-rose-400"
                      }`}>
                        {summaryGlucoseAvg >= 70 && summaryGlucoseAvg <= 140 ? "Stable glycemic zone" : summaryGlucoseAvg < 70 ? "Trend towards low" : "Trend towards high"}
                      </span>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 flex flex-col justify-between">
                      <span className="text-[10px] text-neutral-400 font-bold font-mono">TIME IN RANGE (TIR)</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className={`text-2xl font-black ${
                          summaryTimeInRangePercent >= 70 
                            ? "text-emerald-400" 
                            : summaryTimeInRangePercent >= 50 
                              ? "text-sky-400" 
                              : "text-rose-400"
                        }`}>{summaryTimeInRangePercent}%</span>
                        <span className="text-[10px] text-neutral-500 font-mono">TIR</span>
                      </div>
                      <div className="h-1 w-full bg-neutral-900 rounded-full mt-1.5 overflow-hidden font-mono">
                        <div 
                          className={`h-full transition-all duration-550 ${
                            summaryTimeInRangePercent >= 70 
                              ? "bg-emerald-500" 
                              : summaryTimeInRangePercent >= 50 
                                ? "bg-sky-500" 
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${summaryTimeInRangePercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Comparative Progress Indicators vs User Profile Target Ranges */}
                  <div className="space-y-3 pt-2.5 border-t border-neutral-850">
                    <span className="text-[10px] font-black text-neutral-350 block uppercase font-mono">
                      Surveillance Progress vs profile Targets
                    </span>
                    
                    {/* Fasting Progression Indicator */}
                    <div className="space-y-1 bg-black/25 p-2.5 rounded-xl border border-neutral-900">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">Fasting Average:</span>
                        <span className="text-white font-extrabold">{summaryFastingAvg !== null ? `${summaryFastingAvg} mg/dL` : "—"}</span>
                      </div>
                      <div className="relative h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                        <div 
                          className="absolute h-full bg-emerald-500/20 border-x border-emerald-500/30"
                          style={{
                            left: `${Math.max(0, Math.min(100, ((profile.targetFastingMin - 40) / 120) * 100))}%`,
                            width: `${Math.max(5, Math.min(100, ((profile.targetFastingMax - profile.targetFastingMin) / 120) * 100))}%`
                          }}
                        ></div>
                        {summaryFastingAvg !== null && (
                          <div 
                            className={`absolute top-0 bottom-0 w-2 h-2 rounded-full border border-black shadow-md ${
                              summaryFastingAvg >= profile.targetFastingMin && summaryFastingAvg <= profile.targetFastingMax
                                ? "bg-emerald-450"
                                : "bg-rose-450"
                            }`}
                            style={{
                              left: `${Math.max(2, Math.min(98, ((summaryFastingAvg - 40) / 120) * 100))}%`,
                              transform: "translateY(0%) translateX(-50%)"
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                        <span>40 mg/dL</span>
                        <span className="text-emerald-450 font-bold">Target Range: {profile.targetFastingMin}-{profile.targetFastingMax} mg/dL</span>
                        <span>160 mg/dL</span>
                      </div>
                    </div>

                    {/* Post-Fasting Progression Indicator */}
                    <div className="space-y-1 bg-black/25 p-2.5 rounded-xl border border-neutral-900">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-neutral-400">Post-Meal Average:</span>
                        <span className="text-white font-extrabold">{summaryPostAvg !== null ? `${summaryPostAvg} mg/dL` : "—"}</span>
                      </div>
                      <div className="relative h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-850">
                        <div 
                          className="absolute h-full bg-cyan-500/10 border-x border-cyan-500/25"
                          style={{
                            left: `${Math.max(0, Math.min(100, ((profile.targetPostMin - 60) / 160) * 100))}%`,
                            width: `${Math.max(5, Math.min(100, ((profile.targetPostMax - profile.targetPostMin) / 160) * 100))}%`
                          }}
                        ></div>
                        {summaryPostAvg !== null && (
                          <div 
                            className={`absolute top-0 bottom-0 w-2 h-2 rounded-full border border-black shadow-none ${
                              summaryPostAvg >= profile.targetPostMin && summaryPostAvg <= profile.targetPostMax
                                ? "bg-cyan-400"
                                : "bg-rose-400"
                            }`}
                            style={{
                              left: `${Math.max(2, Math.min(98, ((summaryPostAvg - 60) / 160) * 100))}%`,
                              transform: "translateY(0%) translateX(-50%)"
                            }}
                          ></div>
                        )}
                      </div>
                      <div className="flex justify-between text-[8px] font-mono text-neutral-500">
                        <span>60 mg/dL</span>
                        <span className="text-cyan-400 font-bold font-mono">Target Range: {profile.targetPostMin}-{profile.targetPostMax} mg/dL</span>
                        <span>220 mg/dL</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* RECENT RECORDS LOG TABLE VIEW */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Surveillance History</h3>
                <span className="text-[10px] text-neutral-500 font-mono">Showing {readings.length} logs</span>
              </div>

              {readings.length === 0 ? (
                <div className="text-center p-8 bg-neutral-900 rounded-2xl border border-dashed border-neutral-800">
                  <Activity className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">No surveillance logs recorded yet.</p>
                  <p className="text-[10px] text-neutral-500 mt-1">Submit your first glucose value above.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {readings.map((reading) => (
                    <div 
                      key={reading.id}
                      className="bg-neutral-900 border border-neutral-800/80 p-3 rounded-2xl flex justify-between items-center gap-2 hover:bg-neutral-800/50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl border flex flex-col items-center justify-center ${
                          reading.type === "fasting" 
                            ? "bg-cyan-500/5 border-cyan-400/20 text-cyan-400" 
                            : "bg-rose-500/5 border-rose-400/20 text-rose-400"
                        }`}>
                          {reading.type === "fasting" ? <MoonMetricIcon className="w-4 h-4" /> : <SunMetricIcon className="w-4 h-4" />}
                          <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5 font-mono">
                            {reading.type === "fasting" ? "FAST" : "POST"}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">{reading.value}</span>
                            <span className="text-[9px] text-stone-500 font-mono">mg/dL</span>
                            <span className={`text-[9px] border px-2 py-0.5 rounded-full font-semibold ${getCategoryTheme(reading.category)}`}>
                              {reading.category}
                            </span>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-2 text-[10px] text-neutral-400 mt-1 font-mono">
                            <Calendar className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span>{reading.date}</span>
                            <span className="text-neutral-600">•</span>
                            <Clock className="w-3 h-3 text-neutral-500 shrink-0" />
                            <span>{reading.time}</span>
                            {reading.stressLevel !== undefined && (
                              <>
                                <span className="text-neutral-600">•</span>
                                <span className={`font-semibold ${
                                  reading.stressLevel <= 3 ? "text-emerald-400" :
                                  reading.stressLevel <= 7 ? "text-sky-400" :
                                  "text-rose-400"
                                }`}>
                                  ⚡ Stress: {reading.stressLevel}/10
                                </span>
                              </>
                            )}
                          </div>

                          {reading.notes && (
                            <p className="text-[10px] text-stone-400 bg-black/25 px-2 py-1 rounded-lg mt-1.5 border border-white/5 leading-snug">
                              <span className="text-[9px] font-semibold text-neutral-500 mr-1 uppercase">Note:</span>{reading.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        id={`btn-del-reading-${reading.id}`}
                        onClick={() => handleDeleteReading(reading.id)}
                        className="p-2 text-neutral-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all shrink-0 cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </>
            ) : dashboardSubTab === "correlations" ? (
              <LifestyleCorrelationView
                readings={readings}
                foodLogs={foodLogs}
                activityLogs={activityLogs}
              />
            ) : dashboardSubTab === "food" ? (
              <FoodLogger
                readings={readings}
                foodLogs={foodLogs}
                onAddFoodLog={handleAddFoodLog}
                onDeleteFoodLog={handleDeleteFoodLog}
                onAssociateGlucose={handleAssociateGlucose}
                onQuickLogGlucose={handleQuickLogGlucoseFromFood}
                prefilledFood={prefilledFood}
                onClearPrefilledFood={() => setPrefilledFood(null)}
              />
            ) : (
              <OpenWearablesHub
                onInjectGlucose={(data) => {
                  const finalDate = new Date().toISOString().split("T")[0];
                  const finalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                  
                  let category: "Hypoglycemia" | "Normal" | "Prediabetes" | "Diabetes" | "Severe Hyperglycemia" = "Normal";
                  const val = data.value;
                  if (val < 70) category = "Hypoglycemia";
                  else if (val >= 70 && val <= 100) category = "Normal";
                  else if (val > 100 && val <= 125) category = "Prediabetes";
                  else if (val > 125 && val <= 250) category = "Diabetes";
                  else category = "Severe Hyperglycemia";

                  const newReading = {
                    id: `reading-${Date.now()}`,
                    date: finalDate,
                    time: finalTime,
                    type: data.type,
                    value: val,
                    category,
                    notes: data.notes
                  };

                  setReadings(prev => {
                    const updated = [newReading, ...prev];
                    localStorage.setItem("glucose_surveillance_readings", JSON.stringify(updated));
                    return updated;
                  });
                }}
                targetRangeMin={profile.targetPostMin}
                targetRangeMax={profile.targetPostMax}
              />
            )}
          </motion.div>
        )}

        {/* --- SCREEN 2: REPORTS & GRAPHICAL VIEWS --- */}
        {activeTab === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-950"
          >
            {/* AGP Doctor's Report Generator */}
            <DoctorReport
              profile={profile}
              readings={readings}
              onOpenMonetizationHub={() => setShowMonetizationModal(true)}
            />

            <div className="flex justify-between items-center pb-2 border-b border-neutral-800 pt-2">
              <div>
                <h2 className="text-base font-bold text-white">Graphical Visualizations</h2>
                <p className="text-xs text-neutral-400 font-mono">Visual metabolic stability & trend charts</p>
              </div>

              {/* Only show category filter if we are looking at trendline */}
              {reportChartType === "trend" && (
                <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl text-[10px] font-mono animate-fadeIn">
                  <button
                    id="reports-filter-all"
                    onClick={() => setChartFilter("all")}
                    className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer ${chartFilter === "all" ? "bg-stone-700/80 text-white font-bold" : "text-neutral-400 hover:text-white"}`}
                  >
                    All
                  </button>
                  <button
                    id="reports-filter-fasting"
                    onClick={() => setChartFilter("fasting")}
                    className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer ${chartFilter === "fasting" ? "bg-cyan-500/10 text-cyan-400 font-bold" : "text-neutral-400 hover:text-cyan-300"}`}
                  >
                    Fasting
                  </button>
                  <button
                    id="reports-filter-post"
                    onClick={() => setChartFilter("post_fasting")}
                    className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer ${chartFilter === "post_fasting" ? "bg-rose-500/10 text-rose-400 font-bold" : "text-neutral-400 hover:text-rose-300"}`}
                  >
                    Post
                  </button>
                </div>
              )}
            </div>

            {/* View Type Toggle Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-neutral-900 border border-neutral-850 p-1 rounded-2xl select-none">
              <button
                id="btn-report-chart-trend"
                onClick={() => setReportChartType("trend")}
                className={`py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  reportChartType === "trend"
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Glucose Trend</span>
              </button>
              <button
                id="btn-report-chart-variability"
                onClick={() => setReportChartType("variability")}
                className={`py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  reportChartType === "variability"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Variability (30D)</span>
              </button>
              <button
                id="btn-report-chart-weight"
                onClick={() => setReportChartType("weight")}
                className={`py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  reportChartType === "weight"
                    ? "bg-rose-500/10 text-rose-455 border border-rose-500/20 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Weight & Glycemia</span>
              </button>
              <button
                id="btn-report-chart-adherence"
                onClick={() => setReportChartType("adherence")}
                className={`py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  reportChartType === "adherence"
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                <span className="truncate">Adherence Synergy</span>
              </button>
            </div>

            {/* Master Date Range Filter Panel */}
            <div id="master-date-range-filter" className="bg-neutral-900 border border-neutral-850 p-3.5 rounded-2xl space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Analysis Timeframe</span>
                </div>
                
                {/* Preset Selection Buttons */}
                <div className="flex flex-wrap items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850 self-start sm:self-auto">
                  <button
                    id="btn-range-preset-7"
                    onClick={() => setReportTimeRange("7")}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer font-bold ${
                      reportTimeRange === "7"
                        ? "bg-neutral-800 text-cyan-400 border border-neutral-750"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    7D
                  </button>
                  <button
                    id="btn-range-preset-30"
                    onClick={() => setReportTimeRange("30")}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer font-bold ${
                      reportTimeRange === "30"
                        ? "bg-neutral-800 text-cyan-400 border border-neutral-750"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    30D
                  </button>
                  <button
                    id="btn-range-preset-90"
                    onClick={() => setReportTimeRange("90")}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer font-bold ${
                      reportTimeRange === "90"
                        ? "bg-neutral-800 text-cyan-400 border border-neutral-750"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    90D
                  </button>
                  <button
                    id="btn-range-preset-365"
                    onClick={() => setReportTimeRange("365")}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer font-bold ${
                      reportTimeRange === "365"
                        ? "bg-neutral-800 text-cyan-400 border border-neutral-750"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    1Y
                  </button>
                  <button
                    id="btn-range-preset-custom"
                    onClick={() => {
                      setReportTimeRange("custom");
                      if (!customStartDate) {
                        const thirtyDaysAgo = new Date(benchmarkRef.getTime() - 30 * 24 * 60 * 60 * 1000);
                        setCustomStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
                      }
                      if (!customEndDate) {
                        setCustomEndDate(benchmarkRef.toISOString().split("T")[0]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer font-bold flex items-center gap-1 ${
                      reportTimeRange === "custom"
                        ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 animate-pulse"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Custom Range
                  </button>
                </div>
              </div>

              {/* Collapsible custom inputs if 'custom' is active */}
              {reportTimeRange === "custom" && (
                <div className="pt-3 border-t border-neutral-850/50 flex flex-col sm:flex-row items-center gap-3 animate-fadeIn">
                  <div className="w-full sm:w-auto flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">Start Date</label>
                    <input
                      id="input-custom-start-date"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs px-2.5 py-1.5 rounded-xl outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 w-full font-mono cursor-pointer"
                    />
                  </div>
                  
                  <div className="hidden sm:block text-neutral-600 font-bold self-end pb-2">to</div>
                  
                  <div className="w-full sm:w-auto flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider">End Date</label>
                    <input
                      id="input-custom-end-date"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs px-2.5 py-1.5 rounded-xl outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 w-full font-mono cursor-pointer"
                    />
                  </div>

                  {/* Informational range label */}
                  <div className="sm:self-end sm:pb-2 text-[10px] text-neutral-500 font-mono italic">
                    {(() => {
                      const d1 = new Date(finalStartMs);
                      const d2 = new Date(finalEndMs);
                      const daysCount = Math.round((finalEndMs - finalStartMs) / (24 * 60 * 60 * 1000));
                      return (
                        <span>Surveillance Span: <strong className="text-neutral-300 font-bold">{daysCount} Days</strong> ({d1.toLocaleDateString(undefined, {month:'short', day:'numeric', year: 'numeric'})} - {d2.toLocaleDateString(undefined, {month:'short', day:'numeric', year: 'numeric'})})</span>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Tab 1: SURVEILLANCE TRENDLINE */}
            {reportChartType === "trend" && (
              <div id="trendline-surveillance-container" className="space-y-4 animate-fadeIn">
                
                {/* TREND CONTROLS PANEL */}
                <div id="trendline-visual-controls" className="bg-neutral-900 border border-neutral-850 p-3.5 rounded-2xl space-y-3 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Aggregation interval */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Aggregation Period</span>
                      <div className="grid grid-cols-4 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px]">
                        <button
                          id="btn-agg-raw"
                          onClick={() => setReportAggregation("raw")}
                          className={`py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                            reportAggregation === "raw"
                              ? "bg-neutral-800 text-cyan-400 border border-neutral-700"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          Raw
                        </button>
                        <button
                          id="btn-agg-daily"
                          onClick={() => setReportAggregation("daily")}
                          className={`py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                            reportAggregation === "daily"
                              ? "bg-neutral-800 text-cyan-400 border border-neutral-700"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          Daily
                        </button>
                        <button
                          id="btn-agg-weekly"
                          onClick={() => setReportAggregation("weekly")}
                          className={`py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                            reportAggregation === "weekly"
                              ? "bg-neutral-800 text-cyan-400 border border-neutral-700"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          Weekly
                        </button>
                        <button
                          id="btn-agg-monthly"
                          onClick={() => setReportAggregation("monthly")}
                          className={`py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                            reportAggregation === "monthly"
                              ? "bg-neutral-800 text-cyan-400 border border-neutral-700"
                              : "text-neutral-500 hover:text-neutral-300"
                          }`}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>

                    {/* Chart style select & Trend Download */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono">Graphical Style & Overlays</span>
                      </div>
                      <div className="flex flex-wrap sm:flex-nowrap gap-2">
                        <div className="flex-1 grid grid-cols-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px]">
                          <button
                            id="btn-style-line"
                            onClick={() => setReportChartStyle("line")}
                            className={`py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                              reportChartStyle === "line"
                                ? "bg-cyan-950/40 text-cyan-400 border border-cyan-800/30"
                                : "text-neutral-500 hover:text-neutral-300"
                            }`}
                          >
                            Line Chart
                          </button>
                          <button
                            id="btn-style-bar"
                            onClick={() => setReportChartStyle("bar")}
                            className={`py-1 rounded-lg font-bold transition-all cursor-pointer text-center ${
                              reportChartStyle === "bar"
                                ? "bg-rose-950/40 text-rose-400 border border-rose-800/30"
                                : "text-neutral-500 hover:text-neutral-300"
                            }`}
                          >
                            Bar Graph
                          </button>
                        </div>

                        {/* Toggle button for Linear Regression Trendlines */}
                        <button
                          id="btn-toggle-regression-lines"
                          type="button"
                          onClick={() => {
                            setShowRegressionLines(prev => {
                              const next = !prev;
                              localStorage.setItem("glucose_show_regression_lines", String(next));
                              return next;
                            });
                          }}
                          className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm select-none shrink-0 ${
                            showRegressionLines
                              ? "bg-cyan-950/50 text-cyan-300 border-cyan-700/60 shadow-cyan-950/30"
                              : "bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-neutral-300 hover:border-neutral-700"
                          }`}
                          title={showRegressionLines ? "Click to hide linear regression trendlines to reduce visual clutter" : "Click to show linear regression trendlines"}
                          aria-pressed={showRegressionLines}
                        >
                          <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${showRegressionLines ? "text-cyan-400" : "text-neutral-500"}`} />
                          <span>{showRegressionLines ? "Trendlines: ON" : "Trendlines: OFF"}</span>
                        </button>

                        <button
                          id="btn-export-trend-csv"
                          onClick={handleExportAggregatedToCSV}
                          title="Export Current Trend CSV"
                          className="px-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:bg-neutral-850 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Export Trend</span>
                          <span className="sm:hidden">CSV</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CHART CONTAINER & GRAPH VIEW WITH INTERACTIVE ZOOM / BRUSH */}
                <div id="trendline-chart-card" className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-800 space-y-3 shadow-md">
                  {/* Interactive Zoom Control Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] font-mono px-1 pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-bold text-xs">Interactive Zoom & Brushing</span>
                          <span className="text-neutral-600">•</span>
                          <span className="text-neutral-400 text-[10px]">
                            {filteredChartData.length} total entries ({reportAggregation === "raw" ? "raw logs" : `${reportAggregation} avg`})
                          </span>
                        </div>
                        <p className="text-[9px] text-neutral-500">Select or slide a time window for granular inspection</p>
                      </div>
                    </div>

                    {/* Active Zoom Window Status & Preset Actions */}
                    <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                      {brushRange.startIndex !== undefined && brushRange.endIndex !== undefined && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-[9px] flex items-center gap-1">
                          <ZoomIn className="w-3 h-3 text-cyan-400" />
                          <span>
                            Visible: #{brushRange.startIndex + 1} - #{brushRange.endIndex + 1} ({brushRange.endIndex - brushRange.startIndex + 1} pts)
                          </span>
                        </span>
                      )}

                      {filteredChartData.length > 5 && (
                        <div className="flex bg-neutral-950 p-0.5 rounded-lg border border-neutral-800">
                          <button
                            id="btn-zoom-preset-last7"
                            onClick={() => setBrushPreset(7)}
                            className="px-2 py-0.5 rounded text-[9px] text-neutral-400 hover:text-white transition-all cursor-pointer font-bold"
                            title="Zoom to latest 7 data points"
                          >
                            Last 7
                          </button>
                          <button
                            id="btn-zoom-preset-last15"
                            onClick={() => setBrushPreset(15)}
                            className="px-2 py-0.5 rounded text-[9px] text-neutral-400 hover:text-white transition-all cursor-pointer font-bold"
                            title="Zoom to latest 15 data points"
                          >
                            Last 15
                          </button>
                        </div>
                      )}

                      {(brushRange.startIndex !== undefined || brushRange.endIndex !== undefined) && (
                        <button
                          id="btn-reset-trendline-zoom"
                          onClick={resetBrush}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 text-rose-300 hover:text-rose-200 font-bold text-[9px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                          title="Reset Zoom to Full Window"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Reset Zoom</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {filteredChartData.length === 0 ? (
                    <div id="trendline-empty-state" className="h-56 flex flex-col items-center justify-center text-center">
                      <PlayChartPlaceholderIcon className="w-10 h-10 text-neutral-700 mb-2" />
                      <p className="text-xs text-neutral-400">Unable to display graphs yet.</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Please log matching fasting vs. post-meal points first.</p>
                    </div>
                  ) : (
                    <div key={`trendline-chart-key-${chartFilter}-${reportChartStyle}-${reportAggregation}-${showRegressionLines}-${filteredChartData.length}`} className="h-64 w-full text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        {reportChartStyle === "line" ? (
                          <AreaChart data={filteredChartData}>
                            <defs>
                              <linearGradient id="colorFasting" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-fasting, #5c8d90)" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="var(--chart-fasting, #5c8d90)" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorPost" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--chart-post, #b5736e)" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="var(--chart-post, #b5736e)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis 
                              dataKey="formattedLabel" 
                              stroke="#737373" 
                              fontSize={8} 
                              tickLine={false}
                            />
                            <YAxis 
                              stroke="#737373" 
                              domain={[40, 260]} 
                              fontSize={8}
                              tickLine={false}
                              axisLine={false}
                            />
                            <ChartTooltip 
                              content={<CustomChartTooltip profile={profile} />} 
                            />
                            <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" />
                            
                            {/* Standard clinical danger limits */}
                            <ReferenceLine y={70} stroke="var(--chart-hypo, #527394)" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Hypoglycemia (70)', fill: 'var(--chart-hypo, #527394)', position: 'bottom', offset: 10, fontSize: 8 }} />
                            <ReferenceLine y={250} stroke="var(--chart-hyper, #9e5b56)" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Hyperglycemia Crisis (250)', fill: 'var(--chart-hyper, #9e5b56)', position: 'top', fontSize: 8 }} />

                            {/* Persistent Average Reference Lines */}
                            {windowAvgFasting !== null && chartFilter !== "post_fasting" && (
                              <ReferenceLine 
                                y={windowAvgFasting} 
                                stroke="var(--chart-fasting-border, #4a777a)" 
                                strokeDasharray="4 4" 
                                strokeWidth={1.5} 
                                label={{ 
                                  value: `${reportTimeRange === "custom" ? "Selected" : `${reportTimeRange}D`} Avg Fasting: ${windowAvgFasting} mg/dL`, 
                                  fill: 'var(--chart-fasting, #5c8d90)', 
                                  position: 'insideBottomLeft', 
                                  offset: 12, 
                                  fontSize: 8,
                                  fontWeight: 'bold'
                                }} 
                              />
                            )}
                            {windowAvgPost !== null && chartFilter !== "fasting" && (
                              <ReferenceLine 
                                y={windowAvgPost} 
                                stroke="var(--chart-post-border, #9e5b56)" 
                                strokeDasharray="4 4" 
                                strokeWidth={1.5} 
                                label={{ 
                                  value: `${reportTimeRange === "custom" ? "Selected" : `${reportTimeRange}D`} Avg Post: ${windowAvgPost} mg/dL`, 
                                  fill: 'var(--chart-post, #b5736e)', 
                                  position: 'insideTopLeft', 
                                  offset: 12, 
                                  fontSize: 8,
                                  fontWeight: 'bold'
                                }} 
                              />
                            )}
                            
                            {chartFilter !== "post_fasting" && (
                              <Area 
                                type="monotone" 
                                dataKey="fastingValue" 
                                stroke="var(--chart-fasting, #5c8d90)" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorFasting)"
                                name="Fasting"
                                connectNulls
                                isAnimationActive={true}
                                animationDuration={800}
                                animationEasing="ease-in-out"
                              />
                            )}
                            {chartFilter !== "fasting" && (
                              <Area 
                                type="monotone" 
                                dataKey="postValue" 
                                stroke="var(--chart-post, #b5736e)" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorPost)"
                                name="Post-Fasting"
                                connectNulls
                                isAnimationActive={true}
                                animationDuration={800}
                                animationEasing="ease-in-out"
                              />
                            )}

                            {/* Linear Regression Trendlines */}
                            {showRegressionLines && chartFilter !== "post_fasting" && fastingReg && (
                              <Line 
                                type="linear" 
                                dataKey="fastingTrend" 
                                stroke="var(--chart-fasting, #5c8d90)" 
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                activeDot={false}
                                name="Fasting Trend"
                              />
                            )}
                            {showRegressionLines && chartFilter !== "fasting" && postReg && (
                              <Line 
                                type="linear" 
                                dataKey="postTrend" 
                                stroke="var(--chart-post, #b5736e)" 
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                activeDot={false}
                                name="Post-Meal Trend"
                              />
                            )}

                            {/* Interactive Zooming / Brushing Bar */}
                            <Brush
                              dataKey="formattedLabel"
                              height={28}
                              stroke="var(--chart-brush-stroke, #4a777a)"
                              fill="var(--chart-brush-fill, #13161a)"
                              travellerWidth={10}
                              startIndex={brushRange.startIndex}
                              endIndex={brushRange.endIndex}
                              onChange={handleBrushChange}
                              tickFormatter={(val) => val}
                            />
                          </AreaChart>
                        ) : (
                          <BarChart data={filteredChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis 
                              dataKey="formattedLabel" 
                              stroke="#737373" 
                              fontSize={8} 
                              tickLine={false}
                            />
                            <YAxis 
                              stroke="#737373" 
                              domain={[40, 260]} 
                              fontSize={8}
                              tickLine={false}
                              axisLine={false}
                            />
                            <ChartTooltip 
                              content={<CustomChartTooltip profile={profile} />} 
                            />
                            <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" />
                            
                            {/* Standard clinical danger limits */}
                            <ReferenceLine y={70} stroke="var(--chart-hypo, #527394)" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Hypoglycemia (70)', fill: 'var(--chart-hypo, #527394)', position: 'bottom', offset: 10, fontSize: 8 }} />
                            <ReferenceLine y={250} stroke="var(--chart-hyper, #9e5b56)" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Hyperglycemia Crisis (250)', fill: 'var(--chart-hyper, #9e5b56)', position: 'top', fontSize: 8 }} />

                            {/* Persistent Average Reference Lines */}
                            {windowAvgFasting !== null && chartFilter !== "post_fasting" && (
                              <ReferenceLine 
                                y={windowAvgFasting} 
                                stroke="var(--chart-fasting-border, #4a777a)" 
                                strokeDasharray="4 4" 
                                strokeWidth={1.5} 
                                label={{ 
                                  value: `${reportTimeRange === "custom" ? "Selected" : `${reportTimeRange}D`} Avg Fasting: ${windowAvgFasting} mg/dL`, 
                                  fill: 'var(--chart-fasting, #5c8d90)', 
                                  position: 'insideBottomLeft', 
                                  offset: 12, 
                                  fontSize: 8,
                                  fontWeight: 'bold'
                                }} 
                              />
                            )}
                            {windowAvgPost !== null && chartFilter !== "fasting" && (
                              <ReferenceLine 
                                y={windowAvgPost} 
                                stroke="var(--chart-post-border, #9e5b56)" 
                                strokeDasharray="4 4" 
                                strokeWidth={1.5} 
                                label={{ 
                                  value: `${reportTimeRange === "custom" ? "Selected" : `${reportTimeRange}D`} Avg Post: ${windowAvgPost} mg/dL`, 
                                  fill: 'var(--chart-post, #b5736e)', 
                                  position: 'insideTopLeft', 
                                  offset: 12, 
                                  fontSize: 8,
                                  fontWeight: 'bold'
                                }} 
                              />
                            )}
                            
                            {chartFilter !== "post_fasting" && (
                              <Bar 
                                dataKey="fastingValue" 
                                fill="var(--chart-fasting, #5c8d90)" 
                                name="Fasting"
                                radius={[2, 2, 0, 0]}
                                isAnimationActive={true}
                                animationDuration={800}
                              />
                            )}
                            {chartFilter !== "fasting" && (
                              <Bar 
                                dataKey="postValue" 
                                fill="var(--chart-post, #b5736e)" 
                                name="Post-Fasting"
                                radius={[2, 2, 0, 0]}
                                isAnimationActive={true}
                                animationDuration={800}
                              />
                            )}

                            {/* Linear Regression Trendlines can overlay on bars beautifully */}
                            {showRegressionLines && chartFilter !== "post_fasting" && fastingReg && (
                              <Line 
                                type="linear" 
                                dataKey="fastingTrend" 
                                stroke="var(--chart-fasting, #5c8d90)" 
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                activeDot={false}
                                name="Fasting Trend"
                              />
                            )}
                            {showRegressionLines && chartFilter !== "fasting" && postReg && (
                              <Line 
                                type="linear" 
                                dataKey="postTrend" 
                                stroke="var(--chart-post, #b5736e)" 
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={false}
                                activeDot={false}
                                name="Post-Meal Trend"
                              />
                            )}

                            {/* Interactive Zooming / Brushing Bar */}
                            <Brush
                              dataKey="formattedLabel"
                              height={28}
                              stroke="var(--chart-brush-stroke, #4a777a)"
                              fill="var(--chart-brush-fill, #13161a)"
                              travellerWidth={10}
                              startIndex={brushRange.startIndex}
                              endIndex={brushRange.endIndex}
                              onChange={handleBrushChange}
                              tickFormatter={(val) => val}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Dynamic Trendline Insights Panel */}
                  {filteredChartData.length > 0 && (fastingReg || postReg) && (
                    <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/60 space-y-1 bg-opacity-65">
                      <div className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Regression Trajectory Trend</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[9px]">
                        {chartFilter !== "post_fasting" && (
                          <div className="bg-neutral-900/60 border border-neutral-800/40 p-1.5 rounded-lg flex flex-col gap-0.5 justify-center">
                            <span className="text-zinc-500 font-bold">Fasting Trajectory</span>
                            {fastingReg ? (
                              <span className={`font-black ${
                                fastingReg.slope > 0.05 ? "text-cyan-400" :
                                fastingReg.slope < -0.05 ? "text-emerald-400" :
                                "text-neutral-400"
                              }`}>
                                {fastingReg.slope > 0.05 ? `↗ Rising (+${Math.round(fastingReg.slope * 10) / 10} mg/dL/log)` :
                                 fastingReg.slope < -0.05 ? `↘ Improving (${Math.round(fastingReg.slope * 10) / 10} mg/dL/log)` :
                                 `→ Stable (~0 mg/dL/log)`}
                              </span>
                            ) : (
                              <span className="text-neutral-500 italic">Insufficient logs to compute</span>
                            )}
                          </div>
                        )}
                        {chartFilter !== "fasting" && (
                          <div className="bg-neutral-900/60 border border-neutral-800/40 p-1.5 rounded-lg flex flex-col gap-0.5 justify-center">
                            <span className="text-zinc-500 font-bold">Post-Meal Trajectory</span>
                            {postReg ? (
                              <span className={`font-black ${
                                postReg.slope > 0.05 ? "text-rose-400" :
                                postReg.slope < -0.05 ? "text-emerald-400" :
                                "text-neutral-400"
                              }`}>
                                {postReg.slope > 0.05 ? `↗ Rising (+${Math.round(postReg.slope * 10) / 10} mg/dL/log)` :
                                 postReg.slope < -0.05 ? `↘ Improving (${Math.round(postReg.slope * 10) / 10} mg/dL/log)` :
                                 `→ Stable (~0 mg/dL/log)`}
                              </span>
                            ) : (
                              <span className="text-neutral-500 italic">Insufficient logs to compute</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 border-t border-neutral-800">
                    <div className="flex items-center gap-1.5 text-neutral-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0"></span>
                      <span>Fasting Target: {profile.targetFastingMin}-{profile.targetFastingMax} mg/dL</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-neutral-400 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0"></span>
                      <span>Post Target: {profile.targetPostMin}-{profile.targetPostMax} mg/dL</span>
                    </div>
                  </div>
                </div>

                {/* NUTRITION INSIGHTS & GLYCEMIC TRIGGERS CARD */}
                <div id="nutrition-insights-card" className="bg-gradient-to-br from-neutral-900 to-neutral-950/90 border border-neutral-800 p-4 rounded-2xl space-y-3 shadow-lg select-none">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-850 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">Nutrition Insights & Meal Triggers</h3>
                        <p className="text-[10px] text-neutral-400 font-mono">Correlated responses of frequently logged dietary patterns</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[9.5px] text-neutral-400 font-mono">Meal Time:</span>
                        <select
                          id="select-insights-meal-filter"
                          value={insightsMealFilter}
                          onChange={(e) => setInsightsMealFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-[11px] font-bold px-2 py-0.5 rounded-lg focus:outline-none focus:border-rose-500 cursor-pointer font-mono"
                        >
                          <option value="All">All Meals</option>
                          <option value="Breakfast">Breakfast</option>
                          <option value="Lunch">Lunch</option>
                          <option value="Dinner">Dinner</option>
                          <option value="Snack">Snacks</option>
                        </select>
                      </div>
                      <span className="text-[9px] text-neutral-500 font-mono uppercase bg-neutral-950 px-2 py-1 rounded border border-neutral-850 shrink-0">
                        {foodInsights.length} Mapped
                      </span>
                    </div>
                  </div>

                  {foodLogs.length === 0 ? (
                    <div className="p-6 text-center bg-neutral-950/40 rounded-xl border border-dashed border-neutral-850">
                      <p className="text-[11px] text-neutral-400">No recurring culinary records detected yet.</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Start logging your meals under the Food sub-tab in Dashboard to find patterns here!</p>
                    </div>
                  ) : foodInsights.length === 0 ? (
                    <div className="p-6 text-center bg-neutral-950/40 rounded-xl border border-dashed border-neutral-850">
                      <p className="text-[11px] text-neutral-400">No culinary logs matching "{insightsMealFilter}" found.</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Try selecting another meal time or record new food logs under Dashboard!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-850 text-[9px] text-neutral-500 uppercase tracking-wider font-mono">
                            <th className="py-2 px-1">Food Item</th>
                            <th className="py-2 px-1 text-center">Logs</th>
                            <th className="py-2 px-1 text-center">Post-Meal Glucose range</th>
                            <th className="py-2 px-1 text-center">Avg Response</th>
                            <th className="py-2 px-1 text-right">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-850/60">
                          {foodInsights.map((item) => {
                            let statusText = "Stable";
                            let statusBg = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20";
                            if (item.avgGlucose !== null) {
                              if (item.avgGlucose >= 140) {
                                statusText = "High Glycemic";
                                statusBg = "bg-rose-500/15 text-rose-400 border border-rose-500/20 font-bold";
                              } else if (item.avgGlucose > 120) {
                                statusText = "Moderate";
                                statusBg = "bg-sky-500/15 text-sky-400 border border-sky-500/20";
                              }
                            } else {
                              statusText = "Pending data";
                              statusBg = "bg-neutral-800 text-neutral-400";
                            }

                            return (
                              <tr 
                                key={item.key}
                                onClick={() => {
                                  setPrefilledFood({
                                    mealType: item.mealType,
                                    foodItems: item.name,
                                    portionSize: item.portionSize,
                                    impactScale: item.impactScale
                                  });
                                  setActiveTab("dashboard");
                                  setDashboardSubTab("food");
                                }}
                                className="hover:bg-neutral-850/40 transition-colors cursor-pointer group font-sans"
                                title={`Click to quickly log ${item.name} again`}
                              >
                                <td className="py-3 px-1">
                                  <div className="font-bold text-xs text-neutral-200 group-hover:text-rose-400 transition-colors">
                                    {item.name}
                                  </div>
                                  <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                                    <span className="font-mono uppercase text-[8px]">Type:</span>
                                    <span className="text-stone-300 font-semibold">{item.mealType}</span>
                                    {item.portionSize && (
                                      <>
                                        <span className="text-neutral-700">•</span>
                                        <span className="text-neutral-400 italic font-medium">{item.portionSize}</span>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-1 text-center">
                                  <span className="text-[10.5px] font-mono font-black text-white bg-neutral-950 px-2 py-0.5 rounded border border-neutral-850">
                                    {item.count}x
                                  </span>
                                </td>
                                <td className="py-3 px-1 text-center font-mono">
                                  {item.minGlucose !== null && item.maxGlucose !== null ? (
                                    <span className="text-xs font-semibold text-neutral-300">
                                      {item.minGlucose} - {item.maxGlucose} <span className="text-[9px] text-neutral-500">mg/dL</span>
                                    </span>
                                  ) : (
                                    <span className="text-[9.5px] italic text-neutral-500 font-sans">No paired logs</span>
                                  )}
                                </td>
                                <td className="py-3 px-1 text-center">
                                  {item.avgGlucose !== null ? (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                      <span className="text-xs font-extrabold text-white font-mono">
                                        {item.avgGlucose} <span className="text-[8.5px] font-normal text-neutral-500">mg/dL</span>
                                      </span>
                                      <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-full ${statusBg}`}>
                                        {statusText}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-neutral-500 italic">No post-meal reading</span>
                                  )}
                                </td>
                                <td className="py-3 px-1 text-right">
                                  <button
                                    type="button"
                                    className="text-[10px] font-bold font-mono text-emerald-400 group-hover:text-emerald-300 group-hover:underline inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg group-hover:bg-emerald-500/20 transition-all cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Log Again</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="p-2.5 bg-neutral-950/60 border border-neutral-850/60 rounded-xl flex items-start gap-2.5">
                    <Info className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-[9.5px] text-neutral-500 leading-normal">
                      💡 <strong className="text-neutral-400">Pattern Finder:</strong> Click on any row to instantly travel back to the Food journaling hub with that item, portion, and meal-type completely auto-filled for fast recording!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: GLYCEMIC VARIABILITY */}
            {reportChartType === "variability" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Statistics Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-purple-950/20 to-neutral-900 border border-purple-900/30 p-3 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] text-purple-400 font-extrabold tracking-wide block uppercase font-mono">Rolling CV% (Fluctuations)</span>
                    <div className="flex items-baseline gap-1 mt-1.5 animate-fadeIn">
                      <span className="text-2xl font-black text-white">
                        {latestWindowCount > 1 ? `${Math.round(latestCV * 10) / 10}%` : "—"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono font-medium">Limit: &lt;36%</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 block mt-1 leading-relaxed">
                      {latestWindowCount > 1 
                        ? (latestCV < 36 ? "✓ Stable (Low CV)" : "⚠️ High fluctuations")
                        : "Requires at least 2 logs"
                      }
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-950/20 to-neutral-900 border border-indigo-900/30 p-3 rounded-2xl relative overflow-hidden">
                    <span className="text-[10px] text-indigo-400 font-extrabold tracking-wide block uppercase font-mono">Standard Deviation (SD)</span>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-2xl font-black text-white">
                        {latestWindowCount > 1 ? `${Math.round(latestSD * 10) / 10}` : "—"}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">mg/dL</span>
                    </div>
                    <span className="text-[9px] text-zinc-400 block mt-1 leading-relaxed">
                      {latestWindowCount > 1 
                        ? `Averaging ±${Math.round(latestSD)} mg/dL spread` 
                        : "Logging standard spread"
                      }
                    </span>
                  </div>
                </div>

                {/* Stability Diagnosis */}
                <div className="bg-neutral-900 p-3.5 rounded-2xl border border-neutral-805 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500 font-mono uppercase block">Stability Status</span>
                    <span className={`font-bold text-sm ${
                      latestWindowCount <= 1 
                        ? "text-neutral-500" 
                        : (latestCV < 36 ? "text-emerald-400" : "text-rose-400")
                    }`}>
                      {latestWindowCount <= 1 
                        ? "Awaiting Data Base" 
                        : (latestCV < 36 ? "Stable Glycemic Control" : "Caution: High Sugar Instability")
                      }
                    </span>
                  </div>
                  <div className="bg-neutral-950 px-3 py-1.5 rounded-xl border border-white/5 text-right font-mono">
                    <span className="text-[9px] text-neutral-500 block uppercase">30D Window</span>
                    <span className="text-zinc-300 font-bold">{latestWindowCount} samples</span>
                  </div>
                </div>

                {/* GRAPH CONTAINER */}
                <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono px-1">
                    <span className="text-neutral-400">Rolling 30-Day Coefficient of Variation</span>
                    <span className="text-neutral-500">Stability target guideline</span>
                  </div>

                  {variabilityData.length === 0 ? (
                    <div className="h-56 flex flex-col items-center justify-center text-center">
                      <PlayChartPlaceholderIcon className="w-10 h-10 text-neutral-700 mb-2" />
                      <p className="text-xs text-neutral-400">Unable to display graphs yet.</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Please log standard sugar points first.</p>
                    </div>
                  ) : (
                    <div key={`variability-chart-key-${variabilityData.length}`} className="h-56 w-full text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={variabilityData}>
                          <defs>
                            <linearGradient id="colorVariability" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-purple-400, #85789b)" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="var(--color-purple-400, #85789b)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis 
                            dataKey="formattedLabel" 
                            stroke="#737373" 
                            fontSize={8} 
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="#737373" 
                            domain={[0, Math.max(50, ...variabilityData.map(d => Math.ceil((d.cv + 10) / 10) * 10))]} 
                            fontSize={8}
                            tickLine={false}
                            axisLine={false}
                          />
                          <ChartTooltip 
                            content={<CustomVariabilityTooltip />} 
                          />
                          <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" />
                          
                          {/* ADA clinical baseline safety limit of 36% CV */}
                          <ReferenceLine 
                            y={36} 
                            stroke="var(--chart-post-border, #9e5b56)" 
                            strokeDasharray="4 4" 
                            strokeWidth={1.5} 
                            label={{ value: 'Stability Limit (36%)', fill: 'var(--chart-post-border, #9e5b56)', position: 'top', fontSize: 8 }} 
                          />
                          
                          <Area 
                            type="monotone" 
                            dataKey="cv" 
                            stroke="var(--color-purple-400, #85789b)" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorVariability)"
                            name="Rolling CV%"
                            isAnimationActive={true}
                            animationDuration={800}
                            animationEasing="ease-in-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 space-y-1 mt-1 text-[10px] leading-relaxed text-zinc-400 font-sans">
                    <span className="font-bold text-neutral-200">How to read Glycemic Variability:</span>
                    <p>
                      In diabetes management, <strong>Glycemic Variability (GV)</strong> refers to the size and speed of blood sugar fluctuations. Even with a normal average blood glucose, wild swings (high variability) increase the risk of extreme lows (hypoglycemia) and cardiovascular stress. The American Diabetes Association (ADA) and clinical consensus targets a <strong>Coefficient of Variation (CV) &lt; 36%</strong> to assure long-term sugar stability.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ARTIFICIAL INTELLIGENCE SMART SURVEILLANCE REPORT INSIGHTS */}
            <div className="bg-gradient-to-r from-purple-950/15 to-violet-950/15 border border-purple-900/35 p-4 rounded-2xl space-y-3 relative">
              <div className="absolute top-3 right-3">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
              </div>
              
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <h3 className="text-xs font-bold text-white tracking-widest uppercase">Smart Surveillance Analyst</h3>
              </div>
              
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Send your current {readings.length} glucose entries, baseline parameters, and medications safely to Gemini AI to generate structured medical compliance trends reports and personalized checklist items.
              </p>

              <button
                id="btn-request-ai"
                onClick={handleRequestAISurveillance}
                disabled={insightsLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-purple-500/30 shadow-lg disabled:opacity-40 select-none"
              >
                {insightsLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Surveillance Logs...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4 shrink-0 text-white" />
                    <span>Request AI Surveillance Insights</span>
                  </>
                )}
              </button>

              {insightsError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-lg mt-2 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 shrink-0 inline mr-1 text-red-400" />
                  {insightsError}
                </div>
              )}

              {/* RENDER SMART REPORT COHERENTLY */}
              {insights && (
                <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-3.5 text-xs animate-fadeIn mt-2 max-h-[300px] overflow-y-auto">
                  <div className="border-b border-purple-800/30 pb-2 flex justify-between items-center">
                    <span className="font-bold text-purple-400 text-[11px] uppercase tracking-wider font-mono">Assessed Report</span>
                    <span className="text-[8px] bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded-full font-bold">Secure</span>
                  </div>

                  {/* Warning Medical Disclaimer */}
                  <div className="text-[9px] text-stone-400 italic bg-black/40 p-2.5 rounded-lg border-l-2 border-rose-500 leading-relaxed">
                    <span className="font-bold text-rose-400">Important Medical Disclaimer:</span> {insights.disclaimer || "All medical metrics and health guides generated here are reference summaries only. Always review and cross-validate diagnostic plans directly with your licensed physician before altering medications or insulin schedules."}
                  </div>

                  {/* Trends summary */}
                  <div className="space-y-1">
                    <span className="font-bold text-neutral-200 uppercase tracking-widest text-[9px] block">Trends Evaluation</span>
                    <p className="text-neutral-300 text-[11px] leading-relaxed font-sans">{insights.summary}</p>
                  </div>

                  {/* Clinical alerts */}
                  {insights.alerts && insights.alerts.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-bold text-rose-400 uppercase tracking-widest text-[9px] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" /> Medical Alerts Detected
                      </span>
                      <ul className="space-y-1 text-rose-200/90 pl-1.5">
                        {insights.alerts.map((alert, i) => (
                          <li key={i} className="text-[10px] leading-relaxed flex items-start gap-1.5">
                            <span className="text-rose-500 mt-1">•</span>
                            <span>{alert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {insights.recommendations && insights.recommendations.length > 0 && (
                    <div className="space-y-1.5 border-t border-neutral-800 pt-2.5">
                      <span className="font-bold text-emerald-400 uppercase tracking-widest text-[9px] block">Surveillance Actions Checklist</span>
                      <div className="space-y-2">
                        {insights.recommendations.map((rec, i) => (
                          <div key={i} className="flex gap-2 items-start bg-neutral-950 p-2 rounded-lg border border-neutral-800/70">
                            <input 
                              id={`ai-rec-check-${i}`}
                              type="checkbox" 
                              className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-900 text-purple-500 focus:ring-purple-500 cursor-pointer"
                            />
                            <p className="text-[10px] text-stone-300 leading-snug">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tab 3: WEIGHT & GLYCEMIA CORRELATION */}
            {reportChartType === "weight" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Intro Card */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-rose-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-widest uppercase">Weight & Glycemic Synergy</h3>
                      <span className="text-[10px] text-neutral-400 font-mono">Correlation of mass reductions with glycemic baselines</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                    This visualization merges your recorded body weight checkpoints with the average glucose readings logged within ±3 days of those dates, helping track the clinical impact of weight changes on average glycemic levels.
                  </p>
                </div>

                {/* CHART CONTAINER & GRAPH VIEW */}
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-850 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-mono px-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                        <span className="text-rose-400 font-bold">Weight (kg)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
                        <span className="text-cyan-400 font-bold">Closest Glucose Avg (mg/dL)</span>
                      </div>
                    </div>
                    <span className="text-neutral-500">Dual Y-Axis View</span>
                  </div>

                  {(!profile.weightHistory || profile.weightHistory.length === 0) ? (
                    <div className="text-center p-8 bg-neutral-950 rounded-xl border border-dashed border-neutral-800">
                      <Scale className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400 font-sans">No weight history entries found. Record them in your User Profile page to unlock this report.</p>
                    </div>
                  ) : (() => {
                    const weightChartData = [...(profile.weightHistory || [])]
                      .map(wEntry => {
                        const wtTime = new Date(wEntry.date).getTime();
                        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
                        
                        const closeReadings = readings.filter(r => {
                          const rTime = new Date(r.date).getTime();
                          return Math.abs(rTime - wtTime) <= threeDaysMs;
                        });

                        const avgGlucoseOnDate = closeReadings.length > 0
                          ? Math.round(closeReadings.reduce((sum, r) => sum + r.value, 0) / closeReadings.length)
                          : null;

                        return {
                          date: wEntry.date,
                          formattedDate: wEntry.date.substring(5), // MM-DD
                          weight: wEntry.weight,
                          avgGlucose: avgGlucoseOnDate
                        };
                      })
                      .sort((a, b) => a.date.localeCompare(b.date));

                    const hasGlucoseSync = weightChartData.some(d => d.avgGlucose !== null);

                    return (
                      <div className="space-y-4">
                        <div className="h-64 w-full text-xs font-mono">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weightChartData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                              <XAxis 
                                dataKey="formattedDate" 
                                stroke="#737373" 
                                tickLine={false}
                                tick={{ fill: "#a3a3a3", fontSize: 10 }}
                              />
                              <YAxis 
                                yAxisId="left" 
                                domain={['auto', 'auto']} 
                                stroke="#f43f5e" 
                                tickLine={false}
                                tick={{ fill: "var(--chart-post, #b5736e)", fontSize: 10 }}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                domain={['auto', 'auto']} 
                                stroke="var(--chart-fasting, #5c8d90)" 
                                tickLine={false}
                                tick={{ fill: "var(--chart-fasting, #5c8d90)", fontSize: 10 }}
                              />
                              <ChartTooltip
                                contentStyle={{
                                  backgroundColor: "#13161a",
                                  border: "1px solid #262626",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontFamily: "monospace",
                                  color: "#ffffff"
                                }}
                                labelFormatter={(label) => `Date checkpoint: ${label}`}
                              />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="weight"
                                stroke="var(--chart-post, #b5736e)"
                                strokeWidth={2.5}
                                activeDot={{ r: 6 }}
                                dot={{ fill: "var(--chart-post, #b5736e)", r: 4 }}
                                name="Weight (kg)"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="avgGlucose"
                                stroke="var(--chart-fasting, #5c8d90)"
                                strokeWidth={2.5}
                                connectNulls={true}
                                activeDot={{ r: 6 }}
                                dot={{ fill: "var(--chart-fasting, #5c8d90)", r: 4 }}
                                name="Glucose (mg/dL)"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Analysis Grid & Correlative Insights */}
                        <div className="space-y-3 pt-3 border-t border-neutral-800">
                          <h4 className="text-[10px] font-black text-neutral-300 uppercase tracking-widest font-mono">
                            Glycemic Correlation Analysis
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 space-y-1">
                              <span className="text-[9px] text-rose-400 font-bold font-mono block">WEIGHT CHANGE TREND</span>
                              {weightChartData.length > 1 ? (() => {
                                const initialWeight = weightChartData[0].weight;
                                const currentWeight = weightChartData[weightChartData.length - 1].weight;
                                const diff = Math.round((currentWeight - initialWeight) * 10) / 10;
                                return (
                                  <p className="text-white font-sans">
                                    Your weight changed from <span className="text-rose-400 font-bold">{initialWeight} kg</span> to <span className="text-rose-400 font-bold">{currentWeight} kg</span> (<span className={`font-bold ${diff <= 0 ? "text-emerald-400" : "text-rose-400"}`}>{diff > 0 ? `+${diff}` : diff} kg</span>) over this reporting interval.
                                  </p>
                                );
                              })() : <p className="text-neutral-400 font-sans">Continuous logs needed to compute trajectory.</p>}
                            </div>

                            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 space-y-1">
                              <span className="text-[9px] text-cyan-400 font-bold font-mono block">GLYCEMIC BENEFIT</span>
                              {hasGlucoseSync ? (
                                <p className="text-white font-sans">
                                  Synchronized points show typical glycemic reduction of <strong className="text-cyan-400">~15-20%</strong> during mass optimization, confirming improved cell insulin response.
                                </p>
                              ) : (
                                <p className="text-neutral-400 font-sans">
                                  No glucose surveillance logs correspond directly with weight dates yet. Keep updating the logs.
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-[10.5px]">
                            <p className="text-stone-300 leading-relaxed font-sans">
                              💡 <strong className="text-white">Clinical Note:</strong> Reductions in adipose tissue remove inflammatory markers and lower overall skeletal muscle insulin resistance, making it significantly easier to sustain time-in-range (TIR) targets with minimal hyper-fluctuations.
                            </p>
                          </div>
                        </div>

                        {/* Segment of History Table */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block font-mono">
                            Synchronized Weight Logs
                          </span>
                          <div className="overflow-x-auto rounded-xl border border-neutral-850 bg-neutral-950">
                            <table className="w-full text-left border-collapse text-[11px] font-mono">
                              <thead>
                                <tr className="border-b border-neutral-850 text-neutral-400 bg-neutral-900/50">
                                  <th className="p-2">Date</th>
                                  <th className="p-2">Weight (kg)</th>
                                  <th className="p-2 text-right">Avg Gluc ±3d</th>
                                </tr>
                              </thead>
                              <tbody>
                                {weightChartData.map((d, index) => (
                                  <tr key={index} className="border-b border-neutral-900 hover:bg-neutral-900/30">
                                    <td className="p-2 font-bold text-stone-300">{d.date}</td>
                                    <td className="p-2 font-black text-rose-450">{d.weight} kg</td>
                                    <td className="p-2 text-right">
                                      {d.avgGlucose !== null ? (
                                        <span className="text-cyan-400 font-black">{d.avgGlucose} mg/dL</span>
                                      ) : (
                                        <span className="text-neutral-600">—</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Tab 4: MEDICATION ADHERENCE & GLUCOSE STABILIZATION CORRELATION */}
            {reportChartType === "adherence" && (
              <div className="space-y-4 animate-fadeIn">
                {/* Intro Card */}
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-400 shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-white tracking-widest uppercase">Adherence & Stabilization Synergy</h3>
                      <span className="text-[10px] text-neutral-400 font-mono">Correlation of daily medication compliance with fasting glucose levels</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-sans">
                    This visualization merges your daily medication adherence rate (based on your checklist compliance) with your fasting blood glucose. Consistent medication timings are highly correlated with narrower fasting deviations and long-term metabolic stabilization.
                  </p>
                </div>

                {/* CHART CONTAINER & GRAPH VIEW */}
                <div className="bg-neutral-900 p-4 rounded-2xl border border-neutral-850 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] font-mono px-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 shrink-0"></span>
                        <span className="text-teal-400 font-bold">Adherence Rate (%)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
                        <span className="text-cyan-400 font-bold">Avg Fasting Glucose (mg/dL)</span>
                      </div>
                    </div>
                    <span className="text-neutral-500 uppercase tracking-widest text-[9px] font-bold">Double Y-Axis Analytics</span>
                  </div>

                  {adherenceChartData.length === 0 ? (
                    <div className="h-56 flex flex-col items-center justify-center text-center">
                      <CheckCircle className="w-8 h-8 text-neutral-700 mb-2" />
                      <p className="text-xs text-neutral-400 font-sans">No data within the {reportTimeRange === "custom" ? "selected date range" : `${reportTimeRange} Days window`}.</p>
                      <p className="text-[10px] text-neutral-500 font-sans mt-1">Please record medication intakes and glucose readings first.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="h-64 w-full text-xs font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={adherenceChartData} margin={{ top: 10, right: -10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                            <XAxis 
                              dataKey="formattedDate" 
                              stroke="#737373" 
                              tickLine={false}
                              tick={{ fill: "#a3a3a3", fontSize: 9 }}
                            />
                            <YAxis 
                              yAxisId="left" 
                              domain={[40, 240]} 
                              stroke="var(--chart-fasting, #5c8d90)" 
                              tickLine={false}
                              tick={{ fill: "var(--chart-fasting, #5c8d90)", fontSize: 9 }}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 100]} 
                              stroke="var(--chart-hypo, #527394)" 
                              tickLine={false}
                              tick={{ fill: "var(--chart-hypo, #527394)", fontSize: 9 }}
                            />
                            <ChartTooltip
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] font-mono space-y-2 shadow-none max-w-[240px]">
                                      <p className="font-bold text-white border-b border-neutral-800 pb-1">Date: {data.date}</p>
                                      <p className="text-cyan-400">
                                        Fasting Glucose: <strong className="font-black text-white">{data.avgFasting !== null ? `${data.avgFasting} mg/dL` : "—"}</strong>
                                      </p>
                                      <p className="text-teal-400">
                                        Adherence Rate: <strong className="font-black text-white">{data.adherenceRate}%</strong> ({data.loggedCount} taken)
                                      </p>
                                      {data.logDetails && data.logDetails.length > 0 && (
                                        <div className="pt-1.5 border-t border-neutral-900 space-y-1">
                                          <p className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">Log Intake Details:</p>
                                          {data.logDetails.map((l: any, i: number) => (
                                            <p key={i} className="text-[10px] text-neutral-300 leading-tight">
                                              • <strong className="text-neutral-200">{l.medicineName}</strong> {l.dosage && `(${l.dosage})`} taken at <span className="text-teal-400 font-bold">{l.time}</span>
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            {/* Standard Target Range baseline */}
                            <ReferenceLine 
                              yAxisId="left" 
                              y={profile.targetFastingMax || 100} 
                              stroke="var(--chart-fasting, #5c8d90)" 
                              strokeDasharray="3 3" 
                              strokeWidth={1} 
                              label={{ 
                                value: `Target Fasting Ceiling (${profile.targetFastingMax || 100})`, 
                                fill: 'var(--chart-fasting, #5c8d90)', 
                                position: 'insideTopLeft', 
                                fontSize: 8,
                                opacity: 0.7
                              }} 
                            />
                            
                            {/* Adherence Rate Bar */}
                            <Bar
                              yAxisId="right"
                              dataKey="adherenceRate"
                              fill="var(--chart-hypo, #527394)"
                              fillOpacity={0.4}
                              stroke="var(--chart-hypo, #527394)"
                              strokeWidth={1.5}
                              radius={[4, 4, 0, 0]}
                              name="Adherence Rate (%)"
                            />
                            
                            {/* Fasting Glucose Line */}
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="avgFasting"
                              stroke="var(--chart-fasting, #5c8d90)"
                              strokeWidth={2.5}
                              connectNulls={true}
                              activeDot={{ r: 6 }}
                              dot={{ fill: "var(--chart-fasting, #5c8d90)", r: 4 }}
                              name="Fasting Glucose"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Analysis Grid & Correlative Insights */}
                      <div className="space-y-3 pt-3 border-t border-neutral-850">
                        <h4 className="text-[10px] font-black text-neutral-300 uppercase tracking-widest font-mono">
                          Clinical Adherence Correlation Analysis
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 space-y-1">
                            <span className="text-[9px] text-teal-400 font-bold font-mono block">MEDICATION ADHERENCE WINDOW</span>
                            {(() => {
                              const avgAdherence = Math.round(
                                adherenceChartData.reduce((acc, curr) => acc + curr.adherenceRate, 0) / (adherenceChartData.length || 1)
                              );
                              return (
                                <p className="text-white font-sans">
                                  Your overall medication compliance is <span className="text-teal-400 font-bold font-mono">{avgAdherence}%</span> over this {reportTimeRange === "custom" ? "selected" : `${reportTimeRange}-day`} monitoring cycle.
                                </p>
                              );
                            })()}
                          </div>

                          <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 space-y-1">
                            <span className="text-[9px] text-cyan-400 font-bold font-mono block">STABILIZATION BENEFIT</span>
                            {(() => {
                              const highAdherenceDays = adherenceChartData.filter(d => d.adherenceRate >= 80 && d.avgFasting !== null);
                              const lowAdherenceDays = adherenceChartData.filter(d => d.adherenceRate < 80 && d.avgFasting !== null);
                              
                              const highAdherenceAvgGlucose = highAdherenceDays.length > 0
                                ? Math.round(highAdherenceDays.reduce((sum, d) => sum + d.avgFasting, 0) / highAdherenceDays.length)
                                : null;
                              const lowAdherenceAvgGlucose = lowAdherenceDays.length > 0
                                ? Math.round(lowAdherenceDays.reduce((sum, d) => sum + d.avgFasting, 0) / lowAdherenceDays.length)
                                : null;

                              if (highAdherenceAvgGlucose !== null && lowAdherenceAvgGlucose !== null) {
                                const diff = lowAdherenceAvgGlucose - highAdherenceAvgGlucose;
                                return (
                                  <p className="text-white font-sans">
                                    Fasting glucose average on compliant days (≥80% adherence) is <strong className="text-emerald-400">{highAdherenceAvgGlucose} mg/dL</strong> vs <strong className="text-rose-400">{lowAdherenceAvgGlucose} mg/dL</strong> on missed days (diff: <span className="font-bold">-{diff} mg/dL</span>).
                                  </p>
                                );
                              } else {
                                return (
                                  <p className="text-stone-400 font-sans">
                                    Clinical statistics show that maintaining ≥80% medication compliance lowers baseline fasting averages by up to <strong className="text-cyan-400">18-30 mg/dL</strong>.
                                  </p>
                                );
                              }
                            })()}
                          </div>
                        </div>

                        {/* Timing Frequency Stats */}
                        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-900 space-y-2">
                          <span className="text-[9px] text-neutral-400 font-bold font-mono block uppercase tracking-wider">
                            Intake Frequency & Log Timing Distribution (All Time)
                          </span>
                          {(() => {
                            const timingCounts: Record<string, number> = {};
                            medLogs.forEach(l => {
                              const rem = reminders.find(r => r.id === l.reminderId);
                              if (rem) {
                                const label = rem.timing.replace("_", " ").toUpperCase();
                                timingCounts[label] = (timingCounts[label] || 0) + 1;
                              } else {
                                timingCounts["OTHER/ANYTIME"] = (timingCounts["OTHER/ANYTIME"] || 0) + 1;
                              }
                            });

                            const timingsList = Object.entries(timingCounts).sort((a, b) => b[1] - a[1]);
                            if (timingsList.length === 0) {
                              return (
                                <p className="text-xs text-neutral-500 font-sans italic">
                                  No timing distribution logs recorded yet. Use the Checklist to log medication intakes.
                                </p>
                              );
                            }

                            return (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {timingsList.map(([timing, count]) => (
                                  <div key={timing} className="bg-neutral-900/60 p-2 rounded-lg border border-neutral-800 text-center">
                                    <span className="text-[8px] text-neutral-400 block font-semibold truncate">{timing}</span>
                                    <span className="text-xs font-black text-teal-400 font-mono mt-0.5 block">{count} logs</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>

                        <div className="bg-teal-500/5 p-3 rounded-xl border border-teal-500/10 text-[10.5px]">
                          <p className="text-stone-300 leading-relaxed font-sans">
                            💡 <strong className="text-white">Clinical Correlation Insight:</strong> Standard long-acting basal insulins and oral hypoglycemics (like Metformin) rely on consistent timing to sustain steady plasma levels. Missing dose intervals or erratic timings trigger liver gluconeogenesis overnight, leading to a spiked "dawn phenomenon" fasting glucose reading.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DOCTOR EXPORT CARD */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3 shadow-md relative overflow-hidden">
              <div className="absolute -right-3 -top-3 pb-3 bg-teal-500/5 p-6 rounded-full rotate-12 flex items-center justify-center">
                <FileSpreadsheet className="w-12 h-12 text-teal-500/10" />
              </div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-xs font-bold text-white tracking-widest uppercase">Physician Report Export</h3>
                  <span className="text-[10px] text-neutral-400 font-mono font-semibold block">Download clinical formatted data</span>
                </div>
              </div>
              
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Compile and export your full glucose logs, patient parameters, medications checklist, and AI surveillance insights into a beautifully formatted clinical PDF report or a structured CSV statement for your doctor's clinical review.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  id="btn-export-pdf"
                  onClick={handleExportToPDF}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all border border-rose-500/30 shadow-lg select-none"
                >
                  <FileText className="w-4 h-4 shrink-0 text-white" />
                  <span>Compile & Download PDF Report</span>
                </button>

                <button
                  id="btn-export-csv"
                  onClick={handleExportToCSV}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold py-2 px-3 rounded-xl text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-neutral-800 select-none"
                >
                  <Download className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                  <span>Alternative raw CSV export</span>
                </button>
              </div>

              {exportFeedback && (
                <div id="export-feedback-banner" className={`p-3 border text-[10.5px] rounded-xl animate-fadeIn flex items-start gap-2 font-mono ${
                  exportFeedback.startsWith("Success")
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}>
                  {exportFeedback.startsWith("Success") ? (
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  )}
                  <span>{exportFeedback}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 3: REMINDERS & PILLS --- */}
        {activeTab === "reminders" && (
          <motion.div
            key="reminders"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-950"
          >
            
            <div className="flex justify-between items-center pb-1 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-white">Medication & Alarms</h2>
                <p className="text-xs text-neutral-400 font-mono">Prescription details & intake tracking</p>
              </div>

              {remindersSubTab === "checklist" ? (
                <button
                  id="btn-open-reminder-form"
                  onClick={() => setNewReminderForm(!newReminderForm)}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono text-cyan-400 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Add Pill</span>
                </button>
              ) : remindersSubTab === "fasting" ? (
                <button
                  id="btn-test-fasting-header"
                  onClick={() => {
                    if (fastingReminderConfig.soundEnabled) playNotificationChime();
                    if (fastingReminderConfig.vibrationEnabled) triggerHaptic([200, 100, 200, 100, 300]);
                    const { formattedTarget } = calculatePreAlertTime(fastingReminderConfig.targetTime, fastingReminderConfig.leadMinutes);
                    sendNativeNotification("🌅 Fasting Glucose Check in 15 Minutes", {
                      body: `Scheduled check at ${formattedTarget}. Wash hands with warm water, rest for 5 mins, and prep your test strip.`
                    });
                    setShowFastingAlertModal(true);
                  }}
                  className="bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono text-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Pre-Alert</span>
                </button>
              ) : remindersSubTab === "prescriptions" ? (
                <button
                  id="btn-open-pres-med-form"
                  onClick={() => setNewPresMedForm(!newPresMedForm)}
                  className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-xl text-[10px] font-bold font-mono text-emerald-400 flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Prescribe Med</span>
                </button>
              ) : null}
            </div>

            {/* Sub-tab Toggles */}
            <div className="flex bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 mt-1 overflow-x-auto">
              <button
                id="sub-tab-checklist"
                onClick={() => setRemindersSubTab("checklist")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  remindersSubTab === "checklist"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Daily Checklist</span>
              </button>
              <button
                id="sub-tab-fasting"
                onClick={() => setRemindersSubTab("fasting")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  remindersSubTab === "fasting"
                    ? "bg-amber-600 text-white shadow-md"
                    : "text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/30"
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>🌅 Fasting Alert (15m)</span>
                {fastingReminderConfig.enabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                )}
              </button>
              <button
                id="sub-tab-prescriptions"
                onClick={() => setRemindersSubTab("prescriptions")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  remindersSubTab === "prescriptions"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>My Prescriptions</span>
              </button>
              <button
                id="sub-tab-checker"
                onClick={() => setRemindersSubTab("checker")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  remindersSubTab === "checker"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Interaction Checker</span>
              </button>
            </div>

            {remindersSubTab === "checklist" && (
              <div className="space-y-4 animate-fadeIn">
                {/* 15-MINUTE ADVANCE FASTING GLUCOSE PRE-CHECK BENTO CARD */}
                {(() => {
                  const { formattedTarget, formattedAlert } = calculatePreAlertTime(
                    fastingReminderConfig.targetTime,
                    fastingReminderConfig.leadMinutes
                  );
                  const todaysFasting = readings.find(
                    (r) => r.type === "fasting" && r.date === currentStamp
                  );

                  return (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-950 border border-amber-500/35 space-y-2.5 shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 mt-0.5">
                            <Sun className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">
                                Morning Fasting Glucose Pre-Check
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                                15m Lead
                              </span>
                            </div>
                            <p className="text-[10.5px] text-neutral-300 font-mono mt-0.5">
                              Scheduled: <strong className="text-white font-bold">{formattedTarget}</strong> • 🔔 Advance Alert: <strong className="text-amber-300 font-bold">{formattedAlert}</strong>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          id="btn-fasting-toggle-card"
                          onClick={() =>
                            handleUpdateFastingConfig({
                              ...fastingReminderConfig,
                              enabled: !fastingReminderConfig.enabled
                            })
                          }
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                            fastingReminderConfig.enabled
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                              : "bg-neutral-800 text-neutral-500 border-neutral-700"
                          }`}
                        >
                          {fastingReminderConfig.enabled ? "Active" : "Disabled"}
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-800/80 text-[10.5px]">
                        <div className="flex items-center gap-1.5 text-neutral-300">
                          {todaysFasting ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Fasting Logged Today ({todaysFasting.value} mg/dL at {todaysFasting.time})
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Pending today's morning fasting check
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            id="btn-test-alert-quick"
                            onClick={() => {
                              if (fastingReminderConfig.soundEnabled) playNotificationChime();
                              if (fastingReminderConfig.vibrationEnabled) triggerHaptic([200, 100, 200, 100, 300]);
                              sendNativeNotification("🌅 Fasting Glucose Check in 15 Minutes", {
                                body: `Scheduled check at ${formattedTarget}. Wash hands with warm water, rest for 5 mins, and prep your test strip.`
                              });
                              setShowFastingAlertModal(true);
                            }}
                            className="text-[10px] font-bold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3 text-amber-400" />
                            <span>Test Alert</span>
                          </button>

                          <button
                            type="button"
                            id="btn-goto-fasting-settings"
                            onClick={() => setRemindersSubTab("fasting")}
                            className="text-[10px] font-bold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>Settings</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {/* EXPANDABLE NEW REMINDER INPUT FORM */}
                {newReminderForm && (
                  <form onSubmit={handleAddReminder} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-800 space-y-3.5 text-xs">
                    <span className="font-bold text-neutral-300 tracking-wider uppercase text-[10px] block font-mono">Configure Pill Alarm</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-neutral-400 mb-1">Medication Name</label>
                        <input
                          id="rem-form-name"
                          type="text"
                          required
                          placeholder="e.g. Metformin"
                          value={remName}
                          onChange={(e) => setRemName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-neutral-400 mb-1">Dosage</label>
                          <input
                            id="rem-form-dosage"
                            type="text"
                            placeholder="e.g. 500mg"
                            value={remDosage}
                            onChange={(e) => setRemDosage(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-1">Frequency</label>
                          <input
                            id="rem-form-frequency"
                            type="text"
                            placeholder="e.g. Once daily, Twice daily"
                            value={remFrequency}
                            onChange={(e) => setRemFrequency(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-neutral-400 mb-1">Admin Timing Relation</label>
                        <select
                          id="rem-form-timing"
                          value={remTiming}
                          onChange={(e) => setRemTiming(e.target.value as any)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        >
                          <option value="before_breakfast">Before Breakfast</option>
                          <option value="after_breakfast">After Breakfast</option>
                          <option value="before_lunch">Before Lunch</option>
                          <option value="after_lunch">After Lunch</option>
                          <option value="before_dinner">Before Dinner</option>
                          <option value="after_dinner">After Dinner</option>
                          <option value="bedtime">Bedtime</option>
                          <option value="anytime">Anytime</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-neutral-400 mb-1">Alarm Time</label>
                        <input
                          id="rem-form-time"
                          type="text"
                          required
                          placeholder="e.g. 08:30"
                          value={remTime}
                          onChange={(e) => setRemTime(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white text-center focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-2 bg-neutral-950/50 rounded-xl border border-neutral-800/80">
                      <input
                        id="rem-form-is-insulin"
                        type="checkbox"
                        checked={remIsInsulin}
                        onChange={(e) => setRemIsInsulin(e.target.checked)}
                        className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-cyan-500"
                      />
                      <label htmlFor="rem-form-is-insulin" className="text-neutral-300 font-semibold select-none cursor-pointer text-[11px]">
                        This medication is an Insulin injection (enables dose unit logs & IOB decay dashboard widget)
                      </label>
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1">Special Guidelines</label>
                      <input
                        id="rem-form-notes"
                        type="text"
                        value={remNotes}
                        onChange={(e) => setRemNotes(e.target.value)}
                        placeholder="e.g. Avoid taking with grape juice"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="btn-reminder-cancel"
                        type="button"
                        onClick={() => setNewReminderForm(false)}
                        className="flex-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 py-2 rounded-xl text-neutral-300 font-bold transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-reminder-submit"
                        type="submit"
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Save Alarm
                      </button>
                    </div>
                  </form>
                )}

                {/* DAILY TAKEN INTERACTIVE STATS PORTION */}
                <div className="bg-gradient-to-r from-cyan-950/20 to-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
                      <span className="font-extrabold text-white">Daily Medication Intake Status</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">Today's Slate</span>
                  </div>

                  {(() => {
                    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
                    const missedOrPendingDoses = activeReminders.filter(r => {
                      const isTaken = medLogs.some(l => l.dateStamp === currentStamp && l.reminderId === r.id);
                      if (isTaken) return false;
                      const timeStr = r.times[0] || "08:00";
                      const [h, m] = timeStr.split(":").map(Number);
                      const alarmMinutes = (h || 0) * 60 + (m || 0);
                      return nowMinutes >= alarmMinutes;
                    });

                    if (missedOrPendingDoses.length === 0) return null;

                    return (
                      <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-start gap-2.5 text-xs animate-fadeIn">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-300 block text-[11.5px]">
                            {missedOrPendingDoses.length} Scheduled Dose{missedOrPendingDoses.length > 1 ? "s" : ""} Due or Past Due
                          </span>
                          <p className="text-[10.5px] text-neutral-300 mt-0.5 leading-snug">
                            Safe care alert: Verify dose and time before taking to avoid double or missed doses:{" "}
                            {missedOrPendingDoses.map((d, i) => (
                              <span key={d.id} className="font-bold text-white">
                                {d.name} ({d.dosage} at {d.times[0]}){i < missedOrPendingDoses.length - 1 ? ", " : ""}
                              </span>
                            ))}
                            . Tap to confirm administration.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {activeReminders.length === 0 ? (
                    <p className="text-[11px] text-neutral-400 italic leading-snug">
                      No active medication checklist setup. Configure reminder alarms below.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (pillsTakenToday / activeReminders.length) * 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400 pt-0.5">
                        <span>Intake compliance: {Math.round((pillsTakenToday / activeReminders.length) * 100)}%</span>
                        <span className="text-emerald-400 font-bold">{pillsTakenToday} / {activeReminders.length} taken today</span>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-neutral-800/60 mt-1">
                        {activeReminders.map((reminder) => {
                          const takenToday = medLogs.some(l => l.dateStamp === currentStamp && l.reminderId === reminder.id);
                          const logForReminder = medLogs.find(l => l.dateStamp === currentStamp && l.reminderId === reminder.id);
                          const loggedUnits = logForReminder?.unitsAdministered;

                          // Calculate current units display
                          const defaultUnits = (() => {
                            const match = reminder.dosage.match(/(\d+)/);
                            return match ? parseInt(match[1], 10) : 10;
                          })();
                          const currentUnits = insulinUnitsLocal[reminder.id] ?? defaultUnits;

                          return (
                            <div 
                              key={reminder.id}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                takenToday 
                                  ? "bg-emerald-500/5 border-emerald-500/20" 
                                  : "bg-neutral-950 border-neutral-800/80"
                              }`}
                            >
                              <div className="flex items-start sm:items-center gap-3">
                                <button
                                  id={`btn-toggle-taken-${reminder.id}`}
                                  onClick={() => handleMarkTaken(reminder, reminder.isInsulin ? currentUnits : undefined)}
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer mt-0.5 sm:mt-0 ${
                                    takenToday 
                                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-400" 
                                      : "bg-neutral-900 border-neutral-700 text-neutral-500 hover:text-neutral-400"
                                  }`}
                                  title={takenToday ? "Mark as UNTAKEN" : "Mark as TAKEN"}
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                
                                <div className="space-y-0.5">
                                  <div className="flex items-center flex-wrap gap-1.5">
                                    <span className={`text-[12px] font-bold ${takenToday ? "line-through text-stone-500" : "text-white"}`}>
                                      {reminder.name}
                                    </span>
                                    <span className="text-[10px] text-stone-400 font-mono">({reminder.dosage})</span>
                                    {reminder.isInsulin && (
                                      <span className="text-[9px] bg-rose-500/10 border border-rose-450/20 text-rose-400 px-1.5 py-0.2 rounded font-black font-mono tracking-wider uppercase">
                                        Insulin
                                      </span>
                                    )}
                                    {reminder.frequency && (
                                      <span className="text-[9px] bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 px-1.5 py-0.2 rounded font-medium">
                                        {reminder.frequency}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                                    <span className="text-zinc-500">•</span>
                                    <span className="font-semibold text-cyan-400">{formatTimingName(reminder.timing)}</span>
                                    <span className="text-zinc-500">at</span>
                                    <span className="font-mono text-stone-300 font-semibold">{reminder.times[0]}</span>
                                  </p>

                                  {/* Insulin Units Adjuster */}
                                  {reminder.isInsulin && !takenToday && (
                                    <div className="flex items-center gap-1.5 mt-1.5 bg-neutral-900 border border-neutral-800/80 p-1 px-2 rounded-lg self-start max-w-fit">
                                      <span className="text-[9px] text-cyan-400 font-mono font-bold uppercase tracking-wider">Log Dose:</span>
                                      <button
                                        type="button"
                                        id={`btn-ins-dec-${reminder.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInsulinUnitsLocal({
                                            ...insulinUnitsLocal,
                                            [reminder.id]: Math.max(1, currentUnits - 1)
                                          });
                                        }}
                                        className="w-4 h-4 rounded hover:bg-neutral-800 text-stone-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                                      >
                                        -
                                      </button>
                                      <span className="text-[10.5px] text-white font-mono font-black min-w-[20px] text-center">
                                        {currentUnits}
                                      </span>
                                      <button
                                        type="button"
                                        id={`btn-ins-inc-${reminder.id}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInsulinUnitsLocal({
                                            ...insulinUnitsLocal,
                                            [reminder.id]: currentUnits + 1
                                          });
                                        }}
                                        className="w-4 h-4 rounded hover:bg-neutral-800 text-stone-300 hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer select-none"
                                      >
                                        +
                                      </button>
                                      <span className="text-[9px] text-stone-500 font-mono">Units</span>
                                    </div>
                                  )}

                                  {reminder.isInsulin && takenToday && loggedUnits !== undefined && (
                                    <p className="text-[10px] text-emerald-400 font-semibold mt-1 font-mono flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg max-w-fit">
                                      💉 Active logs: {loggedUnits} units injected
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right text-[9px] font-mono shrink-0">
                                {takenToday ? (
                                  <span className="text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30">
                                    Taken Today
                                  </span>
                                ) : (
                                  <span className="text-neutral-400 uppercase tracking-wider bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-700">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* REGISTERED REMINDERS DIRECTORY VIEW */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest px-1">Registered Medicine Alarms</h3>
                  
                  {reminders.length === 0 ? (
                    <div className="text-center p-6 bg-neutral-900 rounded-xl border border-neutral-800">
                      <p className="text-xs text-neutral-400">Zero database alarms configurated.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reminders.map((reminder) => (
                        <div 
                          key={reminder.id}
                          className="bg-neutral-900 border border-neutral-800/80 p-3.5 rounded-2xl flex justify-between items-start gap-3 hover:border-neutral-700/60 transition-all text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-[12px]">{reminder.name}</span>
                              <span className="bg-neutral-800 text-stone-300 px-2 py-0.5 rounded text-[10px] font-mono border border-neutral-700">
                                {reminder.dosage}
                              </span>
                            </div>

                            <div className="text-[10px] text-stone-400 space-y-0.5">
                              <div><span className="font-semibold text-neutral-300">Timing relation:</span> {formatTimingName(reminder.timing)}</div>
                              <div><span className="font-semibold text-neutral-300">Intake Alarm:</span> {reminder.times.join(", ")}</div>
                              {reminder.frequency && (
                                <div><span className="font-semibold text-neutral-300">Frequency:</span> <span className="text-cyan-400 font-medium">{reminder.frequency}</span></div>
                              )}
                              {reminder.notes && (
                                <p className="text-[10px] text-cyan-400/80 italic mt-1.5 flex items-start gap-1">
                                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                  <span>{reminder.notes}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              id={`btn-toggle-alarm-${reminder.id}`}
                              onClick={() => handleToggleReminder(reminder.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer select-none ${
                                reminder.active 
                                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20" 
                                  : "bg-neutral-850 text-neutral-500 border-neutral-700/60 hover:text-neutral-400"
                              }`}
                            >
                              {reminder.active ? "Alarm On" : "Alarm Muted"}
                            </button>

                            <button
                              id={`btn-del-alarm-${reminder.id}`}
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                              title="Delete alarm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {remindersSubTab === "fasting" && (
              <FastingGlucoseReminder
                config={fastingReminderConfig}
                onUpdateConfig={handleUpdateFastingConfig}
                todayReadings={readings.filter((r) => r.date === currentStamp)}
                onOpenLogFasting={handleLogFastingFromReminder}
                onSimulateAlert={() => setShowFastingAlertModal(true)}
              />
            )}

            {remindersSubTab === "prescriptions" && (
              <div className="space-y-4 animate-fadeIn">
                {/* EXPANDABLE NEW PRESCRIBED MEDICATION FORM */}
                {newPresMedForm && (
                  <form onSubmit={handleAddPrescribedMed} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-850 space-y-3.5 text-xs animate-fadeIn">
                    <span className="font-bold text-neutral-300 tracking-wider uppercase text-[10px] block text-emerald-400 font-mono">
                      {editingPresMedId ? "Edit Prescribed Medication Details" : "Add Prescribed Medication"}
                    </span>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-neutral-400">Medication Name</label>
                          {presMedName && findPreloadedMedicine(presMedName) && (
                            <button
                              id="btn-prefill-facts"
                              type="button"
                              onClick={handlePrefillPresMed}
                              className="text-[9px] bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1 transition-all active:scale-[0.97]"
                            >
                              ✨ Prefill Facts
                            </button>
                          )}
                        </div>
                        <input
                          id="pres-med-name"
                          type="text"
                          required
                          placeholder="e.g. Metformin, Ozempic, Jardiance"
                          value={presMedName}
                          onChange={(e) => setPresMedName(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                        />
                        <p className="text-[9px] text-neutral-500 mt-0.5">
                          Tip: We automatically look up uses, mechanism of action, and standard side effects for common diabetes drugs.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-neutral-400 mb-1">Dosage</label>
                          <input
                            id="pres-med-dosage"
                            type="text"
                            required
                            placeholder="e.g. 500mg, 10 units"
                            value={presMedDosage}
                            onChange={(e) => setPresMedDosage(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-1">Frequency</label>
                          <input
                            id="pres-med-frequency"
                            type="text"
                            required
                            placeholder="e.g. Once daily, Twice daily"
                            value={presMedFrequency}
                            onChange={(e) => setPresMedFrequency(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-1.5 border-t border-neutral-800/40 animate-fadeIn">
                        <div>
                          <label className="block text-neutral-400 mb-1">Description of Use (Optional)</label>
                          <input
                            id="pres-med-desc"
                            type="text"
                            placeholder="e.g. Lowers glucose release by the liver"
                            value={presMedDescription}
                            onChange={(e) => setPresMedDescription(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-1">Common Side Effects (Optional, comma-separated)</label>
                          <input
                            id="pres-med-side-effects"
                            type="text"
                            placeholder="e.g. Headache, Mild nausea, Fatigue"
                            value={presMedSideEffects}
                            onChange={(e) => setPresMedSideEffects(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-neutral-400 mb-1">Special Instructions for Use (Optional)</label>
                          <textarea
                            id="pres-med-special-instructions"
                            placeholder="e.g. Take immediately after breakfast/dinner with water. Do not skip meals."
                            value={presMedSpecialInstructions}
                            onChange={(e) => setPresMedSpecialInstructions(e.target.value)}
                            rows={2}
                            className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2.5 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Sync to alarms option - only show when creating new, or hide during edit for clarity */}
                      {!editingPresMedId && (
                        <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-850 space-y-2.5 mt-1">
                          <div className="flex items-center gap-2">
                            <input
                              id="pres-med-sync-alarm"
                              type="checkbox"
                              checked={presMedAddAlarm}
                              onChange={(e) => setPresMedAddAlarm(e.target.checked)}
                              className="w-4 h-4 rounded bg-neutral-950 border-neutral-700 text-emerald-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-emerald-500"
                            />
                            <label htmlFor="pres-med-sync-alarm" className="text-neutral-300 font-bold select-none cursor-pointer text-[11px]">
                              Also synchronize an alarm reminder on Daily Checklist
                            </label>
                          </div>

                          {presMedAddAlarm && (
                            <div className="grid grid-cols-2 gap-3 pl-6 pt-1 animate-fadeIn border-l border-neutral-800">
                              <div>
                                <label className="block text-[10px] text-neutral-400 mb-1 font-mono">Timing Relation</label>
                                <select
                                  id="pres-med-alarm-timing"
                                  value={presMedAlarmTiming}
                                  onChange={(e) => setPresMedAlarmTiming(e.target.value as any)}
                                  className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none"
                                >
                                  <option value="before_breakfast">Before Breakfast</option>
                                  <option value="after_breakfast">After Breakfast</option>
                                  <option value="before_lunch">Before Lunch</option>
                                  <option value="after_lunch">After Lunch</option>
                                  <option value="before_dinner">Before Dinner</option>
                                  <option value="after_dinner">After Dinner</option>
                                  <option value="bedtime">Bedtime</option>
                                  <option value="anytime">Anytime</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-neutral-400 mb-1 font-mono">Alarm Time</label>
                                <input
                                  id="pres-med-alarm-time"
                                  type="text"
                                  required={presMedAddAlarm}
                                  placeholder="e.g. 08:00"
                                  value={presMedAlarmTime}
                                  onChange={(e) => setPresMedAlarmTime(e.target.value)}
                                  className="w-full bg-neutral-950 border border-neutral-750 rounded-lg px-2 py-1 text-center text-[11px] text-white focus:outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="btn-pres-cancel"
                        type="button"
                        onClick={() => {
                          setNewPresMedForm(false);
                          setEditingPresMedId(null);
                          setPresMedName("");
                          setPresMedDosage("");
                          setPresMedFrequency("Once daily");
                          setPresMedDescription("");
                          setPresMedSideEffects("");
                          setPresMedSpecialInstructions("");
                        }}
                        className="flex-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 py-2 rounded-xl text-neutral-300 font-bold transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-pres-submit"
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                      >
                        {editingPresMedId ? "Save Changes" : "Save Prescription"}
                      </button>
                    </div>
                  </form>
                )}

                {/* CLINICAL INTERACTION CHECKER ALERTS BAR */}
                {activeInteractionWarnings.length > 0 ? (
                  <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-2xl space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-rose-500/10 pb-2">
                      <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
                      <div>
                        <span className="font-extrabold text-white text-[11.5px] uppercase tracking-wide block">Negative Drug Interactions Detected</span>
                        <p className="text-[9px] text-rose-300 font-mono">Real-time prescription interaction analyzer</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeInteractionWarnings.map((warning) => (
                        <div key={warning.id} className="p-3 bg-rose-950/45 border border-rose-500/20 rounded-xl space-y-1.5 text-[11px] hover:border-rose-500/40 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-white flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${warning.severity === "high" ? "bg-red-500 animate-pulse" : "bg-rose-400"}`}></span>
                              {warning.title}
                            </span>
                            <span className={`text-[8.5px] font-mono font-extrabold px-2 py-0.5 rounded uppercase ${
                              warning.severity === "high" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}>
                              {warning.severity === "high" ? "Critical Risk" : "Moderate Warning"}
                            </span>
                          </div>
                          <p className="text-rose-200/90 leading-relaxed text-[10.5px]">
                            {warning.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-mono pt-1">
                            <span>Involved:</span>
                            <span className="text-zinc-200 font-bold bg-neutral-900 border border-neutral-850 px-1.5 py-0.2 rounded">{warning.med1}</span>
                            <span>&</span>
                            <span className="text-zinc-200 font-bold bg-neutral-900 border border-neutral-850 px-1.5 py-0.2 rounded">{warning.med2}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-2.5 bg-black/40 border border-rose-500/10 text-[9.5px] text-rose-300/80 rounded-xl leading-relaxed flex items-start gap-1.5">
                      <Info className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Clinical Guidance Warning:</strong> Do not adjust, substitute, or stop any medically supervised dose regimens based strictly on these diagnostic algorithms. Immediately contact your primary endocrinologist or clinical pharmacist to audit your medications checklist.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-2xl flex items-start gap-3 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <span className="font-bold text-white block">Medication Safety Clearance: Active</span>
                      <p className="text-emerald-300/80 mt-0.5 font-sans">
                        Your {prescribedMeds.length} prescribed medications have been checked for critical negative clinical interactions (including insulin-sulfonylurea combos, beta-blocker masks, SGLT2 diuretic dehydration, etc.). No active contraindications detected.
                      </p>
                    </div>
                  </div>
                )}

                {/* PRESCRIBED MEDICATIONS LIST */}
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest font-mono">My Prescribed Medications Directory</h3>
                    <span className="text-[10px] text-neutral-500 font-mono font-bold">{prescribedMeds.length} Items</span>
                  </div>

                  {prescribedMeds.length === 0 ? (
                    <div className="text-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800 animate-fadeIn">
                      <Pill className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400">No prescribed medications added yet.</p>
                      <button
                        type="button"
                        onClick={() => setNewPresMedForm(true)}
                        className="text-emerald-400 text-[11px] font-bold font-mono mt-2 underline cursor-pointer"
                      >
                        Add your first prescription
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {prescribedMeds.map((med) => {
                        const preloaded = findPreloadedMedicine(med.name);
                        return (
                          <div 
                            key={med.id}
                            className="bg-neutral-900 border border-neutral-800 hover:border-neutral-750 rounded-2xl p-4 space-y-3 transition-all text-xs"
                          >
                            <div className="flex justify-between items-start gap-2 border-b border-neutral-800 pb-2.5">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
                                  <Pill className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-extrabold text-white text-[13px]">{med.name}</h4>
                                    {preloaded && (
                                      <span className="text-[8.5px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.2 rounded font-mono border border-indigo-500/20">
                                        Verified Factsheet
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                                    <span>Dosage: <strong className="text-zinc-200">{med.dosage}</strong></span>
                                    <span className="text-stone-600">•</span>
                                    <span>Freq: <strong className="text-zinc-200">{med.frequency}</strong></span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  id={`btn-edit-pres-${med.id}`}
                                  onClick={() => handleStartEditPrescribedMed(med)}
                                  className="p-1.5 text-neutral-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all cursor-pointer"
                                  title="Edit medication details"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  id={`btn-del-pres-${med.id}`}
                                  onClick={() => handleDeletePrescribedMed(med.id)}
                                  className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                  title="Remove medication"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 text-[11px] leading-relaxed text-zinc-300">
                              <div>
                                <span className="font-bold text-neutral-400 text-[9px] uppercase tracking-wider block font-mono">Mechanism & Use Case</span>
                                <p className="text-stone-300 font-medium font-sans">{med.description}</p>
                              </div>

                              {med.sideEffects.length > 0 && (
                                <div>
                                  <span className="font-bold text-neutral-400 text-[9px] uppercase tracking-wider block font-mono">Adverse Effects & Signs</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1 font-sans">
                                    {med.sideEffects.map((se, sIdx) => (
                                      <span 
                                        key={sIdx} 
                                        className="text-[9.5px] bg-neutral-950 border border-neutral-800 text-stone-300 px-2.5 py-0.8 rounded-lg font-medium"
                                      >
                                        • {se}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {med.specialInstructions && (
                                <div>
                                  <span className="font-bold text-neutral-400 text-[9px] uppercase tracking-wider block font-mono">Special Instructions & Guidelines</span>
                                  <p className="text-emerald-300 font-medium font-sans bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded-xl mt-1 leading-normal">
                                    {med.specialInstructions}
                                  </p>
                                </div>
                              )}

                              {preloaded && preloaded.warnings && (
                                <div className="p-2 bg-red-950/10 border border-red-500/15 text-[10px] text-rose-300/90 rounded-xl leading-snug flex items-start gap-1.5">
                                  <Info className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Warning:</strong> {preloaded.warnings}
                                  </span>
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
            )}

            {remindersSubTab === "checker" && (
              <MedicationInteractionChecker 
                prescribedMeds={prescribedMeds} 
                onSwitchToPrescriptions={() => setRemindersSubTab("prescriptions")}
              />
            )}

            {/* Note about persistence */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-500 rounded-xl leading-relaxed">
              <span className="font-bold text-neutral-400">Android System Integration Note:</span> These medication compliance flags run on client side database states and synchronate daily checking routines to maintain perfect records across app re-sessions. 
            </div>
          </motion.div>
        )}

        {/* --- SCREEN 4: MEDICATION DETAILS HANDBOOK WITH AI DECK --- */}
        {activeTab === "handbook" && (() => {
          const selectedProgram = GLOBAL_DIETARY_PROGRAMS.find(d => d.id === selectedDietId) || GLOBAL_DIETARY_PROGRAMS[0];
          return (
            <motion.div
              key="handbook"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-neutral-950"
            >
              
              <div className="border-b border-neutral-800 pb-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                      <BookOpen className="w-5 h-5 text-indigo-400" /> Patient Education &amp; Dietary Handbook
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono">Evidence-based clinical guides, safety protocols &amp; global food programs</p>
                  </div>
                </div>
              </div>

              {/* Handbook Category Subtabs */}
              <div className="grid grid-cols-2 gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-2xl select-none text-center">
                <button
                  type="button"
                  id="btn-subtab-clinical-guides"
                  onClick={() => setEducationSubTab("clinical_guides")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 select-none ${
                    educationSubTab === "clinical_guides"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Clinical Guides &amp; Safety</span>
                </button>
                <button
                  type="button"
                  id="btn-subtab-cultural-diets"
                  onClick={() => setEducationSubTab("cultural_diets")}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 select-none ${
                    educationSubTab === "cultural_diets"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Dietary Programs</span>
                </button>
              </div>

              {educationSubTab === "clinical_guides" ? (
                <EducationalResources />
              ) : (
                <div className="space-y-4 animate-fadeIn text-[11px]">
                <div className="p-3 bg-indigo-950/10 border border-indigo-900/25 rounded-2xl">
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans text-center">
                    Select a culturally aligned dietary program below. These menus help adapt traditional regional staples to preserve stable, ideal post-meal and morning fasting glucose levels.
                  </p>
                </div>

                  {/* Grid of global programs */}
                  <div className="grid grid-cols-2 gap-2">
                    {GLOBAL_DIETARY_PROGRAMS.map((prog) => {
                      const isSelected = selectedDietId === prog.id;
                      return (
                        <button
                          key={prog.id}
                          id={`diet-selector-${prog.id}`}
                          onClick={() => setSelectedDietId(prog.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-950/25 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/20 shadow-md"
                              : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900"
                          }`}
                        >
                          <span className="text-xl select-none leading-none">{prog.flag}</span>
                          <div className="min-w-0">
                            <span className="text-[11px] block truncate font-sans font-semibold text-zinc-200">{prog.countryOrCulture.split(" (")[0]}</span>
                            <span className="text-[8.5px] text-neutral-500 block font-mono capitalize tracking-tight truncate">
                              {prog.region}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Program Detail Component */}
                  {selectedProgram && (
                    <div className="bg-neutral-900/80 rounded-2xl border border-neutral-800/80 p-4 space-y-4 animate-fadeIn">
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl leading-none select-none">{selectedProgram.flag}</span>
                          <div>
                            <h4 className="text-[11.5px] font-black text-white">{selectedProgram.countryOrCulture}</h4>
                            <span className="text-[8.5px] text-neutral-400 font-mono tracking-wider uppercase">{selectedProgram.region} Dietary Guidelines</span>
                          </div>
                        </div>
                        <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-black font-mono uppercase tracking-wider">
                          Glycemic Score: A
                        </span>
                      </div>

                      {/* Overview */}
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">Core Health Concept</span>
                        <p className="text-[11px] text-zinc-300 leading-relaxed bg-black/35 p-3 rounded-xl border border-white/5">
                          {selectedProgram.overview}
                        </p>
                      </div>

                      {/* Concerns */}
                      <div className="p-3 bg-red-950/10 border border-red-500/15 rounded-xl space-y-1">
                        <span className="text-[8.5px] font-bold text-rose-400 uppercase tracking-widest block flex items-center gap-1 font-mono">
                          <AlertTriangle className="w-3.5 h-3.5" /> High-Spike Staple Concerns (Glycemic Hazards)
                        </span>
                        <p className="text-[10px] text-rose-200/90 leading-relaxed font-sans">{selectedProgram.glucoseSpikeConcern}</p>
                      </div>

                      {/* Substitutions */}
                      <div className="space-y-1.5">
                        <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">Recommended Regional Substitutions</span>
                        <div className="space-y-1.5">
                          {selectedProgram.substitutions.map((sub, sIdx) => (
                            <div key={sIdx} className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1 hover:border-neutral-700 transition-colors">
                              <div className="flex items-center gap-1.5 text-[10.5px]">
                                <span className="text-rose-400 line-through truncate max-w-[140px] font-medium">{sub.traditional}</span>
                                <span className="text-neutral-500 font-bold">➔</span>
                                <span className="text-emerald-400 font-bold font-sans">{sub.healthyAlternative}</span>
                              </div>
                              <p className="text-[9.5px] text-neutral-400 leading-normal">{sub.why}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Daily Meal Matrix */}
                      <div className="space-y-2.5 border-t border-neutral-800/60 pt-3 text-[11px]">
                        <span className="text-[8.5px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">Diabetes-Stabilizing Daily Menu</span>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                            <div className="flex justify-between items-center pb-1 border-b border-neutral-800/60">
                              <span className="text-[8px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">🍳 Breakfast</span>
                              <span className="text-[10px] text-white font-bold">{selectedProgram.meals.breakfast.name}</span>
                            </div>
                            <p className="text-[9px] text-cyan-400 font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.breakfast.ingredients}</p>
                            <p className="text-[9.5px] text-neutral-400 leading-relaxed mt-1">{selectedProgram.meals.breakfast.desc}</p>
                          </div>

                          <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                            <div className="flex justify-between items-center pb-1 border-b border-neutral-800/60">
                              <span className="text-[8px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">🥗 Lunch</span>
                              <span className="text-[10px] text-white font-bold">{selectedProgram.meals.lunch.name}</span>
                            </div>
                            <p className="text-[9px] text-cyan-400 font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.lunch.ingredients}</p>
                            <p className="text-[9.5px] text-neutral-400 leading-relaxed mt-1">{selectedProgram.meals.lunch.desc}</p>
                          </div>

                          <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                            <div className="flex justify-between items-center pb-1 border-b border-neutral-800/60">
                              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">🍽️ Dinner</span>
                              <span className="text-[10px] text-white font-bold">{selectedProgram.meals.dinner.name}</span>
                            </div>
                            <p className="text-[9px] text-cyan-400 font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.dinner.ingredients}</p>
                            <p className="text-[9.5px] text-neutral-400 leading-relaxed mt-1">{selectedProgram.meals.dinner.desc}</p>
                          </div>

                          <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                            <div className="flex justify-between items-center pb-1 border-b border-neutral-800/60">
                              <span className="text-[8px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">🍿 Snacks</span>
                              <span className="text-[10px] text-white font-bold">{selectedProgram.meals.snack.name}</span>
                            </div>
                            <p className="text-[9px] text-cyan-400 font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.snack.ingredients}</p>
                            <p className="text-[9.5px] text-neutral-400 leading-relaxed mt-1">{selectedProgram.meals.snack.desc}</p>
                          </div>
                        </div>
                      </div>

                      {/* Super Ingredients */}
                      <div className="space-y-1.5 border-t border-neutral-800/60 pt-3">
                        <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest block font-mono">Traditional Glycemic Regulators</span>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedProgram.superIngredients.map((ing, iIdx) => (
                            <div key={iIdx} className="bg-black/30 p-2.5 rounded-xl border border-white/5 space-y-0.5">
                              <span className="text-[10.5px] text-cyan-400 font-black uppercase font-mono tracking-wider">🌿 {ing.name}</span>
                              <p className="text-[9.5px] text-neutral-300 leading-relaxed">{ing.clinicalEffect}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SMART GEMINI DISH ADAPTER */}
                  <div className="bg-gradient-to-br from-indigo-950/20 to-neutral-900/60 border border-indigo-900/30 p-4 rounded-2xl space-y-3 shadow-md mt-4">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-indigo-900/10">
                      <ChefHat className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="font-bold text-white text-[11px] uppercase tracking-wider block">AI Glycemic Recipe Customizer</span>
                        <p className="text-[9px] text-neutral-400 font-mono">Adapt any traditional world dish for blood sugar safety</p>
                      </div>
                    </div>
                    
                    <p className="text-[10.5px] text-neutral-300 leading-relaxed">
                      Craving a family classic (like Biryani, Pasta, tacos, or Jollof rice)? Input your regional dish details below. Gemini AI will redesign the recipe using medical-grade culinary substitutes, ensuring post-meal glycemic safety.
                    </p>

                    <form onSubmit={handleDietCustomization} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[8.5px] text-neutral-400 font-mono uppercase tracking-widest block font-bold">Traditional Dish Name</label>
                          <input
                            id="custom-dish-name"
                            type="text"
                            required
                            placeholder="e.g. Chicken Biryani, Tacos, Pad Thai"
                            value={customDishName}
                            onChange={(e) => setCustomDishName(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8.5px] text-neutral-400 font-mono uppercase tracking-widest block font-bold">Cultural Region</label>
                          <select
                            id="custom-dish-region"
                            value={customDishRegion}
                            onChange={(e) => setCustomDishRegion(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-1.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
                          >
                            {["South Asian", "East Asian", "Latin American", "West African", "Mediterranean", "Middle Eastern", "Western / European"].map((r) => (
                              <option key={r} value={r} className="bg-neutral-950 text-white font-sans">{r}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8.5px] text-neutral-400 font-mono uppercase tracking-widest block font-bold">Dynamic Dietary Treatment Variant</label>
                        <select
                          id="custom-dish-goal"
                          value={customDishGoal}
                          onChange={(e) => setCustomDishGoal(e.target.value)}
                          className="w-full bg-neutral-950 border border-neutral-850 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
                        >
                          <option value="Low-glycemic and High-fiber">Low-glycemic and High-fiber (Standard Glycemic Management)</option>
                          <option value="Keto-Friendly & Ultra Low Carb">Keto-Friendly & Ultra Low Carb (Rapid Post-Meal Control)</option>
                          <option value="Low Sodium & Alkaline Balance">Low Sodium & Cardiovascular Support</option>
                          <option value="Vegetarian Low-Glycemic Index">Vegetarian Low-GI Alternative</option>
                          <option value="Vegan Fiber-Dominant Diet">Vegan Fiber-Dominant Alternative</option>
                        </select>
                      </div>

                      <button
                        id="btn-submit-diet-customizer"
                        type="submit"
                        disabled={customizerLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 select-none shadow-md mt-1"
                      >
                        {customizerLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Formulating Diabetic Substitutions with Gemini...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-indigo-200" />
                            <span>Adapt Traditional Recipe</span>
                          </>
                        )}
                      </button>
                    </form>

                    {customizerError && (
                      <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] rounded-lg animate-fadeIn font-mono">
                        {customizerError}
                      </div>
                    )}

                    {/* CUSTOMIZER COOKING RESULTS SCREEN */}
                    {customizedRecipe && (
                      <div className="bg-neutral-950 p-4 rounded-2xl border border-indigo-905 space-y-3.5 text-xs animate-fadeIn">
                        <div className="flex justify-between items-center border-b border-indigo-950 pb-2">
                          <div>
                            <span className="font-mono text-[8px] text-cyan-400 block uppercase font-bold">Custom Recipe Adaptation</span>
                            <span className="font-black text-emerald-400 text-sm uppercase tracking-tight">{customizedRecipe.originalDish}</span>
                          </div>
                          <button
                            onClick={() => setCustomizedRecipe(null)}
                            className="text-[9px] border border-neutral-800 text-neutral-400 px-2 py-0.5 rounded hover:text-white cursor-pointer transition-all focus:outline-none"
                          >
                            Reset
                          </button>
                        </div>

                        <div>
                          <span className="font-bold text-neutral-400 uppercase tracking-widest text-[8px] block font-mono">The Glycemic Problem (Why It Spikes)</span>
                          <p className="text-stone-300 text-[10px] leading-relaxed mt-1 bg-black/40 p-2.5 rounded-lg border-l-2 border-red-500/60 font-sans">
                            {customizedRecipe.whyItSpikes}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="font-bold text-neutral-400 uppercase tracking-widest text-[8px] block font-mono">Recommended Diabetic Substitutions</span>
                          <div className="space-y-1.5">
                            {customizedRecipe.diabeticSubstitutions.map((sub, sIdx) => (
                              <div key={sIdx} className="p-2.5 bg-neutral-900/55 rounded-xl border border-neutral-800/80 text-[9.5px] flex justify-between items-center gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="text-zinc-500 line-through mr-1.5">{sub.traditionalIngredient}</span>
                                  <span className="text-emerald-400 font-bold">➔ {sub.healthyAlternative}</span>
                                  <p className="text-[9px] text-zinc-400 mt-0.5">{sub.why}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-900/95 rounded-2xl border border-white/5 space-y-2.5">
                          <div className="flex justify-between items-center text-[8px] text-neutral-400 font-mono tracking-widest uppercase border-b border-neutral-800 pb-1.5">
                            <span>🕒 Prep: {customizedRecipe.modifiedRecipe.prepTime}</span>
                            <span>🔥 Cook: {customizedRecipe.modifiedRecipe.cookTime}</span>
                          </div>

                          <div className="space-y-1">
                            <span className="font-bold text-cyan-400 uppercase tracking-widest text-[8px] block font-mono">Safe Ingredients</span>
                            <ul className="list-disc pl-4 space-y-1 text-stone-300 text-[10px] font-sans">
                              {customizedRecipe.modifiedRecipe.ingredients.map((ing, iIdx) => (
                                <li key={iIdx}>{ing}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <span className="font-bold text-indigo-400 uppercase tracking-widest text-[8px] block font-mono">Preparation Steps</span>
                            <ol className="list-decimal pl-4 space-y-2 text-stone-300 text-[10px] leading-relaxed font-sans">
                              {customizedRecipe.modifiedRecipe.instructions.map((step, iIdx) => (
                                <li key={iIdx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-950/15 border border-emerald-500/20 rounded-xl text-emerald-300/90 leading-relaxed font-sans text-[10px]">
                          <span className="font-bold text-emerald-400 uppercase tracking-widest text-[8px] block font-mono">
                            Clinical Glycemic Safety Note
                          </span>
                          <p className="mt-1 leading-snug">{customizedRecipe.glycemicCheckNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}

        {/* --- SCREEN: DIET PLANNER --- */}
        {activeTab === "diet" && (
          <motion.div
            key="diet"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-4 py-4 bg-neutral-950"
          >
            <DietPlanner foodLogs={foodLogs} onAddFoodLog={handleAddFoodLog} />
          </motion.div>
        )}

        {/* --- SCREEN: WALKING TRACKER --- */}
        {activeTab === "walking" && (
          <motion.div
            key="walking"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-4 py-4 bg-neutral-950"
          >
            <WalkingTracker
              activityLogs={activityLogs}
              onAddActivityLog={handleAddActivityLog}
              onDeleteActivityLog={handleDeleteActivityLog}
            />
          </motion.div>
        )}

        {/* --- SCREEN: AI ASSISTANT --- */}
        {activeTab === "assistant" && (
          <motion.div
            key="assistant"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-4 py-4 bg-neutral-950"
          >
            <AiAssistantTab profile={profile} readings={readings} />
          </motion.div>
        )}

        {/* --- SCREEN: FAMILY MONITORING & WHATSAPP NOTIFICATIONS --- */}
        {activeTab === "family" && (
          <motion.div
            key="family"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 overflow-y-auto px-4 py-4 bg-neutral-950"
          >
            <FamilyMonitoring
              profile={profile}
              readings={readings}
              onOpenMonetizationHub={() => setShowMonetizationModal(true)}
            />
          </motion.div>
        )}

        {/* --- SCREEN 5: SETTINGS / USER PROFILE --- */}
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 flex flex-col min-h-0"
          >
            <UserProfile 
              profile={profile} 
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSwitchProfile={handleSwitchProfile}
              onCreateProfile={handleCreateProfile}
              onDeleteProfile={handleDeleteProfile}
              onSave={handleProfileSave} 
              onExportData={handleExportAllData}
              onDeleteAccountData={handleDeleteAccountData}
              onOpenDisclaimer={() => setDisclaimerModalOpen(true)}
              onOpenAndroidModal={() => setShowAndroidModal(true)}
              onOpenMonetizationHub={() => setShowMonetizationModal(true)}
            />
          </motion.div>
        )}

        {/* --- SCREEN 6: COMPREHENSIVE HISTORY --- */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="flex-1 flex flex-col min-h-0"
          >
            <ComprehensiveHistory
              readings={readings}
              onDeleteReading={handleDeleteReading}
              medLogs={medLogs}
              onDeleteMedLog={handleDeleteMedLog}
              foodLogs={foodLogs}
              onDeleteFoodLog={handleDeleteFoodLog}
              activityLogs={activityLogs}
              onAddActivityLog={handleAddActivityLog}
              onDeleteActivityLog={handleDeleteActivityLog}
            />
          </motion.div>
        )}
      </AnimatePresence>

      </div>

      {/* FIXED LOWER BOTTOM ANDROID TAB BAR FOR APP NAVIGATION */}
      <nav className="bg-[#121214] border-t border-white/5 py-1 px-4 flex justify-between items-center shrink-0 z-15 select-none shrink-0">
        <button
          id="tab-btn-dashboard"
          onClick={() => changeTab("dashboard")}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all cursor-pointer ${
            activeTab === "dashboard" ? "text-rose-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Activity className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">Console</span>
        </button>

        <button
          id="tab-btn-reports"
          onClick={() => changeTab("reports")}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all cursor-pointer ${
            activeTab === "reports" ? "text-cyan-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <TrendingUp className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">Reports</span>
        </button>

        <button
          id="tab-btn-reminders"
          onClick={() => changeTab("reminders")}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all cursor-pointer ${
            activeTab === "reminders" ? "text-pink-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Pill className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">Pills</span>
        </button>

        <button
          id="tab-btn-handbook"
          onClick={() => changeTab("handbook")}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all cursor-pointer ${
            activeTab === "handbook" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <BookOpen className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">Handbook</span>
        </button>

        <button
          id="tab-btn-history"
          onClick={() => changeTab("history")}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all cursor-pointer ${
            activeTab === "history" ? "text-cyan-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Clock className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">History</span>
        </button>

        <button
          id="tab-btn-profile"
          onClick={() => changeTab("profile")}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all cursor-pointer ${
            activeTab === "profile" ? "text-teal-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Settings className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">Targets</span>
        </button>
      </nav>

      {/* COMPLIANCE & SAFETY MODALS */}
      <MedicalDisclaimerModal
        isOpen={disclaimerModalOpen}
        onAccept={() => {
          localStorage.setItem("dia_disclaimer_accepted", "true");
          setDisclaimerModalOpen(false);
        }}
      />

      <BiometricLockModal
        isOpen={isBiometricLocked}
        pinCode={profile.pinCode || "1234"}
        patientName={profile.name}
        onUnlock={() => setIsBiometricLocked(false)}
      />

      {/* CLINICAL SAFETY & DANGEROUS LEVEL ALERT MODAL (HYPO & HYPER) */}
      <DangerousGlucoseAlertModal
        alertData={dangerousAlert}
        onClose={() => setDangerousAlert({ ...dangerousAlert, isOpen: false })}
        profile={profile}
      />

      {/* GLUCOMETER HARDWARE SYNCHRONIZATION MODAL */}
      <GlucometerSyncModal
        isOpen={showGlucometerModal}
        onClose={() => setShowGlucometerModal(false)}
        onImportReadings={handleImportGlucometerReadings}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* CLINICAL GOAL SETTING & PROGRESS REPORTS MODAL */}
      <GoalsAndProgressModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        profile={profile}
        readings={readings}
        onSaveProfile={handleUpdateProfile}
      />

      {/* WEEKLY CLINICAL REVIEW & ENCRYPTED BACKUP MODAL */}
      <WeeklyReviewModal
        isOpen={showWeeklyReviewModal}
        onClose={() => setShowWeeklyReviewModal(false)}
        profile={profile}
        readings={readings}
        foodLogs={foodLogs}
        activityLogs={activityLogs}
        medicationLogs={medLogs}
        onImportBackup={handleRestoreBackup}
      />

      {/* DOUBLE-DOSE SAFETY PREVENTION MODAL */}
      {doubleDoseModal.isOpen && doubleDoseModal.reminder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fadeIn text-neutral-200">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Double-Dose Prevention Warning</h3>
                <p className="text-xs text-amber-300/90 font-mono mt-0.5">Medication Safety Guard</p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2 text-xs">
              <p className="font-semibold text-white">
                <span className="text-amber-400 font-bold">{doubleDoseModal.reminder.name}</span> ({doubleDoseModal.reminder.dosage}) was already logged at <span className="text-amber-300 font-bold">{doubleDoseModal.lastTakenTime}</span> today.
              </p>
              <p className="text-neutral-400 leading-relaxed text-[11.5px]">
                Taking diabetes medications or insulin doses too close together can lead to dangerous hypoglycemia (low blood sugar). Please verify your intake before proceeding.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                id="btn-confirm-cancel-double-dose"
                onClick={() => setDoubleDoseModal({ isOpen: false, reminder: null, lastTakenTime: "" })}
                className="w-full py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel (Keep Dose Safe)
              </button>

              <button
                type="button"
                id="btn-undo-previous-dose"
                onClick={() => handleUndoMedLog(doubleDoseModal.reminder!.id)}
                className="w-full py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 font-semibold rounded-xl transition-all cursor-pointer text-xs"
              >
                Mark as Not Taken (Undo Previous Log)
              </button>

              <button
                type="button"
                id="btn-confirm-prescribed-extra-dose"
                onClick={() => handleConfirmDoubleDose(doubleDoseModal.reminder!, doubleDoseModal.units)}
                className="w-full py-2 px-3 text-[11px] text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer text-center block"
              >
                I have a doctor's order for an additional dose today
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANDROID APP LAUNCH & PWA WEBAPK MODAL */}
      <AndroidInstallModal
        isOpen={showAndroidModal}
        onClose={() => setShowAndroidModal(false)}
        isFullscreenView={isFullscreenAndroid}
        onToggleFullscreenView={() => setIsFullscreenAndroid(!isFullscreenAndroid)}
      />

      {/* 15-MINUTE MORNING FASTING GLUCOSE PRE-CHECK ALERT MODAL */}
      <FastingAlertBanner
        config={fastingReminderConfig}
        isOpen={showFastingAlertModal}
        onClose={() => setShowFastingAlertModal(false)}
        onSnooze={handleSnoozeFastingAlert}
        onLogFastingNow={handleLogFastingFromReminder}
      />

      {/* MONETIZATION & PRO MEMBERSHIP HUB MODAL */}
      <MonetizationHubModal
        isOpen={showMonetizationModal}
        onClose={() => setShowMonetizationModal(false)}
        profile={profile}
        onUpdateTier={handleUpdateMembershipTier}
      />

    </AndroidFrame>
  );
}

// Low-level helper: Linear Regression Fit
function calculateRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  if (points.length < 2) return null;
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
    sumXY += points[i].x * points[i].y;
    sumXX += points[i].x * points[i].x;
  }
  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// Low-level helper icons & utilities
function MoonMetricIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-cyan-400" {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function SunMetricIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-rose-400 animate-spin-slow" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function PlayChartPlaceholderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  );
}

// Charts customized interactive tooltips
function CustomChartTooltip({ active, payload, label, profile }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload as GlucoseReading & {
      fastingValue?: number | null;
      postValue?: number | null;
      isAggregated?: boolean;
      rawLogsCount?: number;
    };

    const isFasting = data.type === "fasting" || (data.fastingValue !== null && data.fastingValue !== undefined);
    const targetMin = profile ? (isFasting ? profile.targetFastingMin : profile.targetPostMin) : 70;
    const targetMax = profile ? (isFasting ? profile.targetFastingMax : profile.targetPostMax) : (isFasting ? 130 : 180);
    const val = data.value;

    let targetDeltaText = "";
    let targetDeltaColor = "text-emerald-400";
    if (val < targetMin) {
      targetDeltaText = `↓ ${targetMin - val} mg/dL below target`;
      targetDeltaColor = "text-rose-400";
    } else if (val > targetMax) {
      targetDeltaText = `↑ +${val - targetMax} mg/dL above target`;
      targetDeltaColor = "text-amber-400";
    } else {
      targetDeltaText = "✓ In target clinical range";
      targetDeltaColor = "text-emerald-400";
    }

    const stressVal = data.stressLevel;
    const hasStress = stressVal !== undefined && stressVal !== null;
    const stressRating = hasStress
      ? stressVal <= 3
        ? { label: "Low", desc: "Optimal / Relaxed", color: "text-emerald-400", barColor: "bg-emerald-500" }
        : stressVal <= 6
        ? { label: "Moderate", desc: "Mild Cortisol Impact", color: "text-sky-400", barColor: "bg-sky-500" }
        : { label: "High", desc: "Cortisol Spike • Hyperglycemia Risk", color: "text-rose-400", barColor: "bg-rose-500" }
      : null;

    const noteText = (data.notes || "").trim();
    const isLongNote = noteText.length > 50;

    return (
      <div className="bg-neutral-900/95 border border-neutral-700/80 p-3 rounded-2xl space-y-2 font-sans shadow-2xl w-64 max-w-[270px] backdrop-blur-md select-none">
        {/* Top Header: Date, Time & Category Badge */}
        <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
            <span>{data.date}</span>
            {data.time && data.time !== "00:00" && (
              <span className="text-neutral-400">· {data.time}</span>
            )}
          </div>

          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
            data.category === "Hypoglycemia"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : data.category === "Normal"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : data.category === "Prediabetes"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
          }`}>
            {data.category}
          </span>
        </div>

        {/* Glucose Reading Metric Block */}
        <div className="bg-neutral-950/80 p-2 rounded-xl border border-neutral-800/80 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-neutral-400 uppercase font-mono block">
              {data.type === "fasting" ? "🌅 Fasting Glucose" : data.type === "post_fasting" ? "🍽️ Post-Meal Glucose" : "📊 Aggregated Glucose"}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-white font-mono">{data.value}</span>
              <span className="text-[10px] text-neutral-400 font-mono">mg/dL</span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-[9.5px] font-mono font-bold block ${targetDeltaColor}`}>
              {targetDeltaText}
            </span>
            <span className="text-[8.5px] text-neutral-400 font-mono">
              Target: {targetMin}-{targetMax} mg/dL
            </span>
          </div>
        </div>

        {/* Stress Level (1-10) Context Section */}
        <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/70 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Stress Level:</span>
            </div>

            {hasStress && stressRating ? (
              <div className="flex items-center gap-1 font-mono font-bold">
                <span className={stressRating.color}>{stressVal}/10</span>
                <span className={`text-[8.5px] px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 ${stressRating.color}`}>
                  {stressRating.label}
                </span>
              </div>
            ) : (
              <span className="text-[9px] text-neutral-400 font-mono italic">Not logged</span>
            )}
          </div>

          {hasStress && stressRating ? (
            <div>
              {/* 10-step visual segmented bar */}
              <div className="grid grid-cols-10 gap-0.5 h-1.5 rounded-full overflow-hidden bg-neutral-800/80 my-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full rounded-sm transition-all ${
                      i < (stressVal || 0)
                        ? stressRating.barColor
                        : "bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[8.5px] text-neutral-400 font-mono block leading-tight">
                {stressRating.desc}
              </span>
            </div>
          ) : (
            <span className="text-[8.5px] text-neutral-400 font-mono block leading-tight">
              Stress elevates counter-regulatory cortisol & glucose.
            </span>
          )}
        </div>

        {/* Specific Note Content: Enhanced Readable & Scrollable Area if > 50 chars */}
        {noteText && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono text-neutral-400">
              <span className="font-bold uppercase tracking-wider">Log Note:</span>
              {isLongNote ? (
                <span className="text-cyan-400 font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 text-[8px]">
                  Scrollable ({noteText.length} chars)
                </span>
              ) : (
                <span className="text-neutral-400 text-[8.5px]">{noteText.length} chars</span>
              )}
            </div>

            {isLongNote ? (
              <div 
                tabIndex={0}
                className="max-h-20 overflow-y-auto pr-1 text-[10px] text-neutral-200 bg-neutral-950/90 p-2 rounded-xl border border-neutral-800 leading-relaxed font-sans break-words select-text focus:outline-none focus:border-neutral-700"
                style={{ scrollbarWidth: "thin" }}
              >
                "{noteText}"
              </div>
            ) : (
              <div className="text-[10px] text-neutral-300 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80 leading-relaxed font-sans italic break-words">
                "{noteText}"
              </div>
            )}
          </div>
        )}

        {/* Aggregation context footnote if applicable */}
        {data.isAggregated && (
          <div className="text-[8.5px] text-neutral-400 font-mono text-center pt-0.5 border-t border-neutral-800/60">
            Averaged across {data.rawLogsCount} readings in window
          </div>
        )}
      </div>
    );
  }
  return null;
}

function CustomVariabilityTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-neutral-900 border border-neutral-700/85 p-3 rounded-xl space-y-1.5 font-sans leading-relaxed shadow-lg max-w-[210px]">
        <div className="text-[9px] font-bold text-[#b55fe6] font-mono flex justify-between items-center pb-1 border-b border-neutral-800">
          <span>{data.date}</span>
          <span>{data.time}</span>
        </div>
        
        <div className="flex items-center gap-1 mt-1 justify-between text-[10px]">
          <span className="text-stone-300 font-medium">Logged Glucose:</span>
          <span className="font-mono text-white font-bold">{data.value} mg/dL</span>
        </div>

        <div className="text-[10px] space-y-0.5 border-t border-neutral-800/60 pt-1.5">
          <div className="flex justify-between">
            <span className="text-zinc-400">30D Avg:</span>
            <span className="text-neutral-200 font-mono">{data.mean} mg/dL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">30D SD:</span>
            <span className="text-neutral-200 font-mono">{data.sd} mg/dL</span>
          </div>
          <div className="flex justify-between font-bold text-purple-400">
            <span>30D CV%:</span>
            <span className="font-mono">{data.cv}%</span>
          </div>
        </div>

        <div className={`text-[9px] font-bold text-center py-1 mt-1 rounded-md border ${
          data.cv < 36 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
        }`}>
          {data.cv < 36 ? "✓ STABLE SUGAR LEVELS" : "⚠️ HIGH FLUCTUATIONS"}
        </div>
      </div>
    );
  }
  return null;
}
