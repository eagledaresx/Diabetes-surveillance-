import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  Pill, 
  Info, 
  CheckCircle2, 
  ArrowRightLeft, 
  BookOpen, 
  HelpCircle,
  Activity,
  Heart
} from "lucide-react";
import { PrescribedMedication } from "../types";

interface MedicationInteractionCheckerProps {
  prescribedMeds: PrescribedMedication[];
  onSwitchToPrescriptions?: () => void;
}

export interface InteractionRule {
  id: string;
  med1Pattern: string;
  med2Pattern: string;
  med1Label: string;
  med2Label: string;
  severity: "high" | "moderate" | "low";
  title: string;
  mechanism: string;
  action: string;
}

export const INTERACTION_RULES: InteractionRule[] = [
  {
    id: "metformin_contrast",
    med1Pattern: "metformin",
    med2Pattern: "contrast",
    med1Label: "Metformin (Glucophage)",
    med2Label: "Iodinated Contrast Dye",
    severity: "high",
    title: "Lactic Acidosis Risk (Metformin + Contrast Media)",
    mechanism: "Iodinated contrast media can cause acute kidney injury, leading to metformin accumulation in the body, which significantly elevates the risk of severe, potentially life-threatening lactic acidosis.",
    action: "Metformin must generally be temporarily discontinued at the time of, or prior to, the imaging procedure and withheld for 48 hours after the procedure until renal function is re-evaluated and confirmed normal."
  },
  {
    id: "metformin_nsaid",
    med1Pattern: "metformin",
    med2Pattern: "nsaid",
    med1Label: "Metformin (Glucophage)",
    med2Label: "NSAIDs (Ibuprofen, Naproxen, etc.)",
    severity: "moderate",
    title: "Impaired Renal Clearance & Elevated Metformin Levels",
    mechanism: "NSAIDs inhibit renal prostaglandins, causing renal vasoconstriction and temporary reduction in glomerular filtration. This impairs metformin excretion, potentially increasing the risk of lactic acidosis.",
    action: "Monitor kidney function markers (e.g., eGFR, Serum Creatinine) regularly if taking long-term NSAIDs with Metformin. Consider alternative pain relievers like Acetaminophen under medical guidance."
  },
  {
    id: "metformin_alcohol",
    med1Pattern: "metformin",
    med2Pattern: "alcohol",
    med1Label: "Metformin (Glucophage)",
    med2Label: "Alcohol (Ethanol)",
    severity: "high",
    title: "Synergistic Lactic Acidosis Risk",
    mechanism: "Alcohol suppresses hepatic gluconeogenesis and enhances the conversion of glucose to lactate in peripheral tissues. When combined with Metformin, this severely impairs lactate clearance and can cause profound lactic acidosis.",
    action: "Avoid excessive or acute alcohol binge drinking while taking Metformin. Always consume alcohol in extreme moderation and preferably with a meal to avoid simultaneous hypoglycemia."
  },
  {
    id: "metformin_cimetidine",
    med1Pattern: "metformin",
    med2Pattern: "cimetidine",
    med1Label: "Metformin (Glucophage)",
    med2Label: "Cimetidine (Tagamet)",
    severity: "low",
    title: "Competition for Renal Cationic Transport",
    mechanism: "Cimetidine competes with metformin for active renal tubular secretion via organic cation transporters (OCT2), resulting in a roughly 60% increase in metformin peak plasma concentrations.",
    action: "Consider alternative H2-receptor antagonists (like Famotidine) that do not interfere with OCT2 transport channels, or reduce Metformin dose if GI side effects worsen."
  },
  {
    id: "sulfonylurea_insulin",
    med1Pattern: "glipizide",
    med2Pattern: "insulin",
    med1Label: "Sulfonylureas (Glipizide, Glyburide, etc.)",
    med2Label: "Insulin (Basal or Rapid-acting)",
    severity: "high",
    title: "Exponential Risk of Severe Hypoglycemia",
    mechanism: "Both sulfonylureas (which force the pancreas to secrete active insulin) and exogenous insulin injections work synergistically to lower blood sugar. This combination drastically increases the rate of profound hypoglycemia.",
    action: "Strictly monitor capillary blood glucose multiple times daily. Dose adjustments are critical. Ensure fast-acting glucose tablets or emergency glucagon are readily accessible."
  },
  {
    id: "sulfonylurea_bb",
    med1Pattern: "glipizide",
    med2Pattern: "metoprolol",
    med1Label: "Sulfonylureas (Glipizide, Glyburide, etc.)",
    med2Label: "Beta-Blockers (Metoprolol, Atenolol, etc.)",
    severity: "moderate",
    title: "Masked Hypoglycemia Symptoms & Attenuated Recovery",
    mechanism: "Beta-adrenergic blockades mask standard sympathetic warning indicators of low blood glucose, such as palpitations, tremor, and tachycardia. Sweat glands are activated by cholinergic pathways and remain unaffected.",
    action: "Counsel patient that sweating may be the only reliable warning sign of low blood sugar. Perform scheduled glucose checks rather than relying on somatic symptoms."
  },
  {
    id: "insulin_bb",
    med1Pattern: "insulin",
    med2Pattern: "metoprolol",
    med1Label: "Insulin (Basal or Rapid-acting)",
    med2Label: "Beta-Blockers (Metoprolol, Atenolol, etc.)",
    severity: "moderate",
    title: "Masked Hypoglycemia & Blunted Glucose Counter-Regulation",
    mechanism: "Beta-blockers mask critical cardiac warning signs of hypoglycemia (palpitations, rapid pulse). In addition, non-selective beta-blockers (like Propranolol) inhibit glycogenolysis, making it harder for the body to recover from hypoglycemia.",
    action: "Observe perspiration/sweating patterns. If beta-blockers are clinically necessary, highly selective beta-1 antagonists (e.g., Metoprolol) are preferred to preserve liver response."
  },
  {
    id: "sulfonylurea_warfarin",
    med1Pattern: "glipizide",
    med2Pattern: "warfarin",
    med1Label: "Sulfonylureas (Glipizide, Glyburide, etc.)",
    med2Label: "Warfarin (Coumadin)",
    severity: "high",
    title: "Bilateral Drug Displacement & Enhanced Anticoagulant Risk",
    mechanism: "Warfarin may compete with sulfonylureas for protein binding sites, transiently elevating free sulfonylurea levels and causing sudden hypoglycemia. Conversely, sulfonylureas may impair warfarin's clearance, elevating bleeding risks.",
    action: "Closely monitor INR (International Normalized Ratio) and capillary blood glucose when initiating or adjusting either medication. Watch for bruising, bleeding gums, or dizziness."
  },
  {
    id: "sulfonylurea_alcohol",
    med1Pattern: "glipizide",
    med2Pattern: "alcohol",
    med1Label: "Sulfonylureas (Glipizide, Glyburide, etc.)",
    med2Label: "Alcohol (Ethanol)",
    severity: "high",
    title: "Severe Hypoglycemia & Disulfiram-like Reaction",
    mechanism: "Alcohol blocks liver glucose release. Additionally, certain sulfonylureas (especially glyburide) can inhibit acetaldehyde dehydrogenase, causing flushing, throbbing headache, and nausea.",
    action: "Avoid drinking alcohol on an empty stomach. Warn the patient about the risk of sudden hypoglycemia and hot flushes. Carry fast-acting carbohydrates."
  },
  {
    id: "sglt2_diuretic",
    med1Pattern: "empagliflozin",
    med2Pattern: "furosemide",
    med1Label: "SGLT2 Inhibitors (Jardiance, Farxiga, etc.)",
    med2Label: "Diuretics (Furosemide, HCTZ, etc.)",
    severity: "moderate",
    title: "Severe Volume Depletion & Orthostatic Hypotension",
    mechanism: "SGLT2 inhibitors cause osmotic diuresis by expelling glucose in urine. Combining them with standard loop or thiazide diuretics causes a profound additive volume depletion, increasing dehydration and postural dizziness.",
    action: "Monitor blood pressure, hydration status (skin turgor, dry mouth), and renal biomarkers. A temporary dose reduction of the diuretic may be warranted when starting SGLT2 therapy."
  },
  {
    id: "sglt2_nsaid",
    med1Pattern: "empagliflozin",
    med2Pattern: "nsaid",
    med1Label: "SGLT2 Inhibitors (Jardiance, Farxiga, etc.)",
    med2Label: "NSAIDs (Ibuprofen, Naproxen, etc.)",
    severity: "moderate",
    title: "Double-Hit Nephrotoxicity Risk",
    mechanism: "SGLT2 inhibitors increase urine output and lower systemic blood pressure. NSAIDs constrict the afferent renal arteriole. Combined, they impair the kidney's auto-regulatory ability, sparking acute kidney injury.",
    action: "Avoid prolonged or frequent NSAID therapy while taking SGLT2 inhibitors. If analgesic control is necessary, prefer short-term low-dose acetaminophen or consult your physician."
  },
  {
    id: "aspirin_warfarin",
    med1Pattern: "aspirin",
    med2Pattern: "warfarin",
    med1Label: "Aspirin (Acetylsalicylic Acid)",
    med2Label: "Anticoagulants (Warfarin, Eliquis, etc.)",
    severity: "high",
    title: "Profound Bleeding & Gastrointestinal Hemorrhage Risk",
    mechanism: "Aspirin irreversibly impairs platelet aggregation, whereas anticoagulants inhibit the clotting cascade. The dual mechanism dramatically raises the hazard of spontaneous internal bleeds and stomach ulcers.",
    action: "This combination requires strict medical justification (e.g., recent coronary stenting with atrial fibrillation). Report any dark/tarry stools, nosebleeds, or pink urine immediately."
  },
  {
    id: "ace_sglt2",
    med1Pattern: "lisinopril",
    med2Pattern: "empagliflozin",
    med1Label: "ACE Inhibitors / ARBs (Lisinopril, Losartan, etc.)",
    med2Label: "SGLT2 Inhibitors (Jardiance, Farxiga, etc.)",
    severity: "low",
    title: "Renal Hemodynamic Synergism & Hypotension Caution",
    mechanism: "Both classes affect renal blood flow (ACE inhibitors dilate efferent arterioles, SGLT2 inhibitors constrict afferent arterioles). While nephroprotective long-term, their initiation can trigger a mild, temporary drop in GFR and low blood pressure.",
    action: "Monitor blood pressure and serum creatinine within 2-4 weeks of starting co-administration. Stay adequately hydrated to maintain stable intravascular volume."
  },
  {
    id: "ace_insulin",
    med1Pattern: "lisinopril",
    med2Pattern: "insulin",
    med1Label: "ACE Inhibitors / ARBs (Lisinopril, Losartan, etc.)",
    med2Label: "Insulin (Basal or Rapid-acting)",
    severity: "moderate",
    title: "Increased Insulin Sensitivity & Hypoglycemia Risk",
    mechanism: "ACE inhibitors can increase insulin sensitivity and lower blood glucose by elevating bradykinin levels, which stimulates blood flow and glucose uptake in skeletal muscle.",
    action: "Be alert for unexplained mild blood sugar drops when commencing an ACE inhibitor or ARB. Monitor fasting levels and discuss dose reductions with your endocrinologist."
  },
  {
    id: "ace_spironolactone",
    med1Pattern: "lisinopril",
    med2Pattern: "spironolactone",
    med1Label: "ACE Inhibitors / ARBs (Lisinopril, Losartan, etc.)",
    med2Label: "Spironolactone (Aldactone)",
    severity: "high",
    title: "Severe Hyperkalemia Risk",
    mechanism: "Both medications suppress aldosterone actions, leading to decreased potassium excretion by the kidneys. This synergism can trigger life-threatening high blood potassium levels (hyperkalemia).",
    action: "Check serum potassium levels and kidney function weekly during initiation or dose titration. Avoid potassium supplements or salt substitutes containing potassium."
  }
];

// Helper to normalize drug category tags for user inputs
export const DRUG_PLAYGROUND_LIST = [
  { value: "metformin", label: "Metformin (Glucophage)" },
  { value: "insulin", label: "Insulin (Lantus / Humalog / Basal)" },
  { value: "glipizide", label: "Sulfonylurea (Glipizide / Glimepiride)" },
  { value: "empagliflozin", label: "SGLT2 Inhibitor (Jardiance / Farxiga)" },
  { value: "metoprolol", label: "Beta-Blocker (Metoprolol / Atenolol)" },
  { value: "lisinopril", label: "ACE Inhibitor / ARB (Lisinopril / Losartan)" },
  { value: "nsaid", label: "NSAID (Ibuprofen / Naproxen)" },
  { value: "furosemide", label: "Diuretic (Furosemide / HCTZ / Lasix)" },
  { value: "spironolactone", label: "Spironolactone (Aldactone)" },
  { value: "aspirin", label: "Aspirin (High-dose or Cardio)" },
  { value: "warfarin", label: "Anticoagulant (Warfarin / Eliquis)" },
  { value: "contrast", label: "Iodinated Contrast Dye" },
  { value: "alcohol", label: "Alcohol / Ethanol" }
];

export function MedicationInteractionChecker({ 
  prescribedMeds, 
  onSwitchToPrescriptions 
}: MedicationInteractionCheckerProps) {
  const [sandboxMed1, setSandboxMed1] = useState<string>("metformin");
  const [sandboxMed2, setSandboxMed2] = useState<string>("contrast");
  const [dbSearchQuery, setDbSearchQuery] = useState<string>("");

  // Helper to test if a rule matches two specific drug identifier strings
  const checkPairwiseMatch = (rule: InteractionRule, value1: string, value2: string) => {
    const v1 = value1.toLowerCase();
    const v2 = value2.toLowerCase();
    const p1 = rule.med1Pattern.toLowerCase();
    const p2 = rule.med2Pattern.toLowerCase();

    // Map common names/synonyms to patterns for flexible checking
    const getSynonyms = (val: string): string[] => {
      const syns = [val];
      if (val.includes("metformin") || val.includes("glucophage")) syns.push("metformin");
      if (val.includes("glipizide") || val.includes("glyburide") || val.includes("glimepiride") || val.includes("gliclazide") || val.includes("sulfonylurea")) syns.push("glipizide");
      if (val.includes("empagliflozin") || val.includes("jardiance") || val.includes("dapagliflozin") || val.includes("farxiga") || val.includes("canagliflozin") || val.includes("invokana") || val.includes("sglt2")) syns.push("empagliflozin");
      if (val.includes("insulin") || val.includes("glargine") || val.includes("lantus") || val.includes("humalog") || val.includes("novolog") || val.includes("basal")) syns.push("insulin");
      if (val.includes("metoprolol") || val.includes("atenolol") || val.includes("propranolol") || val.includes("carvedilol") || val.includes("bisoprolol") || val.includes("beta")) syns.push("metoprolol");
      if (val.includes("lisinopril") || val.includes("enalapril") || val.includes("ramipril") || val.includes("benazepril") || val.includes("losartan") || val.includes("valsartan") || val.includes("arb") || val.includes("ace")) syns.push("lisinopril");
      if (val.includes("furosemide") || val.includes("lasix") || val.includes("hydrochlorothiazide") || val.includes("hctz") || val.includes("diuretic") || val.includes("torsemide")) syns.push("furosemide");
      if (val.includes("spironolactone") || val.includes("aldactone")) syns.push("spironolactone");
      if (val.includes("ibuprofen") || val.includes("naproxen") || val.includes("advil") || val.includes("aleve") || val.includes("meloxicam") || val.includes("diclofenac") || val.includes("nsaid")) syns.push("nsaid");
      if (val.includes("aspirin") || val.includes("bayer")) syns.push("aspirin");
      if (val.includes("warfarin") || val.includes("coumadin") || val.includes("apixaban") || val.includes("eliquis") || val.includes("rivaroxaban") || val.includes("xarelto") || val.includes("anticoagulant")) syns.push("warfarin");
      if (val.includes("contrast") || val.includes("dye") || val.includes("iodine")) syns.push("contrast");
      if (val.includes("alcohol") || val.includes("ethanol") || val.includes("beer") || val.includes("wine") || val.includes("whiskey")) syns.push("alcohol");
      return syns;
    };

    const s1 = getSynonyms(v1);
    const s2 = getSynonyms(v2);

    const matchForward = s1.some(x => x.includes(p1)) && s2.some(x => x.includes(p2));
    const matchBackward = s1.some(x => x.includes(p2)) && s2.some(x => x.includes(p1));

    return matchForward || matchBackward;
  };

  // 1. Sandbox interaction results
  const sandboxInteraction = useMemo(() => {
    if (sandboxMed1 === sandboxMed2) {
      return {
        hasConflict: false,
        sameMed: true,
        message: "You have selected the same medication or class. A medication cannot clinically interact with itself."
      };
    }

    const matchedRule = INTERACTION_RULES.find(rule => 
      checkPairwiseMatch(rule, sandboxMed1, sandboxMed2)
    );

    if (matchedRule) {
      return {
        hasConflict: true,
        sameMed: false,
        rule: matchedRule
      };
    }

    return {
      hasConflict: false,
      sameMed: false,
      message: "No known adverse clinical drug interaction was detected between these two selections in our diabetes surveillance database. However, always consult a pharmacist to audit uncommon prescriptions."
    };
  }, [sandboxMed1, sandboxMed2]);

  // 2. Scan active user prescribed medications list for conflicts
  const activeRegimenConflicts = useMemo(() => {
    const foundConflicts: {
      rule: InteractionRule;
      med1Name: string;
      med2Name: string;
    }[] = [];

    if (prescribedMeds.length < 2) return foundConflicts;

    // Check all unique pairs of prescribed medications
    for (let i = 0; i < prescribedMeds.length; i++) {
      for (let j = i + 1; j < prescribedMeds.length; j++) {
        const medI = prescribedMeds[i];
        const medJ = prescribedMeds[j];

        // Find if there is an interaction rule matching this pair
        const matchedRule = INTERACTION_RULES.find(rule => 
          checkPairwiseMatch(rule, medI.name, medJ.name)
        );

        if (matchedRule) {
          foundConflicts.push({
            rule: matchedRule,
            med1Name: medI.name,
            med2Name: medJ.name
          });
        }
      }
    }

    return foundConflicts;
  }, [prescribedMeds]);

  // 3. Search and browse the database
  const filteredRules = useMemo(() => {
    if (!dbSearchQuery.trim()) return INTERACTION_RULES;
    const q = dbSearchQuery.toLowerCase();
    return INTERACTION_RULES.filter(rule => 
      rule.title.toLowerCase().includes(q) ||
      rule.med1Label.toLowerCase().includes(q) ||
      rule.med2Label.toLowerCase().includes(q) ||
      rule.mechanism.toLowerCase().includes(q)
    );
  }, [dbSearchQuery]);

  return (
    <div className="space-y-4 text-xs animate-fadeIn">
      
      {/* 1. ACTIVE USER REGIMEN AUDIT STATUS */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-850 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/25">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-bold text-neutral-200 uppercase tracking-widest text-[11px] font-mono">Live Prescriptions Safety Audit</h4>
              <p className="text-[10px] text-neutral-500">Real-time surveillance of your actual prescribed medications</p>
            </div>
          </div>
          <span className="text-[10px] bg-neutral-950 px-2 py-0.5 border border-neutral-850 text-neutral-400 rounded-lg font-mono">
            {prescribedMeds.length} Active Med{prescribedMeds.length !== 1 ? "s" : ""}
          </span>
        </div>

        {prescribedMeds.length === 0 ? (
          <div className="text-center p-6 bg-neutral-950 border border-dashed border-neutral-850 rounded-xl space-y-2">
            <Pill className="w-8 h-8 text-neutral-600 mx-auto animate-pulse" />
            <p className="text-neutral-400 font-medium">No Prescribed Medications Logged</p>
            <p className="text-neutral-500 text-[10px] max-w-[280px] mx-auto leading-relaxed">
              We cannot scan your regimen because your prescription directory is currently empty.
            </p>
            {onSwitchToPrescriptions && (
              <button
                type="button"
                onClick={onSwitchToPrescriptions}
                className="mt-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer"
              >
                Go to Prescriptions & Add Meds
              </button>
            )}
          </div>
        ) : activeRegimenConflicts.length > 0 ? (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 p-2.5 bg-red-950/20 border border-red-500/30 rounded-xl text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="font-bold">
                Warning: {activeRegimenConflicts.length} Active Clinical Drug Interaction{activeRegimenConflicts.length !== 1 ? "s" : ""} Detected!
              </span>
            </div>

            <div className="space-y-2.5">
              {activeRegimenConflicts.map((conflict, idx) => (
                <div 
                  key={`${conflict.rule.id}-${idx}`}
                  className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl space-y-2 hover:border-neutral-750 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-white text-[11px] flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${conflict.rule.severity === "high" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`} />
                      {conflict.rule.title}
                    </span>
                    <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                      conflict.rule.severity === "high" 
                        ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                        : conflict.rule.severity === "moderate"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {conflict.rule.severity === "high" ? "Critical Risk" : conflict.rule.severity === "moderate" ? "Moderate Warning" : "Caution"}
                    </span>
                  </div>

                  <p className="text-neutral-300 leading-relaxed text-[10.5px]">
                    {conflict.rule.mechanism}
                  </p>

                  <div className="bg-neutral-900 border border-neutral-850 p-2.5 rounded-lg space-y-1 text-[10px]">
                    <span className="font-bold text-neutral-400 uppercase tracking-wider font-mono text-[8px] block">Recommended Action Plan</span>
                    <p className="text-zinc-300 font-sans leading-relaxed">{conflict.rule.action}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] text-neutral-500 font-mono">
                    <span>Active regimen trigger:</span>
                    <span className="text-neutral-300 font-bold bg-neutral-900 border border-neutral-850 px-1.5 rounded">{conflict.med1Name}</span>
                    <span>+</span>
                    <span className="text-neutral-300 font-bold bg-neutral-900 border border-neutral-850 px-1.5 rounded">{conflict.med2Name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-white block">Active Regimen Safety Clearance: SECURE</span>
              <p className="text-emerald-300/80 font-sans text-[10.5px]">
                Your current medications ({prescribedMeds.map(m => m.name).join(", ")}) do not present any known high-risk or moderate-risk drug combinations within our diabetes clinical database.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. INTERACTIVE CLINICAL CHECKER PLAYGROUND */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3.5">
        <div className="border-b border-neutral-850 pb-2">
          <h4 className="font-bold text-neutral-200 uppercase tracking-widest text-[11px] font-mono flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/25">
              <ArrowRightLeft className="w-4 h-4" />
            </span>
            Ad-Hoc Interactive Checker Playground
          </h4>
          <p className="text-[10px] text-neutral-500 mt-0.5">Test any medication combinations before you prescribe them to check for negative interactions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Medication Selector 1 */}
          <div>
            <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Medication or Class A</label>
            <select
              value={sandboxMed1}
              onChange={(e) => setSandboxMed1(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {DRUG_PLAYGROUND_LIST.map((drug) => (
                <option key={`a-${drug.value}`} value={drug.value}>
                  {drug.label}
                </option>
              ))}
            </select>
          </div>

          {/* Medication Selector 2 */}
          <div>
            <label className="block text-[10px] text-neutral-400 font-mono mb-1 font-bold uppercase">Medication or Class B</label>
            <select
              value={sandboxMed2}
              onChange={(e) => setSandboxMed2(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              {DRUG_PLAYGROUND_LIST.map((drug) => (
                <option key={`b-${drug.value}`} value={drug.value}>
                  {drug.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sandbox Output Results */}
        <div className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl animate-fadeIn">
          {sandboxInteraction.hasConflict ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg border ${
                    sandboxInteraction.rule?.severity === "high" 
                      ? "bg-red-500/10 text-red-400 border-red-500/20" 
                      : sandboxInteraction.rule?.severity === "moderate"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                  </span>
                  <div>
                    <h5 className="font-extrabold text-white text-[11px]">{sandboxInteraction.rule?.title}</h5>
                    <p className="text-[9.5px] text-neutral-500">
                      Interaction detected between <strong className="text-neutral-400">{sandboxInteraction.rule?.med1Label}</strong> & <strong className="text-neutral-400">{sandboxInteraction.rule?.med2Label}</strong>
                    </p>
                  </div>
                </div>

                <span className={`text-[8.5px] font-mono font-black px-2 py-0.5 rounded uppercase shrink-0 ${
                  sandboxInteraction.rule?.severity === "high" 
                    ? "bg-red-500/25 text-red-400 border border-red-500/30" 
                    : sandboxInteraction.rule?.severity === "moderate"
                    ? "bg-amber-500/25 text-amber-400 border border-amber-500/30"
                    : "bg-blue-500/25 text-blue-400 border border-blue-500/30"
                }`}>
                  {sandboxInteraction.rule?.severity === "high" ? "Critical Risk" : sandboxInteraction.rule?.severity === "moderate" ? "Moderate Warning" : "Caution"}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-bold text-neutral-400 text-[8px] uppercase tracking-wider block font-mono">Mechanism & Nature of Interaction</span>
                  <p className="text-zinc-200 leading-relaxed font-sans text-[10.5px]">
                    {sandboxInteraction.rule?.mechanism}
                  </p>
                </div>

                <div className="p-3 bg-neutral-900 border border-neutral-850 rounded-xl space-y-1 text-[10px]">
                  <span className="font-bold text-neutral-400 uppercase tracking-wider font-mono text-[8px] block">Recommended Preventive Clinical Actions</span>
                  <p className="text-zinc-300 leading-relaxed font-sans">{sandboxInteraction.rule?.action}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 text-neutral-400 py-1">
              {sandboxInteraction.sameMed ? (
                <HelpCircle className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold text-white block">
                  {sandboxInteraction.sameMed ? "Self Comparison" : "No Known Clinical Interaction"}
                </span>
                <p className="text-[10px] text-neutral-500 font-sans leading-relaxed">
                  {sandboxInteraction.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. COMPREHENSIVE CLINICAL KNOWLEDGE REFERENCE DATABASE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-2">
          <div className="space-y-0.5">
            <h4 className="font-bold text-neutral-200 uppercase tracking-widest text-[11px] font-mono flex items-center gap-1.5">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/25">
                <BookOpen className="w-4 h-4" />
              </span>
              Clinical Interactions Reference Database
            </h4>
            <p className="text-[10px] text-neutral-500">Browse or search system-wide drug-to-drug clinical knowledge reference rules</p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-neutral-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search drug or side effect..."
              value={dbSearchQuery}
              onChange={(e) => setDbSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-8 pr-2.5 py-1.5 text-[10px] text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-850 max-h-[300px] overflow-y-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-850 font-mono text-[9px] font-bold uppercase tracking-wider">
                <th className="p-2.5 pl-3">Medication Class A</th>
                <th className="p-2.5">Medication Class B</th>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5 pr-3">Interaction Risk & Nature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850/60">
              {filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                  <tr 
                    key={rule.id} 
                    className="hover:bg-neutral-950/50 transition-colors text-[10px] group"
                  >
                    <td className="p-2.5 pl-3 font-semibold text-white group-hover:text-indigo-400 transition-colors">{rule.med1Label}</td>
                    <td className="p-2.5 font-semibold text-white group-hover:text-indigo-400 transition-colors">{rule.med2Label}</td>
                    <td className="p-2.5">
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        rule.severity === "high" 
                          ? "bg-red-500/15 text-red-400 border border-red-500/20" 
                          : rule.severity === "moderate"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                      }`}>
                        {rule.severity}
                      </span>
                    </td>
                    <td className="p-2.5 pr-3 text-neutral-400 leading-normal max-w-xs group-hover:text-neutral-300">
                      <strong className="text-neutral-200 block text-[10px] mb-0.5">{rule.title}</strong>
                      {rule.mechanism}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center p-6 text-neutral-500 italic">
                    No clinical interactions found matching your search query. Try typing simpler medication classes (e.g. "metformin", "nsaid", "insulin", "sglt2").
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER CLINICAL DISCLAIMER */}
      <div className="p-3 bg-neutral-950/40 border border-neutral-850 text-[9.5px] text-neutral-500 rounded-xl leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
        <span>
          <strong>Clinical Safety & Pharmacy Disclaimer:</strong> This medication interaction checker operates entirely on algorithmic, rule-based matching within a standard diabetes therapeutics database. It is intended strictly for patient education and awareness. This tool is NOT a substitute for formal medication therapy management (MTM) conducted by certified clinical pharmacists, medical board physicians, or endocrinology specialists. Always verify all drug schedules directly with your care team.
        </span>
      </div>
    </div>
  );
}
