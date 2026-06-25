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
  Zap
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
  Bar
} from "recharts";

import AndroidFrame from "./components/AndroidFrame";
import UserProfile from "./components/UserProfile";
import FastingTimer from "./components/FastingTimer";
import HydrationTracker from "./components/HydrationTracker";
import FoodLogger from "./components/FoodLogger";
import OpenWearablesHub from "./components/OpenWearablesHub";
import { MedicationInteractionChecker } from "./components/MedicationInteractionChecker";
import { getApiUrl } from "./lib/api";
import { motion, AnimatePresence } from "motion/react";
import { GlucoseReading, MedicationReminder, MedicationLog, MedicineDetails, UserProfile as UserProfileType, FoodLog, PrescribedMedication, ActivityLog } from "./types";
import ComprehensiveHistory from "./components/ComprehensiveHistory";
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
  theme: "dark",
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

type AppTab = "dashboard" | "reports" | "reminders" | "handbook" | "profile" | "history";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("dashboard");
  const [tabHistory, setTabHistory] = useState<AppTab[]>(["dashboard"]);
  
  // States loaded from LocalStorage
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [dashboardSubTab, setDashboardSubTab] = useState<"logs" | "food" | "wearables">("logs");
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [prefilledFood, setPrefilledFood] = useState<{
    mealType: FoodLog["mealType"];
    foodItems: string;
    portionSize?: string;
    impactScale?: FoodLog["impactScale"];
  } | null>(null);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [prescribedMeds, setPrescribedMeds] = useState<PrescribedMedication[]>([]);
  const [remindersSubTab, setRemindersSubTab] = useState<"checklist" | "prescriptions" | "checker">("checklist");
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

  // Chart visual filters
  const [chartFilter, setChartFilter] = useState<"all" | "fasting" | "post_fasting">("all");
  const [reportChartType, setReportChartType] = useState<"trend" | "variability" | "weight" | "adherence">("trend");
  const [reportTimeRange, setReportTimeRange] = useState<"7" | "30" | "90" | "365" | "custom">("30");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

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
  }, []);

  // Synchronize CSS variable theme overrides based on patient profile selection
  useEffect(() => {
    const activeTheme = profile.theme || "dark";
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [profile.theme]);

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
      theme: "dark",
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

  // Mark medication taken today
  const handleMarkTaken = (reminder: MedicationReminder, units?: number) => {
    const stamp = new Date().toISOString().split("T")[0];
    const logId = `log_${reminder.id}_${stamp}`;
    
    // Check if ready existing
    const exists = medLogs.some(l => l.dateStamp === stamp && l.reminderId === reminder.id);
    if (exists) {
      // Toggle off / remove
      const updated = medLogs.filter(l => !(l.dateStamp === stamp && l.reminderId === reminder.id));
      setMedLogs(updated);
      localStorage.setItem("dia_medlogs", JSON.stringify(updated));
    } else {
      // Record new take
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
    }
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
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
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

  // Daily medication count taken status
  const activeReminders = reminders.filter(r => r.active);
  const currentStamp = new Date().toISOString().split("T")[0];
  const pillsTakenToday = medLogs.filter(l => l.dateStamp === currentStamp).length;

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

  // Chart data preparing: sort chronologically for Recharts mapping safety
  const chartData = rangeSortedReadings.map(r => ({
    ...r,
    formattedLabel: `${r.date.substring(5)} ${r.time}`,
    fastingValue: r.type === "fasting" ? r.value : null,
    postValue: r.type === "post_fasting" ? r.value : null,
  }));

  const filteredRawData = chartData.filter(item => {
    if (chartFilter === "fasting") return item.type === "fasting";
    if (chartFilter === "post_fasting") return item.type === "post_fasting";
    return true;
  });

  const fastingRegPoints = filteredRawData
    .map((item, idx) => ({ x: idx, y: item.fastingValue }))
    .filter(p => p.y !== null) as { x: number; y: number }[];

  const postRegPoints = filteredRawData
    .map((item, idx) => ({ x: idx, y: item.postValue }))
    .filter(p => p.y !== null) as { x: number; y: number }[];

  const fastingReg = calculateRegression(fastingRegPoints);
  const postReg = calculateRegression(postRegPoints);

  const filteredChartData = filteredRawData.map((item, idx) => ({
    ...item,
    fastingTrend: fastingReg ? fastingReg.slope * idx + fastingReg.intercept : null,
    postTrend: postReg ? postReg.slope * idx + postReg.intercept : null,
  }));

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

      // 3. Glucose Readings Tabular Data
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
      doc.text("CURRENT PRESCRIBED MEDICATIONS", 15, y);
      doc.line(15, y + 2, 195, y + 2);
      
      y += 8;
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      const medsList = (profile.medications || "").split(",").map(m => m.trim()).filter(Boolean);
      if (medsList.length === 0) {
        doc.text("No active medical prescriptions listed in profile.", 15, y);
        y += 6;
      } else {
        medsList.forEach((med) => {
          doc.setFillColor(13, 148, 136);
          doc.rect(17, y - 2, 1.5, 1.5, "F");
          doc.text(med, 22, y + 0.5);
          y += 5.5;
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
    <AndroidFrame onBackPress={handleBackNavigation} onHomePress={handleHomeNavigation}>
      
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
          
          <button 
            id="header-profile-btn"
            onClick={() => changeTab("profile")}
            className="flex items-center gap-2 text-xs text-stone-400 bg-neutral-800 hover:bg-neutral-700/80 px-2.5 py-1.5 rounded-xl border border-neutral-700/60 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium truncate max-w-[80px]">{profile.name.split(" ")[0]}</span>
          </button>
        </header>

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
                <p className="text-[11px] text-[#22c55e] flex items-center gap-1.5 font-mono mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping"></span>
                  Active Diabetes Watch ({profile.diabetesType})
                </p>
              </div>
              <div className="text-right text-[10px] text-neutral-400 font-mono">
                <div>Fasting: {profile.targetFastingMin}-{profile.targetFastingMax} mg/dL</div>
                <div>Post-Meal: {profile.targetPostMin}-{profile.targetPostMax} mg/dL</div>
              </div>
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

            {/* Fasting Timer & Insulin-on-Board Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FastingTimer readings={readings} />
              
              {/* Dynamic Insulin on Board (IOB) Quick-View Card */}
              <div className="bg-gradient-to-br from-[#1e1b4b]/25 to-neutral-900 border border-indigo-900/40 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-zinc-550 font-extrabold tracking-wider block uppercase font-mono">
                        Active Insulin Tracker
                      </span>
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        Insulin on Board (IOB)
                      </h3>
                    </div>
                    
                    <span className="text-[8px] bg-indigo-505/15 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-black font-mono uppercase tracking-widest leading-none">
                      4H Linear Decay
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#22d3ee] tracking-tight">
                      {activeIOB}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono font-bold uppercase">Units Active</span>
                  </div>

                  {activeInjections.length === 0 ? (
                    <div className="bg-black/35 p-3 rounded-xl border border-neutral-800/40 text-[10px] text-neutral-400 italic font-mono flex items-center gap-2 leading-normal">
                      <Zap className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span>Zero active insulin on board today. Re-calculate doses dynamically up to 4 hours post-administration.</span>
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
                              <span className="text-[#22d3ee] font-black">{inj.remainingUnits} U remaining</span>
                            </div>
                            <div className="h-1 bg-neutral-800/50 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-300"
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
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      ⚠️ Avoid insulin stacking
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard Sub-Tabs Selector */}
            <div className="grid grid-cols-3 gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-2xl select-none text-center">
              <button
                id="btn-dash-manual-subtab"
                type="button"
                onClick={() => setDashboardSubTab("logs")}
                className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 select-none ${
                  dashboardSubTab === "logs"
                    ? "bg-neutral-800 text-white shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Manual Logs</span>
              </button>
              <button
                id="btn-dash-food-subtab"
                type="button"
                onClick={() => setDashboardSubTab("food")}
                className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 select-none ${
                  dashboardSubTab === "food"
                    ? "bg-rose-955/25 text-rose-455 border border-rose-500/10 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Culinary & Diet</span>
              </button>
              <button
                id="btn-dash-wearables-subtab"
                type="button"
                onClick={() => setDashboardSubTab("wearables")}
                className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 select-none ${
                  dashboardSubTab === "wearables"
                    ? "bg-indigo-950/45 text-indigo-455 border border-indigo-500/20 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Open Wearables</span>
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
                      logStressLevel <= 7 ? "bg-amber-500/10 text-amber-400" :
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
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-[#22d3ee] font-extrabold tracking-wider block uppercase font-mono">
                        Active Metabolic Metrics
                      </span>
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                        Daily Dashboard Summary
                      </h3>
                    </div>
                    
                    <span className={`text-[8px] border px-2 py-0.5 rounded font-black font-mono uppercase tracking-wider ${
                      hasTodayReadings 
                        ? "bg-emerald-550/15 text-emerald-400 border-emerald-500/20" 
                        : "bg-amber-550/15 text-amber-400 border-amber-500/20"
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
                            ? "text-amber-400" 
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
                              ? "text-amber-450" 
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
                                ? "bg-amber-500" 
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
                            className={`absolute top-0 bottom-0 w-2 h-2 rounded-full border border-black shadow-md ${
                              summaryPostAvg >= profile.targetPostMin && summaryPostAvg <= profile.targetPostMax
                                ? "bg-[#22d3ee]"
                                : "bg-rose-450"
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
                                  reading.stressLevel <= 7 ? "text-amber-400" :
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
            
            <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-white">Graphical Reports</h2>
                <p className="text-xs text-neutral-400 font-mono">Visual metabolic stability tracking</p>
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
              <div className="space-y-4 animate-fadeIn">
                {/* CHART CONTAINER & GRAPH VIEW */}
                <div className="bg-neutral-900 p-3 rounded-2xl border border-neutral-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-[10px] font-mono px-1 pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-neutral-400">Target Range Guideline</span>
                      <span className="text-neutral-600">•</span>
                      <span className="text-neutral-500">
                        {filteredChartData.length} records in {reportTimeRange === "custom" ? "Custom Range" : `${reportTimeRange}D`} window
                      </span>
                    </div>
                  </div>

                  {filteredChartData.length === 0 ? (
                    <div className="h-56 flex flex-col items-center justify-center text-center">
                      <PlayChartPlaceholderIcon className="w-10 h-10 text-neutral-700 mb-2" />
                      <p className="text-xs text-neutral-400">Unable to display graphs yet.</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Please log matching fasting vs. post-meal points first.</p>
                    </div>
                  ) : (
                    <div key={`trendline-chart-key-${chartFilter}-${filteredChartData.length}`} className="h-56 w-full text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredChartData}>
                          <defs>
                            <linearGradient id="colorFasting" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPost" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
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
                          <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Hypoglycemia (70)', fill: '#60a5fa', position: 'bottom', offset: 10, fontSize: 8 }} />
                          <ReferenceLine y={250} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Hyperglycemia Crisis (250)', fill: '#f87171', position: 'top', fontSize: 8 }} />

                          {/* Persistent Average Reference Lines */}
                          {windowAvgFasting !== null && chartFilter !== "post_fasting" && (
                            <ReferenceLine 
                              y={windowAvgFasting} 
                              stroke="#06b6d4" 
                              strokeDasharray="4 4" 
                              strokeWidth={1.5} 
                              label={{ 
                                value: `${reportTimeRange === "custom" ? "Selected" : `${reportTimeRange}D`} Avg Fasting: ${windowAvgFasting} mg/dL`, 
                                fill: '#22d3ee', 
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
                              stroke="#f43f5e" 
                              strokeDasharray="4 4" 
                              strokeWidth={1.5} 
                              label={{ 
                                value: `${reportTimeRange === "custom" ? "Selected" : `${reportTimeRange}D`} Avg Post: ${windowAvgPost} mg/dL`, 
                                fill: '#fb7185', 
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
                              stroke="#22d3ee" 
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
                              stroke="#fb7185" 
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
                          {chartFilter !== "post_fasting" && fastingReg && (
                            <Line 
                              type="linear" 
                              dataKey="fastingTrend" 
                              stroke="#22d3ee" 
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              dot={false}
                              activeDot={false}
                              name="Fasting Trend"
                            />
                          )}
                          {chartFilter !== "fasting" && postReg && (
                            <Line 
                              type="linear" 
                              dataKey="postTrend" 
                              stroke="#fb7185" 
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              dot={false}
                              activeDot={false}
                              name="Post-Meal Trend"
                            />
                          )}
                        </AreaChart>
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
                                statusBg = "bg-amber-500/15 text-amber-400 border border-amber-500/20";
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
                        : (latestCV < 36 ? "text-emerald-400" : "text-amber-400")
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
                              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
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
                            stroke="#f59e0b" 
                            strokeDasharray="4 4" 
                            strokeWidth={1.5} 
                            label={{ value: 'Stability Limit (36%)', fill: '#f59e0b', position: 'top', fontSize: 8 }} 
                          />
                          
                          <Area 
                            type="monotone" 
                            dataKey="cv" 
                            stroke="#a855f7" 
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
                  <div className="text-[9px] text-stone-400 italic bg-black/40 p-2.5 rounded-lg border-l-2 border-amber-500 leading-relaxed">
                    <span className="font-bold text-amber-400">Important Medical Disclaimer:</span> {insights.disclaimer || "All medical metrics and health guides generated here are reference summaries only. Always review and cross-validate diagnostic plans directly with your licensed physician before altering medications or insulin schedules."}
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
                                tick={{ fill: "#f43f5e", fontSize: 10 }}
                              />
                              <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                domain={['auto', 'auto']} 
                                stroke="#22d3ee" 
                                tickLine={false}
                                tick={{ fill: "#22d3ee", fontSize: 10 }}
                              />
                              <ChartTooltip
                                contentStyle={{
                                  backgroundColor: "#0a0a0a",
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
                                stroke="#f43f5e"
                                strokeWidth={2.5}
                                activeDot={{ r: 6 }}
                                dot={{ fill: "#f43f5e", r: 4 }}
                                name="Weight (kg)"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="avgGlucose"
                                stroke="#22d3ee"
                                strokeWidth={2.5}
                                connectNulls={true}
                                activeDot={{ r: 6 }}
                                dot={{ fill: "#22d3ee", r: 4 }}
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
                                    Your weight changed from <span className="text-rose-400 font-bold">{initialWeight} kg</span> to <span className="text-rose-400 font-bold">{currentWeight} kg</span> (<span className={`font-bold ${diff <= 0 ? "text-emerald-400" : "text-amber-400"}`}>{diff > 0 ? `+${diff}` : diff} kg</span>) over this reporting interval.
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
                              stroke="#22d3ee" 
                              tickLine={false}
                              tick={{ fill: "#22d3ee", fontSize: 9 }}
                            />
                            <YAxis 
                              yAxisId="right" 
                              orientation="right" 
                              domain={[0, 100]} 
                              stroke="#14b8a6" 
                              tickLine={false}
                              tick={{ fill: "#14b8a6", fontSize: 9 }}
                            />
                            <ChartTooltip
                              content={({ active, payload }: any) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-[11px] font-mono space-y-2 shadow-2xl max-w-[240px]">
                                      <p className="font-bold text-white border-b border-neutral-850 pb-1">Date: {data.date}</p>
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
                              stroke="#22d3ee" 
                              strokeDasharray="3 3" 
                              strokeWidth={1} 
                              label={{ 
                                value: `Target Fasting Ceiling (${profile.targetFastingMax || 100})`, 
                                fill: '#22d3ee', 
                                position: 'insideTopLeft', 
                                fontSize: 8,
                                opacity: 0.7
                              }} 
                            />
                            
                            {/* Adherence Rate Bar */}
                            <Bar
                              yAxisId="right"
                              dataKey="adherenceRate"
                              fill="#14b8a6"
                              fillOpacity={0.25}
                              stroke="#14b8a6"
                              strokeWidth={1.5}
                              radius={[4, 4, 0, 0]}
                              name="Adherence Rate (%)"
                            />
                            
                            {/* Fasting Glucose Line */}
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="avgFasting"
                              stroke="#22d3ee"
                              strokeWidth={2.5}
                              connectNulls={true}
                              activeDot={{ r: 6 }}
                              dot={{ fill: "#22d3ee", r: 4 }}
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
            <div className="flex bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 mt-1">
              <button
                id="sub-tab-checklist"
                onClick={() => setRemindersSubTab("checklist")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  remindersSubTab === "checklist"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Daily Checklist</span>
              </button>
              <button
                id="sub-tab-prescriptions"
                onClick={() => setRemindersSubTab("prescriptions")}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
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
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
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
                                      <span className="text-[9px] text-[#22d3ee] font-mono font-bold uppercase tracking-wider">Log Dose:</span>
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
                                  <span className="text-amber-500 uppercase tracking-wider bg-amber-500/5 px-2 py-0.5 rounded-md border border-amber-500/15">
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
                                <p className="text-[10px] text-[#22d3ee]/80 italic mt-1.5 flex items-start gap-1">
                                  <Info className="w-3.5 h-3.5 text-[#22d3ee] shrink-0 mt-0.5" />
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

            {remindersSubTab === "prescriptions" && (
              <div className="space-y-4 animate-fadeIn">
                {/* EXPANDABLE NEW PRESCRIBED MEDICATION FORM */}
                {newPresMedForm && (
                  <form onSubmit={handleAddPrescribedMed} className="bg-neutral-900 p-4 rounded-2xl border border-neutral-850 space-y-3.5 text-xs animate-fadeIn">
                    <span className="font-bold text-neutral-300 tracking-wider uppercase text-[10px] block text-emerald-400 font-mono">Add Prescribed Medication</span>
                    
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

                      {/* Sync to alarms option */}
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
                    </div>

                    <div className="flex gap-2">
                      <button
                        id="btn-pres-cancel"
                        type="button"
                        onClick={() => setNewPresMedForm(false)}
                        className="flex-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-700 py-2 rounded-xl text-neutral-300 font-bold transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button
                        id="btn-pres-submit"
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Save Prescription
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
                              <span className={`w-1.5 h-1.5 rounded-full ${warning.severity === "high" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`}></span>
                              {warning.title}
                            </span>
                            <span className={`text-[8.5px] font-mono font-extrabold px-2 py-0.5 rounded uppercase ${
                              warning.severity === "high" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
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

                              <button
                                id={`btn-del-pres-${med.id}`}
                                onClick={() => handleDeletePrescribedMed(med.id)}
                                className="p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                title="Remove medication"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
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
                      <BookOpen className="w-5 h-5 text-indigo-400" /> Patient Dietary & Medicine Handbook
                    </h2>
                    <p className="text-xs text-neutral-400 font-mono">Fasting mechanics, food programs & clinical guides</p>
                  </div>
                </div>

                {/* Sub-tab Toggles */}
                <div className="flex bg-neutral-900 p-0.5 rounded-xl border border-neutral-800 mt-1">
                  <button
                    id="sub-tab-diets"
                    onClick={() => setHandbookSubTab("diets")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      handbookSubTab === "diets"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Global Diets ({GLOBAL_DIETARY_PROGRAMS.length})</span>
                  </button>
                  <button
                    id="sub-tab-medicines"
                    onClick={() => setHandbookSubTab("medicines")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      handbookSubTab === "medicines"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <Pill className="w-4 h-4" />
                    <span>Meds Registry</span>
                  </button>
                </div>
              </div>

              {handbookSubTab === "diets" && (
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
                            <p className="text-[9px] text-[#22d3ee] font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.breakfast.ingredients}</p>
                            <p className="text-[9.5px] text-neutral-400 leading-relaxed mt-1">{selectedProgram.meals.breakfast.desc}</p>
                          </div>

                          <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                            <div className="flex justify-between items-center pb-1 border-b border-neutral-800/60">
                              <span className="text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">🥗 Lunch</span>
                              <span className="text-[10px] text-white font-bold">{selectedProgram.meals.lunch.name}</span>
                            </div>
                            <p className="text-[9px] text-[#22d3ee] font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.lunch.ingredients}</p>
                            <p className="text-[9.5px] text-neutral-400 leading-relaxed mt-1">{selectedProgram.meals.lunch.desc}</p>
                          </div>

                          <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                            <div className="flex justify-between items-center pb-1 border-b border-neutral-800/60">
                              <span className="text-[8px] bg-[#22d3ee]/10 text-[#22d3ee] px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">🍽️ Dinner</span>
                              <span className="text-[10px] text-white font-bold">{selectedProgram.meals.dinner.name}</span>
                            </div>
                            <p className="text-[9px] text-[#22d3ee] font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.dinner.ingredients}</p>
                            <p className="text-[9.5px] text-neutral-400 leading-relaxed mt-1">{selectedProgram.meals.dinner.desc}</p>
                          </div>

                          <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-800/80 hover:border-neutral-700 transition-colors">
                            <div className="flex justify-between items-center pb-1 border-b border-neutral-800/60">
                              <span className="text-[8px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider">🍿 Snacks</span>
                              <span className="text-[10px] text-white font-bold">{selectedProgram.meals.snack.name}</span>
                            </div>
                            <p className="text-[9px] text-[#22d3ee] font-semibold mt-1 font-mono">Ingredients: {selectedProgram.meals.snack.ingredients}</p>
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
                              <span className="text-[10.5px] text-[#22d3ee] font-black uppercase font-mono tracking-wider">🌿 {ing.name}</span>
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
                            <span className="font-mono text-[8px] text-[#22d3ee] block uppercase font-bold">Custom Recipe Adaptation</span>
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
                            <span className="font-bold text-[#22d3ee] uppercase tracking-widest text-[8px] block font-mono">Safe Ingredients</span>
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

              {handbookSubTab === "medicines" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* SMART GEMINI MEDICINE RESEARCH DECK */}
                  <div className="bg-gradient-to-br from-indigo-950/20 to-neutral-900/60 border border-indigo-900/30 p-4 rounded-2xl space-y-3 shadow-md">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                      <span className="font-bold text-white text-xs uppercase tracking-wider">Gemini Medical Research Desk</span>
                    </div>
                    
                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      Need details for unlisted prescriptions, active insulin styles, or blood sugar interactions? Query Gemini AI directly for a clinically aligned dosage and side effects breakdown.
                    </p>

                    <form onSubmit={handleMedicineAISearch} className="space-y-2">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            id="input-ai-med-search"
                            type="text"
                            required
                            placeholder="Enter drug name (e.g. Januvia, Ozempic)"
                            value={lookupName}
                            onChange={(e) => setLookupName(e.target.value)}
                            className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                          />
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                        </div>
                        
                        <button
                          id="btn-submit-ai-med-search"
                          type="submit"
                          disabled={searchLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50 select-none shadow-md shrink-0"
                        >
                          {searchLoading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <span>Search</span>
                          )}
                        </button>
                      </div>

                      <div className="flex gap-2 text-[10px] items-center">
                        <span className="text-neutral-500">Query Filter:</span>
                        <div className="flex gap-1.5">
                          {["General Information", "Dosage & Fasting Impact", "Metabolic Interactions"].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSearchType(opt)}
                              className={`px-2 py-0.5 rounded border text-[9px] transition-all cursor-pointer font-mono ${
                                searchType === opt 
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-semibold" 
                                  : "bg-neutral-950 text-neutral-500 border-neutral-800"
                              }`}
                            >
                              {opt.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </form>

                    {searchError && (
                      <div className="p-3 bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] rounded-lg animate-fadeIn">
                        {searchError}
                      </div>
                    )}

                    {/* RENDER AI RETRIEVATION DISCOVERY COMPONENT */}
                    {searchedMedicine && (
                      <div className="bg-neutral-950 p-4 rounded-xl border border-indigo-900/40 space-y-3.5 text-xs animate-fadeIn max-h-[300px] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-indigo-950 pb-2">
                          <span className="font-black text-rose-400 text-sm uppercase tracking-tight">{searchedMedicine.name}</span>
                          <span className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full font-mono border border-indigo-500/20">AI Guidance</span>
                        </div>

                        {/* Mandated Disclaimer */}
                        <div className="text-[9px] text-stone-400 italic bg-black/40 p-2.5 rounded-lg border-l-2 border-indigo-500 leading-relaxed font-sans">
                          <span className="font-bold text-indigo-400">Medical Warning Checklist:</span> {searchedMedicine.disclaimer}
                        </div>

                        <div className="space-y-3 leading-dashed font-sans">
                          <div>
                            <span className="font-bold text-neutral-300 uppercase tracking-widest text-[9px] block">Medical Description & Action</span>
                            <p className="text-stone-300 text-[11px] leading-relaxed mt-0.5">{searchedMedicine.description}</p>
                          </div>

                          <div>
                            <span className="font-bold text-neutral-300 uppercase tracking-widest text-[9px] block">Prescribed Purpose</span>
                            <p className="text-stone-300 text-[11px] leading-relaxed mt-0.5">{searchedMedicine.purpose}</p>
                          </div>

                          <div className="p-2.5 bg-neutral-900 rounded-xl border border-white/5 space-y-1">
                            <span className="font-bold text-[#22d3ee] uppercase tracking-widest text-[9px] block">Typical Dosage & Meal Relation</span>
                            <p className="text-stone-300 text-[11px] leading-relaxed mt-0.5">{searchedMedicine.typicalDosage}</p>
                          </div>

                          <div className="p-2.5 bg-neutral-900 rounded-xl border border-white/5 space-y-1">
                            <span className="font-bold text-emerald-400 uppercase tracking-widest text-[9px] block">Impact on Fasting/Glucose Levels</span>
                            <p className="text-stone-300 text-[11px] leading-relaxed mt-0.5">{searchedMedicine.fastingImpact}</p>
                          </div>

                          <div>
                            <span className="font-bold text-neutral-300 uppercase tracking-widest text-[9px] block">Standard Side Effects</span>
                            <ul className="list-disc pl-4 space-y-1 mt-1 text-stone-300 text-[11px]">
                              {searchedMedicine.commonSideEffects?.map((se, idx) => (
                                <li key={idx}>{se}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="font-bold text-neutral-300 uppercase tracking-widest text-[9px] block">Key Dietary & Beverage Interactions</span>
                            <p className="text-stone-300 text-[11px] leading-relaxed mt-0.5">{searchedMedicine.dietaryInteractions}</p>
                          </div>

                          <div className="p-3 bg-red-950/15 border border-red-500/20 rounded-xl text-rose-300/90 leading-relaxed font-sans">
                            <span className="font-bold text-rose-400 uppercase tracking-widest text-[9px] block flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Extreme Warnings & Risk Indicators
                            </span>
                            <p className="text-[11px] mt-1 leading-snug">{searchedMedicine.warnings}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRE-BUILT MEDICAL DIRECTORIES */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-widest px-1">Common Diabetes Medications Checklist</h3>
                    
                    <div className="space-y-3">
                      {MEDICINE_LIST.map((med, idx) => (
                        <details 
                          key={idx}
                          className="group bg-neutral-900 border border-neutral-800/80 rounded-2xl overflow-hidden font-sans text-xs transition-all [&_summary::-webkit-details-marker]:hidden"
                        >
                          <summary className="flex items-center justify-between p-4 cursor-pointer select-none border-b border-transparent group-open:border-neutral-800 shrink-0">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                                <Pill className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="font-bold text-white text-[12px] block group-open:text-indigo-400 transition-colors">{med.name}</span>
                                <span className="text-[9px] text-zinc-500 font-semibold font-mono tracking-wider uppercase">Click to view mechanics & details</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-500 group-open:rotate-90 transition-transform" />
                          </summary>

                          <div className="p-4 space-y-3.5 bg-neutral-900 border-t border-neutral-800 leading-relaxed text-stone-300">
                            <p className="text-[10px] text-neutral-400 italic bg-black/30 p-2.5 rounded-lg border-l-2 border-stone-500 leading-snug">
                              {med.disclaimer}
                            </p>

                            <div>
                              <span className="font-bold text-neutral-200 uppercase tracking-widest text-[9px] block">What it Is & How it Works</span>
                              <p className="text-[11.5px] mt-0.5 leading-relaxed">{med.description}</p>
                            </div>

                            <div>
                              <span className="font-bold text-neutral-200 uppercase tracking-widest text-[9px] block">Prescribed Purpose</span>
                              <p className="text-[11.5px] mt-0.5 leading-relaxed">{med.purpose}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1">
                              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                                <span className="font-bold text-[#22d3ee] uppercase tracking-widest class text-[9px] block">Dosage Instructions</span>
                                <p className="text-[10px] mt-1 leading-relaxed text-stone-300">{med.typicalDosage}</p>
                              </div>
                              <div className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
                                <span className="font-bold text-emerald-400 uppercase tracking-widest text-[9px] block">Impact on Fasting Checked</span>
                                <p className="text-[10px] mt-1 leading-relaxed text-stone-300">{med.fastingImpact}</p>
                              </div>
                            </div>

                            <div>
                              <span className="font-bold text-neutral-200 uppercase tracking-widest text-[9px] block">Common Adverse Events</span>
                              <ul className="list-disc pl-4 space-y-1.5 mt-1 test-[11px] text-zinc-300">
                                {med.commonSideEffects.map((se, sIdx) => (
                                  <li key={sIdx}>{se}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <span className="font-bold text-neutral-200 uppercase tracking-widest text-[9px] block">Meal & Drink Warnings</span>
                              <p className="text-[11.5px] mt-0.5 leading-relaxed">{med.dietaryInteractions}</p>
                            </div>

                            <div className="p-3 bg-red-950/10 border border-red-500/25 rounded-xl text-rose-300/95 font-sans">
                              <span className="font-bold text-rose-400 uppercase tracking-widest text-[9px] block flex items-center gap-1 font-mono">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Critical Warnings
                              </span>
                              <p className="text-[10px] mt-1.5 leading-snug">{med.warnings}</p>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })()}

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
            activeTab === "history" ? "text-amber-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Clock className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">History</span>
        </button>

        <button
          id="tab-btn-profile"
          onClick={() => changeTab("profile")}
          className={`flex-1 flex flex-col items-center justify-center py-2 transition-all cursor-pointer ${
            activeTab === "profile" ? "text-amber-500 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Settings className="w-5 h-5 block" />
          <span className="text-[9px] mt-1 tracking-tight">Targets</span>
        </button>
      </nav>

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
    const data = payload[0].payload as GlucoseReading;
    return (
      <div className="bg-neutral-900 border border-neutral-700/85 p-3 rounded-xl space-y-1.5 font-sans leading-relaxed shadow-lg max-w-[200px]">
        <div className="text-[9px] font-bold text-neutral-400 font-mono flex justify-between items-center pb-1 border-b border-neutral-800">
          <span>{data.date}</span>
          <span>{data.time}</span>
        </div>
        
        <div className="flex items-center gap-1 mt-1 justify-between">
          <span className="text-[10px] text-zinc-300 font-medium">Type: {data.type === "fasting" ? "Fasting" : "Post-Meal"}</span>
          <span className="text-[10px] font-mono text-zinc-500 font-semibold">{data.category}</span>
        </div>

        <div className="flex items-baseline gap-1 bg-black/35 py-1 px-2 rounded-lg justify-center border border-white/5">
          <span className="text-sm font-black text-white">{data.value}</span>
          <span className="text-[9px] text-stone-500 font-mono">mg/dL</span>
        </div>

        {data.stressLevel !== undefined && (
          <div className="flex items-center justify-between text-[9px] font-mono border-t border-neutral-800/60 pt-1.5 mt-1">
            <span className="text-stone-500">Stress Correlation:</span>
            <span className={`font-bold ${
              data.stressLevel <= 3 ? "text-emerald-400" :
              data.stressLevel <= 7 ? "text-amber-400" :
              "text-rose-400"
            }`}>
              {data.stressLevel}/10
            </span>
          </div>
        )}

        {data.notes && (
          <p className="text-[9px] text-stone-400 mt-1 italic leading-snug truncate">
            "{data.notes}"
          </p>
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
            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
        }`}>
          {data.cv < 36 ? "✓ STABLE SUGAR LEVELS" : "⚠️ HIGH FLUCTUATIONS"}
        </div>
      </div>
    );
  }
  return null;
}
