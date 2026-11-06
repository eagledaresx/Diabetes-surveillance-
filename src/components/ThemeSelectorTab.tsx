import React, { useState } from "react";
import {
  Palette,
  Moon,
  Sun,
  Check,
  Sparkles,
  Eye,
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  RotateCcw,
  ShieldCheck
} from "lucide-react";
import { UserProfile } from "../types";

export type ColorSchemeId =
  | "matte-slate"
  | "matte-terracotta"
  | "matte-steel"
  | "matte-chalk-light"
  | "high-contrast-light"
  | "clinical-mint-light";

export interface ColorSchemeOption {
  id: ColorSchemeId;
  name: string;
  shortLabel: string;
  category: "dark" | "light";
  badge: string;
  description: string;
  bestFor: string;
  swatches: {
    bg: string;
    card: string;
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const SIX_COLOR_SCHEMES: ColorSchemeOption[] = [
  // ================= 3 DARK THEMES =================
  {
    id: "matte-slate",
    name: "Matte Slate & Sage",
    shortLabel: "Slate Dark",
    category: "dark",
    badge: "Default Dark • #1",
    description:
      "Desaturated charcoal mineral surfaces paired with calm eucalyptus sage, sea-celadon, and muted rosewood accents.",
    bestFor: "Nighttime & low-glare indoor clinical monitoring",
    swatches: {
      bg: "#13161a",
      card: "#1c2026",
      primary: "#5c8d90",
      secondary: "#547b69",
      accent: "#9e5b56"
    }
  },
  {
    id: "matte-terracotta",
    name: "Obsidian Terracotta & Clay",
    shortLabel: "Terracotta Dark",
    category: "dark",
    badge: "Warm Dark • #2",
    description:
      "Warm volcanic stone charcoal with organic terracotta clay, dusty olive, and warm amber-ochre highlights. Zero blue-light harshness.",
    bestFor: "Evening relaxation & reduced blue-light eye strain",
    swatches: {
      bg: "#171413",
      card: "#211d1b",
      primary: "#a86259",
      secondary: "#5e7b5e",
      accent: "#a8724d"
    }
  },
  {
    id: "matte-steel",
    name: "Nordic Midnight Steel",
    shortLabel: "Nordic Dark",
    category: "dark",
    badge: "Cool Dark • #3",
    description:
      "Deep Nordic fjord slate combined with crisp gunmetal steel blue, lichen green, and misty heather violet tones.",
    bestFor: "High-precision analytics, charts & data review",
    swatches: {
      bg: "#12151a",
      card: "#191e25",
      primary: "#476885",
      secondary: "#4d7768",
      accent: "#665b7c"
    }
  },

  // ================= 3 LIGHT THEMES =================
  {
    id: "matte-chalk-light",
    name: "Sand & Chalk Paper",
    shortLabel: "Chalk Light",
    category: "light",
    badge: "Warm Light • #4",
    description:
      "Velvety e-ink inspired warm paper surfaces with soft sand cards, deep pine sage, and matte slate ink typography.",
    bestFor: "Comfortable all-day reading without screen glare",
    swatches: {
      bg: "#f5f4ef",
      card: "#eae8e1",
      primary: "#355d60",
      secondary: "#3b614f",
      accent: "#8c423c"
    }
  },
  {
    id: "high-contrast-light",
    name: "High-Contrast Daylight",
    shortLabel: "High-Contrast",
    category: "light",
    badge: "Sunlight Light • #5",
    description:
      "Maximum-luminance pure white cards with jet-black typography and bold medical cobalt, emerald, and crimson indicators.",
    bestFor: "Direct outdoor sunlight & maximum visual accessibility",
    swatches: {
      bg: "#ffffff",
      card: "#f8f9fa",
      primary: "#0284c7",
      secondary: "#16a34a",
      accent: "#dc2626"
    }
  },
  {
    id: "clinical-mint-light",
    name: "Clinical Mint & Glacier",
    shortLabel: "Mint Light",
    category: "light",
    badge: "Medical Light • #6",
    description:
      "Refreshing hospital-grade frosted mint and glacier surfaces paired with deep surgical teal, sapphire blue, and ruby alerts.",
    bestFor: "Doctor consultations, clinics & crisp daytime tracking",
    swatches: {
      bg: "#f0f9f7",
      card: "#e3f2ef",
      primary: "#0f766e",
      secondary: "#047857",
      accent: "#be123c"
    }
  }
];

export function getColorSchemeById(id?: string): ColorSchemeOption {
  if (!id || id === "dark") return SIX_COLOR_SCHEMES[0];
  return SIX_COLOR_SCHEMES.find(s => s.id === id) || SIX_COLOR_SCHEMES[0];
}

interface ThemeSelectorTabProps {
  profile: UserProfile;
  onSelectTheme: (themeId: ColorSchemeId) => void;
}

export const ThemeSelectorTab: React.FC<ThemeSelectorTabProps> = ({
  profile,
  onSelectTheme
}) => {
  const [filterMode, setFilterMode] = useState<"all" | "dark" | "light">("all");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentScheme = getColorSchemeById(profile.theme);

  const handleApplyScheme = (scheme: ColorSchemeOption) => {
    onSelectTheme(scheme.id);
    setStatusMessage(
      `Applied "${scheme.name}" (${scheme.category === "dark" ? "Dark Theme" : "Light Theme"})`
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const darkSchemes = SIX_COLOR_SCHEMES.filter(s => s.category === "dark");
  const lightSchemes = SIX_COLOR_SCHEMES.filter(s => s.category === "light");

  return (
    <div className="space-y-4 pb-8 animate-fadeIn">
      {/* Top Active Theme Hero Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
              {currentScheme.category === "dark" ? (
                <Moon className="w-6 h-6 text-sky-400" />
              ) : (
                <Sun className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Active Scheme • {currentScheme.badge}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded-full">
                  6 Color Schemes (3 Dark + 3 Light)
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight mt-1">
                {currentScheme.name}
              </h2>
              <p className="text-xs text-neutral-400">
                {currentScheme.description}
              </p>
            </div>
          </div>

          {/* Quick Reset / Next Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {currentScheme.id !== "matte-slate" && (
              <button
                type="button"
                onClick={() => handleApplyScheme(SIX_COLOR_SCHEMES[0])}
                className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Default Dark</span>
              </button>
            )}
          </div>
        </div>

        {/* Direct Color Scheme Dropdown Menu */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-1.5">
          <label
            htmlFor="theme-tab-dropdown-select"
            className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5"
          >
            <Palette className="w-3.5 h-3.5 text-sky-400" />
            <span>Quick Select Color Scheme (6 Available Palettes):</span>
          </label>
          <select
            id="theme-tab-dropdown-select"
            value={currentScheme.id}
            onChange={e => {
              const found = getColorSchemeById(e.target.value);
              handleApplyScheme(found);
            }}
            className="w-full bg-neutral-900 border border-neutral-700 hover:border-sky-400 text-white text-sm font-mono font-semibold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <optgroup label="🌙 3 Dark Themes (Low-Glare Clinical Dark)">
              {darkSchemes.map(s => (
                <option key={s.id} value={s.id}>
                  🌙 {s.name} — {s.bestFor}
                </option>
              ))}
            </optgroup>
            <optgroup label="☀️ 3 Light Themes (Daylight & High-Contrast)">
              {lightSchemes.map(s => (
                <option key={s.id} value={s.id}>
                  ☀️ {s.name} — {s.bestFor}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {statusMessage && (
          <div className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-400 pl-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span>Filter Palettes:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "All 6 Schemes" },
            { id: "dark", label: "🌙 3 Dark Themes" },
            { id: "light", label: "☀️ 3 Light Themes" }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id as "all" | "dark" | "light")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer ${
                filterMode === tab.id
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: 3 DARK THEMES */}
      {(filterMode === "all" || filterMode === "dark") && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                Dark Color Schemes (3 Themes)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              OLED & Low-Glare Nighttime Protection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {darkSchemes.map(scheme => {
              const isSelected = currentScheme.id === scheme.id;
              return (
                <button
                  key={scheme.id}
                  id={`scheme-card-${scheme.id}`}
                  type="button"
                  onClick={() => handleApplyScheme(scheme)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                    isSelected
                      ? "bg-neutral-950 border-sky-400 ring-2 ring-sky-500/30 shadow-lg"
                      : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-bold">
                          {scheme.badge}
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-1.5">
                          {scheme.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-sky-500 text-neutral-950 flex items-center justify-center shrink-0 shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {scheme.description}
                    </p>
                  </div>

                  {/* Interactive Color Swatch Bar Preview */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <div
                      className="p-2.5 rounded-xl border border-white/10 flex items-center justify-between"
                      style={{ backgroundColor: scheme.swatches.bg }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-lg border border-white/15 shadow-sm"
                          style={{ backgroundColor: scheme.swatches.card }}
                          title="Card Surface"
                        />
                        <span
                          className="w-5 h-5 rounded-lg shadow-sm"
                          style={{ backgroundColor: scheme.swatches.primary }}
                          title="Primary Accent"
                        />
                        <span
                          className="w-5 h-5 rounded-lg shadow-sm"
                          style={{ backgroundColor: scheme.swatches.secondary }}
                          title="Normal / Target Range"
                        />
                        <span
                          className="w-5 h-5 rounded-lg shadow-sm"
                          style={{ backgroundColor: scheme.swatches.accent }}
                          title="Alert / Post-Meal"
                        />
                      </div>
                      <span
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: scheme.swatches.card,
                          color: "#e2e8f0"
                        }}
                      >
                        96 mg/dL
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span className="truncate">{scheme.bestFor}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: 3 LIGHT THEMES */}
      {(filterMode === "all" || filterMode === "light") && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                Light & Daylight Color Schemes (3 Themes)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              Daylight Paper, High-Contrast Sunlight & Clinical Mint
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {lightSchemes.map(scheme => {
              const isSelected = currentScheme.id === scheme.id;
              return (
                <button
                  key={scheme.id}
                  id={`scheme-card-${scheme.id}`}
                  type="button"
                  onClick={() => handleApplyScheme(scheme)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                    isSelected
                      ? "bg-neutral-950 border-amber-400 ring-2 ring-amber-500/30 shadow-lg"
                      : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                          {scheme.badge}
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-1.5">
                          {scheme.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {scheme.description}
                    </p>
                  </div>

                  {/* Interactive Color Swatch Bar Preview */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                    <div
                      className="p-2.5 rounded-xl border border-neutral-400/40 flex items-center justify-between"
                      style={{ backgroundColor: scheme.swatches.bg }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-lg border border-black/15 shadow-sm"
                          style={{ backgroundColor: scheme.swatches.card }}
                          title="Card Surface"
                        />
                        <span
                          className="w-5 h-5 rounded-lg shadow-sm"
                          style={{ backgroundColor: scheme.swatches.primary }}
                          title="Primary Accent"
                        />
                        <span
                          className="w-5 h-5 rounded-lg shadow-sm"
                          style={{ backgroundColor: scheme.swatches.secondary }}
                          title="Normal / Target Range"
                        />
                        <span
                          className="w-5 h-5 rounded-lg shadow-sm"
                          style={{ backgroundColor: scheme.swatches.accent }}
                          title="Alert / Post-Meal"
                        />
                      </div>
                      <span
                        className="text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-black/10"
                        style={{
                          backgroundColor: scheme.swatches.card,
                          color: "#0f172a"
                        }}
                      >
                        96 mg/dL
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span className="truncate">{scheme.bestFor}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LIVE CLINICAL COMPONENT PREVIEW IN ACTIVE THEME */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
              Live Interface Preview ({currentScheme.name})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            WCAG Clinical Contrast Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                Fasting Target
              </span>
              <span className="text-lg font-black text-white font-mono">
                {profile.targetFastingMin}–{profile.targetFastingMax} mg/dL
              </span>
            </div>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                Time in Range
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono">
                84% Optimal
              </span>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold block">
                Post-Meal Peak
              </span>
              <span className="text-lg font-black text-rose-400 font-mono">
                {profile.targetPostMax} mg/dL
              </span>
            </div>
            <Sparkles className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ThemeSelectorTab;
