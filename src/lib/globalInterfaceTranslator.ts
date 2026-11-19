import {
  DEFAULT_ENGLISH_TRANSLATIONS,
  INTERNATIONAL_LANGUAGES,
  getLanguageByCode,
} from "../data/languages";

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
    "Post-Meal": "Post-Comida",
    "Post-Fasting": "Post-Ayuno",
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
    "Light & Daylight Color Schemes (3 Themes)": "Esquemas Claros y Día (3 Temas)",
    "Blood Sugar": "Azúcar en Sangre",
    "Blood Glucose": "Glucosa en Sangre",
    "Time in Range": "Tiempo en Rango",
    "Estimated HbA1c": "HbA1c Estimada",
    "Average Glucose": "Glucosa Promedio",
    "Readings": "Lecturas",
    "Before Meal": "Antes de Comer",
    "After Meal": "Después de Comer",
    "Bedtime": "Antes de Dormir",
    "Morning": "Mañana",
    "Evening": "Noche",
    "Notes": "Notas",
    "Add Note": "Añadir Nota",
    "Settings": "Configuración",
    "Profile": "Perfil",
    "Language": "Idioma",
    "Languages": "Idiomas",
    "Auto-Detect": "Auto-Detectar",
    "Select Language": "Seleccionar Idioma"
  },
  fr: {
    "Theme": "Thème",
    "Pro": "Pro",
    "Care+": "Soin+",
    "Android App": "App Android",
    "Sync Meter": "Sync Lecteur",
    "My Goals": "Mes Objectifs",
    "HbA1c & TIR": "HbA1c & TIR",
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
    "Post-Meal": "Post-Repas",
    "Post-Fasting": "Post-Jeûne",
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
    "Export PDF": "Exporter PDF",
    "Export CSV": "Exporter CSV",
    "Overview": "Aperçu",
    "Spike CGM Stream": "Flux CGM Spike",
    "Continuous HR": "Fréquence Cardiaque",
    "Sleep Stages": "Cycles de Sommeil",
    "Active Scheme": "Thème Actif",
    "Default Dark": "Sombre par Défaut",
    "Filter Palettes:": "Filtrer les Palettes :",
    "All 6 Schemes": "Les 6 Thèmes",
    "Blood Sugar": "Glycémie",
    "Blood Glucose": "Glycémie Sanguine",
    "Time in Range": "Temps dans la Cible",
    "Estimated HbA1c": "HbA1c Estimée",
    "Average Glucose": "Glycémie Moyenne",
    "Readings": "Mesures",
    "Settings": "Paramètres",
    "Profile": "Profil",
    "Language": "Langue",
    "Languages": "Langues",
    "Auto-Detect": "Auto-Détection"
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
    "Visual metabolic stability & trend charts": "Diagramme zur Stoffwechselstabilität und Trends",
    "All": "Alle",
    "Fasting": "Nüchtern",
    "Post": "Nach Mahlzeit",
    "Post-Meal": "Nach Mahlzeit",
    "7-Day Rolling": "7-Tage-Schnitt",
    "Trend Line": "Trendlinie",
    "Daily Bar": "Tagesbalken",
    "Category Pie": "Kategorien",
    "Variability": "Variabilität",
    "Medication Reminders": "Medikamenten-Erinnerungen",
    "Add Reminder": "Erinnerung Hinzufügen",
    "Search": "Suchen",
    "Cancel": "Abbrechen",
    "Overview": "Übersicht",
    "Spike CGM Stream": "Spike CGM-Stream",
    "Continuous HR": "Herzfrequenz",
    "Sleep Stages": "Schlafphasen",
    "Close": "Schließen",
    "Save": "Speichern",
    "Delete": "Löschen",
    "Edit": "Bearbeiten"
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
    "Post-Meal": "بعد الأكل",
    "7-Day Rolling": "متوسط 7 أيام",
    "Trend Line": "خط الاتجاه",
    "Daily Bar": "أعمدة يومية",
    "Category Pie": "توزيع الفئات",
    "Variability": "التذبذب",
    "Medication Reminders": "تذكيرات الأدوية",
    "Add Reminder": "إضافة تذكير",
    "Search": "بحث",
    "Cancel": "إلغاء",
    "Overview": "نظرة عامة",
    "Spike CGM Stream": "بث حساسات Spike CGM",
    "Continuous HR": "نبض القلب المستمر",
    "Sleep Stages": "مراحل النوم",
    "Close": "إغلاق",
    "Save": "حفظ",
    "Delete": "حذف",
    "Edit": "تعديل"
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
    "Post-Meal": "کھانے کے بعد",
    "7-Day Rolling": "7 دن کی اوسط",
    "Trend Line": "رجحان لائن",
    "Daily Bar": "روزانہ بار",
    "Category Pie": "درجہ بندی چارٹ",
    "Variability": "تغیر پذیری",
    "Medication Reminders": "ادویات کی یاد دہانی",
    "Add Reminder": "یاد دہانی شامل کریں",
    "Search": "تلاش کریں",
    "Cancel": "منسوخ کریں",
    "Overview": "مجموعی جائزہ",
    "Spike CGM Stream": "اسپائک CGM لائیو اسٹریم",
    "Continuous HR": "دل کی دھڑکن",
    "Sleep Stages": "نیند کے مراحل",
    "Close": "بند کریں",
    "Save": "محفوظ کریں",
    "Delete": "حذف کریں",
    "Edit": "ترمیم کریں"
  },
  hi: {
    "Theme": "थीम",
    "Pro": "प्रो",
    "Care+": "केयर+",
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
    "Visual metabolic stability & trend charts": "मेटाबोलिक स्थिरता और ट्रेंड चार्ट",
    "All": "सभी",
    "Fasting": "उपवास",
    "Post": "भोजन के बाद",
    "Post-Meal": "भोजन के बाद",
    "7-Day Rolling": "7-दिन का औसत",
    "Trend Line": "ट्रेंड लाइन",
    "Daily Bar": "दैनिक बार",
    "Category Pie": "श्रेणी चार्ट",
    "Variability": "परिवर्तनशीलता",
    "Medication Reminders": "दवा अनुस्मारक",
    "Add Reminder": "रिमाइंडर जोड़ें",
    "Search": "खोजें",
    "Cancel": "रद्द करें",
    "Overview": "अवलोकन",
    "Spike CGM Stream": "स्पाइक CGM स्ट्रीम",
    "Continuous HR": "हृदय गति",
    "Sleep Stages": "नींद के चरण",
    "Close": "बंद करें",
    "Save": "सहेजें",
    "Delete": "हटाएं",
    "Edit": "संपादित करें"
  },
  zh: {
    "Theme": "主题配色",
    "Pro": "专业版",
    "Care+": "关怀+",
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
    "Visual metabolic stability & trend charts": "代谢稳定性与血糖趋势图表",
    "All": "全部",
    "Fasting": "空腹",
    "Post": "餐后",
    "Post-Meal": "餐后",
    "7-Day Rolling": "7天滑动平均",
    "Trend Line": "趋势曲线",
    "Daily Bar": "每日柱状图",
    "Category Pie": "分布饼图",
    "Variability": "血糖波动率",
    "Medication Reminders": "服药提醒",
    "Add Reminder": "添加提醒",
    "Search": "搜索",
    "Cancel": "取消",
    "Overview": "总览",
    "Spike CGM Stream": "Spike 动态血糖流",
    "Continuous HR": "连续心率",
    "Sleep Stages": "睡眠结构",
    "Close": "关闭",
    "Save": "保存",
    "Delete": "删除",
    "Edit": "编辑"
  },
  ru: {
    "Theme": "Тема",
    "Android App": "Android Приложение",
    "Sync Meter": "Синхр. Глюкометр",
    "My Goals": "Мои Цели",
    "Weekly Review": "Итоги Недели",
    "Trends & Backup": "Тренды и Копия",
    "Logs": "Записи",
    "Spikes": "Скачки",
    "Diet": "Питание",
    "Sensors": "Датчики",
    "Daily Management Status": "Статус Ежедневного Контроля",
    "Warning": "Внимание",
    "Daily Pill Tracker": "Прием Лекарств",
    "Hydration Tracker": "Водный Баланс",
    "Fasting Timer": "Таймер Голодания",
    "Recent Glucose Readings": "Последние Замеры Глюкозы",
    "Save Reading": "Сохранить",
    "Graphical Visualizations": "Графики и Аналитика",
    "All": "Все",
    "Fasting": "Натощак",
    "Post": "После еды",
    "Post-Meal": "После еды",
    "7-Day Rolling": "Среднее 7 дн.",
    "Trend Line": "Линия Тренда",
    "Daily Bar": "По Дням",
    "Category Pie": "Категории",
    "Variability": "Вариабельность",
    "Overview": "Обзор",
    "Close": "Закрыть",
    "Save": "Сохранить",
    "Delete": "Удалить",
    "Cancel": "Отмена",
    "Search": "Поиск"
  },
  pt: {
    "Theme": "Tema",
    "Android App": "App Android",
    "Sync Meter": "Sinc. Medidor",
    "My Goals": "Minhas Metas",
    "Weekly Review": "Revisão Semanal",
    "Trends & Backup": "Tendências e Backup",
    "Logs": "Registros",
    "Spikes": "Picos",
    "Diet": "Dieta",
    "Sensors": "Sensores",
    "Daily Management Status": "Status de Controle Diário",
    "Warning": "Alerta",
    "Daily Pill Tracker": "Controle Diário de Remédios",
    "Hydration Tracker": "Controle de Hidratação",
    "Fasting Timer": "Timer de Jejum",
    "Recent Glucose Readings": "Leituras Recentes de Glicose",
    "Save Reading": "Salvar Leitura",
    "Graphical Visualizations": "Visualizações Gráficas",
    "All": "Todos",
    "Fasting": "Jejum",
    "Post": "Pós-Refeição",
    "Post-Meal": "Pós-Refeição",
    "7-Day Rolling": "Média 7 Dias",
    "Trend Line": "Linha Tendência",
    "Daily Bar": "Barras Diárias",
    "Category Pie": "Categorias",
    "Variability": "Variabilidade",
    "Overview": "Visão Geral",
    "Close": "Fechar",
    "Save": "Salvar",
    "Delete": "Excluir",
    "Cancel": "Cancelar",
    "Search": "Buscar"
  },
  tr: {
    "Theme": "Tema",
    "Android App": "Android Uygulaması",
    "Sync Meter": "Cihaz Eşitle",
    "My Goals": "Hedeflerim",
    "Weekly Review": "Haftalık Özeti",
    "Trends & Backup": "Trendler ve Yedek",
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
    "Post-Meal": "Tokluk",
    "7-Day Rolling": "7 Günlük Ort.",
    "Trend Line": "Trend Çizgisi",
    "Daily Bar": "Günlük Çubuk",
    "Category Pie": "Kategoriler",
    "Variability": "Değişkenlik",
    "Close": "Kapat",
    "Save": "Kaydet",
    "Delete": "Sil",
    "Cancel": "İptal",
    "Search": "Ara"
  },
  ja: {
    "Theme": "テーマ",
    "Android App": "Androidアプリ",
    "Sync Meter": "血糖計同期",
    "My Goals": "目標設定",
    "Weekly Review": "週間レビュー",
    "Trends & Backup": "トレンドとバックアップ",
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
    "Post-Meal": "食後",
    "7-Day Rolling": "7日間移動平均",
    "Trend Line": "トレンド",
    "Daily Bar": "日別バー",
    "Category Pie": "カテゴリ",
    "Variability": "変動率",
    "Close": "閉じる",
    "Save": "保存",
    "Delete": "削除",
    "Cancel": "キャンセル",
    "Search": "検索"
  },
  ko: {
    "Theme": "테마",
    "Android App": "안드로이드 앱",
    "Sync Meter": "혈당계 동기화",
    "My Goals": "나의 목표",
    "Weekly Review": "주간 리뷰",
    "Trends & Backup": "추세 및 백업",
    "Logs": "기록",
    "Spikes": "혈당 스파이크",
    "Diet": "식단",
    "Sensors": "센서",
    "Daily Management Status": "일일 혈당 관리 상태",
    "Daily Pill Tracker": "복약 트래커",
    "Graphical Visualizations": "그래프 시각화 분석",
    "All": "전체",
    "Fasting": "공복",
    "Post": "식후",
    "Post-Meal": "식후",
    "7-Day Rolling": "7일 이동평균",
    "Trend Line": "추세선",
    "Daily Bar": "일별 막대",
    "Category Pie": "분류 차트",
    "Variability": "변동성",
    "Close": "닫기",
    "Save": "저장",
    "Delete": "삭제",
    "Cancel": "취소",
    "Search": "검색"
  }
};

// Reverse map: Any translated string in any language -> Canonical English source string
// Prevents __origText from ever being overwritten by a translated string when React re-renders t.* or tr(...)
const REVERSE_TO_ENGLISH_MAP: Record<string, string> = {};
const ENGLISH_CANONICAL_SET: Set<string> = new Set();

function initializeReverseTranslationMap() {
  const englishEntries = Object.entries(DEFAULT_ENGLISH_TRANSLATIONS) as Array<
    [keyof typeof DEFAULT_ENGLISH_TRANSLATIONS, string]
  >;

  for (const [, engVal] of englishEntries) {
    if (engVal) {
      ENGLISH_CANONICAL_SET.add(engVal.trim());
    }
  }

  for (const lang of INTERNATIONAL_LANGUAGES) {
    for (const [key, engVal] of englishEntries) {
      const translatedVal = lang.translations[key];
      if (translatedVal && engVal && translatedVal.trim() !== engVal.trim()) {
        REVERSE_TO_ENGLISH_MAP[translatedVal.trim()] = engVal.trim();
      }
    }
  }

  for (const langDict of Object.values(CORE_UI_DICTIONARY)) {
    for (const [engKey, translatedVal] of Object.entries(langDict)) {
      ENGLISH_CANONICAL_SET.add(engKey.trim());
      if (translatedVal && translatedVal.trim() !== engKey.trim()) {
        REVERSE_TO_ENGLISH_MAP[translatedVal.trim()] = engKey.trim();
      }
    }
  }
}

initializeReverseTranslationMap();

// Memory + LocalStorage Translation Cache
const translationMemoryCache: Record<string, Record<string, string>> = {};

function normalizeCacheLangKey(langCode: string): string {
  const clean = (langCode || "en").trim().toLowerCase();
  if (clean === "zh-tw" || clean === "zh-hant") return "zh-tw";
  return clean.split("-")[0];
}

function registerTranslationsInMemory(langCode: string, map: Record<string, string>) {
  const cache = getLangCache(langCode);
  for (const [eng, trans] of Object.entries(map)) {
    const cleanEng = eng.trim();
    const cleanTrans = (trans || "").trim();
    if (!cleanEng || !cleanTrans) continue;
    cache[cleanEng] = cleanTrans;
    ENGLISH_CANONICAL_SET.add(cleanEng);
    if (cleanTrans !== cleanEng) {
      REVERSE_TO_ENGLISH_MAP[cleanTrans] = cleanEng;
    }
  }
}

function getLangCache(langCode: string): Record<string, string> {
  const base = normalizeCacheLangKey(langCode);
  if (!translationMemoryCache[base]) {
    let stored: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(`ui_i18n_cache_v2_${base}`);
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
      "AI Assistant": t.aiAssistant,
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
      "Log Blood Glucose": t.logGlucose,
      [DEFAULT_ENGLISH_TRANSLATIONS.emergencyPhraseDiabetes]: t.emergencyPhraseDiabetes,
      [DEFAULT_ENGLISH_TRANSLATIONS.emergencyPhraseLowSugar]: t.emergencyPhraseLowSugar,
      [DEFAULT_ENGLISH_TRANSLATIONS.emergencyPhraseNeedDoctor]: t.emergencyPhraseNeedDoctor,
      [DEFAULT_ENGLISH_TRANSLATIONS.emergencyPhraseInsulin]: t.emergencyPhraseInsulin,
    };

    const merged = {
      ...seedFromLangData,
      ...(CORE_UI_DICTIONARY[base] || {}),
      ...stored,
    };

    translationMemoryCache[base] = merged;
    for (const [engKey, transVal] of Object.entries(merged)) {
      if (engKey && transVal && engKey.trim() !== transVal.trim()) {
        REVERSE_TO_ENGLISH_MAP[transVal.trim()] = engKey.trim();
      }
    }
  }
  return translationMemoryCache[base];
}

function saveLangCache(langCode: string) {
  const base = normalizeCacheLangKey(langCode);
  try {
    if (translationMemoryCache[base]) {
      localStorage.setItem(`ui_i18n_cache_v2_${base}`, JSON.stringify(translationMemoryCache[base]));
    }
  } catch {
    // ignore quota errors
  }
}

export function translatePhrase(phrase: string, langCode: string): string {
  if (!phrase) return phrase;
  const trimmed = phrase.trim();
  const canonicalEng = REVERSE_TO_ENGLISH_MAP[trimmed] || trimmed;
  if (!langCode || langCode.toLowerCase().startsWith("en")) return canonicalEng;
  const cache = getLangCache(langCode);
  return cache[canonicalEng] || phrase;
}

// Track queued and in-flight translation requests per language
const queuedTextsByLang: Record<string, Set<string>> = {};
const inFlightTextsByLang: Record<string, Set<string>> = {};
let batchTimeoutId: any = null;
let isApplyingTranslation = false;
let currentActiveLangCode = "en";

function shouldSkipText(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 650) return true;
  // Must contain at least two letters to be translatable text
  if (!/[a-zA-Z\u00C0-\u024F\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u4E00-\u9FFF]{2,}/.test(trimmed)) {
    return true;
  }
  // Skip pure numbers, units, symbols, dates, times, URLs, or code identifiers
  if (/^[\d\s.,:%+\-/()•|<>°~≈±×÷=\[\]#@!$%^&*_]+$/i.test(trimmed)) return true;
  if (/^(\d+(\.\d+)?\s*(mg\/dL|mmol\/L|g|mg|ml|mL|kcal|cal|bpm|hrs?|h|m|s|mins?|sec|days?|d|wks?|%|\bIU\b|\bU\b|\bsteps\b))$/i.test(trimmed)) {
    return true;
  }
  if (/^(https?:\/\/|SPIKE_|OPEN_WEARABLES|visitor@|bash —|sha256|AES-GCM|PBKDF2)/i.test(trimmed)) return true;
  return false;
}

/**
 * Attempts a composite sub-phrase lookup if the full string is not yet in cache
 * (for example, "Fasting: 98 mg/dL" or "Target • 70-130 mg/dL").
 */
function lookupOrComposeTranslation(
  origTrimmed: string,
  cache: Record<string, string>
): { translated: string | null; isExact: boolean } {
  if (cache[origTrimmed]) {
    return { translated: cache[origTrimmed], isExact: true };
  }

  // Case-insensitive exact lookup
  const lowerOrig = origTrimmed.toLowerCase();
  for (const [k, v] of Object.entries(cache)) {
    if (k.toLowerCase() === lowerOrig) {
      cache[origTrimmed] = v;
      return { translated: v, isExact: true };
    }
  }

  // Composite delimiter split (e.g., "Fasting: 95 mg/dL", "Trends & Backup • Live")
  const delimiters = [": ", " — ", " – ", " - ", " • ", " | ", " / "];
  for (const delim of delimiters) {
    if (origTrimmed.includes(delim)) {
      const parts = origTrimmed.split(delim);
      let anyPartTranslated = false;
      const mappedParts = parts.map((p) => {
        const pt = p.trim();
        if (!pt || shouldSkipText(pt)) return p;
        const hit = cache[pt];
        if (hit) {
          anyPartTranslated = true;
          return hit;
        }
        return p;
      });
      if (anyPartTranslated) {
        return { translated: mappedParts.join(delim), isExact: false };
      }
    }
  }

  return { translated: null, isExact: false };
}

function resolveCanonicalEnglishForNode(anyNode: any, currentVal: string): string {
  const trimmedCurrent = currentVal.trim();
  if (!trimmedCurrent) return currentVal;

  // 1. If the current DOM text is a known translated string from any language, map it back to canonical English!
  const reverseMapped = REVERSE_TO_ENGLISH_MAP[trimmedCurrent];
  if (reverseMapped) {
    const leadingSpace = currentVal.match(/^\s*/)?.[0] || "";
    const trailingSpace = currentVal.match(/\s*$/)?.[0] || "";
    const canonicalFull = `${leadingSpace}${reverseMapped}${trailingSpace}`;
    anyNode.__origText = canonicalFull;
    return canonicalFull;
  }

  // 2. If this node has never been seen before, store currentVal as __origText
  if (anyNode.__origText === undefined) {
    anyNode.__origText = currentVal;
    return currentVal;
  }

  // 3. If React updated the text node (i.e. currentVal !== __lastTranslated), only overwrite __origText
  // if currentVal is English or a newly computed value
  if (anyNode.__lastTranslated !== undefined && currentVal !== anyNode.__lastTranslated) {
    anyNode.__origText = currentVal;
  }

  return anyNode.__origText;
}

export function applyGlobalInterfaceTranslation(langCode: string, rootElement?: HTMLElement | null) {
  if (isApplyingTranslation) return;
  const root = rootElement || document.getElementById("root") || document.body;
  if (!root) return;

  currentActiveLangCode = langCode || "en";
  isApplyingTranslation = true;

  try {
    const isEnglish = !langCode || langCode.toLowerCase().startsWith("en");
    const baseLang = normalizeCacheLangKey(langCode || "en");
    const cache = isEnglish ? {} : getLangCache(langCode);
    const missingTexts = new Set<string>();

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (
          tag === "script" ||
          tag === "style" ||
          tag === "code" ||
          tag === "pre" ||
          tag === "textarea"
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest("[data-no-translate='true']")) {
          return NodeFilter.FILTER_REJECT;
        }
        // Keep native language list items inside the language dropdown in their native scripts
        if (parent.closest("#header-language-dropdown-menu") && parent.closest("button[role='option']")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest("#native-app-language-select")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
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

      const origFull = resolveCanonicalEnglishForNode(anyNode, currentVal);
      const origTrimmed = origFull.trim();

      if (isEnglish) {
        if (currentVal !== origFull) {
          currentNode.nodeValue = origFull;
        }
        anyNode.__lastTranslated = origFull;
      } else if (!shouldSkipText(origTrimmed)) {
        const { translated, isExact } = lookupOrComposeTranslation(origTrimmed, cache);
        if (translated && translated !== origTrimmed) {
          const leadingSpace = origFull.match(/^\s*/)?.[0] || "";
          const trailingSpace = origFull.match(/\s*$/)?.[0] || "";
          const finalVal = `${leadingSpace}${translated}${trailingSpace}`;
          if (currentNode.nodeValue !== finalVal) {
            currentNode.nodeValue = finalVal;
          }
          anyNode.__lastTranslated = finalVal;
          REVERSE_TO_ENGLISH_MAP[translated.trim()] = origTrimmed;
        }
        if (!isExact) {
          missingTexts.add(origTrimmed);
        }
      }

      currentNode = walker.nextNode() as Text | null;
    }

    // Translate input & textarea placeholders, title attributes, and aria-labels
    const translatableAttrs = ["placeholder", "title", "aria-label"] as const;
    const attrSelector = "input[placeholder], textarea[placeholder], [title], [aria-label]";
    const elementsWithAttrs = root.querySelectorAll<HTMLElement>(attrSelector);

    elementsWithAttrs.forEach((el) => {
      if (el.closest("[data-no-translate='true']")) return;
      const anyEl = el as any;
      if (!anyEl.__origAttrs) anyEl.__origAttrs = {};
      if (!anyEl.__lastAttrs) anyEl.__lastAttrs = {};

      for (const attr of translatableAttrs) {
        const currentAttrVal = el.getAttribute(attr);
        if (!currentAttrVal || !currentAttrVal.trim()) continue;
        const trimmedCurrentAttr = currentAttrVal.trim();

        const reverseAttr = REVERSE_TO_ENGLISH_MAP[trimmedCurrentAttr];
        if (reverseAttr) {
          anyEl.__origAttrs[attr] = reverseAttr;
        } else if (
          anyEl.__origAttrs[attr] === undefined ||
          (anyEl.__lastAttrs[attr] !== undefined && currentAttrVal !== anyEl.__lastAttrs[attr])
        ) {
          anyEl.__origAttrs[attr] = trimmedCurrentAttr;
        }

        const origAttr: string = anyEl.__origAttrs[attr];
        if (isEnglish) {
          if (currentAttrVal !== origAttr) {
            el.setAttribute(attr, origAttr);
          }
          anyEl.__lastAttrs[attr] = origAttr;
        } else if (!shouldSkipText(origAttr)) {
          const { translated, isExact } = lookupOrComposeTranslation(origAttr, cache);
          if (translated && translated !== origAttr) {
            if (currentAttrVal !== translated) {
              el.setAttribute(attr, translated);
            }
            anyEl.__lastAttrs[attr] = translated;
            REVERSE_TO_ENGLISH_MAP[translated.trim()] = origAttr;
          }
          if (!isExact) {
            missingTexts.add(origAttr);
          }
        }
      }
    });

    if (!isEnglish && missingTexts.size > 0) {
      queueMissingTranslations(langCode, baseLang, Array.from(missingTexts), root);
    }
  } finally {
    isApplyingTranslation = false;
  }
}

function queueMissingTranslations(
  langCode: string,
  baseLang: string,
  texts: string[],
  root: HTMLElement
) {
  if (!queuedTextsByLang[baseLang]) {
    queuedTextsByLang[baseLang] = new Set();
  }
  if (!inFlightTextsByLang[baseLang]) {
    inFlightTextsByLang[baseLang] = new Set();
  }

  const queuedSet = queuedTextsByLang[baseLang];
  const inFlightSet = inFlightTextsByLang[baseLang];
  const cache = getLangCache(langCode);

  for (const txt of texts) {
    if (!cache[txt] && !inFlightSet.has(txt)) {
      queuedSet.add(txt);
    }
  }

  if (queuedSet.size === 0) return;

  if (batchTimeoutId) clearTimeout(batchTimeoutId);
  batchTimeoutId = setTimeout(async () => {
    const allToFetch = Array.from(queuedSet).filter((t) => !cache[t] && !inFlightSet.has(t));
    queuedSet.clear();

    if (allToFetch.length === 0) return;

    allToFetch.forEach((t) => inFlightSet.add(t));

    // Process in chunks of up to 120 strings so every single element on screen is translated
    const chunkSize = 120;
    const chunks: string[][] = [];
    for (let i = 0; i < allToFetch.length; i += chunkSize) {
      chunks.push(allToFetch.slice(i, i + chunkSize));
    }

    const langObj = getLanguageByCode(langCode);
    const apiPrefix = (window as any).__VITE_API_URL__ || "";

    await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const resp = await fetch(`${apiPrefix}/api/translate-ui`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetLangCode: langObj.code,
              targetLangName: langObj.name,
              targetNativeName: langObj.nativeName,
              texts: chunk,
            }),
          });

          if (resp.ok) {
            const data = await resp.json();
            if (
              data &&
              data.translations &&
              typeof data.translations === "object" &&
              Object.keys(data.translations).length > 0
            ) {
              registerTranslationsInMemory(langCode, data.translations);
              saveLangCache(langCode);
              if (normalizeCacheLangKey(currentActiveLangCode) === baseLang) {
                applyGlobalInterfaceTranslation(currentActiveLangCode, root);
              }
            }
          }
        } catch {
          // Silently ignore network errors; built-in dictionary remains active
        } finally {
          chunk.forEach((t) => inFlightSet.delete(t));
        }
      })
    );
  }, 50);
}
