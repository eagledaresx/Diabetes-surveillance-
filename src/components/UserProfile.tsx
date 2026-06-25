import React, { useState, useEffect } from "react";
import { UserProfile as UserProfileType, WeightHistoryEntry } from "../types";
import { User, Activity, Goal, Save, CheckCircle, Palette, ShieldCheck, ExternalLink, X, Scale, Trash2, Plus, Calendar, UserPlus, Check } from "lucide-react";

interface UserProfileProps {
  profile: UserProfileType;
  profiles?: UserProfileType[];
  activeProfileId?: string;
  onSwitchProfile?: (id: string) => void;
  onCreateProfile?: (name: string, diabetesType: UserProfileType["diabetesType"]) => void;
  onDeleteProfile?: (id: string) => void;
  onSave: (updated: UserProfileType) => void;
}

export default function UserProfile({ 
  profile, 
  profiles = [], 
  activeProfileId, 
  onSwitchProfile, 
  onCreateProfile, 
  onDeleteProfile, 
  onSave 
}: UserProfileProps) {
  const [formData, setFormData] = useState<UserProfileType>({ ...profile });
  const [isSaved, setIsSaved] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

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
    const currentTheme = formData.theme || "dark";
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [formData.theme]);

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
          <h2 className="text-lg font-bold text-white">Patient Profile</h2>
          <p className="text-xs text-neutral-400 font-mono">Customize surveillance thresholds</p>
        </div>
      </div>

      {/* Profiles Switcher & Creation Panel */}
      {profiles.length > 0 && (
        <div className="bg-neutral-850/45 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-neutral-800/60">
            <h3 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-500" /> Patient Profiles Directory
            </h3>
            <button
              id="btn-create-profile-trigger"
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-600/10 text-amber-400 hover:bg-amber-600/20 border border-amber-500/20 px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
                      ? "bg-neutral-900 border-amber-500 text-white shadow-md shadow-amber-950/10"
                      : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700/80 hover:text-neutral-350"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-amber-500/25 text-amber-400" : "bg-neutral-850 text-neutral-500"}`}>
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
                      <span className="p-1 bg-amber-500/20 text-amber-400 rounded-full">
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
                <UserPlus className="w-4 h-4 text-amber-400" />
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
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium font-mono">Diabetes Type</label>
                <select
                  value={newProfileType}
                  onChange={(e) => setNewProfileType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-750 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
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

        {/* Display Settings & Accessibility */}
        <div className="bg-neutral-800/45 p-4 rounded-2xl border border-neutral-800 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" /> Theme & Readability
          </h3>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Choose between standard dark visual elements or a high-contrast light mode optimized for daylight monitoring or enhanced legibility.
          </p>

          <div>
            <label className="block text-neutral-400 mb-1.5 font-medium">Display Theme Mode</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                id="theme-select-dark"
                type="button"
                onClick={() => setFormData({ ...formData, theme: "dark" })}
                className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  (formData.theme || "dark") === "dark"
                    ? "bg-neutral-900 text-white border-sky-400 shadow-md ring-1 ring-sky-500/20"
                    : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 bg-zinc-950 rounded-full border border-white/20"></span>
                <span>Dark Mode</span>
              </button>

              <button
                id="theme-select-light"
                type="button"
                onClick={() => setFormData({ ...formData, theme: "high-contrast-light" })}
                className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  formData.theme === "high-contrast-light"
                    ? "bg-neutral-100 text-neutral-950 border-sky-500 shadow-md ring-1 ring-sky-400/20"
                    : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 bg-neutral-100 rounded-full border border-black/20"></span>
                <span>High Contrast Light</span>
              </button>
            </div>
          </div>
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

        {/* Submit */}
        <div className="pt-2">
          {isSaved && (
            <div className="mb-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Surveillance targets and details updated successfully!</span>
            </div>
          )}

          <button
            id="btn-save-profile"
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-sky-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile & Targets</span>
          </button>
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

              <div className="p-2.5 bg-neutral-950 border border-neutral-900 text-[10px] text-amber-500 rounded-lg">
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
