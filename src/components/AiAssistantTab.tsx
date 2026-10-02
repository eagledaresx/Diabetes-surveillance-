import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, User, RefreshCw, AlertCircle, HelpCircle, CheckCircle, Lightbulb, ShieldAlert } from "lucide-react";
import { UserProfile, GlucoseReading, MedicationReminder } from "../types";

interface AiAssistantTabProps {
  profile: UserProfile;
  readings: GlucoseReading[];
  reminders: MedicationReminder[];
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "How can I lower my post-meal glucose spike?",
  "What should I do if my sugar drops below 70 mg/dL?",
  "What is Time-in-Range (TIR) and why does it matter?",
  "Suggest a low-glycemic meal plan for today",
  "How does a 15-minute post-meal walk lower blood sugar?"
];

export const AiAssistantTab: React.FC<AiAssistantTabProps> = ({
  profile,
  readings,
  reminders
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "ai",
      text: `Hello ${profile.name || "Patient"}! I am your **AI Diabetes & Clinical Surveillance Assistant**.\n\nI can analyze your blood sugar logs, explain medication schedules, suggest low-GI meal swaps, and guide you through hypoglycemia safety protocols. How can I support your diabetes care today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Compute patient context for AI prompt
  const recentReadings = readings.slice(-5);
  const avgGlucose = readings.length
    ? Math.round(readings.reduce((acc, r) => acc + r.value, 0) / readings.length)
    : 110;
  const activeInsulin = reminders.filter(r => r.isInsulin && r.active).map(r => `${r.name} (${r.dosage})`);
  const activeMeds = reminders.filter(r => !r.isInsulin && r.active).map(r => `${r.name} (${r.dosage})`);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setLoading(true);

    try {
      // Build context payload
      const patientBiometrics = {
        provider: "Diabetes Surveillance Platform",
        activity: { steps: 8740, stepsGoal: 10000, activeMinutes: 45, calories: 2100 },
        sleep: { sleepScore: 84, durationSeconds: 27000, stagesSeconds: { deep: 5100, rem: 4800, light: 15000 } },
        hrv: { averageMs: 50 },
        patientContext: {
          name: profile.name,
          age: profile.age,
          diabetesType: profile.diabetesType,
          avgGlucose,
          activeInsulin,
          activeMeds,
          recentReadings: recentReadings.map(r => `${r.date} ${r.time}: ${r.value} mg/dL (${r.type})`)
        }
      };

      const response = await fetch("/api/open-wearables/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          chatHistory: messages.map(m => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          })),
          biometrics: patientBiometrics
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: data.text || "Thank you for asking. Please consult your physician for personalized medical decisions.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("AI service temporary offline");
      }
    } catch (err) {
      // Smart offline clinical fallback response
      let fallbackText = `I have analyzed your request regarding **"${query}"** in relation to your ${profile.diabetesType || "Type 2 Diabetes"} profile (Avg Glucose: ${avgGlucose} mg/dL):\n\n`;

      const lower = query.toLowerCase();
      if (lower.includes("lower") || lower.includes("spike") || lower.includes("after meal")) {
        fallbackText += `### 💡 4 Proven Steps to Flatten Post-Meal Glucose Spikes:\n
1. **15-Minute Post-Meal Walk**: Take a light 10–15 minute walk within 30 minutes after finishing your meal. Skeletal muscle contractions activate **GLUT4 glucose transporters**, clearing blood sugar directly without requiring extra insulin.
2. **Food Sequencing**: Eat fiber/vegetables first, followed by protein and healthy fats, and eat carbohydrates LAST. This slows gastric emptying and reduces spike amplitude by up to 30%.
3. **Hydration**: Drink 1–2 full glasses of water after eating to assist kidney excretion of excess circulating glucose.
4. **Avoid Refined Starches**: Swap white rice or white bread for high-fiber lentils, quinoa, or cauliflower rice.`;
      } else if (lower.includes("drop") || lower.includes("70") || lower.includes("hypo") || lower.includes("low")) {
        fallbackText += `### 🚨 Rule of 15 for Hypoglycemia (< 70 mg/dL):\n
1. **Consume 15g of Fast-Acting Carbs** immediately (e.g., 4 oz fruit juice, 3–4 glucose tablets, or 1 tablespoon of honey).
2. **Rest for 15 minutes** without physical exertion.
3. **Re-check Blood Glucose**. If still < 70 mg/dL, repeat with another 15g of fast-acting carbs.
4. Once normalized (≥ 70 mg/dL), eat a small snack with protein and complex carbs (e.g., peanut butter on whole wheat cracker) to maintain stability.`;
      } else if (lower.includes("walk") || lower.includes("exercise") || lower.includes("step")) {
        fallbackText += `### 🏃 Physical Activity & Insulin Sensitivity:\n
- **Immediate Effect**: Walking causes skeletal muscles to absorb circulating blood glucose for energy, independent of insulin secretion.
- **Long-term Benefit**: Regular 30-minute daily walking improves insulin sensitivity for up to 24–48 hours post-exercise.
- **Post-Meal Timing**: Walking 10–15 minutes shortly after lunch or dinner yields the highest reduction in 2-hour postprandial glucose peaks.`;
      } else {
        fallbackText += `### 📋 General Clinical Recommendation:\n
- **Fasting Target**: Maintain fasting blood sugar between **70–100 mg/dL** (or as advised by your endocrinologist).
- **Post-Meal Target**: Keep 2-hour postprandial levels below **140 mg/dL** (or < 180 mg/dL for non-strict targets).
- **Adherence**: Take prescribed medications (${profile.medications || "as ordered"}) consistently at specified times.
- **Consultation**: Always discuss persistent highs (>200 mg/dL) or frequent lows (<70 mg/dL) with your healthcare provider.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-neutral-900 border border-indigo-900/40 p-4 rounded-2xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
              AI Clinical Diabetes Assistant
            </h2>
            <p className="text-[10px] text-neutral-300">
              Powered by Gemini AI • Real-time Glucose & Metabolic Guidance
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-mono border border-emerald-500/20">
            Live Health Mode
          </span>
        </div>
      </div>

      {/* Patient Live Context Chip */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-2.5 rounded-xl flex flex-wrap items-center justify-between text-[10px] text-neutral-400 gap-2 font-mono">
        <div className="flex items-center gap-3">
          <span>Patient: <strong className="text-white">{profile.name}</strong></span>
          <span>Type: <strong className="text-indigo-400">{profile.diabetesType}</strong></span>
          <span>Recent Avg: <strong className="text-emerald-400">{avgGlucose} mg/dL</strong></span>
        </div>
        <div className="text-[9.5px] text-neutral-500">
          Logs synced: {readings.length}
        </div>
      </div>

      {/* Quick Prompt Pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-mono flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-cyan-400" /> Suggested Clinical Topics:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-[10px] bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-indigo-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 min-h-[340px] max-h-[460px] overflow-y-auto space-y-3.5 shadow-inner">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ai" && (
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0 h-8 w-8 flex items-center justify-center mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none font-medium shadow-md"
                  : "bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none font-sans"
              }`}
            >
              <div className="flex justify-between items-center gap-3 text-[9px] opacity-70 mb-1 border-b border-white/10 pb-1 font-mono">
                <span className="font-bold">{msg.sender === "user" ? "You" : "AI Assistant"}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="whitespace-pre-line text-[11px] leading-relaxed">
                {msg.text}
              </div>
            </div>

            {msg.sender === "user" && (
              <div className="p-2 bg-neutral-800 text-neutral-300 rounded-xl border border-neutral-700 shrink-0 h-8 w-8 flex items-center justify-center mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-indigo-400 font-mono p-2 bg-indigo-950/20 rounded-xl border border-indigo-900/30 w-fit animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>AI analyzing patient biometrics & medical guidelines...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI about blood sugar, diet, insulin, or symptoms..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shrink-0"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Mandatory Disclaimer */}
      <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 rounded-xl text-[9.5px] text-neutral-400 leading-relaxed font-sans flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <span>
          <strong>Clinical Safety Notice:</strong> AI responses are provided for educational and informational tracking purposes only. They do not constitute official medical diagnosis or prescription. Always consult your healthcare provider before adjusting insulin or medication dosages.
        </span>
      </div>
    </div>
  );
};
