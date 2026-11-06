import { getLanguageByCode } from "../data/languages";

// Comprehensive UI & Sub-Menu Phrase Dictionary for Instant 0ms Translation
const CORE_UI_DICTIONARY: Record<string, Record<string, string>> = {
  es: {
    "Theme": "Tema",
    "Pro": "Pro",
    "Care+": "Cuidado+",
    "Android App": "App Android",
    "Sync Meter": "Sincronizar Medidor",
    "BLE / USB / NFC": "BLE / USB / NFC",
    "My Goals": "Mis Metas",
    "HbA1c & TIR": "HbA1c y TIR",
    "Weekly Review": "Revisión Semanal",
    "Trends & Backup": "Tendencias y Copia",
    "Logs": "Registros",
    "Spikes": "Picos",
    "Diet": "Dieta",
    "Sensors": "Sensores",
    "Daily Management Status": "Estado de Control Diario",
    "Warning": "Alerta",
    "Daily Pill Tracker": "Control Diario de Medicamentos",
    "Hydration Tracker": "Control de Hidratación",
    "Fasting Timer": "Temporizador de Ayuno",
    "Recent Glucose Readings": "Lecturas Recientes de Glucosa",
    "Save Reading": "Guardar Lectura",
    "Graphical Visualizations": "Visualizaciones Gráficas",
    "Visual metabolic stability & trend charts": "Gráficos de estabilidad metabólica y tendencias",
    "All": "Todos",
    "Fasting": "Ayunas",
    "Post": "Post-Comida",
    "7-Day Rolling": "Media 7 Días",
    "Trend Line": "Línea Tendencia",
    "Daily Bar": "Barras Diarias",
    "Category Pie": "Gráfico Circular",
    "Variability": "Variabilidad",
    "Medication Reminders": "Recordatorios de Medicación",
    "Add Reminder": "Añadir Recordatorio",
    "Search": "Buscar",
    "Cancel": "Cancelar",
    "Close": "Cerrar",
    "Save": "Guardar",
    "Delete": "Eliminar",
    "Edit": "Editar",
    "Export PDF": "Exportar PDF",
    "Export CSV": "Exportar CSV",
    "Overview": "Resumen",
    "Spike CGM Stream": "Flujo CGM Spike",
    "Continuous HR": "Ritmo Cardíaco",
    "Sleep Stages": "Fases de Sueño",
    "SpO2": "Oxígeno SpO2",
    "JSON Spec": "Especificación JSON",
    "CLI Sandbox": "Terminal CLI",
    "Active Scheme": "Esquema Activo",
    "Default Dark": "Oscuro Predeterminado",
    "Filter Palettes:": "Filtrar Paletas:",
    "All 6 Schemes": "Los 6 Esquemas",
    "Dark Color Schemes (3 Themes)": "Esquemas Oscuros (3 Temas)",
    "Light & Daylight Color Schemes (3 Themes)": "Esquemas Claros y Día (3 Temas)"
  },
  fr: {
    "Theme": "Thème",
    "Pro": "Pro",
    "Care+": "Soin+",
    "Android App": "App Android",
    "Sync Meter": "Sync Lecteur",
    "My Goals": "Mes Objectifs",
    "Weekly Review": "Bilan Hebdo",
    "Trends & Backup": "Tendances & Sauvegarde",
    "Logs": "Journaux",
    "Spikes": "Pics",
    "Diet": "Régime",
    "Sensors": "Capteurs",
    "Daily Management Status": "État de Gestion Quotidien",
    "Warning": "Alerte",
    "Daily Pill Tracker": "Suivi Quotidien des Médicaments",
    "Hydration Tracker": "Suivi d'Hydratation",
    "Fasting Timer": "Minuteur de Jeûne",
    "Recent Glucose Readings": "Lectures Récentes de Glycémie",
    "Save Reading": "Enregistrer",
    "Graphical Visualizations": "Visualisations Graphiques",
    "Visual metabolic stability & trend charts": "Graphiques de stabilité métabolique et tendances",
    "All": "Tous",
    "Fasting": "À Jeun",
    "Post": "Post-Repas",
    "7-Day Rolling": "Moyenne 7 Jours",
    "Trend Line": "Courbe Tendance",
    "Daily Bar": "Barres Jour",
    "Category Pie": "Camembert",
    "Variability": "Variabilité",
    "Medication Reminders": "Rappels de Médicaments",
    "Add Reminder": "Ajouter un Rappel",
    "Search": "Rechercher",
    "Cancel": "Annuler",
    "Close": "Fermer",
    "Save": "Enregistrer",
    "Delete": "Supprimer",
    "Edit": "Modifier",
    "Overview": "Aperçu",
    "Spike CGM Stream": "Flux CGM Spike",
    "Continuous HR": "Fréquence Cardiaque",
    "Sleep Stages": "Cycles de Sommeil",
    "Active Scheme": "Thème Actif",
    "Default Dark": "Sombre par Défaut",
    "Filter Palettes:": "Filtrer les Palettes :",
    "All 6 Schemes": "Les 6 Thèmes"
  },
  de: {
    "Theme": "Design",
    "Android App": "Android-App",
    "Sync Meter": "Messgerät Sync",
    "My Goals": "Meine Ziele",
    "Weekly Review": "Wochenbericht",
    "Trends & Backup": "Trends & Backup",
    "Logs": "Protokolle",
    "Spikes": "Spitzen",
    "Diet": "Ernährung",
    "Sensors": "Sensoren",
    "Daily Management Status": "Täglicher Management-Status",
    "Warning": "Warnung",
    "Daily Pill Tracker": "Täglicher Medikamenten-Tracker",
    "Hydration Tracker": "Flüssigkeits-Tracker",
    "Fasting Timer": "Fasten-Timer",
    "Recent Glucose Readings": "Aktuelle Blutzuckerwerte",
    "Save Reading": "Wert Speichern",
    "Graphical Visualizations": "Grafische Auswertungen",
    "All": "Alle",
    "Fasting": "Nüchtern",
    "Post": "Nach Mahlzeit",
    "7-Day Rolling": "7-Tage-Schnitt",
    "Trend Line": "Trendlinie",
    "Daily Bar": "Tagesbalken",
    "Category Pie": "Kategorien",
    "Variability": "Variabilität",
    "Overview": "Übersicht",
    "Spike CGM Stream": "Spike CGM-Stream",
    "Continuous HR": "Herzfrequenz",
    "Sleep Stages": "Schlafphasen",
    "Close": "Schließen",
    "Save": "Speichern",
    "Delete": "Löschen"
  },
  ar: {
    "Theme": "المظهر",
    "Pro": "برو",
    "Care+": "رعاية+",
    "Android App": "تطبيق أندرويد",
    "Sync Meter": "مزامنة الجهاز",
    "My Goals": "أهدافي",
    "Weekly Review": "المراجعة الأسبوعية",
    "Trends & Backup": "الاتجاهات والنسخ",
    "Logs": "السجلات",
    "Spikes": "الارتفاعات",
    "Diet": "الغذاء",
    "Sensors": "المستشعرات",
    "Daily Management Status": "حالة المتابعة اليومية",
    "Warning": "تنبيه",
    "Daily Pill Tracker": "متابع الأدوية اليومي",
    "Hydration Tracker": "متابع شرب الماء",
    "Fasting Timer": "مؤقت الصيام",
    "Recent Glucose Readings": "قراءات السكر الأخيرة",
    "Save Reading": "حفظ القراءة",
    "Graphical Visualizations": "الرسوم البيانية والتحليلات",
    "Visual metabolic stability & trend charts": "مخططات استقرار الأيض واتجاهات السكر",
    "All": "الكل",
    "Fasting": "صائم",
    "Post": "بعد الأكل",
    "7-Day Rolling": "متوسط 7 أيام",
    "Trend Line": "خط الاتجاه",
    "Daily Bar": "أعمدة يومية",
    "Category Pie": "توزيع الفئات",
    "Variability": "التذبذب",
    "Overview": "نظرة عامة",
    "Spike CGM Stream": "بث حساسات Spike CGM",
    "Continuous HR": "نبض القلب المستمر",
    "Sleep Stages": "مراحل النوم",
    "Close": "إغلاق",
    "Save": "حفظ",
    "Delete": "حذف"
  },
  ur: {
    "Theme": "تھیم",
    "Pro": "پرو",
    "Care+": "کیئر+",
    "Android App": "اینڈرائیڈ ایپ",
    "Sync Meter": "میٹر سنک کریں",
    "My Goals": "میرے اہداف",
    "Weekly Review": "ہفتہ وار جائزہ",
    "Trends & Backup": "رجحانات اور بیک اپ",
    "Logs": "ریکارڈز",
    "Spikes": "شوگر اتار چڑھاؤ",
    "Diet": "خوراک",
    "Sensors": "سینسرز",
    "Daily Management Status": "روزانہ شوگر کنٹرول کی صورتحال",
    "Warning": "انتباہ",
    "Daily Pill Tracker": "روزانہ ادویات کا ٹریکر",
    "Hydration Tracker": "پانی پینے کا ٹریکر",
    "Fasting Timer": "فاسٹنگ ٹائمر",
    "Recent Glucose Readings": "حالیہ بلڈ شوگر ریکارڈز",
    "Save Reading": "ریڈنگ محفوظ کریں",
    "Graphical Visualizations": "گرافیکل رپورٹس اور چارٹس",
    "Visual metabolic stability & trend charts": "میٹابولک استحکام اور شوگر کے رجحانات کے چارٹس",
    "All": "سب",
    "Fasting": "نہار منہ",
    "Post": "کھانے کے بعد",
    "7-Day Rolling": "7 دن کی اوسط",
    "Trend Line": "رجحان لائن",
    "Daily Bar": "روزانہ بار",
    "Category Pie": "درجہ بندی چارٹ",
    "Variability": "تغیر پذیری",
    "Overview": "مجموعی جائزہ",
    "Spike CGM Stream": "اسپائک CGM لائیو اسٹریم",
    "Continuous HR": "دل کی دھڑکن",
    "Sleep Stages": "نیند کے مراحل",
    "Close": "بند کریں",
    "Save": "محفوظ کریں",
    "Delete": "حذف کریں"
  },
  hi: {
    "Theme": "थीम",
    "Pro": "प्रो",
    "Android App": "एंड्रॉइड ऐप",
    "Sync Meter": "मीटर सिंक करें",
    "My Goals": "मेरे लक्ष्य",
    "Weekly Review": "साप्ताहिक समीक्षा",
    "Trends & Backup": "रुझान और बैकअप",
    "Logs": "लॉग्स",
    "Spikes": "स्पाइक्स",
    "Diet": "आहार",
    "Sensors": "सेंसर",
    "Daily Management Status": "दैनिक प्रबंधन स्थिति",
    "Warning": "चेतावनी",
    "Daily Pill Tracker": "दैनिक दवा ट्रैकर",
    "Hydration Tracker": "हाइड्रेशन ट्रैकर",
    "Fasting Timer": "उपवास टाइमर",
    "Recent Glucose Readings": "हालिया ग्लूकोज रीडिंग",
    "Save Reading": "रीडिंग सहेजें",
    "Graphical Visualizations": "ग्राफिकल चार्ट और विश्लेषण",
    "All": "सभी",
    "Fasting": "उपवास",
    "Post": "भोजन के बाद",
    "7-Day Rolling": "7-दिन का औसत",
    "Trend Line": "ट्रेंड लाइन",
    "Daily Bar": "दैनिक बार",
    "Category Pie": "श्रेणी चार्ट",
    "Variability": "परिवर्तनशीलता",
    "Overview": "अवलोकन",
    "Spike CGM Stream": "स्पाइक CGM स्ट्रीम",
    "Continuous HR": "हृदय गति",
    "Sleep Stages": "नींद के चरण",
    "Close": "बंद करें",
    "Save": "सहेजें",
    "Delete": "हटाएं"
  },
  zh: {
    "Theme": "主题配色",
    "Pro": "专业版",
    "Android App": "安卓应用",
    "Sync Meter": "同步血糖仪",
    "My Goals": "我的目标",
    "Weekly Review": "每周回顾",
    "Trends & Backup": "趋势与备份",
    "Logs": "血糖记录",
    "Spikes": "峰值分析",
    "Diet": "饮食日志",
    "Sensors": "穿戴传感器",
    "Daily Management Status": "每日控糖管理状态",
    "Warning": "警告",
    "Daily Pill Tracker": "每日服药追踪",
    "Hydration Tracker": "每日饮水追踪",
    "Fasting Timer": "断食计时器",
    "Recent Glucose Readings": "近期血糖记录",
    "Save Reading": "保存记录",
    "Graphical Visualizations": "图表可视化分析",
    "All": "全部",
    "Fasting": "空腹",
    "Post": "餐后",
    "7-Day Rolling": "7天滑动平均",
    "Trend Line": "趋势曲线",
    "Daily Bar": "每日柱状图",
    "Category Pie": "分布饼图",
    "Variability": "血糖波动率",
    "Overview": "总览",
    "Spike CGM Stream": "Spike 动态血糖流",
    "Continuous HR": "连续心率",
    "Sleep Stages": "睡眠结构",
    "Close": "关闭",
    "Save": "保存",
    "Delete": "删除"
  },
  ru: {
    "Theme": "Тема",
    "Android App": "Android Приложение",
    "Sync Meter": "Синхр. Глюкометр",
    "My Goals": "Мои Цели",
    "Weekly Review": "Итоги Недели",
    "Logs": "Записи",
    "Spikes": "Скачки",
    "Diet": "Питание",
    "Sensors": "Датчики",
    "Daily Management Status": "Статус Ежедневного Контроля",
    "Warning": "Внимание",
    "Daily Pill Tracker": "Прием Лекарств",
    "Recent Glucose Readings": "Последние Замеры Глюкозы",
    "Save Reading": "Сохранить",
    "Graphical Visualizations": "Графики и Аналитика",
    "All": "Все",
    "Fasting": "Натощак",
    "Post": "После еды",
    "7-Day Rolling": "Среднее 7 дн.",
    "Trend Line": "Линия Тренда",
    "Daily Bar": "По Дням",
    "Category Pie": "Категории",
    "Variability": "Вариабельность",
    "Overview": "Обзор",
    "Close": "Закрыть",
    "Save": "Сохранить",
    "Delete": "Удалить"
  },
  pt: {
    "Theme": "Tema",
    "Android App": "App Android",
    "Sync Meter": "Sinc. Medidor",
    "My Goals": "Minhas Metas",
    "Weekly Review": "Revisão Semanal",
    "Logs": "Registros",
    "Spikes": "Picos",
    "Diet": "Dieta",
    "Sensors": "Sensores",
    "Daily Management Status": "Status de Controle Diário",
    "Warning": "Alerta",
    "Daily Pill Tracker": "Controle Diário de Remédios",
    "Recent Glucose Readings": "Leituras Recentes de Glicose",
    "Save Reading": "Salvar Leitura",
    "Graphical Visualizations": "Visualizações Gráficas",
    "All": "Todos",
    "Fasting": "Jejum",
    "Post": "Pós-Refeição",
    "7-Day Rolling": "Média 7 Dias",
    "Trend Line": "Linha Tendência",
    "Daily Bar": "Barras Diárias",
    "Category Pie": "Categorias",
    "Variability": "Variabilidade",
    "Overview": "Visão Geral",
    "Close": "Fechar",
    "Save": "Salvar"
  },
  tr: {
    "Theme": "Tema",
    "Android App": "Android Uygulaması",
    "Sync Meter": "Cihaz Eşitle",
    "My Goals": "Hedeflerim",
    "Weekly Review": "Haftalık Özeti",
    "Logs": "Kayıtlar",
    "Spikes": "Dalgalanmalar",
    "Diet": "Beslenme",
    "Sensors": "Sensörler",
    "Daily Management Status": "Günlük Kontrol Durumu",
    "Daily Pill Tracker": "Günlük İlaç Takibi",
    "Graphical Visualizations": "Grafiksel Analizler",
    "All": "Tümü",
    "Fasting": "Açlık",
    "Post": "Tokluk",
    "7-Day Rolling": "7 Günlük Ort.",
    "Trend Line": "Trend Çizgisi",
    "Daily Bar": "Günlük Çubuk",
    "Category Pie": "Kategoriler",
    "Variability": "Değişkenlik"
  },
  ja: {
    "Theme": "テーマ",
    "Android App": "Androidアプリ",
    "Sync Meter": "血糖計同期",
    "My Goals": "目標設定",
    "Weekly Review": "週間レビュー",
    "Logs": "記録",
    "Spikes": "スパイク",
    "Diet": "食事",
    "Sensors": "センサー",
    "Daily Management Status": "本日の血糖管理ステータス",
    "Daily Pill Tracker": "服薬トラッカー",
    "Graphical Visualizations": "グラフ分析",
    "All": "すべて",
    "Fasting": "空腹時",
    "Post": "食後",
    "7-Day Rolling": "7日間移動平均",
    "Trend Line": "トレンド",
    "Daily Bar": "日別バー",
    "Category Pie": "カテゴリ",
    "Variability": "変動率"
  },
  ko: {
    "Theme": "테마",
    "Android App": "안드로이드 앱",
    "Sync Meter": "혈당계 동기화",
    "My Goals": "나의 목표",
    "Weekly Review": "주간 리뷰",
    "Logs": "기록",
    "Spikes": "혈당 스파이크",
    "Diet": "식단",
    "Sensors": "센서",
    "Daily Management Status": "일일 혈당 관리 상태",
    "Daily Pill Tracker": "복약 트래커",
    "Graphical Visualizations": "그래프 시각화 분석",
    "All": "전체",
    "Fasting": "공腹",
    "Post": "식후",
    "7-Day Rolling": "7일 이동평균",
    "Trend Line": "추세선",
    "Daily Bar": "일별 막대",
    "Category Pie": "분류 차트",
    "Variability": "변동성"
  }
};

// Memory + LocalStorage Translation Cache
const translationMemoryCache: Record<string, Record<string, string>> = {};

function getLangCache(langCode: string): Record<string, string> {
  const base = langCode.split("-")[0].toLowerCase();
  if (!translationMemoryCache[base]) {
    let stored: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(`ui_i18n_cache_${base}`);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // ignore storage errors
    }
    const langObj = getLanguageByCode(langCode);
    const t = langObj.translations;
    const seedFromLangData: Record<string, string> = {
      "Care Console": t.careConsole,
      "Diabetes Care & Tracker": t.appName,
      "Welcome": t.welcome,
      "Active Diabetes Watch": t.activeWatch,
      "Fasting": t.fasting,
      "Post-Meal": t.postMeal,
      "Post-Fasting": t.postMeal,
      "Glucose Tracking": t.glucoseTracking,
      "Insulin & Meds": t.insulinMeds,
      "Diet Planner": t.dietPlanner,
      "Walking Tracker": t.walkingTracker,
      "Doctor's Report": t.doctorsReport,
      "Family & WhatsApp": t.familyWhatsapp,
      "Diets Handbook": t.dietsHandbook,
      "Languages": t.languagesTab,
      "Console": t.consoleNav,
      "Reports": t.reportsNav,
      "Pills": t.pillsNav,
      "Handbook": t.handbookNav,
      "History": t.historyNav,
      "Targets": t.targetsNav,
      "Normal": t.normal,
      "Prediabetes": t.prediabetes,
      "Diabetes": t.diabetes,
      "Hypoglycemia": t.hypoglycemia,
      "Log Blood Glucose": t.logGlucose
    };

    translationMemoryCache[base] = {
      ...seedFromLangData,
      ...(CORE_UI_DICTIONARY[base] || {}),
      ...stored
    };
  }
  return translationMemoryCache[base];
}

function saveLangCache(langCode: string) {
  const base = langCode.split("-")[0].toLowerCase();
  try {
    if (translationMemoryCache[base]) {
      localStorage.setItem(`ui_i18n_cache_${base}`, JSON.stringify(translationMemoryCache[base]));
    }
  } catch {
    // ignore quota errors
  }
}

export function translatePhrase(phrase: string, langCode: string): string {
  if (!langCode || langCode.toLowerCase().startsWith("en")) return phrase;
  const cache = getLangCache(langCode);
  return cache[phrase] || phrase;
}

// Track pending network translation batches so we never duplicate requests
const pendingTextsByLang: Record<string, Set<string>> = {};
let batchTimeoutId: any = null;

function shouldSkipText(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 260) return true;
  // Skip pure numbers, units, symbols, dates, times, URLs, or code identifiers
  if (/^[\d\s.,:%+\-/()•|<>mgdLhbA1c°]+$/i.test(trimmed)) return true;
  if (/^(https?:\/\/|SPIKE_|OPEN_WEARABLES|visitor@|bash —)/i.test(trimmed)) return true;
  return false;
}

export function applyGlobalInterfaceTranslation(langCode: string, rootElement?: HTMLElement | null) {
  const root = rootElement || document.getElementById("root");
  if (!root) return;

  const isEnglish = !langCode || langCode.toLowerCase().startsWith("en");
  const baseLang = (langCode || "en").split("-")[0].toLowerCase();
  const cache = isEnglish ? {} : getLangCache(langCode);
  const missingTexts = new Set<string>();

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (tag === "script" || tag === "style" || tag === "code" || tag === "pre" || tag === "textarea") {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest("#header-language-dropdown-menu")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let currentNode = walker.nextNode() as Text | null;
  while (currentNode) {
    const anyNode = currentNode as any;
    const currentVal = currentNode.nodeValue || "";
    const trimmedCurrent = currentVal.trim();

    if (!trimmedCurrent) {
      currentNode = walker.nextNode() as Text | null;
      continue;
    }

    // Store or update original English text if node changed by React
    if (anyNode.__origText === undefined || (anyNode.__lastTranslated !== undefined && currentVal !== anyNode.__lastTranslated)) {
      anyNode.__origText = currentVal;
    }

    const origFull: string = anyNode.__origText;
    const origTrimmed = origFull.trim();

    if (isEnglish) {
      if (currentVal !== origFull) {
        currentNode.nodeValue = origFull;
      }
      anyNode.__lastTranslated = origFull;
    } else if (!shouldSkipText(origTrimmed)) {
      const translated = cache[origTrimmed];
      if (translated && translated !== origTrimmed) {
        const leadingSpace = origFull.match(/^\s*/)?.[0] || "";
        const trailingSpace = origFull.match(/\s*$/)?.[0] || "";
        const finalVal = `${leadingSpace}${translated}${trailingSpace}`;
        if (currentNode.nodeValue !== finalVal) {
          currentNode.nodeValue = finalVal;
        }
        anyNode.__lastTranslated = finalVal;
      } else if (!cache[origTrimmed]) {
        missingTexts.add(origTrimmed);
      }
    }

    currentNode = walker.nextNode() as Text | null;
  }

  // Also translate input placeholders
  const inputs = root.querySelectorAll<HTMLInputElement>("input[placeholder]");
  inputs.forEach(input => {
    const anyInput = input as any;
    const currentPh = input.getAttribute("placeholder") || "";
    if (!currentPh) return;
    if (anyInput.__origPlaceholder === undefined || (anyInput.__lastPh !== undefined && currentPh !== anyInput.__lastPh)) {
      anyInput.__origPlaceholder = currentPh;
    }
    const origPh: string = anyInput.__origPlaceholder;
    if (isEnglish) {
      if (currentPh !== origPh) input.setAttribute("placeholder", origPh);
      anyInput.__lastPh = origPh;
    } else if (!shouldSkipText(origPh)) {
      const translatedPh = cache[origPh];
      if (translatedPh) {
        input.setAttribute("placeholder", translatedPh);
        anyInput.__lastPh = translatedPh;
      } else {
        missingTexts.add(origPh);
      }
    }
  });

  if (!isEnglish && missingTexts.size > 0) {
    queueMissingTranslations(langCode, baseLang, Array.from(missingTexts), root);
  }
}

function queueMissingTranslations(langCode: string, baseLang: string, texts: string[], root: HTMLElement) {
  if (!pendingTextsByLang[baseLang]) {
    pendingTextsByLang[baseLang] = new Set();
  }
  const pendingSet = pendingTextsByLang[baseLang];
  const newToFetch: string[] = [];

  for (const txt of texts) {
    if (!pendingSet.has(txt) && newToFetch.length < 60) {
      pendingSet.add(txt);
      newToFetch.push(txt);
    }
  }

  if (newToFetch.length === 0) return;

  if (batchTimeoutId) clearTimeout(batchTimeoutId);
  batchTimeoutId = setTimeout(async () => {
    try {
      const langObj = getLanguageByCode(langCode);
      const apiPrefix = (window as any).__VITE_API_URL__ || "";
      const resp = await fetch(`${apiPrefix}/api/translate-ui`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLangCode: langObj.code,
          targetLangName: langObj.name,
          targetNativeName: langObj.nativeName,
          texts: newToFetch
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.translations && typeof data.translations === "object") {
          const cache = getLangCache(langCode);
          Object.assign(cache, data.translations);
          saveLangCache(langCode);
          applyGlobalInterfaceTranslation(langCode, root);
        }
      }
    } catch (err) {
      // Silently ignore network errors; built-in dictionary remains active
    }
  }, 180);
}
