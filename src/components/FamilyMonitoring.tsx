import React, { useState } from "react";
import { Users, Phone, Send, AlertTriangle, ShieldCheck, Share2, MessageCircle, PlusCircle, Trash2, Copy, Check, Crown, Sparkles } from "lucide-react";
import { UserProfile, GlucoseReading } from "../types";

interface FamilyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isEmergencyContact: boolean;
}

interface FamilyMonitoringProps {
  profile: UserProfile;
  readings: GlucoseReading[];
  onOpenMonetizationHub?: () => void;
}

export const FamilyMonitoring: React.FC<FamilyMonitoringProps> = ({
  profile,
  readings,
  onOpenMonetizationHub
}) => {
  const [familyContacts, setFamilyContacts] = useState<FamilyContact[]>(() => {
    const saved = localStorage.getItem("dia_family_contacts");
    return saved ? JSON.parse(saved) : [
      { id: "fc1", name: "Sara Nadeem", relation: "Spouse", phone: "+15550192834", isEmergencyContact: true },
      { id: "fc2", name: "Dr. Hassan Reza", relation: "Endocrinologist", phone: "+15550183746", isEmergencyContact: false }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("Spouse");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const familySyncCode = "DIA-PAT-8821-SYNC";

  const latestReading = readings.length ? readings[0] : null;

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const updated = [
      ...familyContacts,
      {
        id: `fc-${Date.now()}`,
        name: newContactName,
        relation: newContactRelation,
        phone: newContactPhone,
        isEmergencyContact: isEmergency
      }
    ];
    setFamilyContacts(updated);
    localStorage.setItem("dia_family_contacts", JSON.stringify(updated));
    setNewContactName("");
    setNewContactPhone("");
    setShowAddModal(false);
  };

  const handleDeleteContact = (id: string) => {
    const updated = familyContacts.filter(c => c.id !== id);
    setFamilyContacts(updated);
    localStorage.setItem("dia_family_contacts", JSON.stringify(updated));
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(familySyncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const openExternalLinkSafely = (url: string) => {
    try {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.location.href = url;
    }
  };

  // WhatsApp Message Builders
  const sendWhatsAppSummary = (phoneNum?: string) => {
    const text = encodeURIComponent(
      `🟢 *Diabetes Health Report for ${profile.name}*\n` +
      `-----------------------------------\n` +
      `• *Latest Glucose:* ${latestReading ? `${latestReading.value} mg/dL (${latestReading.type === "fasting" ? "Fasting" : "Post-Meal"})` : "N/A"}\n` +
      `• *Status:* ${latestReading ? latestReading.category : "Normal"}\n` +
      `• *Diabetes Type:* ${profile.diabetesType}\n` +
      `• *Target Range:* ${profile.targetFastingMin}-${profile.targetFastingMax} mg/dL\n` +
      `-----------------------------------\n` +
      `Sent via Diabetes Surveillance Platform.`
    );
    const cleanPhone = phoneNum ? phoneNum.replace(/[^\d+]/g, "") : "";
    openExternalLinkSafely(`https://wa.me/${cleanPhone}?text=${text}`);
  };

  const sendWhatsAppHypoAlert = (phoneNum?: string) => {
    const text = encodeURIComponent(
      `🚨 *HYPOGLYCEMIA EMERGENCY ALERT*\n` +
      `-----------------------------------\n` +
      `Patient: *${profile.name}*\n` +
      `Blood Sugar dropped to: *${latestReading ? latestReading.value : 62} mg/dL*!\n` +
      `Time: ${latestReading ? `${latestReading.date} ${latestReading.time}` : new Date().toLocaleTimeString()}\n` +
      `Action Taken: Rule of 15 Protocol initiated.\n` +
      `Please check on ${profile.name} immediately if needed.\n` +
      `-----------------------------------`
    );
    const cleanPhone = phoneNum ? phoneNum.replace(/[^\d+]/g, "") : "";
    openExternalLinkSafely(`https://wa.me/${cleanPhone}?text=${text}`);
  };

  const sendWhatsAppMedsStatus = (phoneNum?: string) => {
    const text = encodeURIComponent(
      `💊 *Medication Adherence Update*\n` +
      `Patient: *${profile.name}*\n` +
      `Status: Morning & Evening diabetes prescriptions recorded successfully.\n` +
      `Medications: ${profile.medications || "Metformin & Basal Insulin"}`
    );
    const cleanPhone = phoneNum ? phoneNum.replace(/[^\d+]/g, "") : "";
    openExternalLinkSafely(`https://wa.me/${cleanPhone}?text=${text}`);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-neutral-900 border border-emerald-900/40 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                Family & Caregiver Monitoring
              </h2>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold flex items-center gap-1">
                <Crown className="w-2.5 h-2.5 text-purple-400" />
                Caregiver Plan ($14.99/mo)
              </span>
            </div>
            <p className="text-[10px] text-neutral-300">
              WhatsApp Alert System & Remote Family Sync
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Caregiver</span>
        </button>
      </div>

      {/* Free Tier Caregiver Guard Upgrade Promo Banner */}
      {(!profile.membershipTier || profile.membershipTier === "free") && onOpenMonetizationHub && (
        <div className="p-3 bg-gradient-to-r from-purple-950/40 via-neutral-900 to-purple-950/40 border border-purple-500/35 rounded-2xl flex items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">
                Remote Family Guard is a Premium Subscription Tier
              </span>
              <p className="text-[10px] text-neutral-300">
                Unlock multi-patient remote profiles (up to 5 family members) and real-time WhatsApp hypoglycemia alerts for $14.99/mo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenMonetizationHub}
            className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-mono font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>View Plans</span>
          </button>
        </div>
      )}

      {/* Patient Live Status Banner for Family */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <div className="flex justify-between items-center text-xs border-b border-neutral-800 pb-2">
          <span className="font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Remote Patient Live Status
          </span>
          <span className="text-[9.5px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono">
            Active Caregiver Stream
          </span>
        </div>

        <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 font-mono block">Patient Name</span>
            <span className="text-sm font-bold text-white block">{profile.name} ({profile.diabetesType})</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-neutral-400 font-mono block">Latest Blood Sugar</span>
            {latestReading ? (
              <span className={`text-base font-black font-mono ${
                latestReading.value < 70 ? "text-rose-400" :
                latestReading.value > 180 ? "text-rose-400" :
                "text-emerald-400"
              }`}>
                {latestReading.value} <span className="text-[10px] text-neutral-500">mg/dL</span>
              </span>
            ) : (
              <span className="text-sm font-bold text-emerald-400 font-mono">102 mg/dL</span>
            )}
          </div>
        </div>

        {/* Remote Sync Passcode Box */}
        <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[9.5px] text-neutral-400 font-mono block">Family Remote Sync Passcode</span>
            <span className="font-bold font-mono text-emerald-400">{familySyncCode}</span>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all font-mono"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>
      </div>

      {/* WhatsApp One-Click Notification Actions */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-emerald-900/30 p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">WhatsApp Caregiver Notifications</h3>
            <p className="text-[9.5px] text-neutral-400 font-mono">Send instant pre-formatted updates to family on WhatsApp</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => sendWhatsAppSummary()}
            className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-left space-y-1 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-bold text-xs">Glucose Report</span>
              <MessageCircle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight">Share today's blood sugar logs & targets on WhatsApp</p>
          </button>

          <button
            onClick={() => sendWhatsAppHypoAlert()}
            className="p-3 bg-rose-950/20 hover:bg-rose-950/30 border border-rose-500/30 hover:border-rose-500/50 rounded-xl text-left space-y-1 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-rose-400">
              <span className="font-bold text-xs flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Hypo Emergency Alert
              </span>
              <MessageCircle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-rose-300/80 leading-tight">Broadcast immediate low sugar warning to family</p>
          </button>

          <button
            onClick={() => sendWhatsAppMedsStatus()}
            className="p-3 bg-neutral-950 hover:bg-neutral-900 border border-indigo-500/20 hover:border-indigo-500/40 rounded-xl text-left space-y-1 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-indigo-400">
              <span className="font-bold text-xs">Meds Update</span>
              <MessageCircle className="w-4 h-4" />
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight">Confirm medicine & insulin doses taken today</p>
          </button>
        </div>
      </div>

      {/* Caregiver Contacts List */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-neutral-800 pb-2">
          Saved Family Contacts ({familyContacts.length})
        </h3>

        <div className="space-y-2">
          {familyContacts.map((contact) => (
            <div key={contact.id} className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${contact.isEmergencyContact ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{contact.name}</span>
                    <span className="text-[9px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono">{contact.relation}</span>
                    {contact.isEmergencyContact && (
                      <span className="text-[8.5px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-bold border border-rose-500/20">
                        Emergency
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{contact.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => sendWhatsAppSummary(contact.phone)}
                  className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Send WhatsApp Report"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-400 rounded-lg cursor-pointer transition-all"
                  title="Delete Contact"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-sm w-full space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-white text-sm font-mono flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> Add Caregiver Contact
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="text-[10px] text-neutral-400 font-mono block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Sara Nadeem"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-mono block mb-1">Relation</label>
                <select
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Son/Daughter">Son / Daughter</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Endocrinologist">Endocrinologist / Doctor</option>
                  <option value="Friend/Caregiver">Friend / Caregiver</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-mono block mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="+1 555 019 2834"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-emergency"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="rounded bg-neutral-950 border-neutral-800 text-rose-500 focus:ring-rose-500"
                />
                <label htmlFor="chk-emergency" className="text-[11px] text-neutral-300 font-medium">
                  Designate as Primary Emergency Contact
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-all shadow-md"
              >
                Save Family Contact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
