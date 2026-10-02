import React, { useState, useEffect } from "react";
import { UserProfile as UserProfileType, WeightHistoryEntry } from "../types";
import { User, Activity, Goal, Save, CheckCircle, Palette, ShieldCheck, ExternalLink, X, Scale, Trash2, Plus, Calendar, UserPlus, Check, Lock, Fingerprint, Download, AlertTriangle, ShieldAlert, Cpu, Smartphone, Sun, Moon, ChevronDown, ChevronUp, Crown, Sparkles } from "lucide-react";

interface UserProfileProps {
  profile: UserProfileType;
  profiles?: UserProfileType[];
  activeProfileId?: string;
  onSwitchProfile?: (id: string) => void;
  onCreateProfile?: (name: string, diabetesType: UserProfileType["diabetesType"]) => void;
  onDeleteProfile?: (id: string) => void;
  onSave: (updated: UserProfileType) => void;
  onExportData?: () => void;
  onDeleteAccountData?: () => void;
  onOpenDisclaimer?: () => void;
  onOpenAndroidModal?: () => void;
  onOpenMonetizationHub?: () => void;
}

export default function UserProfile({ 
  profile, 
  profiles = [], 
  activeProfileId, 
  onSwitchProfile, 
  onCreateProfile, 
  onDeleteProfile, 
  onSave,
  onExportData,
  onDeleteAccountData,
  onOpenDisclaimer,
  onOpenAndroidModal,
  onOpenMonetizationHub
}: UserProfileProps) {
  const [formData, setFormData] = useState<UserProfileType>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [themeFeedback, setThemeFeedback] = useState<string>("");
  const [showAllPalettes, setShowAllPalettes] = useState(false);

  // Profile creation states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileType, setNewProfileType] = useState<UserProfileType["diabetesType"]>("Type 2");

  // Weight history state trackers
  const [newWeightVal, setNewWeightVal] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Sync state if active profile changes
  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  // Live preview of theme as the user selects it, before pressing submit
  useEffect(() => {
    const currentTheme = formData.theme || "matte-slate";
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [formData.theme]);

  const isHighContrast = formData.theme === "high-contrast-light";

  const handleGlobalThemeToggle = (newTheme: "matte-slate" | "high-contrast-light") => {
    const updated: UserProfileType = { ...formData, theme: newTheme };
    setFormData(updated);
    document.documentElement.setAttribute("data-theme", newTheme);
    onSave(updated);
    setThemeFeedback(
      newTheme === "high-contrast-light"
        ? "High-Contrast Light Mode activated for sunlight readability"
        : "Default 'Matte-Slate' Dark Mode activated"
    );
    setTimeout(() => setThemeFeedback(""), 3500);
  };

  const handlePaletteSelect = (palette: UserProfileType["theme"]) => {
    const updated: UserProfileType = { ...formData, theme: palette };
    setFormData(updated);
    document.documentElement.setAttribute("data-theme", palette || "matte-slate");
    onSave(updated);
    setThemeFeedback(`Palette switched to ${palette}`);
    setTimeout(() => setThemeFeedback(""), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddWeight = () => {
    const weightNum = parseFloat(newWeightVal);
    if (isNaN(weightNum) || weightNum <= 0) {
      alert("Please enter a valid weight number (e.g. 72.4).");
      return;
    }
    const newEntry: WeightHistoryEntry = {
      id: "w_" + Date.now(),
      date: newWeightDate,
      weight: weightNum
    };
    
    const updatedHistory = [...(formData.weightHistory || [])];
    updatedHistory.push(newEntry);
    updatedHistory.sort((a, b) => a.date.localeCompare(b.date)); // Sort chronologically

    const updatedProfile = {
      ...formData,
      weight: `${weightNum} kg`,
      weightHistory: updatedHistory
    };
    setFormData(updatedProfile);
    setNewWeightVal("");
  };

  const handleDeleteWeight = (id: string) => {
    const updatedHistory = (formData.weightHistory || []).filter(item => item.id !== id);
    setFormData({
      ...formData,
      weightHistory: updatedHistory
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-neutral-900">
      <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
        <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Patient Profile & Settings</h2>
          <p className="text-xs text-neutral-400 font-mono">Customize surveillance thresholds, global theme & appearance</p>
        </div>
      </div>

      {/* Profiles Switcher & Creation Panel */}
      {profiles.length > 0 && (
        <div className="bg-neutral-850/45 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
            <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" /> Patient Profiles Directory
            </h3>
            <button
              id="btn-create-profile-trigger"
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600/20 border border-cyan-500/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  onClick={() => onSwitchProfile && p.id && onSwitchProfile(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isActive
                      ? "bg-neutral-900 border-cyan-500 text-white shadow-none"
                      : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700/80 hover:text-neutral-350"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-cyan-500/25 text-cyan-400" : "bg-neutral-850 text-neutral-500"}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-neutral-300"}`}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                        {p.diabetesType} • {p.age || "—"} yrs
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isActive ? (
                      <span className="p-1 bg-cyan-500/20 text-cyan-400 rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      onDeleteProfile && profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (p.id && confirm(`Are you sure you want to delete profile "${p.name}"? This will clear its specific target settings.`)) {
                              onDeleteProfile(p.id);
                            }
                          }}
                          className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-all cursor-pointer"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide-down Drawer / Popover for Creating Profile */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-neutral-850 w-full max-w-sm rounded-2xl flex flex-col shadow-2xl animate-scaleUp p-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-black uppercase text-white tracking-widest font-mono">Create New Patient Profile</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium font-mono">Patient Full Name</label>
                <input
                  type="text"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium font-mono">Diabetes Type</label>
                <select
                  value={newProfileType}
                  onChange={(e) => setNewProfileType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Type 2">Type 2 Diabetes</option>
                  <option value="Type 1">Type 1 Diabetes</option>
                  <option value="Gestational">Gestational Diabetes</option>
                  <option value="Prediabetes">Prediabetes Category</option>
                  <option value="None">None (General Surveillance)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-850 text-neutral-300 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newProfileName.trim()) {
                    alert("Please enter a valid patient name.");
                    return;
                  }
                  if (onCreateProfile) {
                    onCreateProfile(newProfileName.trim(), newProfileType);
                    setNewProfileName("");
                    setShowCreateModal(false);
                  }
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* MEMBERSHIP TIER & MONETIZATION CARD */}
        <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-cyan-950/40 p-4 rounded-2xl border border-amber-500/35 space-y-3 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">Membership Plan & Monetization</h3>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    formData.membershipTier === "pro"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : formData.membershipTier === "caregiver_plus"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                  }`}>
                    {formData.membershipTier ? formData.membershipTier.replace("_", " ") : "Free Starter"}
                  </span>
                </div>
                <p className="text-[10.5px] text-neutral-300 mt-0.5 leading-snug">
                  Manage your subscription, unlock clinical doctor exports, 15-min push alarms, and explore app earning models.
                </p>
              </div>
            </div>

            {onOpenMonetizationHub && (
              <button
                type="button"
                id="btn-profile-manage-sub"
                onClick={onOpenMonetizationHub}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-mono font-black transition-all cursor-pointer shrink-0 shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{formData.membershipTier === "pro" || formData.membershipTier === "caregiver_plus" ? "Manage Plan" : "Upgrade / Plans"}</span>
              </button>
            )}
          </div>
        </div>

        {/* GLOBAL THEME & DISPLAY CONTRAST TOGGLE */}
        <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-750 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  Global Display Theme & Contrast
                </h3>
                <p className="text-[10.5px] text-neutral-400">
                  Switch between soothing dark mode and ultra-high-contrast light mode for bright environments
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isHighContrast 
                ? "bg-amber-500/15 text-amber-300 border-amber-500/30" 
                : "bg-sky-500/15 text-sky-300 border-sky-500/30"
            }`}>
              {isHighContrast ? "High Contrast" : "Matte Slate"}
            </span>
          </div>

          {/* Quick-Action 1-Tap Toggle Switch Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-750">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl transition-colors ${
                isHighContrast ? "bg-amber-500/20 text-amber-400" : "bg-sky-500/20 text-sky-400"
              }`}>
                {isHighContrast ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-200">
                  {isHighContrast ? "High-Contrast Light Mode Active" : "Default 'Matte-Slate' Dark Mode Active"}
                </div>
                <div className="text-[10.5px] text-neutral-400">
                  {isHighContrast
                    ? "Max daylight legibility & crisp contrast for direct sunlight"
                    : "Low-glare mineral palette for standard indoor clinical monitoring"}
                </div>
              </div>
            </div>

            <button
              id="theme-global-toggle-switch"
              type="button"
              role="switch"
              aria-checked={isHighContrast}
              aria-label="Toggle between Matte-Slate Dark Mode and High-Contrast Light Mode"
              onClick={() => handleGlobalThemeToggle(isHighContrast ? "matte-slate" : "high-contrast-light")}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                isHighContrast ? "bg-amber-500 border-amber-400" : "bg-neutral-800 border-neutral-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  isHighContrast ? "translate-x-6" : "translate-x-0.5"
                }`}
              >
                {isHighContrast ? (
                  <Sun className="w-3 h-3 text-amber-600" />
                ) : (
                  <Moon className="w-3 h-3 text-slate-700" />
                )}
              </span>
            </button>
          </div>

          {/* Interactive 2-Card Segmented Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Matte Slate Dark Card */}
            <button
              id="theme-select-matte-slate"
              type="button"
              onClick={() => handleGlobalThemeToggle("matte-slate")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                !isHighContrast && (formData.theme === "matte-slate" || !formData.theme || formData.theme === "dark")
                  ? "bg-neutral-900 border-sky-500/70 ring-1 ring-sky-500/30 text-white"
                  : "bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-neutral-100">Default 'Matte-Slate'</div>
                    <div className="text-[10px] text-neutral-400">Clinical Dark Mode</div>
                  </div>
                </div>
                {!isHighContrast && (formData.theme === "matte-slate" || !formData.theme || formData.theme === "dark") && (
                  <span className="p-1 rounded-full bg-sky-500/20 text-sky-400">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Anti-glare mineral tones (charcoal, sage, dusty denim) designed to minimize screen fatigue during standard monitoring.
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                <span className="text-[9px] font-mono text-neutral-500">Low-Glare Mineral</span>
                <div className="flex gap-1 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#13161a] border border-neutral-700"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5c8d90]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#547b69]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9e5b56]"></span>
                </div>
              </div>
            </button>

            {/* High Contrast Light Card */}
            <button
              id="theme-select-high-contrast"
              type="button"
              onClick={() => handleGlobalThemeToggle("high-contrast-light")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                isHighContrast
                  ? "bg-neutral-900 border-amber-500/70 ring-1 ring-amber-500/30 text-white"
                  : "bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-neutral-100">High-Contrast Light</div>
                    <div className="text-[10px] text-amber-400 font-medium">Bright Environments</div>
                  </div>
                </div>
                {isHighContrast && (
                  <span className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              <p className="text-[10px] text-neutral-400 leading-relaxed">
                Crisp dark typography on high-luminance white panels. Engineered for crystal-clear readability under bright sunlight & outdoors.
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
                <span className="text-[9px] font-mono text-amber-400/80">Sunlight Optimized</span>
                <div className="flex gap-1 shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-neutral-400"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]"></span>
                </div>
              </div>
            </button>
          </div>

          {/* Instant Feedback Toast */}
          {themeFeedback && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{themeFeedback}</span>
            </div>
          )}

          {/* Collapsible Secondary Mineral Palettes */}
          <div className="pt-1 border-t border-neutral-800/60">
            <button
              type="button"
              onClick={() => setShowAllPalettes(!showAllPalettes)}
              className="w-full flex items-center justify-between text-[11px] text-neutral-400 hover:text-neutral-200 py-1 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                <span>More Mineral Matte Themes (Terracotta, Steel, Chalk)</span>
              </div>
              {showAllPalettes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAllPalettes && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2.5">
                <button
                  id="theme-select-matte-terracotta"
                  type="button"
                  onClick={() => handlePaletteSelect("matte-terracotta")}
                  className={`p-2 rounded-xl border text-[10.5px] text-left transition-all cursor-pointer ${
                    formData.theme === "matte-terracotta"
                      ? "bg-neutral-900 text-white border-neutral-600 ring-1 ring-neutral-500/30 font-bold"
                      : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                  }`}
                >
                  <div className="font-semibold text-neutral-200">Terracotta & Clay</div>
                  <div className="text-[9.5px] text-neutral-500 mb-1.5">Warm earthy stone</div>
                  <div className="flex gap-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#171413] border border-neutral-700"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a86259]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5e7b5e]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a8724d]"></span>
                  </div>
                </button>

                <button
                  id="theme-select-matte-steel"
                  type="button"
                  onClick={() => handlePaletteSelect("matte-steel")}
                  className={`p-2 rounded-xl border text-[10.5px] text-left transition-all cursor-pointer ${
                    formData.theme === "matte-steel"
                      ? "bg-neutral-900 text-white border-neutral-600 ring-1 ring-neutral-500/30 font-bold"
                      : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                  }`}
                >
                  <div className="font-semibold text-neutral-200">Nordic Steel</div>
                  <div className="text-[9.5px] text-neutral-500 mb-1.5">Gunmetal & heather</div>
                  <div className="flex gap-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#12151a] border border-neutral-700"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#476885]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4d7768]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#665b7c]"></span>
                  </div>
                </button>

                <button
                  id="theme-select-matte-chalk"
                  type="button"
                  onClick={() => handlePaletteSelect("matte-chalk-light")}
                  className={`p-2 rounded-xl border text-[10.5px] text-left transition-all cursor-pointer ${
                    formData.theme === "matte-chalk-light"
                      ? "bg-neutral-900 text-white border-neutral-600 ring-1 ring-neutral-500/30 font-bold"
                      : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                  }`}
                >
                  <div className="font-semibold text-neutral-200">Sand & Chalk</div>
                  <div className="text-[9.5px] text-neutral-500 mb-1.5">Soft paper daylight</div>
                  <div className="flex gap-1 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f5f4ef] border border-neutral-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3b614f]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8c423c]"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#385770]"></span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal details */}
        <div className="bg-neutral-800/45 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" /> General Stats
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Patient Name</label>
              <input
                id="edit-profile-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Age (years)</label>
                <input
                  id="edit-profile-age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="Years"
                />
              </div>
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Weight</label>
                <input
                  id="edit-profile-weight"
                  type="text"
                  value={formData.weight || ""}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="e.g. 70 kg or 154 lbs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Diabetes Category</label>
            <select
              id="edit-profile-type"
              value={formData.diabetesType}
              onChange={(e) => setFormData({ ...formData, diabetesType: e.target.value as any })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="Type 2">Type 2 Diabetes (Standard)</option>
              <option value="Type 1">Type 1 Diabetes</option>
              <option value="Gestational">Gestational Diabetes</option>
              <option value="Prediabetes">Prediabetes Category</option>
              <option value="None">None (General Surveillance)</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Active Prescriptions</label>
            <input
              id="edit-profile-meds"
              type="text"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="e.g., Metformin 500mg, Lantus 14 Units"
            />
          </div>
        </div>

        {/* WEIGHT JOURNEY LOG SECTION */}
        <div className="bg-neutral-800/45 p-4 rounded-2xl border border-neutral-800 space-y-3.5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Scale className="w-4 h-4 text-rose-455" /> Weight Tracking Logs
            </h3>
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase">
              {(formData.weightHistory || []).length} Logged Entries
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Record regular body weight checkpoints to trace how weight adjustments correlate to glycemic and insulin efficiency improvements over time.
          </p>

          <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-2.5">
            <span className="text-[10px] font-bold text-neutral-350 block uppercase font-mono">Quick Add Weight Entry</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[9.5px] text-neutral-400 mb-1 font-mono">Date</label>
                <input
                  type="date"
                  value={newWeightDate}
                  onChange={(e) => setNewWeightDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-755 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9.5px] text-neutral-400 mb-1 font-mono">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightVal}
                  onChange={(e) => setNewWeightVal(e.target.value)}
                  placeholder="e.g. 72.4"
                  className="w-full bg-neutral-950 border border-neutral-755 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  id="btn-add-weight bg-rose-600"
                  onClick={handleAddWeight}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-[31px] rounded-lg text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Weight</span>
                </button>
              </div>
            </div>
          </div>

          {/* HISTORICAL WEIGHT LOG TABLE */}
          {(formData.weightHistory || []).length === 0 ? (
            <div className="text-center p-5 bg-neutral-900/40 rounded-xl border border-dashed border-neutral-805 text-[11px] text-neutral-500 italic">
              No weight observations recorded yet. Log your first weight checkpoint above.
            </div>
          ) : (
            <div className="max-h-[180px] overflow-y-auto pr-1 space-y-1.5">
              {[...(formData.weightHistory || [])]
                .sort((a, b) => b.date.localeCompare(a.date)) // newest first in list for high visibility
                .map((wEntry) => (
                  <div key={wEntry.id} className="bg-neutral-900 border border-neutral-805 p-2 rounded-xl flex items-center justify-between text-[11px] font-mono hover:bg-neutral-850 transition-colors">
                    <div className="flex items-center gap-2.5 text-stone-200">
                      <Calendar className="w-3.5 h-3.5 text-neutral-550" />
                      <span>{wEntry.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-white text-xs">{wEntry.weight} kg</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteWeight(wEntry.id)}
                        className="text-stone-500 hover:text-red-400 p-1 rounded hover:bg-black/20 cursor-pointer transition-all shrink-0"
                        title="Delete this observation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Target Thresholds */}
        <div className="bg-neutral-800/45 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <Goal className="w-4 h-4 text-emerald-400" /> Blood Glucose Target Ranges (mg/dL)
          </h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            These ranges govern the color alerts, warning badges, and graphical guides throughout this surveillance dashboard. Consult your medical team for target validation.
          </p>

          <div className="space-y-3">
            <div className="border-t border-neutral-800 pt-2">
              <span className="font-semibold text-neutral-200">Fasting Level Targets</span>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono text-[10px]">Min Normal (mg/dL)</label>
                  <input
                    id="edit-profile-fasting-min"
                    type="number"
                    value={formData.targetFastingMin}
                    onChange={(e) => setFormData({ ...formData, targetFastingMin: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono text-[10px]">Max Normal (mg/dL)</label>
                  <input
                    id="edit-profile-fasting-max"
                    type="number"
                    value={formData.targetFastingMax}
                    onChange={(e) => setFormData({ ...formData, targetFastingMax: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-800 pt-2">
              <span className="font-semibold text-neutral-200">Post-Fasting (After Meal) Targets</span>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono text-[10px]">Min Target (mg/dL)</label>
                  <input
                    id="edit-profile-post-min"
                    type="number"
                    value={formData.targetPostMin}
                    onChange={(e) => setFormData({ ...formData, targetPostMin: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1 font-mono text-[10px]">Max Target (mg/dL)</label>
                  <input
                    id="edit-profile-post-max"
                    type="number"
                    value={formData.targetPostMax}
                    onChange={(e) => setFormData({ ...formData, targetPostMax: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BIOMETRIC & LOCAL SECURITY LOCK CONTROLS */}
        <div className="bg-neutral-850/40 p-4 rounded-2xl border border-neutral-800 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Biometric & Local Passcode Security</h4>
              <p className="text-[10px] text-neutral-400 font-mono">Android BiometricPrompt & PIN Protection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-200 block text-[11px]">Biometric Lock</span>
                <span className="text-[10px] text-neutral-400">Require Fingerprint/PIN on launch</span>
              </div>
              <input
                id="toggle-biometric-lock"
                type="checkbox"
                checked={!!formData.biometricEnabled}
                onChange={(e) => setFormData({ ...formData, biometricEnabled: e.target.checked })}
                className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-mono text-[10px]">4-Digit Passcode PIN</label>
              <input
                id="edit-profile-pin-code"
                type="password"
                maxLength={6}
                value={formData.pinCode || "1234"}
                onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          {isSaved && (
            <div className="mb-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Surveillance targets and security options updated successfully!</span>
            </div>
          )}

          <button
            id="btn-save-profile"
            type="submit"
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-xl border border-neutral-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-none"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Security Settings</span>
          </button>
        </div>

        {/* ACCOUNT DELETION & HEALTH DATA EXPORT (GOOGLE PLAY COMPLIANCE) */}
        <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Account Deletion & Data Rights</h4>
              <p className="text-[10px] text-rose-400 font-mono">Google Play Data Policy Mandate</p>
            </div>
          </div>

          <p className="text-[10.5px] text-neutral-350 leading-relaxed">
            In compliance with Google Play Health policies, you can export your complete health history or permanently request localized deletion of all profile data, logs, and stored settings.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              id="btn-export-all-user-data"
              type="button"
              onClick={onExportData}
              className="flex-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-750 text-cyan-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Health Data</span>
            </button>

            <button
              id="btn-trigger-delete-account"
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Health Data</span>
            </button>
          </div>
        </div>

        {/* ANDROID APP LAUNCH & PWA STANDALONE CARD */}
        <div className="bg-gradient-to-br from-emerald-950/30 via-neutral-900 to-neutral-950 border border-emerald-500/30 p-4 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Smartphone className="w-4 h-4" />
              <span>Android Mobile App Experience</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              WebAPK / PWA
            </span>
          </div>

          <p className="text-[10.5px] text-neutral-350 leading-relaxed">
            Run GlucoGuard as a dedicated, standalone Android application on your device with full home screen integration, offline local database caching, biometric security, and no browser address bar.
          </p>

          <button
            id="btn-profile-launch-android-app"
            type="button"
            onClick={onOpenAndroidModal}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50"
          >
            <Smartphone className="w-4 h-4" />
            <span>Launch / Install as Android App</span>
          </button>
        </div>

        {/* PROMINENT MEDICAL DISCLAIMER CARD */}
        <div className="bg-rose-950/25 border border-rose-500/30 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider font-mono">
              <ShieldAlert className="w-4 h-4" />
              <span>Prominent In-App Medical Disclaimer</span>
            </div>
            {onOpenDisclaimer && (
              <button
                id="btn-open-prominent-disclaimer"
                type="button"
                onClick={onOpenDisclaimer}
                className="text-[10px] text-rose-400 hover:underline font-bold cursor-pointer"
              >
                View Full Disclaimer
              </button>
            )}
          </div>
          <p className="text-[11px] text-rose-200/90 leading-relaxed italic font-serif">
            &ldquo;This application is intended for informational and self-monitoring purposes only. It does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making clinical decisions.&rdquo;
          </p>
        </div>

        {/* Play Store Compliance Info & Local Privacy */}
        <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-2xl space-y-3.5">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Play Store Privacy Compliance</h4>
              <p className="text-[10px] text-neutral-400 font-mono mt-0.5">HIPAA-Aligned Local Storage Sandbox</p>
            </div>
          </div>

          <p className="text-[10.5px] text-neutral-350 leading-relaxed">
            All registered values, blood sugar logs, fasting timers, medication intake registers, and water levels remain <span className="text-white font-bold">100% on this device</span>. Deleting the application immediately purges all tracking records safely.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              id="btn-trigger-privacy-modal"
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="flex-1 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl py-2 px-3 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Read Full Privacy Policy</span>
            </button>
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-sky-955/20 hover:bg-sky-955/40 border border-sky-500/20 text-sky-450 hover:text-sky-350 rounded-xl py-2 px-3 text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center text-decoration-none"
            >
              <span>Open Public URL Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-2.5 bg-neutral-900/60 rounded-xl text-[9.5px] leading-relaxed text-slate-400 font-mono italic flex items-center justify-between">
            <span>Play Store developer listing URL:</span>
            <span className="text-sky-400 font-bold select-all">/privacy</span>
          </div>
        </div>
      </form>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-rose-500/50 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 border-b border-rose-500/20 pb-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirm Permanent Deletion</h3>
                <p className="text-[10px] text-rose-400 font-mono">Irreversible Account & Health Data Purge</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              This action will permanently delete all blood glucose logs, food journals, medication records, weight history, and user profiles stored in this application sandbox.
            </p>

            <div>
              <label className="block text-[10px] text-neutral-400 mb-1 font-mono">Type &ldquo;DELETE&rdquo; to confirm:</label>
              <input
                id="input-confirm-delete-text"
                type="text"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-neutral-950 border border-neutral-750 rounded-xl px-3 py-2 text-rose-400 font-bold font-mono text-center text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                }}
                className="flex-1 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteConfirmInput.trim().toUpperCase() !== "DELETE"}
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmInput("");
                  if (onDeleteAccountData) onDeleteAccountData();
                }}
                className={`flex-1 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer text-center ${
                  deleteConfirmInput.trim().toUpperCase() === "DELETE"
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-950/40"
                    : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                }`}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded interactive privacy modal dialog */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-neutral-850 w-full max-w-lg rounded-2xl flex flex-col max-h-[85vh] shadow-2xl animate-scaleUp">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase text-white tracking-widest font-mono">Full Compliance Disclosure</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
                aria-label="Close Privacy Policy Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Text Content */}
            <div className="p-5 overflow-y-auto text-xs space-y-4 text-neutral-300 leading-relaxed font-sans">
              <div className="bg-slate-950/65 border border-slate-900/60 p-4 rounded-xl space-y-1.5">
                <div className="text-[10px] text-sky-400 font-mono font-bold tracking-wider uppercase">Active Surveillance Shield</div>
                <h4 className="text-sm font-extrabold text-white">Diabetes Surveillance Privacy Policy</h4>
                <p className="text-[10px] text-neutral-500 font-mono">Last updated: June 3, 2026</p>
              </div>

              <div>
                <h5 className="font-bold text-white text-xs mb-1">1. Developer Information</h5>
                <p>Managed and updated by Eagle Dares Development Team. For support or HIPAA validation inquiries, email: <a href="mailto:eagledares@gmail.com" class="text-sky-400 underline font-mono">eagledares@gmail.com</a>.</p>
              </div>

              <div>
                <h5 className="font-bold text-white text-xs mb-1">2. Secure Local Sandbox Model</h5>
                <p>The Application processes all tracked blood sugar values, fasting timetables, pill adherence logs, and fluid intake levels directly in your device’s sandbox storage. No automatic data transmission, registration, or telemetry is forced onto third-party systems.</p>
              </div>

              <div>
                <h5 className="font-bold text-white text-xs mb-1">3. Wearables and OAuth Proxies</h5>
                <p>If utilizing Glooko, Dexcom, or Spike continuous glucose platforms, API integrations are handled as user-authorized HTTPS requests. Your API keys are kept safely inside local application storage or secure container secrets, maintaining extreme communication privacy.</p>
              </div>

              <div>
                <h5 className="font-bold text-white text-xs mb-1">4. Generative AI Information and Reports</h5>
                <p>To analyze medications or custom food recipes safely, medical queries are analyzed over secure API pipelines using Gemini AI models. Individual tracking prompts do not link your primary identifying credentials, which keeps AI diagnostic queries entirely confidential.</p>
              </div>

              <div>
                <h5 className="font-bold text-white text-xs mb-1">5. HIPAA Compliance alignment</h5>
                <p>Your records do not pass through corporate external database servers, so the publisher is not a Covered Entity under HIPAA definition. However, standard local filesystem encryptions protect database fields on Android and iOS hardware platforms.</p>
              </div>

              <div className="p-2.5 bg-neutral-950 border border-neutral-900 text-[10px] text-rose-400 rounded-lg">
                <strong>Precautionary Disclaimer:</strong> Surveillance charts and summaries are for diagnostic tracking. They do not constitute official treatment advice. Always cross-reference with your active healthcare provider.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-900 bg-neutral-950/60 rounded-b-2xl flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="bg-blue-600 hover:bg-blue-650 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer select-none"
              >
                Accept and Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
