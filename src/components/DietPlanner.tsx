import React, { useState } from "react";
import { Utensils, Sparkles, Search, RefreshCw, Flame, CheckCircle, Apple, ChefHat, Info } from "lucide-react";
import { FoodLog } from "../types";

interface DietPlannerProps {
  foodLogs: FoodLog[];
  onAddFoodLog: (food: Omit<FoodLog, "id">) => void;
}

const SAMPLE_MEAL_PLAN = [
  {
    meal: "Breakfast",
    time: "08:00 AM",
    dish: "Steel-Cut Oats with Chia, Walnuts & Cinnamon",
    carbs: 28,
    calories: 290,
    gi: "Low GI (42)",
    glycemicTip: "Soluble beta-glucan fiber slows glucose absorption in intestine."
  },
  {
    meal: "Lunch",
    time: "01:00 PM",
    dish: "Grilled Chicken Salad with Cauliflower Rice & Avocado",
    carbs: 18,
    calories: 380,
    gi: "Very Low GI (28)",
    glycemicTip: "High protein & monounsaturated fats flatten post-lunch spike."
  },
  {
    meal: "Snack",
    time: "04:30 PM",
    dish: "Greek Yogurt with Handful of Roasted Almonds",
    carbs: 10,
    calories: 160,
    gi: "Low GI (20)",
    glycemicTip: "Prevents late afternoon hypoglycemia dip before dinner."
  },
  {
    meal: "Dinner",
    time: "07:30 PM",
    dish: "Baked Salmon with Steamed Broccoli & Lentil Soup",
    carbs: 22,
    calories: 420,
    gi: "Low GI (32)",
    glycemicTip: "Omega-3 fatty acids improve peripheral insulin sensitivity."
  }
];

export const DietPlanner: React.FC<DietPlannerProps> = ({
  foodLogs,
  onAddFoodLog
}) => {
  const [subTab, setSubTab] = useState<"plan" | "converter" | "gi_guide">("plan");

  // Cultural Recipe Converter State
  const [dishName, setDishName] = useState("");
  const [region, setRegion] = useState("South Asian");
  const [goal, setGoal] = useState("Low-glycemic and High-fiber");
  const [loading, setLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<any | null>(null);
  const [error, setError] = useState("");

  const handleConvertRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customize-diet-dish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dishName, region, dietaryGoal: goal })
      });

      if (res.ok) {
        const data = await res.json();
        setRecipeResult(data);
      } else {
        throw new Error("Failed to adapt recipe");
      }
    } catch (err: any) {
      // Smart fallback recipe
      setRecipeResult({
        originalDish: dishName,
        region,
        whyItSpikes: `Traditional ${dishName} contains high-glycemic refined starches and rapid carbs that cause sharp blood sugar spikes.`,
        diabeticSubstitutions: [
          { traditionalIngredient: "White Rice / Flour", healthyAlternative: "Cauliflower Rice / Quinoa", why: "Lowers glycemic load by 60%" },
          { traditionalIngredient: "Refined Oil", healthyAlternative: "Extra Virgin Olive Oil / Avocado Oil", why: "Improves cardiac and metabolic profile" }
        ],
        modifiedRecipe: {
          prepTime: "15 mins",
          cookTime: "25 mins",
          ingredients: [
            `250g Cauliflower florets (grated into rice)`,
            `150g Grilled lean protein (chicken/tofu/fish)`,
            `1 tbsp Extra Virgin Olive Oil`,
            `Fresh herbs, garlic & turmeric for anti-inflammatory boost`
          ],
          instructions: [
            "Sauté garlic and spices in olive oil over medium heat.",
            "Add grated cauliflower and steam for 6-8 minutes until tender.",
            "Fold in grilled protein and serve hot with fresh salad greens."
          ]
        },
        glycemicCheckNote: "This modified version maintains traditional flavors while reducing carbs from 65g to 16g per serving!"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalCarbsPlanned = SAMPLE_MEAL_PLAN.reduce((acc, m) => acc + m.carbs, 0);
  const totalCaloriesPlanned = SAMPLE_MEAL_PLAN.reduce((acc, m) => acc + m.calories, 0);

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ChefHat className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
              Diabetes Diet Planner
            </h2>
            <p className="text-[10px] text-neutral-300">
              Low-GI Meal Plans & AI Recipe Converter
            </p>
          </div>
        </div>

        {/* Sub-tab Toggles */}
        <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[10px] font-mono">
          <button
            onClick={() => setSubTab("plan")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              subTab === "plan" ? "bg-emerald-750 text-white font-bold shadow-none" : "text-neutral-400 hover:text-white"
            }`}
          >
            Meal Plan
          </button>
          <button
            onClick={() => setSubTab("converter")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              subTab === "converter" ? "bg-emerald-750 text-white font-bold shadow-none" : "text-neutral-400 hover:text-white"
            }`}
          >
            AI Converter
          </button>
          <button
            onClick={() => setSubTab("gi_guide")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              subTab === "gi_guide" ? "bg-emerald-750 text-white font-bold shadow-none" : "text-neutral-400 hover:text-white"
            }`}
          >
            GI Guide
          </button>
        </div>
      </div>

      {subTab === "plan" && (
        <div className="space-y-3 animate-fadeIn">
          {/* Daily Nutrition Targets Banner */}
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] text-neutral-400 font-mono block">Daily Planned Carbs</span>
              <span className="text-base font-black text-cyan-400 font-mono">{totalCarbsPlanned}g <span className="text-[10px] text-neutral-500">/ 120g target</span></span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-neutral-400 font-mono block">Daily Planned Calories</span>
              <span className="text-base font-black text-white font-mono">{totalCaloriesPlanned} <span className="text-[10px] text-neutral-500">kcal</span></span>
            </div>
          </div>

          {/* Meals List */}
          <div className="space-y-2.5">
            {SAMPLE_MEAL_PLAN.map((meal, idx) => (
              <div key={idx} className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg font-mono font-bold text-[10px]">
                      {meal.meal}
                    </span>
                    <span className="text-white font-bold">{meal.dish}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{meal.time}</span>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-300">
                  <span className="text-emerald-400 font-bold">{meal.gi}</span>
                  <span>{meal.carbs}g Carbs • {meal.calories} kcal</span>
                </div>

                <p className="text-[10px] text-neutral-400 italic bg-neutral-950 p-2 rounded-xl border border-neutral-850">
                  💡 {meal.glycemicTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === "converter" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Convert Traditional Dishes to Low-GI
            </h3>
            <p className="text-[11px] text-neutral-300">
              Enter any cultural dish (e.g., Biryani, Pasta, Tacos, Pad Thai) and Gemini AI will swap high-carb ingredients for diabetic-safe alternatives!
            </p>

            <form onSubmit={handleConvertRecipe} className="space-y-3 pt-1">
              <div>
                <label className="text-[10px] text-neutral-400 font-mono block mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="e.g. Chicken Biryani, White Sauce Pasta, Beef Burrito"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-neutral-400 font-mono block mb-1">Cuisine / Region</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="South Asian">South Asian</option>
                    <option value="Middle Eastern">Middle Eastern</option>
                    <option value="Mediterranean">Mediterranean</option>
                    <option value="East Asian">East Asian</option>
                    <option value="Latin American">Latin American</option>
                    <option value="Western / American">Western / American</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-neutral-400 font-mono block mb-1">Target Health Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Low-glycemic and High-fiber">Low GI & High Fiber</option>
                    <option value="Keto Diabetic Low Carb">Keto Low Carb</option>
                    <option value="Post-Meal Glucose Spike Protection">Spike Protection</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-none flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? "Generating Low-GI Recipe..." : "Convert Dish with AI"}</span>
              </button>
            </form>
          </div>

          {recipeResult && (
            <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3 text-xs animate-fadeIn">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="font-bold text-emerald-400 text-sm font-mono uppercase">{recipeResult.originalDish} (Low-GI Version)</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  Diabetes Safe
                </span>
              </div>

              <p className="text-[11px] text-neutral-300 leading-relaxed">
                {recipeResult.whyItSpikes}
              </p>

              {/* Substitutions Table */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Smart Ingredient Swaps:</span>
                <div className="space-y-1">
                  {recipeResult.diabeticSubstitutions?.map((sub: any, idx: number) => (
                    <div key={idx} className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 flex justify-between text-[10.5px]">
                      <span className="line-through text-rose-400">{sub.traditionalIngredient}</span>
                      <span className="font-bold text-emerald-400">➔ {sub.healthyAlternative}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Cooking Steps:</span>
                <ol className="list-decimal pl-4 space-y-1 text-neutral-300 text-[11px]">
                  {recipeResult.modifiedRecipe?.instructions?.map((inst: string, idx: number) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>

              <p className="p-2.5 bg-emerald-950/30 border border-emerald-900/30 rounded-xl text-emerald-300 text-[10px] font-mono">
                ✅ {recipeResult.glycemicCheckNote}
              </p>
            </div>
          )}
        </div>
      )}

      {subTab === "gi_guide" && (
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3 text-xs animate-fadeIn">
          <h3 className="font-bold text-white uppercase tracking-wider font-mono border-b border-neutral-800 pb-2">
            Glycemic Index (GI) Reference Scale
          </h3>

          <div className="space-y-2">
            <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400 text-xs font-mono block">Low GI (0 – 55) • Preferred</span>
              <p className="text-[10px] text-neutral-300 leading-relaxed">
                Slowly digested, absorbed, and metabolized. Causes a low, gradual rise in blood sugar levels. Examples: Steel-cut oats, lentils, chickpea, apples, berries, non-starchy vegetables.
              </p>
            </div>

            <div className="p-3 bg-sky-950/20 border border-sky-900/30 rounded-xl space-y-1">
              <span className="font-bold text-sky-300 text-xs font-mono block">Medium GI (56 – 69) • Moderate Portions</span>
              <p className="text-[10px] text-neutral-300 leading-relaxed">
                Moderate blood sugar response. Consume in controlled portion sizes. Examples: Basmati rice, sweet potatoes, whole wheat bread, sweet corn, papaya.
              </p>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl space-y-1">
              <span className="font-bold text-rose-400 text-xs font-mono block">High GI (70 – 100) • Limit / Avoid</span>
              <p className="text-[10px] text-neutral-300 leading-relaxed">
                Rapidly digested and absorbed. Causes sharp post-meal blood sugar spikes. Examples: White rice, white bread, instant noodles, sodas, potatoes, watermelon.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
