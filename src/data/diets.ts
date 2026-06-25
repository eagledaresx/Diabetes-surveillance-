export interface DietaryPlan {
  id: string;
  region: string;
  countryOrCulture: string;
  flag: string;
  vibeColor: string; // Tailwind color class for borders, backgrounds, etc.
  overview: string;
  glucoseSpikeConcern: string;
  superIngredients: Array<{
    name: string;
    clinicalEffect: string;
  }>;
  substitutions: Array<{
    traditional: string;
    healthyAlternative: string;
    why: string;
  }>;
  meals: {
    breakfast: { name: string; ingredients: string; desc: string };
    lunch: { name: string; ingredients: string; desc: string };
    dinner: { name: string; ingredients: string; desc: string };
    snack: { name: string; ingredients: string; desc: string };
  };
}

export const GLOBAL_DIETARY_PROGRAMS: DietaryPlan[] = [
  {
    id: "mediterranean",
    region: "Southern Europe",
    countryOrCulture: "Mediterranean (Greece, Italy, Spain)",
    flag: "🇬🇷",
    vibeColor: "emerald",
    overview: "Formulated on healthy fats (extra virgin olive oil), leafy greens, aromatic herbs, nuts, seafood, and moderate whole legumes. Clinically verified as the premier diet for improving HbA1c, boosting general cardiac longevity, and mitigating systemic insulin resistance.",
    glucoseSpikeConcern: "Refined wheat pasta, white bread, processed pizza crusts, and excessive sweet wines can run up post-dinner glucose spikes if unmanaged.",
    superIngredients: [
      { name: "Extra Virgin Olive Oil (EVOO)", clinicalEffect: "Loaded with oleic acid and polyphenols, EVOO slows gastric emptying, dramatically flattening the post-meal glucose spike curves." },
      { name: "Raw Garlic & Oregano", clinicalEffect: "Contains sulfur components (allicin) and antioxidants that support insulin signaling pathways and lower oxidative markers." }
    ],
    substitutions: [
      { traditional: "Refined white pasta or white semolina bread", healthyAlternative: "Farro, barley, chickpea-based pasta, or artisan rye/sourdough", why: "Lowers general glycemic index while boosting dietary fiber content." },
      { traditional: "Sautéing with butter or seed oils", healthyAlternative: "Cold-pressed Extra Virgin Olive Oil", why: "Monounsaturated fats enhance cell membrane permeability for smoother insulin absorption." }
    ],
    meals: {
      breakfast: {
        name: "Greek Aegean Sunrise Scramble",
        ingredients: "2 whole organic eggs, baby spinach, crumbled feta cheese, and 1/2 sliced ripe tomato.",
        desc: "Sautéed in a light splash of olive oil; served alongside a handful of raw olives for healthy fats and slow metabolic release."
      },
      lunch: {
        name: "Spanish Lemon-Herb Sardine & Chickpea Bowl",
        ingredients: "Canned wild sardines, boiled whole chickpeas, cucumbers, capers, parsley, and lemon-tahini drizzle.",
        desc: "High in marine omega-3 fatty acids and legume fibers which act together to slow carbohydrate absorption and maintain steady mid-day sugars."
      },
      dinner: {
        name: "Tuscan Rosemary Grilled Sea Bass",
        ingredients: "Fresh sea bass fillet, baked sweet potato wedges (dusted in cinnamon), and a generous side of charred asparagus.",
        desc: "A lean, clean dinner containing healthy proteins, crucial minerals, and complex root carbohydrates that won't strain morning fasting scores."
      },
      snack: {
        name: "Aegean Walnuts & Berry Parfait",
        ingredients: "Unsweetened Greek yogurt (10% fat), handful of raw walnuts, and 5 fresh wild blackberries.",
        desc: "Yogurt proteins and walnuts provide sustained satiety and low-glycemic crunch without needing honey."
      }
    }
  },
  {
    id: "south-asian",
    region: "South Asia",
    countryOrCulture: "India, Pakistan, Bangladesh",
    flag: "🇮🇳",
    vibeColor: "amber",
    overview: "Vibrant and rich in anti-inflammatory spices like turmeric, ginger, and fenugreek. This program focuses on replacing high-glycemic staple grains with heritage millets, fiber-dense dal (lentils), and healthy vegetable curries to overcome insulin resistance.",
    glucoseSpikeConcern: "Refined white rice (like Jasmine/Basmati), refined wheat flatbreads (Maida Naan/Roti), and deep-fried starch snacks (Samosas) represent highly concentrated simple carbs.",
    superIngredients: [
      { name: "Fenugreek Seeds (Methi)", clinicalEffect: "Contains trigonelline and high mucilage fiber; directly improves glucose tolerance and insulin secretion in diabetic subjects." },
      { name: "Turmeric & Black Pepper", clinicalEffect: "Curcumin, activated by piperine in pepper, is a potent anti-inflammatory agent that improves pancreatic beta-cell insulin safety." }
    ],
    substitutions: [
      { traditional: "White rice or refined wheat Roti/Naan", healthyAlternative: "Gluten-free Brown Basmati, Cauliflower Rice, or Bajra/Jowar (millet) Roti", why: "Heritage millets release glucose far slower, keeping post-meal spikes well within safety ranges." },
      { traditional: "Refined vegetable seed oils", healthyAlternative: "Pure grass-fed Ghee or cold-pressed mustard/coconut oil", why: "Medium-chain fatty acids provide superior metabolic energy without contributing to vascular inflammation." }
    ],
    meals: {
      breakfast: {
        name: "Low-Glycemic Methi & Moong Dal Chilla",
        ingredients: "Sprouted yellow moong lentil batter, fresh fenugreek leaves, green chillies, and ginger paste.",
        desc: "Griddle-cooked savory pancake served with a robust sugar-free coconut chutney. Exceptionally rich in vegetarian protein and soluble fibers."
      },
      lunch: {
        name: "Heritage Millet Thali with Panchmel Dal",
        ingredients: "Jowar (sorghum) Roti, a cup of mixed split lentil stew, steamed local spinach (palak), and bhindi curry (okra).",
        desc: "The viscous fiber in okra coordinates with the complex millet proteins to minimize carbohydrate uptake during digestion."
      },
      dinner: {
        name: "Spiced Tandoori Salmon or Paneer Tikka",
        ingredients: "Salmon chunks or thick paneer cheese cubes marinated in high-fat Greek yogurt, cumin, turmeric, and masala spices.",
        desc: "Charred with bell peppers and red onions. This high-protein, ultra-low-carb dinner is perfect for yielding optimal morning fasting blood sugar scores."
      },
      snack: {
        name: "Masala Chai with Spiced Almonds",
        ingredients: "Freshly brewed black tea leaves, ginger, cardamom, clove, a splash of unsweetened almond milk, paired with 15 raw almonds.",
        desc: "Warm drink (strictly zero-sugar added) combined with vitamin E-rich almonds to beat evening cravings."
      }
    }
  },
  {
    id: "east-asian",
    region: "East Asia",
    countryOrCulture: "Japan, Korea, China",
    flag: "🇯🇵",
    vibeColor: "rose",
    overview: "Emphasizes marine greens, fermented prebiotic soy complexes (miso, natto), lean coastal proteins, and bitter metabolically protective gourds. Highly effective for fat metabolization and pancreatic insulin recovery.",
    glucoseSpikeConcern: "Polished white sushi rice, refined wheat noodles (Udon, Ramen), and high-sugar marinades (Teriyaki, Hoisin) carry heavy refined glycemic loads.",
    superIngredients: [
      { name: "Bitter Melon (Goya)", clinicalEffect: "Contains charantin and polypeptide-p; acts as a natural peptide mimic that safely pushes glucose into skeletal muscle cells." },
      { name: "Fermented Natto & Kimchi", clinicalEffect: "Prebiotics and probiotics which strengthen gut microbiome health, clinically linked to lower insulin resistance." }
    ],
    substitutions: [
      { traditional: "Starchy white sushi rice or ramen noodles", healthyAlternative: "Buckwheat Soba noodles, Purple Rice, or Cauliflower-Konjac Rice blend", why: "Buckwheat contains d-chiro-inositol, which acts as a powerful secondary messenger in insulin pathways." },
      { traditional: "Sugary bottled Teriyaki/Soy glaze", healthyAlternative: "Naturally brewed Tamari soy sauce, ginger, garlic, and drop of liquid stevia/monkfruit", why: "Cuts out high-fructose corn syrups that burden the liver and cause immediate blood sugar surges." }
    ],
    meals: {
      breakfast: {
        name: "Kyoto Prebiotic Baseline Breakfast",
        ingredients: "Silken tofu soup with wakame seaweed and miso, paired with a small serving of traditional Natto (fermented soy) and soft-boiled egg.",
        desc: "Rich in clean, marine-sourced minerals, protein complexes, and active gut cultures that prime insulin sensitivity first thing in the morning."
      },
      lunch: {
        name: "Buckwheat Soba Salad with Sesame-Yuzu Chicken",
        ingredients: "100% buckwheat soba noodles, chilled shredded chicken, shredded purple cabbage, edamame beans, and roasted sesame seeds.",
        desc: "Slow-digesting soba provides critical complex carbohydrates that support consistent energy throughout the afternoon."
      },
      dinner: {
        name: "Steamed Soy-Ginger Seabass with Bitter Melon",
        ingredients: "Wild seabass fillet steamed with julienned ginger and scallions, served with a side of stir-fried bitter melon (Goya).",
        desc: "Goya's unique metabolic insulin-mimicking action assists in driving immediate glycogen uptake, ensuring glucose readings stay flat."
      },
      snack: {
        name: "Seaweed Nori Crisps & Roasted Edamame",
        ingredients: "Baked organic seaweed nori sheets with sea salt, plus 1/2 cup of salted, shelled edamame.",
        desc: "Low-carb crunchy combination rich in trace iodine, soy proteins, and dietary fiber."
      }
    }
  },
  {
    id: "latin-american",
    region: "Latin America & Caribbean",
    countryOrCulture: "Mexico, Colombia, Venezuela, Brazil",
    flag: "🇲🇽",
    vibeColor: "sky",
    overview: "Rooted in heritage staples like black/pinto beans, avocados, squash, and insulin-regulating cactus. This regime leverages high dietary fibers and healthy monounsaturated fats to flatten glycemic spikes naturally.",
    glucoseSpikeConcern: "Refined white flour tortillas, sweet maize breads (Arepas), deep-fried plantains, and sugary fruit juices load up simple glucose rapidly.",
    superIngredients: [
      { name: "Nopal (Prickly Pear Cactus)", clinicalEffect: "Exceptionally rich in soluble fibers and antioxidants; shown in multiple clinical studies to reduce postprandial glucose peaks." },
      { name: "Chia Seeds & Avocados", clinicalEffect: "Rich in fiber and healthy monounsaturated fats that improve fat-burning markers and lower insulin resistance." }
    ],
    substitutions: [
      { traditional: "Refined flour tortillas or white rice", healthyAlternative: "Nixtamalized 100% whole corn tortillas, lettuce wraps, or black bean sides", why: "Nixtamalization preserves fiber and mineral availability, lowering the glycemic index compared to white flour." },
      { traditional: "Sweet fried plantain (Maduro)", healthyAlternative: "Baked zucchini wedges, avocado slices, or pico de gallo", why: "Removes concentrated sugars and unhealthy frying oils, adding potassium and key fibers." }
    ],
    meals: {
      breakfast: {
        name: "Nopalitos & Egg Huevos Revueltos",
        ingredients: "2 scrambled eggs folded with sautéed tender prickly pear cactus (Nopal), serrano peppers, cilantro, and wild green salsa.",
        desc: "Served with 1 warmed nixtamalized whole-corn tortilla. Cactus mucilage creates a natural gel-barrier in the gut to delay glucose absorption."
      },
      lunch: {
        name: "Yucatán Shredded Chicken Pibil Bowl",
        ingredients: "Shredded chicken cooked in achiote spice, served over a bed of black beans, diced avocado, pickled red onions, and cotija cheese.",
        desc: "The rich, slow-digesting protein and healthy lipids from avocado maintain a prolonged metabolic plateau with no glycemic volatility."
      },
      dinner: {
        name: "Veracruz Baked Red Snapper",
        ingredients: "Snapper fillet baked with tomatoes, capers, green olives, oregano, bell peppers, and olive oil.",
        desc: "Tomato-based lycopenes and olive oil combine with key marine elements to provide a light, nutritious meal that guarantees low baseline morning logs."
      },
      snack: {
        name: "Guacamole with Cucumber & Radish Chips",
        ingredients: "1 mashed Haas avocado, lime juice, jalapeños, and sliced crisp organic cucumber and pink radish discs.",
        desc: "Refreshing dip with high crunch satisfaction and close to zero carbohydrate content."
      }
    }
  },
  {
    id: "west-african",
    region: "Sub-Saharan Africa",
    countryOrCulture: "West Africa (Nigeria, Ghana, Senegal)",
    flag: "🇳🇬",
    vibeColor: "yellow",
    overview: "Utilizes abundant local leafy greens (efo), protein-dense cowpeas, okra, and healthy light pepper soups. This program restructures meals to prioritize fiber-dense soups over heavy starchy tubers to prevent metabolic fatigue.",
    glucoseSpikeConcern: "Heavy refined starchy tubers or swallows like white Yam Fufu, Cassava Garri, and sweetened plantain chips present extremely dense glycemic loads.",
    superIngredients: [
      { name: "Okra (Ladyfinger)", clinicalEffect: "Okra's rich mucilage functions as an alpha-glucosidase inhibitor on starch, slowing down carbohydrate breakdown into glucose." },
      { name: "Moringa Leaves", clinicalEffect: "High in isothiocyanates which reduce overall liver gluconeogenesis and support pancreas longevity." }
    ],
    substitutions: [
      { traditional: "White Yam Fufu or Cassava swallow (Garri)", healthyAlternative: "Okra fufu, Oat-bran swallow, or Cauliflower swallow", why: "Drastically drops the carbohydrate density per meal while maintaining traditional texture." },
      { traditional: "Refined palm oil in excessive quantities", healthyAlternative: "Moderated high-oleic unrefined palm oil or olive oil", why: "Maintains traditional red-gold flavor but lowers oxidative inflammatory factors by reducing volume." }
    ],
    meals: {
      breakfast: {
        name: "Lagoon Pepper Soup with Boiled Cowpeas",
        ingredients: "Light broth cooked with local catfish, scented chili pepper seeds, utazi leaves, green onions, and whole boiled brown cowpeas.",
        desc: "Extremely cleansing morning bowl with high bioavailability of protein and legume fibers that stabilizes insulin secretion."
      },
      lunch: {
        name: "Efo Riro Greens with Oat Swallow",
        ingredients: "Stir-fried African spinach (efo), Scotch bonnets, and bell pepper base, served with a small ball of Oat-bran swallow.",
        desc: "The incredible volume of dietary fiber in the steamed leaves prevents the oat starch from spiking post-meal glucose."
      },
      dinner: {
        name: "Abuja Grilled Suya Chicken Strips",
        ingredients: "Boneless chicken thighs roasted in spicy peanut meal, ginger, and chili powder (Yaji spice), served with raw sliced cucumbers.",
        desc: "An high-protein, zero-carb, traditional roasted meat that keeps glucose levels flat, assisting critical overnight glycemic recovery."
      },
      snack: {
        name: "Roasted Peanuts & Hard Boiled Egg",
        ingredients: "A small handful (1/4 cup) of roasted West African groundnuts paired with one hard-boiled egg.",
        desc: "Extremely simple, high-protein portable snack to satisfy hunger cues between lunch and dinner."
      }
    }
  },
  {
    id: "middle-eastern",
    region: "Middle East & North Africa",
    countryOrCulture: "Levant, North Africa, Gulf (Lebanon, Egypt, Morocco)",
    flag: "🇱🇧",
    vibeColor: "teal",
    overview: "Based on ancient grains (freekeh, bulgur), high-protein legumes like chickpeas and fava beans, tahini sesame pastes, lean lamb/poultry, and antioxidant-rich pomegranate. Highly supportive for glycemic and lipid control.",
    glucoseSpikeConcern: "Fluffy white pita bread, refined couscous, and high-sugar honey pastries (Baklava) cause major, rapid blood sugar surges.",
    superIngredients: [
      { name: "Pure Sesame Tahini", clinicalEffect: "Sesamin and sesamolin lignans improve liver fatty acid oxidation and cellular insulin sensitivity." },
      { name: "Ground Cumin & Cinnamon", clinicalEffect: "Cinnamon mimics insulin and potentiates insulin receptors, which directly increases glucose utilization." }
    ],
    substitutions: [
      { traditional: "Refined white pita or white couscous", healthyAlternative: "Freekeh (green roasted wheat), bulgur, or almond-ﬂour flatbreads", why: "Freekeh is harvested young, preserving massive amounts of prebiotic resistant starch and fibers." },
      { traditional: "Sugary mint tea or honey syrups", healthyAlternative: "Herbal Mint/Sage tea with monkfruit, or lemon-infused water", why: "Preserves the cultural tea routine but removes direct simple sugar spikes." }
    ],
    meals: {
      breakfast: {
        name: "Traditional Egyptian Ful Mudammas",
        ingredients: "Slow-simmered fava beans, crushed garlic, cumin, lemon juice, and a generous pour of extra virgin olive oil.",
        desc: "Served with fresh cucumbers, mint leaves, and radishes (no bread). An exceptionally filling, slow-digesting meal rich in prebiotic bean fibers."
      },
      lunch: {
        name: "Levantine Chicken Shawarma & Freekeh Salad",
        ingredients: "Cumin-scallion grilled chicken breast slices, cooked whole green Freekeh, parsley, red onion, and lemon-tahini dressing.",
        desc: "Green freekeh has a glycemic index of only 43, allowing smooth, steady digestion with no sudden drowsiness."
      },
      dinner: {
        name: "Moroccan Lamb & Okra Tagine",
        ingredients: "Lean diced lamb shoulder slow-cooked in a clay pot with fresh okra pods, tomatoes, coriander, turmeric, and garlic.",
        desc: "Rich, deeply satisfying stew. The okra slime binds to stomach contents, naturally flattening glycemic release for stellar morning readings."
      },
      snack: {
        name: "Levant Baba Ganoush with Celery Rails",
        ingredients: "Smokey roasted eggplant mash, pure tahini sesame paste, lemon, and raw organic celery sticks for dipping.",
        desc: "High-fiber vegetable spread loaded with healthy oils and antioxidants to keep cravings at bay."
      }
    }
  },
  {
    id: "western-modern",
    region: "North America & UK",
    countryOrCulture: "Western (US, Canada, United Kingdom)",
    flag: "🇺🇸",
    vibeColor: "indigo",
    overview: "A modern, scientifically structured Western diet focusing on clean lean meats, fiber-dense cruciferous vegetables, whole-rolled steel-cut oats, and low-sugar berries. Cuts through industrial processing to support insulin health.",
    glucoseSpikeConcern: "Highly processed morning cereals, white bread sandwiches, French fries, sugary table syrups, and soda soft drinks represent extreme metabolic hazards.",
    superIngredients: [
      { name: "Cinnamon & Apple Cider Vinegar", clinicalEffect: "Vinegar significantly raises insulin sensitivity during a carbohydrate meal, locking down post-prandial surges." },
      { name: "Rolled Steel-Cut Oats & Chia", clinicalEffect: "Packed with beta-glucans which form a gel matrix in the small intestine, dampening sugar transport rates." }
    ],
    substitutions: [
      { traditional: "White sandwich bread, bagels, or french fries", healthyAlternative: "Whole grain sprouted sourdough, crisp lettuce wraps, or air-fried jicama fries", why: "Sprouted sourdough reduces starch availability via fermentation, lowering insulin impact." },
      { traditional: "Sugary table syrups or maple sweeteners", healthyAlternative: "Allulose-based or pure organic stevia sweet drops", why: "Delivers zero-glycemic sweetness without insulin resistance consequences." }
    ],
    meals: {
      breakfast: {
        name: "Steel-Cut Oats with Chia & Blueberries",
        ingredients: "1/2 cup steel-cut oats cooked in water, folded with 1 tbsp chia seeds, 1/2 tsp Ceylon cinnamon, and 10 raw blueberries.",
        desc: "Slow-simmered rolled oats carry high beta-glucan fiber content that maintains stable glucose for up to 4+ hours."
      },
      lunch: {
        name: "Oregon Orchard Grilled Turkey Salad",
        ingredients: "Organic sliced turkey breast, raw baby kale, chopped pecans, sliced celery, and olive oil apple-cider vinaigrette.",
        desc: "The apple cider vinegar helps block salivary digestive amylase, stabilizing blood sugar in response to vegetables."
      },
      dinner: {
        name: "Pan-Seared Salmon with Lemon Asparagus",
        ingredients: "Fresh Atlantic salmon grilled in olive oil, served with sauteed asparagus and a side of seasoned roasted cauliflower mash.",
        desc: "High in lean proteins, heart-healthy fatty acids, and zero grain starch, creating optimal overnight liver security."
      },
      snack: {
        name: "Celery with Organic Almond Butter",
        ingredients: "2 long celery stalks smeared with 2 tbsp of unsweetened raw almond butter (no added palm or rapeseed oil).",
        desc: "A crunchy, savory snack loaded with plant sterols and rich monounsaturated fats."
      }
    }
  }
];
