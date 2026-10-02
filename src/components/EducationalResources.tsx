import React, { useState } from "react";
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Footprints, 
  Utensils, 
  Dumbbell, 
  AlertTriangle, 
  Pill, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface Article {
  id: string;
  category: "diet" | "exercise" | "foot_care" | "emergencies" | "medications";
  title: string;
  summary: string;
  readTime: string;
  keyTakeaways: string[];
  content: string[];
  recommendedFrequency?: string;
}

const ARTICLES_DATA: Article[] = [
  {
    id: "foot_care_daily",
    category: "foot_care",
    title: "Daily 5-Step Diabetic Foot Inspection & Neuropathy Care",
    readTime: "3 min read",
    summary: "Peripheral neuropathy reduces sensation in the feet. A tiny unnoticed blister can quickly escalate into a serious ulcer without regular inspection.",
    keyTakeaways: [
      "Inspect the soles and between toes daily using a handheld mirror or assistance",
      "Never walk barefoot, even indoors on soft carpets or tiles",
      "Moisturize tops and soles daily, but NEVER leave lotion between toes (causes fungal breakdown)",
      "Test bathwater with your elbow or thermometer, not your feet, to prevent painless burns"
    ],
    content: [
      "Diabetic peripheral neuropathy develops gradually as prolonged elevated blood glucose damages peripheral nerve fibers. Because the sensation of pain, heat, and cold is diminished, cuts, punctures, or pressure sores can go unnoticed for days.",
      "Step 1: Visual Inspection. Look for redness, swelling, blisters, calluses, or ingrown toenails. If you cannot bend to see the bottom of your feet, place a mirror on the floor.",
      "Step 2: Gentle Washing & Drying. Wash feet daily with lukewarm water and mild soap. Gently pat dry with a soft towel—never rub vigorously. Ensure the skin between toes is completely dry.",
      "Step 3: Safe Trimming. Trim toenails straight across and gently file sharp edges. Never cut cuticles or dig into corners. Seek a podiatrist for thick calluses.",
      "Step 4: Moisture Management. Apply an unscented urea-based or ceramide moisturizer to the heel and top of the foot. Keep the spaces between your toes dry to prevent tinea pedis (athlete's foot).",
      "Step 5: Footwear Inspection. Shake out your shoes before putting them on to ensure no pebbles, small toys, or rough seams are inside. Always wear seamless, moisture-wicking socks."
    ],
    recommendedFrequency: "Daily Routine"
  },
  {
    id: "post_meal_walking",
    category: "exercise",
    title: "How a 15-Minute Post-Meal Walk Flattens Blood Sugar Spikes",
    readTime: "4 min read",
    summary: "Timing your physical activity immediately after meals activates muscle GLUT-4 transporters, clearing glucose directly from the bloodstream without needing extra insulin.",
    keyTakeaways: [
      "A 10–15 minute walk within 30 minutes of eating significantly lowers postprandial glucose peaks",
      "Muscle contractions draw glucose directly into cells independently of insulin",
      "Gentle walking is more effective at preventing spikes than a strenuous workout done hours later",
      "Stay hydrated and avoid high-intensity sprinting right after eating to prevent gastrointestinal distress"
    ],
    content: [
      "When you eat carbohydrates, glucose floods the bloodstream and peaks roughly 60 to 90 minutes later. For individuals with insulin resistance or diabetes, beta cells cannot release sufficient insulin quickly enough, resulting in sharp glycemic spikes that stress blood vessels.",
      "Skeletal muscle is responsible for over 75% of glucose disposal in the human body. When you walk, contracting muscle fibers trigger the translocation of GLUT-4 glucose transporters to the cell membrane. This occurs via an insulin-independent pathway (AMPK activation).",
      "In clinical trials, a brief 10 to 15-minute brisk walk taken 15–30 minutes after lunch or dinner reduced peak blood glucose by 25–40 mg/dL compared to remaining sedentary.",
      "How to implement: Simply pace around your house, take a walk around your neighborhood, or march gently in place while watching your favorite evening show. Consistency trumps intensity."
    ],
    recommendedFrequency: "After Lunch & Dinner"
  },
  {
    id: "plate_method_carbs",
    category: "diet",
    title: "The Diabetes Plate Method & Carbohydrate Sequencing",
    readTime: "3 min read",
    summary: "Ditch complicated scales and calorie formulas. Use visual 9-inch plate partitioning and food sequencing to keep your blood glucose in the green zone.",
    keyTakeaways: [
      "Fill 1/2 of your plate with non-starchy vegetables (greens, broccoli, peppers, cucumbers)",
      "Fill 1/4 of your plate with lean proteins (chicken, fish, eggs, tofu, legumes)",
      "Fill 1/4 of your plate with complex carbohydrates (quinoa, brown rice, whole oats, sweet potatoes)",
      "Eat fiber first, protein second, and starches last to slow digestion and reduce peak glucose by up to 30%"
    ],
    content: [
      "Managing dietary carbohydrates is often perceived as restrictive and exhausting. The American Diabetes Association (ADA) Plate Method simplifies meal planning by dividing a standard 9-inch plate into three visual sections.",
      "1. Half Non-Starchy Vegetables: Spinach, kale, broccoli, cauliflower, cabbage, cucumbers, tomatoes, and mushrooms. These are rich in micronutrients, water, and viscous fiber that line the small intestine and create a gel-like barrier.",
      "2. One-Quarter Lean Protein: Grilled chicken breast, salmon, tuna, eggs, Greek yogurt, or tofu. Protein stimulates the release of GLP-1 and satiety hormones, preventing rapid stomach emptying.",
      "3. One-Quarter Carbohydrates: Keep whole grains, heritage millets, beans, or starchy tubers to one quarter. Pairing them with fats and fiber prevents rapid enzymatic breakdown into free glucose.",
      "The Food Sequencing Secret: Research shows that eating your salad/vegetables first, then your protein, and finishing with your rice or potato reduces the post-meal glycemic spike by 30% to 40% compared to eating the starch first."
    ],
    recommendedFrequency: "Every Meal"
  },
  {
    id: "rule_of_15_hypo",
    category: "emergencies",
    title: "The Rule of 15 for Hypoglycemia: Treating Lows Without Rebounding",
    readTime: "3 min read",
    summary: "When blood sugar drops below 70 mg/dL, panic eating chocolate, cakes, or high-fat snacks causes dangerous rebound spikes. Learn the clinical protocol.",
    keyTakeaways: [
      "Recognize early symptoms: shakiness, sweating, irritability, dizziness, pallor, and rapid heart rate",
      "Take exactly 15 grams of pure, fast-acting sugar (avoid high-fat snacks like chocolate or peanut butter)",
      "Wait 15 minutes before rechecking your blood sugar",
      "Repeat if still under 70 mg/dL; eat a complex carb/protein snack once recovered to maintain stability"
    ],
    content: [
      "Hypoglycemia (blood sugar below 70 mg/dL) can occur rapidly, especially in people taking sulfonylureas (like glipizide/glimepiride) or insulin. It requires immediate, measured treatment.",
      "Why Not Chocolate? Foods with fats (like chocolate bars or pastries) slow down the absorption of sugar in the stomach. When you are low, you need immediate glucose delivery to your brain.",
      "Ideal 15-Gram Portions:",
      "• 1/2 cup (4 ounces) of fruit juice or regular (non-diet) soda",
      "• 3 to 4 chewable glucose tablets",
      "• 1 tablespoon of honey, sugar, or maple syrup",
      "• 5 to 6 hard jelly candies",
      "Wait 15 Minutes: Do not eat continuously. It takes 10–15 minutes for sugar to cross into the bloodstream. Check your meter after 15 minutes. If it has risen above 70 mg/dL, eat a balanced snack (like a piece of whole-grain toast or crackers with cheese) to keep it stable."
    ],
    recommendedFrequency: "Emergency Guide"
  },
  {
    id: "dawn_phenomenon",
    category: "diet",
    title: "Understanding High Morning Sugar: Dawn Phenomenon vs Somogyi Effect",
    readTime: "4 min read",
    summary: "Waking up with elevated fasting glucose even when you did not eat midnight snacks? Learn how liver gluconeogenesis and morning hormones work.",
    keyTakeaways: [
      "Between 3 AM and 8 AM, the body releases growth hormone, cortisol, and glucagon to prepare you for waking",
      "These hormones cause the liver to release stored glucose into the blood (Dawn Phenomenon)",
      "If you experience a midnight low followed by a morning spike, it may be the Somogyi rebound effect",
      "Checking blood sugar at 3 AM once or twice helps your doctor differentiate between the two causes"
    ],
    content: [
      "Many people are surprised to wake up with blood glucose readings higher than when they went to sleep. This is most commonly due to the natural 'Dawn Phenomenon'.",
      "The Dawn Phenomenon: In the early morning hours, circadian hormonal shifts increase cortisol and growth hormone. In individuals without diabetes, the pancreas secretes a small burst of insulin to offset this liver output. In diabetes, insulin levels are insufficient, leading to an elevated morning reading.",
      "The Somogyi Effect: Occasionally, a high morning reading is triggered by an undetected 2 AM or 3 AM low. The body panics and releases adrenaline and glucagon, causing the liver to dump glucose in emergency mode.",
      "How to Differentiate: Set an alarm for 3:00 AM on a weekend. If your blood sugar is low (<70 mg/dL) at 3 AM, discuss the Somogyi effect with your doctor. If it is normal or elevated at 3 AM, it is likely the Dawn Phenomenon."
    ]
  },
  {
    id: "insulin_technique_safety",
    category: "medications",
    title: "Insulin Injection Technique & Site Rotation: Preventing Lipohypertrophy",
    readTime: "3 min read",
    summary: "Injecting repeatedly in the same area causes rubbery fatty lumps called lipohypertrophy, which leads to erratic, unpredictable insulin absorption.",
    keyTakeaways: [
      "Rotate injection sites systematically across the abdomen, outer thighs, and upper arms",
      "Leave at least 1 inch (two finger-widths) between consecutive injection spots",
      "Never reuse pen needles—used needles dull immediately and cause micro-trauma to skin",
      "Store active insulin at room temperature (below 86°F / 30°C) to prevent stinging during injection"
    ],
    content: [
      "Insulin is a delicate peptide hormone that must be absorbed consistently into the subcutaneous fat layer. Proper injection technique is just as crucial as the prescribed dose.",
      "The Threat of Lipohypertrophy: When the same patch of skin is used repeatedly, fat cells swell into firm, numb lumps (lipohypertrophy). Injecting into these lumps can cause insulin to either pool unabsorbed or dump into the blood suddenly hours later, creating unexplained highs and terrifying crashes.",
      "Proper Site Rotation: Imagine a clock face or grid on your abdomen, at least 2 inches away from your belly button. Move clockwise from Monday to Sunday, leaving 1 inch between injection points.",
      "Needle Safety: Pen needles are microscopic and single-use. After a single injection, the tip bends into a hook that tears tissue, increasing scarring and inflammation. Always discard needles in a puncture-proof sharps container."
    ]
  },
  {
    id: "sick_day_guidelines",
    category: "emergencies",
    title: "Sick Day Rules: Managing Blood Sugar & Ketones During Illness",
    readTime: "4 min read",
    summary: "Infections, flu, or fever trigger stress hormones that drive blood sugar sky-high, even if you are eating almost nothing.",
    keyTakeaways: [
      "Never stop taking your baseline basal insulin or medications without consulting your doctor",
      "Check your blood sugar every 2 to 4 hours while feeling sick",
      "Stay hydrated: Sip 8 ounces of zero-calorie fluids every hour to prevent dehydration",
      "Check ketones if blood sugar exceeds 250 mg/dL, especially in Type 1 diabetes"
    ],
    content: [
      "When your body fights an infection, flu, or illness, it releases stress hormones like epinephrine and cortisol. These hormones make you temporarily more insulin-resistant and stimulate the liver to pump out glucose.",
      "The Cardinal Rule: Never completely stop your insulin or baseline diabetes medications simply because you have lost your appetite. Your body still requires insulin to handle liver glucose production.",
      "Hydration Protocol: Drink plenty of clear fluids—water, broth, herbal tea. If you cannot keep solids down, sip fluids with a little carbohydrate (like diluted fruit juice or electrolyte solutions) to prevent starvation ketosis.",
      "When to Call the Doctor or Go to the ER:",
      "• You have been vomiting or having diarrhea for more than 4 to 6 hours",
      "• Your blood sugar stays above 250 mg/dL despite prescribed correction doses",
      "• You test positive for moderate to high urine or blood ketones",
      "• You experience confusion, extreme shortness of breath, or abdominal pain"
    ]
  }
];

export const EducationalResources: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>("foot_care_daily");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("dia_bookmarked_articles");
      return saved ? JSON.parse(saved) : ["foot_care_daily", "post_meal_walking"];
    } catch {
      return ["foot_care_daily", "post_meal_walking"];
    }
  });

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      localStorage.setItem("dia_bookmarked_articles", JSON.stringify(next));
      return next;
    });
  };

  const filteredArticles = ARTICLES_DATA.filter(article => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keyTakeaways.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 animate-fadeIn text-xs pb-12">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Diabetes Education &amp; Clinical Guides
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                Evidence-Based
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Expert tips on diet, physical activity, foot inspections, and safety protocols
            </p>
          </div>
        </div>
      </div>

      {/* Daily Practical Tip Banner */}
      <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-start gap-3">
        <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wider block">
            Tip for Effective Care
          </span>
          <span className="font-bold text-white text-xs block mt-0.5">
            Consistency Builds Reliable Health Patterns
          </span>
          <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
            Logging your blood sugar daily at similar intervals (e.g. upon waking, and 2 hours after meals) creates clean longitudinal trends. This empowers your physician to fine-tune medications safely without blind guesses.
          </p>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search articles on foot care, diet sequencing, insulin, walking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10.5px]">
          {[
            { id: "all", label: "All Topics" },
            { id: "foot_care", label: "Foot Care", icon: Footprints },
            { id: "exercise", label: "Exercise & Walking", icon: Dumbbell },
            { id: "diet", label: "Diet & Carbs", icon: Utensils },
            { id: "emergencies", label: "Hypo/Hyper Safety", icon: AlertTriangle },
            { id: "medications", label: "Medications", icon: Pill },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? "bg-purple-950/40 border-purple-500 text-purple-300 shadow-sm"
                  : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {cat.icon && <cat.icon className="w-3 h-3" />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl text-neutral-500 font-mono">
            No educational guides matched "{searchQuery}". Try searching for "walking", "carbs", or "foot".
          </div>
        ) : (
          filteredArticles.map(article => {
            const isExpanded = expandedArticleId === article.id;
            const isBookmarked = bookmarkedIds.includes(article.id);

            return (
              <div 
                key={article.id} 
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                {/* Article Header Card */}
                <div 
                  onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                  className="p-4 cursor-pointer hover:bg-neutral-850/60 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded bg-neutral-950 text-purple-300 border border-purple-500/30">
                        {article.category.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {article.readTime}
                      </span>
                      {article.recommendedFrequency && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-teal-950/40 text-teal-300 border border-teal-800/40">
                          {article.recommendedFrequency}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-xs leading-snug">
                      {article.title}
                    </h4>

                    <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(article.id, e)}
                      title={isBookmarked ? "Remove Bookmark" : "Save Guide"}
                      className="p-1.5 text-neutral-400 hover:text-purple-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <div className="p-1 text-neutral-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Article Body */}
                {isExpanded && (
                  <div className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-3.5 animate-fadeIn">
                    {/* Key Takeaways Box */}
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-teal-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Key Clinical Takeaways
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-neutral-300">
                        {article.keyTakeaways.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Full Content Paragraphs */}
                    <div className="space-y-2.5 text-[11px] text-neutral-300 leading-relaxed font-sans">
                      {article.content.map((p, idx) => (
                        <p key={idx} className={p.startsWith("Step") || p.startsWith("The") || p.startsWith("Why") || p.startsWith("Ideal") ? "font-bold text-neutral-200 mt-2" : ""}>
                          {p}
                        </p>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-neutral-850 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Grounded in ADA &amp; IDF Standards of Medical Care</span>
                      <button 
                        onClick={() => setExpandedArticleId(null)}
                        className="text-purple-400 hover:underline cursor-pointer"
                      >
                        Collapse Guide
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
