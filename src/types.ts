export interface GlucoseReading {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour)
  type: "fasting" | "post_fasting";
  value: number; // mg/dL
  category: "Hypoglycemia" | "Normal" | "Prediabetes" | "Diabetes" | "Severe Hyperglycemia";
  notes?: string;
  stressLevel?: number; // 1-10
}

export interface MedicationReminder {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg" or "10 units"
  timing: "before_breakfast" | "after_breakfast" | "before_lunch" | "after_lunch" | "before_dinner" | "after_dinner" | "bedtime" | "anytime";
  times: string[]; // e.g. ["08:00", "20:00"]
  frequency?: string; // e.g. "Once daily", "Twice daily"
  active: boolean;
  isInsulin?: boolean;
  notes?: string;
}

export interface MedicationLog {
  id: string;
  reminderId: string;
  medicineName: string;
  takenAt: string; // ISO String
  dateStamp: string; // YYYY-MM-DD
  unitsAdministered?: number;
}

export interface MedicineDetails {
  disclaimer: string;
  name?: string;
  description: string;
  purpose: string;
  typicalDosage: string;
  fastingImpact: string;
  commonSideEffects: string[];
  dietaryInteractions: string;
  warnings: string;
}

export interface WeightHistoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // weight in kg
}

export interface UserProfile {
  id?: string;
  name: string;
  age: number;
  weight?: string; // Weight in kg or lbs
  diabetesType: "Type 1" | "Type 2" | "Gestational" | "Prediabetes" | "None";
  medications: string;
  targetFastingMin: number; // Default 70 mg/dL
  targetFastingMax: number; // Default 100 mg/dL
  targetPostMin: number;    // Default 100 mg/dL
  targetPostMax: number;    // Default 140 mg/dL
  theme?: "matte-slate" | "matte-terracotta" | "matte-steel" | "matte-chalk-light" | "dark" | "high-contrast-light";
  targetHbA1c?: number; // Target HbA1c in %, e.g. 6.5
  targetTimeInRange?: number; // Target Time In Range %, e.g. 75
  targetDailyLogs?: number; // Target number of daily glucose logs, e.g. 3
  doctorName?: string;
  doctorEmail?: string;
  doctorClinic?: string;
  doctorPhone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  glucometerDevice?: {
    name: string;
    brand: string;
    connectedAt: string;
    lastSync?: string;
    autoSync: boolean;
  };
  weightHistory?: WeightHistoryEntry[];
  biometricEnabled?: boolean;
  pinCode?: string;
  disclaimerAccepted?: boolean;
  healthConnectSynced?: boolean;
  membershipTier?: "free" | "pro" | "caregiver_plus";
  membershipExpiry?: string;
  trialActive?: boolean;
}

export interface FoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour style format)
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  foodItems: string; // e.g., "White rice, bowl of soup, chicken breast"
  portionSize: string; // e.g., "1 plate, 200g, 2 pieces"
  associatedGlucoseId?: string; // Link to a GlucoseReading
  notes?: string;
  impactScale?: "low" | "medium" | "high"; // Optional carbs or high glycemic spike indicator
  carbsIntake?: number; // Optionally, carbohydrate intake in grams
  proteinIntake?: number; // Optionally, protein intake in grams
  fatIntake?: number; // Optionally, fat intake in grams
}

export interface PrescribedMedication {
  id: string;
  name: string;
  dosage: string; // e.g. "500mg" or "10 units"
  frequency: string; // e.g. "Once daily", "Twice daily"
  description: string; // use/mechanism
  sideEffects: string[]; // adverse effects list
  specialInstructions?: string; // special directions for use
}

export interface ActivityLog {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  activityType: string; // e.g. "Walking", "Running", "Swimming", "Cycling", "Strength Training"
  duration: number; // minutes
  intensity: "low" | "medium" | "high";
  caloriesBurned?: number;
  notes?: string;
}

export interface FastingReminderConfig {
  enabled: boolean;
  targetTime: string; // Target scheduled check time e.g. "07:30"
  leadMinutes: number; // Minutes before target time to notify (default 15)
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  browserNotificationsEnabled: boolean;
  prepChecklistEnabled: boolean;
  customNotes?: string;
  lastTriggeredDate?: string; // YYYY-MM-DD to avoid repeating on the same day
  snoozedUntil?: number | null; // Timestamp
}




