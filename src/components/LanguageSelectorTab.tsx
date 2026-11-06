import React, { useState, useMemo } from "react";
import {
  Globe,
  Search,
  Check,
  Volume2,
  Copy,
  Sparkles,
  ShieldAlert,
  Compass,
  RotateCcw,
  Share2,
  Languages,
  CheckCircle2,
  MapPin,
  Users
} from "lucide-react";
import {
  INTERNATIONAL_LANGUAGES,
  InternationalLanguage,
  getLanguageByCode
} from "../data/languages";
import { UserProfile } from "../types";

interface LanguageSelectorTabProps {
  profile: UserProfile;
  onSelectLanguage: (langCode: string) => void;
}

const REGIONS = [
  "All",
  "Global & Americas",
  "Europe",
  "Middle East & North Africa",
  "South & Central Asia",
  "East & Southeast Asia",
  "Sub-Saharan Africa",
  "RTL Scripts"
] as const;

export const LanguageSelectorTab: React.FC<LanguageSelectorTabProps> = ({
  profile,
  onSelectLanguage
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<(typeof REGIONS)[number]>("All");
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const currentLang = useMemo(
    () => getLanguageByCode(profile.language || "en"),
    [profile.language]
  );

  const filteredLanguages = useMemo(() => {
    return INTERNATIONAL_LANGUAGES.filter(lang => {
      if (selectedRegion === "RTL Scripts") {
        if (lang.dir !== "rtl") return false;
      } else if (selectedRegion !== "All" && lang.region !== selectedRegion) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.countries.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, selectedRegion]);

  const handleApplyLanguage = (lang: InternationalLanguage) => {
    onSelectLanguage(lang.code);
    setStatusBanner(`Language switched to ${lang.name} (${lang.nativeName})`);
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleAutoDetectLanguage = () => {
    if (typeof navigator === "undefined") return;
    const browserLang = navigator.language || "en";
    const exactMatch = INTERNATIONAL_LANGUAGES.find(
      l => l.bcp47.toLowerCase() === browserLang.toLowerCase() || l.code.toLowerCase() === browserLang.toLowerCase()
    );
    const prefixMatch = INTERNATIONAL_LANGUAGES.find(
      l => l.code.split("-")[0].toLowerCase() === browserLang.split("-")[0].toLowerCase()
    );
    const chosen = exactMatch || prefixMatch || INTERNATIONAL_LANGUAGES[0];
    handleApplyLanguage(chosen);
  };

  const handleSpeakText = (text: string, bcp47: string, id: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      utterance.rate = 0.95;
      utterance.onstart = () => setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingId(null);
    }
  };

  const handleCopyPhrase = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPhrase(id);
      setTimeout(() => setCopiedPhrase(null), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleShareEmergencyCard = () => {
    const t = currentLang.translations;
    const message =
      `🌍 *${t.appName} (${currentLang.nativeName})*\n` +
      `Patient: ${profile.name} (${profile.diabetesType})\n` +
      `-----------------------------------\n` +
      `🚨 ${t.emergencyPhraseDiabetes}\n` +
      `🧃 ${t.emergencyPhraseLowSugar}\n` +
      `💉 ${t.emergencyPhraseInsulin}\n` +
      `🏥 ${t.emergencyPhraseNeedDoctor}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <div className="space-y-4 pb-8 animate-fadeIn">
      {/* Top Active Language Hero Card */}
      <div className="bg-gradient-to-br from-sky-950/60 via-neutral-900 to-teal-950/40 border border-sky-500/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
              {currentLang.flag}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Active Language • {currentLang.code.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full">
                  {INTERNATIONAL_LANGUAGES.length} International Languages Available
                </span>
                {currentLang.dir === "rtl" && (
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-700/40 px-2 py-0.5 rounded-full">
                    RTL Script Support
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
                <span>{currentLang.nativeName}</span>
                <span className="text-sm font-normal text-neutral-400">({currentLang.name})</span>
              </h2>
              <p className="text-xs text-sky-200/80 font-mono">
                {currentLang.translations.careConsole} — {currentLang.translations.appName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-lang-autodetect"
              type="button"
              onClick={handleAutoDetectLanguage}
              className="px-3 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Detect language from your device/browser settings"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Auto-Detect</span>
            </button>

            {currentLang.code !== "en" && (
              <button
                id="btn-lang-reset-en"
                type="button"
                onClick={() => handleApplyLanguage(INTERNATIONAL_LANGUAGES[0])}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>English</span>
              </button>
            )}
          </div>
        </div>

        {/* Prominent App Language Dropdown Menu */}
        <div className="bg-neutral-950/90 border border-sky-500/40 rounded-xl p-3 space-y-1.5">
          <label
            htmlFor="tab-language-dropdown-select"
            className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Select App Language (Dropdown Menu — All {INTERNATIONAL_LANGUAGES.length} International Languages):</span>
          </label>
          <select
            id="tab-language-dropdown-select"
            value={currentLang.code}
            onChange={e => {
              const chosen = getLanguageByCode(e.target.value);
              handleApplyLanguage(chosen);
            }}
            className="w-full bg-neutral-900 border border-neutral-700 hover:border-sky-400 focus:border-sky-400 text-white text-sm font-mono font-semibold rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-sky-500/30 transition-all cursor-pointer"
          >
            {(
              [
                "Global & Americas",
                "Europe",
                "Middle East & North Africa",
                "South & Central Asia",
                "East & Southeast Asia",
                "Sub-Saharan Africa"
              ] as const
            ).map(region => (
              <optgroup key={region} label={`🌍 ${region}`}>
                {INTERNATIONAL_LANGUAGES.filter(l => l.region === region).map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} — {lang.name} ({lang.code.toUpperCase()}) • {lang.countries}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {statusBanner && (
          <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusBanner}</span>
          </div>
        )}
      </div>

      {/* Search & Global Region Filter Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 space-y-3 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-international-languages"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search any language, native script (العربية, اردو, हिन्दी, 中文, Español), country, or ISO code..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-sky-500/60 rounded-xl pl-10 pr-20 py-2.5 text-xs text-white placeholder-neutral-500 outline-none font-mono transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-0.5 rounded-lg cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {REGIONS.map(region => {
            const active = selectedRegion === region;
            const count =
              region === "All"
                ? INTERNATIONAL_LANGUAGES.length
                : region === "RTL Scripts"
                ? INTERNATIONAL_LANGUAGES.filter(l => l.dir === "rtl").length
                : INTERNATIONAL_LANGUAGES.filter(l => l.region === region).length;
            return (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  active
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
                    : "bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-850"
                }`}
              >
                <span>{region}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                    active ? "bg-sky-500/30 text-white" : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* International Languages Selection Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Select International Language ({filteredLanguages.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">
            Instant UI & Medical Phrasebook Localization
          </span>
        </div>

        {filteredLanguages.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <Globe className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs text-neutral-400 font-mono">
              No languages matched "{searchQuery}". Try searching by country or region.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredLanguages.map(lang => {
              const isSelected = currentLang.code === lang.code;
              return (
                <div
                  key={lang.code}
                  onClick={() => handleApplyLanguage(lang)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleApplyLanguage(lang);
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                    isSelected
                      ? "bg-gradient-to-br from-sky-950/80 via-neutral-900 to-teal-950/60 border-sky-400/60 shadow-md shadow-sky-950/40"
                      : "bg-neutral-950/90 hover:bg-neutral-900 border-neutral-800/90 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm truncate">
                            {lang.nativeName}
                          </span>
                          {lang.dir === "rtl" && (
                            <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              RTL
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 truncate">{lang.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {lang.code}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-neutral-950 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Localized Preview Line */}
                  <div
                    dir={lang.dir}
                    className="text-[10px] font-mono text-sky-300/90 bg-neutral-900/90 border border-neutral-800/80 px-2.5 py-1.5 rounded-lg truncate"
                  >
                    {lang.translations.appName}
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500 pt-0.5">
                    <span className="truncate flex items-center gap-1 max-w-[70%]">
                      <MapPin className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
                      {lang.countries}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Users className="w-2.5 h-2.5 text-neutral-500" />
                      {lang.speakers}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Localized Clinical Terms & Emergency Diabetes Travel Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Emergency Medical & Travel Phrasebook</span>
                <span className="text-xs font-mono text-sky-400">
                  ({currentLang.flag} {currentLang.nativeName})
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Show or play these localized clinical statements to paramedics, pharmacists, or doctors worldwide
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShareEmergencyCard}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp</span>
          </button>
        </div>

        {/* Key Clinical Terms in Selected Language */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" dir={currentLang.dir}>
          <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl">
            <span className="text-[9px] font-mono uppercase text-neutral-500 block">Fasting Glucose</span>
            <span className="text-sm font-bold text-cyan-300">{currentLang.translations.fasting}</span>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl">
            <span className="text-[9px] font-mono uppercase text-neutral-500 block">Post-Meal</span>
            <span className="text-sm font-bold text-rose-300">{currentLang.translations.postMeal}</span>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl">
            <span className="text-[9px] font-mono uppercase text-neutral-500 block">Insulin & Meds</span>
            <span className="text-sm font-bold text-purple-300">{currentLang.translations.insulinMeds}</span>
          </div>
          <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl">
            <span className="text-[9px] font-mono uppercase text-neutral-500 block">Doctor's Report</span>
            <span className="text-sm font-bold text-emerald-300">{currentLang.translations.doctorsReport}</span>
          </div>
        </div>

        {/* Spoken Emergency Phrases */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            {
              id: "diabetes",
              badge: "Medical Identification",
              en: "I have diabetes. Please check my blood sugar.",
              translated: currentLang.translations.emergencyPhraseDiabetes,
              color: "border-sky-500/30 bg-sky-950/20"
            },
            {
              id: "hypo",
              badge: "Hypoglycemia Emergency (<70 mg/dL)",
              en: "My blood sugar is dangerously low. Please give me juice or sugar immediately.",
              translated: currentLang.translations.emergencyPhraseLowSugar,
              color: "border-rose-500/30 bg-rose-950/20"
            },
            {
              id: "doctor",
              badge: "Urgent Medical Help",
              en: "I need medical assistance and a doctor right away.",
              translated: currentLang.translations.emergencyPhraseNeedDoctor,
              color: "border-amber-500/30 bg-amber-950/20"
            },
            {
              id: "insulin",
              badge: "Medication Safety",
              en: "I take insulin and diabetes medication.",
              translated: currentLang.translations.emergencyPhraseInsulin,
              color: "border-purple-500/30 bg-purple-950/20"
            }
          ].map(item => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border ${item.color} flex flex-col justify-between gap-2.5`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-300">
                    {item.badge}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSpeakText(item.translated, currentLang.bcp47, item.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
                        speakingId === item.id
                          ? "bg-sky-500 text-neutral-950"
                          : "bg-neutral-900 hover:bg-neutral-800 text-sky-300 border border-neutral-700"
                      }`}
                      title="Speak aloud in selected language"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{speakingId === item.id ? "Speaking..." : "Speak"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyPhrase(item.translated, item.id)}
                      className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] font-mono flex items-center gap-1 cursor-pointer"
                      title="Copy phrase"
                    >
                      {copiedPhrase === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p
                  dir={currentLang.dir}
                  className="text-sm font-bold text-white leading-snug pt-1"
                >
                  {item.translated}
                </p>
              </div>

              <p className="text-[11px] text-neutral-400 font-mono border-t border-white/5 pt-1.5">
                EN: "{item.en}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default LanguageSelectorTab;
