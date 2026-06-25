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
  theme?: "dark" | "high-contrast-light";
  weightHistory?: WeightHistoryEntry[];
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



