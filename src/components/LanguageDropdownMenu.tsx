import React, { useState, useRef, useEffect, useMemo } from "react";
import { Globe, ChevronDown, Check, Search, Compass, ExternalLink } from "lucide-react";
import {
  INTERNATIONAL_LANGUAGES,
  InternationalLanguage,
  getLanguageByCode
} from "../data/languages";

interface LanguageDropdownMenuProps {
  selectedCode?: string;
  onSelectLanguage: (langCode: string) => void;
  onOpenLanguagesTab?: () => void;
}

const REGION_GROUPS = [
  "Global & Americas",
  "Europe",
  "Middle East & North Africa",
  "South & Central Asia",
  "East & Southeast Asia",
  "Sub-Saharan Africa"
] as const;

export const LanguageDropdownMenu: React.FC<LanguageDropdownMenuProps> = ({
  selectedCode = "en",
  onSelectLanguage,
  onOpenLanguagesTab
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = useMemo(
    () => getLanguageByCode(selectedCode),
    [selectedCode]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return INTERNATIONAL_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return INTERNATIONAL_LANGUAGES.filter(
      lang =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.countries.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (lang: InternationalLanguage) => {
    onSelectLanguage(lang.code);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleAutoDetect = () => {
    if (typeof navigator === "undefined") return;
    const browserLang = navigator.language || "en";
    const exactMatch = INTERNATIONAL_LANGUAGES.find(
      l =>
        l.bcp47.toLowerCase() === browserLang.toLowerCase() ||
        l.code.toLowerCase() === browserLang.toLowerCase()
    );
    const prefixMatch = INTERNATIONAL_LANGUAGES.find(
      l => l.code.split("-")[0].toLowerCase() === browserLang.split("-")[0].toLowerCase()
    );
    const chosen = exactMatch || prefixMatch || INTERNATIONAL_LANGUAGES[0];
    handleSelect(chosen);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-50 shrink-0">
      {/* Main Dropdown Trigger Button */}
      <button
        id="header-language-dropdown-btn"
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Language: ${currentLang.nativeName} (${currentLang.name}) — Select from 60+ International Languages`}
        className={`flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-xl border font-mono font-bold transition-all cursor-pointer select-none ${
          isOpen
            ? "bg-sky-500/20 text-sky-300 border-sky-400/60 shadow-lg shadow-sky-950/50"
            : "bg-neutral-800/90 hover:bg-neutral-800 text-neutral-200 border-neutral-700/70 hover:border-sky-500/40"
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span className="text-xs leading-none">{currentLang.flag}</span>
        <span className="uppercase text-sky-300">
          {currentLang.code.split("-")[0]}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-neutral-400 transition-transform duration-150 shrink-0 ${
            isOpen ? "rotate-180 text-sky-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover Menu */}
      {isOpen && (
        <div
          id="header-language-dropdown-menu"
          role="listbox"
          className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-neutral-900 border border-neutral-700/90 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
        >
          {/* Dropdown Top Header & Native Select */}
          <div className="p-3 bg-neutral-950 border-b border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                  App Language ({INTERNATIONAL_LANGUAGES.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoDetect}
                className="text-[10px] font-mono text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer"
                title="Auto-detect browser language"
              >
                <Compass className="w-3 h-3" />
                <span>Auto-Detect</span>
              </button>
            </div>

            {/* Direct Native Select Dropdown for Instant OS-Native Selection */}
            <div>
              <label htmlFor="native-app-language-select" className="sr-only">
                Select App Language
              </label>
              <select
                id="native-app-language-select"
                value={currentLang.code}
                onChange={e => {
                  const found = getLanguageByCode(e.target.value);
                  handleSelect(found);
                }}
                className="w-full bg-neutral-900 border border-sky-500/40 hover:border-sky-400 text-white text-xs font-mono rounded-xl px-2.5 py-2 outline-none focus:ring-2 focus:ring-sky-500/30 cursor-pointer"
              >
                {REGION_GROUPS.map(region => (
                  <optgroup key={region} label={`🌍 ${region}`}>
                    {INTERNATIONAL_LANGUAGES.filter(l => l.region === region).map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName} — {lang.name} ({lang.code.toUpperCase()})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Quick Filter Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filter languages (e.g. Español, العربية, اردو, 中文)..."
                className="w-full bg-neutral-900 border border-neutral-800 focus:border-sky-500/50 rounded-xl pl-8 pr-2.5 py-1.5 text-[11px] text-white placeholder-neutral-500 outline-none font-mono"
              />
            </div>
          </div>

          {/* Scrollable List of International Languages */}
          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-800/50">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500 font-mono">
                No language found for "{searchQuery}"
              </div>
            ) : (
              filteredLanguages.map(lang => {
                const isSelected = lang.code === currentLang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-sky-950/70 text-sky-200"
                        : "hover:bg-neutral-800/70 text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate">
                            {lang.nativeName}
                          </span>
                          {lang.dir === "rtl" && (
                            <span className="text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              RTL
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 block truncate">
                          {lang.name} • {lang.countries}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                        {lang.code}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Dropdown Footer Link to Full Phrasebook Tab */}
          {onOpenLanguagesTab && (
            <div className="p-2 bg-neutral-950 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenLanguagesTab();
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/25 text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Open Full Language & Emergency Phrasebook Hub</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default LanguageDropdownMenu;
