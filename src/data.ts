import { MedicineDetails } from "./types";

export const PRELOADED_MEDICINES: Record<string, MedicineDetails> = {
  metformin: {
    disclaimer: "Reference guidelines only. Always consult your physician for individualized medical advice.",
    name: "Metformin (Glucophage)",
    description: "Biguanide medication that reduces the amount of sugar produced by the liver and increases the sensitivity of muscle cells to insulin, encouraging natural glucose uptake.",
    purpose: "Primary first-line therapy for managing Type 2 Diabetes to maintain balanced baseline levels.",
    typicalDosage: "Usually 500mg to 1000mg twice daily. Often taken immediately after breakfast and dinner to lower the risk of stomach irritation.",
    fastingImpact: "Principally works to lower morning Fasting Blood Glucose by curtailing overactive liver production overnight. Has a low inherent risk of causing hypoglycemia when taken alone.",
    commonSideEffects: [
      "Stomach upset, nausea, or mild cramps",
      "Diarrhea (often subsides after initial weeks)",
      "Metallic taste in mouth",
      "Vitamin B12 deficiency (long-term use)"
    ],
    dietaryInteractions: "Should be taken with meals. Avoid extreme alcohol consumption as it may dramatically elevate the risk of a rare condition called lactic acidosis.",
    warnings: "Contact your physician immediately if you experience deep breathing, weakness, muscle pain, or extreme fatigue (signs of lactic acidosis)."
  },
  glipizide: {
    disclaimer: "Reference guidelines only. Always consult your physician for individualized medical advice.",
    name: "Glipizide (Glucotrol)",
    description: "A sulfonylurea drug that acts directly on the beta cells of the pancreas, stimulating prompt insulin release into the bloodstream.",
    purpose: "Stabilizes post-meal blood sugar levels by amplifying insulin levels immediately in response to nutritional intake.",
    typicalDosage: "Usually 5mg to 10mg once or twice daily. Must be taken exactly 30 minutes before breakfast or your scheduled main meal.",
    fastingImpact: "Strongly reduces post-breakfast/meal levels. Presents a high risk of insulin-induced hypoglycemia if meals are skipped or delayed following the dose.",
    commonSideEffects: [
      "Low blood sugar (hypoglycemia)",
      "Weight gain",
      "Skin rash or sensitivity",
      "Mild nausea"
    ],
    dietaryInteractions: "Must be accompanied by carbohydrates inside 30 minutes. Limit alcohol as it alters hypoglycemia awareness and blood sugar release.",
    warnings: "Always carry fast-acting sugars (e.g., fruit juice, honey, glucose tablets) in case of hypoglycemia. Skip the dose if you are skipping a major meal."
  },
  empagliflozin: {
    disclaimer: "Reference guidelines only. Always consult your physician for individualized medical advice.",
    name: "Empagliflozin (Jardiance)",
    description: "An SGLT2 inhibitor that prevents the kidneys from reabsorbing glucose back into the blood, letting excess sugar be removed securely through urination.",
    purpose: "Advanced glycemic control for Type 2 Diabetes. Also clinically demonstrated to reduce cardiovascular incidents and assist kidney preservation.",
    typicalDosage: "Typically 10mg once daily taken in the morning, with or without food.",
    fastingImpact: "Smoothly reduces both fasting and post-prandial levels. Does not directly stimulate insulin, resulting in low general hypoglycemia risk.",
    commonSideEffects: [
      "Increased urination frequency",
      "Mild dehydration or dry mouth",
      "Urinary tract infections (UTIs)",
      "Slight weight loss"
    ],
    dietaryInteractions: "Maintain robust daily water intake to balance the diuretic effect and protect renal functions.",
    warnings: "Watch out for signs of extremely high acid levels or dehydration. Contact a doctor if experiencing nausea, vomiting, stomach pain, or breathing difficulties (atypical diabetic ketoacidosis)."
  },
  sitagliptin: {
    disclaimer: "Reference guidelines only. Always consult your physician for individualized medical advice.",
    name: "Sitagliptin (Januvia)",
    description: "A DPP-4 inhibitor that works by safeguarding and extending the window of active incretin hormones. These hormones prompt insulin production and decrease glucagon release only when glucose levels are high.",
    purpose: "Regulates mealtime blood sugar spikes in Type 2 Diabetes, supporting stable cellular utilization.",
    typicalDosage: "Standard dose is 100mg once daily, taken consistently at any time of day with or without food.",
    fastingImpact: "Targets both fasting baseline and post-meal spikes with a self-limiting action that rarely provokes standard hypoglycemia.",
    commonSideEffects: [
      "Upper respiratory tract congestion",
      "Headache",
      "Mild sore throat",
      "Joint discomfort"
    ],
    dietaryInteractions: "No major food restrictions; works efficiently with standard nutritious diets.",
    warnings: "Seek urgent medical support if you experience persistent, severe abdominal pain radiating to the back (rare indicator of acute pancreatitis)."
  },
  insulin_glargine: {
    disclaimer: "Reference guidelines only. Always consult your physician for individualized medical advice.",
    name: "Insulin Glargine (Lantus)",
    description: "A long-acting, peakless basal insulin analogue designed to release slowly over a full 24-hour window to duplicate standard physiological baseline insulin.",
    purpose: "Essential for baseline survival in Type 1 Diabetes and as advanced support for Type 2 Diabetes.",
    typicalDosage: "Subcutaneous injection once daily, systematically injected at the exact same hour every day.",
    fastingImpact: "Directly secures steady Fasting Blood Glucose scores upon waking up. Hypoglycemia risk is prominent and requires meticulous target balance.",
    commonSideEffects: [
      "Hypoglycemia (low blood sugar)",
      "Injection site redness or lipodystrophy",
      "Mild weight gain",
      "Slight sodium retention"
    ],
    dietaryInteractions: "Requires reliable, standard carbohydrate intake patterns. Do not skip meals without adjusting mealtime bolus insulin (if prescribed).",
    warnings: "Never share injection pens. Repeatedly check and adjust dosage matching fasting trends carefully under direct physician supervision."
  },
  semaglutide: {
    disclaimer: "Reference guidelines only. Always consult your physician for individualized medical advice.",
    name: "Semaglutide (Ozempic / Rybelsus)",
    description: "A GLP-1 receptor agonist that mimics natural glucagon-like peptide-1, enhancing nutrient-dependent insulin release, slowing stomach emptying, and signaling fullness to the brain.",
    purpose: "Potent glycemic control to reduce A1c, support weight management, and lower cardiovascular risk in Type 2 Diabetes.",
    typicalDosage: "Subcutaneous weekly injection starting at 0.25mg up to 2.0mg, or daily oral tablet (Rybelsus) 30 mins before any food with water.",
    fastingImpact: "Reduces fasting glucose levels significantly over time by correcting glucagon levels and liver outputs, with extremely low individual hypoglycemia risks.",
    commonSideEffects: [
      "Moderate nausea, vomiting, or diarrhea",
      "Decreased appetite",
      "Mild constipation or bloated stomach",
      "Headaches"
    ],
    dietaryInteractions: "Requires small, balanced portions. Avoid large fatty meals to minimize gastrointestinal discomfort.",
    warnings: "Advise your physician if you experience lumps in the neck or hoarseness (GLP-1 thyroid warning). Avoid if you have a family history of Medullary Thyroid Carcinoma."
  }
};
export const MEDICINE_LIST = Object.values(PRELOADED_MEDICINES);
