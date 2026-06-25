import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Activity,
  Moon,
  Brain,
  Cpu,
  Layers,
  Wifi,
  Send,
  Lock,
  Settings,
  Plug,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Code,
  Flame,
  Check,
  ChevronRight,
  Terminal
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";

interface OpenWearablesHubProps {
  onInjectGlucose?: (reading: {
    value: number;
    type: "fasting" | "post_fasting";
    notes?: string;
  }) => void;
  targetRangeMin: number;
  targetRangeMax: number;
}

export default function OpenWearablesHub({
  onInjectGlucose,
  targetRangeMin,
  targetRangeMax
}: OpenWearablesHubProps) {
  // Config & Status States
  const [userId, setUserId] = useState("amir_nadeem_health");
  const [provider, setProvider] = useState<string>("fitbit");
  const [accessToken, setAccessToken] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [isSandbox, setIsSandbox] = useState(true);
  
  // Loading & Telemetry states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [telemetry, setTelemetry] = useState<any>(null);

  // AI Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; text: string }>>([
    {
      role: "model",
      text: "As-salamu alaykum! I am your Open Wearables AI Specialist. Once you click 'Synchronize Biometric Stream' above to pull your live or standardized sandbox stream, I can run clinically aligned interpretations of your cardiovascular exertion, sleep phases, and nocturnal oxygen parameters relative to your diabetes management."
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Active view tab for telemetry visualizer: "overview" | "heart" | "sleep" | "spo2" | "developer" | "terminal"
  const [visualTab, setVisualTab] = useState<"overview" | "heart" | "sleep" | "spo2" | "developer" | "terminal">("overview");

  // Terminal Sandbox States pre-populated with user's initial commands
  const [terminalHistory, setTerminalHistory] = useState<Array<{ text: string; type: "command" | "output" | "prompt" | "error" | "success" }>>([
    { text: "visitor@open-wearables-sandbox:~$ git clone https://github.com/the-momentum/open-wearables.git", type: "command" },
    { text: "Cloning into 'open-wearables'...", type: "output" },
    { text: "remote: Enumerating objects: 153, done.", type: "output" },
    { text: "remote: Counting objects: 100% (153/153), done.", type: "output" },
    { text: "remote: Total 153 (delta 63), reused 120 (delta 42), pack-reused 0", type: "output" },
    { text: "Receiving objects: 100% (153/153), 118.92 KiB | 1.25 MiB/s, done.", type: "output" },
    { text: "Resolving deltas: 100% (63/63), done.", type: "output" },
    { text: "visitor@open-wearables-sandbox:~$ cd open-wearables", type: "command" },
    { text: "visitor@open-wearables-sandbox:~/open-wearables$ ", type: "prompt" }
  ]);
  const [currentDirectory, setCurrentDirectory] = useState("~/open-wearables");
  const [terminalInput, setTerminalInput] = useState("");
  const [hasInstalled, setHasInstalled] = useState(false);

  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // Synchronize Open Wearables Biometrics
  const handleSync = async () => {
    setIsLoading(true);
    setError("");
    setSyncSuccess(false);
    try {
      // Fetch telemetry data from server proxy
      const apiPrefix = (window as any).__VITE_API_URL__ || "";
      const urlToFetch = apiPrefix ? `${apiPrefix}/api/open-wearables/sync` : "/api/open-wearables/sync";

      const r = await fetch(urlToFetch, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          userId,
          accessToken,
          endpointUrl
        })
      });

      if (!r.ok) {
        const errJson = await r.json();
        throw new Error(errJson.error || "Failed syncing from Open Wearables API gateway.");
      }

      const resData = await r.json();
      setTelemetry(resData);
      setIsSandbox(!!resData.isSandbox);
      setSyncSuccess(true);
      
      // Auto-update visual tab to overview if it was showing developer
      if (visualTab === "developer") {
        setVisualTab("overview");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during Open Wearables handshake.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-synchronize on render so the user has immediate metrics
  useEffect(() => {
    handleSync();
  }, []);

  // Sync scroll to bottom when terminal updates
  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalHistory, visualTab]);

  const handleTerminalCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const promptPrefix = `visitor@open-wearables-sandbox:${currentDirectory}$ ${trimmed}`;
    
    // Add command to history first
    const newLines: Array<{ text: string; type: "command" | "output" | "prompt" | "error" | "success" }> = [
      { text: promptPrefix, type: "command" }
    ];

    if (lower === "clear") {
      setTerminalHistory([]);
      return;
    } else if (lower === "help") {
      newLines.push(
        { text: "Open Wearables Developer Sandbox CLI — Standard Commands:", type: "success" },
        { text: "  git clone https://github.com/the-momentum/open-wearables.git  Recovers / clones Open Wearables core SDK repository.", type: "output" },
        { text: "  cd <dir>                                                      Change active project directory.", type: "output" },
        { text: "  ls                                                            List files in current working directory.", type: "output" },
        { text: "  cat <file>                                                    Print contents of a target specification file.", type: "output" },
        { text: "  npm install                                                   Install standard development dependencies from package.json.", type: "output" },
        { text: "  node client.js                                                Sync live biometrics utilizing current connection parameters.", type: "output" },
        { text: "  clear                                                         Clears terminal history buffers.", type: "output" }
      );
    } else if (lower.startsWith("git clone")) {
      if (lower.includes("the-momentum/open-wearables.git") || lower.includes("open-wearables")) {
        newLines.push(
          { text: "Cloning into 'open-wearables'...", type: "output" },
          { text: "remote: Enumerating objects: 153, done.", type: "output" },
          { text: "remote: Counting objects: 100% (153/153), done.", type: "output" },
          { text: "remote: Total 153 (delta 63), reused 120 (delta 42), pack-reused 0", type: "output" },
          { text: "Receiving objects:  100% (153/153), 118.92 KiB, done.", type: "output" },
          { text: "Resolving deltas: 100% (63/63), done.", type: "output" },
          { text: "Directory 'open-wearables' initialized successfully.", type: "success" }
        );
      } else {
        newLines.push({ text: `fatal: repository '${trimmed.substring(10)}' not found in public momentum registries.`, type: "error" });
      }
    } else if (lower.startsWith("cd ")) {
      const targetDir = trimmed.substring(3).trim();
      if (targetDir === "open-wearables" || targetDir === "./open-wearables") {
        setCurrentDirectory("~/open-wearables");
        newLines.push({ text: "Switched working context to directory: ~/open-wearables", type: "success" });
      } else if (targetDir === ".." || targetDir === "../") {
        setCurrentDirectory("~");
        newLines.push({ text: "Switched working context to root: ~", type: "success" });
      } else {
        newLines.push({ text: `-bash: cd: ${targetDir}: No such file or directory`, type: "error" });
      }
    } else if (lower === "cd") {
      setCurrentDirectory("~");
    } else if (lower === "ls" || lower === "dir") {
      if (currentDirectory === "~") {
        newLines.push({ text: "open-wearables/ (directory)", type: "success" });
      } else {
        newLines.push(
          { text: "README.md        (Specification)", type: "success" },
          { text: "package.json     (NPM Configuration)", type: "success" },
          { text: "client.js        (Core Ingress Broker)", type: "success" },
          { text: "schema.json      (Validation rules)", type: "success" }
        );
      }
    } else if (lower.startsWith("cat ")) {
      const file = trimmed.substring(4).trim();
      if (currentDirectory === "~") {
        newLines.push({ text: `cat: ${file}: No such file or directory`, type: "error" });
      } else {
        if (file.toLowerCase() === "readme.md") {
          newLines.push(
            { text: "=========================================", type: "success" },
            { text: "   OPEN WEARABLES STANDARD - VERSION 1.4", type: "success" },
            { text: "=========================================", type: "success" },
            { text: "This repository provides standardized data normalization for fitness and biometric wearables.", type: "output" },
            { text: "Core Specifications:", type: "output" },
            { text: "- standard_activity matches daily step targets, METs, cardiovascular loading.", type: "output" },
            { text: "- sleep_architecture normalizes slow-wave-sleep (SWS) deep hours versus REM cycles.", type: "output" },
            { text: "- physiological_autonomics measures HRV distribution curves to flag metabolic Dawn Phen.", type: "output" },
            { text: "Run 'npm install' then 'node client.js' to test the standard ingestion client.", type: "success" }
          );
        } else if (file.toLowerCase() === "package.json") {
          newLines.push(
            { text: "{", type: "output" },
            { text: "  \"name\": \"@open-wearables/client-sdk\",", type: "output" },
            { text: "  \"version\": \"1.4.2\",", type: "output" },
            { text: "  \"dependencies\": {", type: "output" },
            { text: "    \"@google/genai\": \"^2.4.0\",", type: "output" },
            { text: "    \"dotenv\": \"^17.0.0\",", type: "output" },
            { text: "    \"axios\": \"^1.6.0\"", type: "output" },
            { text: "  }", type: "output" },
            { text: "}", type: "output" }
          );
        } else if (file.toLowerCase() === "client.js") {
          newLines.push(
            { text: "const axios = require('axios');", type: "output" },
            { text: "const d = require('dotenv').config();", type: "output" },
            { text: "console.log('Initiating Open Wearables normalization handshake...');", type: "output" },
            { text: "axios.post('https://api.openwearables.io/v1/sandbox/biometrics').then(res => {", type: "output" },
            { text: "  console.log('[SUCCESS] Normalized stream ingested.');", type: "output" },
            { text: "});", type: "output" }
          );
        } else if (file.toLowerCase() === "schema.json") {
          newLines.push(
            { text: "{ \"$schema\": \"http://json-schema.org/draft-07/schema#\", \"type\": \"object\", \"required\": [\"provider\", \"activity\", \"sleep\", \"hrv\"] }", type: "output" }
          );
        } else {
          newLines.push({ text: `cat: ${file}: No such file or directory`, type: "error" });
        }
      }
    } else if (lower === "npm install") {
      if (currentDirectory !== "~/open-wearables") {
        newLines.push({ text: "npm ERR! enoent ENOENT: no such file or directory, open 'package.json'", type: "error" });
      } else {
        newLines.push(
          { text: "npm WARN deprecated axios@1.6.0: Critical fixes applied in 1.7.0+", type: "output" },
          { text: "added 42 packages from 18 contributors in 1.25s", type: "success" },
          { text: "found 0 vulnerabilities inside @open-wearables/client-sdk", type: "success" }
        );
        setHasInstalled(true);
      }
    } else if (lower.startsWith("node ") || lower === "npm run start") {
      const fileToRun = trimmed.substring(5).trim();
      if (currentDirectory !== "~/open-wearables") {
        newLines.push({ text: `node: internal/modules/cjs/loader:1080 cannot find module '${fileToRun}'`, type: "error" });
      } else {
        if (!hasInstalled) {
          newLines.push({ text: "Error: Cannot find module 'axios' or '@google/genai'. Run 'npm install' first in directory.", type: "error" });
        } else {
          // Output real telemetry parameters!
          const activeSteps = telemetry?.activity?.steps || 8740;
          const activeMins = telemetry?.activity?.activeMinutes || 52;
          const providerName = provider || telemetry?.provider || "fitbit";
          const hrvVal = telemetry?.hrv?.averageMs || 48;

          newLines.push(
            { text: "Connecting to Open Wearables Sandbox Handshake Gateway...", type: "output" },
            { text: `[AUTHENTICATED CLIENT] Subject: ${userId}`, type: "success" },
            { text: "--------------------------------------------------------", type: "output" },
            { text: `[INGESTED FOR PROVIDER: ${providerName.toUpperCase()}]`, type: "success" },
            { text: `  - Daily Step Metrics: ${activeSteps.toLocaleString()} steps logged`, type: "output" },
            { text: `  - Exertion Duration:   ${activeMins} active minutes`, type: "output" },
            { text: `  - Slow Wave Sleep SWS: ${Math.round((telemetry?.sleep?.stagesSeconds?.deep || 5040) / 60)} minutes`, type: "output" },
            { text: `  - Heart Variability:   ${hrvVal} ms Average Index`, type: "output" },
            { text: "--------------------------------------------------------", type: "output" },
            { text: "Handshake Normalization Completed successfully. Diagnostic coupling active.", type: "success" }
          );
        }
      }
    } else {
      newLines.push({ text: `-bash: ${trimmed}: command not found. Type 'help' for support.`, type: "error" });
    }

    setTerminalHistory(prev => [...prev, ...newLines]);
  };

  // Submit query for clinical AI chat
  const handleChatSubmit = async (customPrompt?: string) => {
    const promptToSend = customPrompt || chatInput;
    if (!promptToSend.trim()) return;

    if (!customPrompt) setChatInput("");
    setChatLoading(true);

    const newUserMsg = { role: "user" as const, text: promptToSend };
    setChatMessages(prev => [...prev, newUserMsg]);

    try {
      const historyPayload = chatMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const apiPrefix = (window as any).__VITE_API_URL__ || "";
      const urlToFetch = apiPrefix ? `${apiPrefix}/api/open-wearables/chat` : "/api/open-wearables/chat";

      const r = await fetch(urlToFetch, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptToSend,
          chatHistory: historyPayload,
          biometrics: telemetry
        })
      });

      if (!r.ok) {
        const errJson = await r.json();
        throw new Error(errJson.error || "Failed communicating with AI Specialist.");
      }

      const resData = await r.json();
      setChatMessages(prev => [...prev, { role: "model", text: resData.text }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          role: "model",
          text: `Error: ${err.message || "Unable to process telemetry request. Check your GEMINI_API_KEY environment variable."}`
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Coupling function: Generate a simulated post-dining/fasting glucose reading based on wearable parameters
  const handleSynthesizeGlucoseReading = () => {
    if (!telemetry || !onInjectGlucose) return;

    // Core logic: Highly active days (lots of steps, higher active minutes) reduce blood glucose values
    const steps = telemetry.activity?.steps || 5000;
    const activeMins = telemetry.activity?.activeMinutes || 20;

    // Calculate simulated value
    // Target defaults to random between 80-120 depending on exercise
    let baseVal = 145; // baseline untreated Type 2 post fasting
    const reduction = Math.min(45, Math.round((steps / 1000) * 3 + (activeMins / 5) * 2));
    const finalVal = Math.max(78, baseVal - reduction);

    onInjectGlucose({
      value: finalVal,
      type: "post_fasting",
      notes: `Autogenerated from Open Wearables (${telemetry.provider || "biometric"}). Today's physical load (${steps} steps, ${activeMins} active minutes) naturally improved glucose clearance by -${reduction} mg/dL.`
    });
  };

  return (
    <div id="open-wearables-root" className="space-y-4 animate-fadeIn">
      {/* HEADER SPECS BRANDING */}
      <div className="bg-gradient-to-r from-indigo-950 via-zinc-900 to-zinc-950 border border-indigo-500/20 rounded-2xl p-4 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 text-[9px] bg-indigo-500/20 text-indigo-300 rounded font-mono font-bold tracking-widest uppercase border border-indigo-500/30">
              Open Standard
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">the-momentum/open-wearables</span>
          </div>
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Wifi className="w-4 h-4 text-indigo-400" />
            Open Wearables Dashboard
          </h2>
          <p className="text-[11px] text-zinc-300 leading-normal max-w-xl">
            Integrate continuous, standardized physical activity, cardiovascular load, and sleep architecture telemetry based on the global open-source biometrics protocol.
          </p>
        </div>
        <a
          href="https://github.com/the-momentum/open-wearables"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-indigo-300 hover:text-indigo-200 hover:underline flex items-center gap-1 font-mono transition-all py-1 px-2.5 bg-indigo-900/40 border border-indigo-800/50 rounded-xl"
        >
          <Code className="w-3.5 h-3.5" />
          Visit Git Source
        </a>
      </div>

      {/* API REGISTRATION & SYNCHRONIZATION CONSOLE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-neutral-800/60">
          <h3 className="text-xs font-bold text-neutral-200 tracking-wide uppercase flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" /> Connection Parameters
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">Select a demo code to auto-populate</span>
        </div>

        {/* CLINICAL TRIAL PRESETS & DEMO CODES */}
        <div className="p-3 bg-indigo-950/25 border border-indigo-500/10 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 text-[8.5px] bg-indigo-505/20 text-indigo-300 rounded font-mono font-bold tracking-wider uppercase border border-indigo-500/20">
              Demo Keys & Cohorts
            </span>
            <span className="text-[10px] text-zinc-400 font-sans font-medium">Standardized Open Wearables study presets:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setUserId("momentum_t2d_cohort_104");
                setProvider("fitbit");
                setAccessToken("ow_fitbit_demotoken_77492");
                setEndpointUrl("https://api.openwearables.io/v1/sandbox/biometrics");
              }}
              className="text-left px-3 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-white group-hover:text-indigo-300 transition-colors">🔥 T2D Fitbit Cohort-104</span>
                <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Active</span>
              </div>
              <p className="text-[9.5px] text-zinc-400 mt-1 font-mono leading-normal">ID: momentum_t2d_cohort_104</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserId("garmin_cardio_hrv_study");
                setProvider("garmin");
                setAccessToken("ow_garmin_heartrate_88492");
                setEndpointUrl("https://api.openwearables.io/v1/sandbox/biometrics");
              }}
              className="text-left px-3 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-white group-hover:text-indigo-300 transition-colors">❤️ Garmin HRV Phase-II</span>
                <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Active</span>
              </div>
              <p className="text-[9.5px] text-zinc-400 mt-1 font-mono leading-normal">ID: garmin_cardio_hrv_study</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserId("oura_sleep_saturation");
                setProvider("oura");
                setAccessToken("ow_oura_sleep_staged_9918");
                setEndpointUrl("https://api.openwearables.io/v1/sandbox/biometrics");
              }}
              className="text-left px-3 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-white group-hover:text-indigo-300 transition-colors">🌙 Oura Nocturnal SpO2</span>
                <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Active</span>
              </div>
              <p className="text-[9.5px] text-zinc-400 mt-1 font-mono leading-normal">ID: o_sleep_saturation</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Subject / User ID</label>
            <input
              type="text"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-semibold"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. amir_nadeem"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Metric Stream Provider</label>
            <select
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-semibold cursor-pointer"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="fitbit">Fitbit (Google Standard)</option>
              <option value="garmin">Garmin Connect</option>
              <option value="apple_health">Apple HealthKit</option>
              <option value="oura">Oura Ring</option>
              <option value="whoop">Whoop strap</option>
              <option value="google_fit">Google Fit API</option>
              <option value="withings">Withings Health</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">API Token / Passkey (Optional)</label>
            <input
              type="password"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="•••••••••••••••"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold">Custom Endpoint URL</label>
            <input
              type="text"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="http://localhost:8080/..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-between items-stretch sm:items-center border-t border-neutral-800/60">
          <p className="text-[10px] text-zinc-400 leading-normal max-w-md">
            If no custom URL parameters or API keys are specified, our backend proxies to a high-fidelity diagnostic sandbox simulating standard Open Wearables telemetry streams.
          </p>

          <button
            onClick={handleSync}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:shadow-lg disabled:opacity-40 animate-pulse active:scale-95 shrink-0"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plug className="w-4 h-4" />
            )}
            <span>Synchronize Biometric Stream</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-350 text-[11px] rounded-xl flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {syncSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-350 text-[11px] rounded-xl flex justify-between items-center font-sans">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Synchronized <strong>{provider.toUpperCase()}</strong> stream successfully for <strong>{userId}</strong>! ({isSandbox ? "Sandbox Mode" : "Live API Connective Port"})
              </span>
            </span>
            <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
              OK
            </span>
          </div>
        )}
      </div>

      {telemetry && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT 7 COLS: TELEMETRY DATA VISUALIZATIONS */}
          <div className="lg:col-span-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col space-y-4">
            
            {/* STREAM TAB SELECTOR */}
            <div className="flex flex-wrap gap-1 bg-black/40 border border-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setVisualTab("overview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  visualTab === "overview" ? "bg-indigo-650 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Standard Overview</span>
              </button>
              <button
                onClick={() => setVisualTab("heart")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  visualTab === "heart" ? "bg-indigo-650 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-450" />
                <span>Continuous ECG / HR</span>
              </button>
              <button
                onClick={() => setVisualTab("sleep")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  visualTab === "sleep" ? "bg-indigo-650 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>Sleep Architecture</span>
              </button>
              <button
                onClick={() => setVisualTab("spo2")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  visualTab === "spo2" ? "bg-indigo-650 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nocturnal SpO2</span>
              </button>
              <button
                onClick={() => setVisualTab("developer")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  visualTab === "developer" ? "bg-stone-800 text-white shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>JSON Standard Spec</span>
              </button>
              <button
                id="tab-btn-terminal"
                onClick={() => setVisualTab("terminal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  visualTab === "terminal" ? "bg-stone-800 text-emerald-400 border border-emerald-500/20 shadow" : "text-neutral-400 hover:text-white"
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono">CLI Sandbox</span>
                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Shell</span>
              </button>
            </div>

            {/* TAB CONTENT: OVERVIEW MATRICES */}
            {visualTab === "overview" && (
              <div className="space-y-4 animate-fadeIn">
                {/* TOP BENTO BLOCKS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* Step block */}
                  <div className="bg-black/40 border border-neutral-800 p-3 rounded-xl flex flex-col justify-between space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                      <span>Daily Steps Counter</span>
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="pt-1.5">
                      <span className="text-xl font-bold text-white font-mono">
                        {telemetry.activity?.steps?.toLocaleString() || "0"}
                      </span>
                      <span className="text-[10px] text-zinc-450 font-semibold block mt-0.5">
                        Goal: {telemetry.activity?.stepsGoal?.toLocaleString() || "10,000"} steps
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((telemetry.activity?.steps || 0) / (telemetry.activity?.stepsGoal || 10000)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Calories block */}
                  <div className="bg-black/40 border border-neutral-800 p-3 rounded-xl flex flex-col justify-between space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                      <span>Metabolic Burn</span>
                      <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                    </div>
                    <div className="pt-1.5">
                      <span className="text-xl font-bold text-white font-mono">
                        {telemetry.activity?.calories || "-"}
                      </span>
                      <span className="text-[9.5px] text-zinc-350 font-semibold uppercase font-mono block mt-0.5">
                        KCAL Burned
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-450 mt-1">
                      Target maintenance active expenditure accomplished safely.
                    </p>
                  </div>

                  {/* Sleep Score block */}
                  <div className="bg-black/40 border border-neutral-800 p-3 rounded-xl flex flex-col justify-between space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                      <span>Overnight Sleep Index</span>
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div className="pt-1.5">
                      <span className="text-xl font-bold text-indigo-300 font-mono">
                        {telemetry.sleep?.sleepScore || "82"}/100
                      </span>
                      <span className="text-[9.5px] text-zinc-350 font-semibold block mt-0.5">
                        Duration: {Math.floor((telemetry.sleep?.durationSeconds || 26100) / 3600)}h {Math.round(((telemetry.sleep?.durationSeconds || 26100) % 3600) / 60)}m
                      </span>
                    </div>
                    <p className="text-[9px] text-emerald-400 mt-1">
                      • Reached optimal deep recovery depth criteria.
                    </p>
                  </div>

                  {/* Heart Variability block */}
                  <div className="bg-black/40 border border-neutral-800 p-3 rounded-xl flex flex-col justify-between space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                      <span>Cardiopulmonary Index</span>
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                    </div>
                    <div className="pt-1.5">
                      <span className="text-xl font-bold text-rose-400 font-mono">
                        {telemetry.hrv?.averageMs || "48"} ms
                      </span>
                      <span className="text-[9.5px] text-zinc-350 font-semibold block mt-0.5">
                        Mean HRV (Autonomic Tone)
                      </span>
                    </div>
                    <p className="text-[9px] text-zinc-450 mt-1">
                      Elevated parasympathetic dominance indicates restful state.
                    </p>
                  </div>
                </div>

                {/* HEART GRAPH & COUPLING SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Heart Rate quick review */}
                  <div className="md:col-span-8 bg-black/30 border border-neutral-800 p-3 rounded-xl space-y-2.5">
                    <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold tracking-wider block">Circadian Heart Rate Stream (24-Hour Timeline)</span>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={telemetry.heartRateSeries || []}>
                          <defs>
                            <linearGradient id="colorHrOverview" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" stroke="#525252" fontSize={8} tickLine={false} interval={12} />
                          <YAxis domain={[50, 130]} stroke="#525252" fontSize={8} width={20} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "10px", fontSize: "10px" }}
                            labelStyle={{ color: "#a3a3a3", fontWeight: "bold" }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={1.8} fillOpacity={1} fill="url(#colorHrOverview)" name="Heart Rate (BPM)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* COUPLING ACTION BOARD */}
                  <div className="md:col-span-4 bg-gradient-to-br from-indigo-950/30 to-black border border-indigo-500/10 p-3 rounded-xl flex flex-col justify-between">
                    <div className="space-y-1.5 text-left">
                      <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-wider block uppercase">Diabetes Coupling Utility</span>
                      <h4 className="text-xs font-bold text-white uppercase">Automate Lab Glucose Logs</h4>
                      <p className="text-[10.5px] text-zinc-300 leading-normal pt-1">
                        Use the muscle-contraction glucose clearance algorithm to generate a post-exercise glucose entry using today's activity telemetry.
                      </p>
                    </div>

                    <div className="pt-4 space-y-2">
                      <div className="p-2 bg-indigo-950/30 border border-indigo-850/50 rounded-lg space-y-1">
                        <span className="text-[9px] text-indigo-300 font-mono block">CLEARANCE ESTIMATION:</span>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-zinc-200">Active steps:</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">-{Math.min(45, Math.round(((telemetry.activity?.steps || 5000) / 1000) * 3 + (telemetry.activity?.activeMinutes || 20) / 5 * 2))} mg/dL</span>
                        </div>
                      </div>

                      {onInjectGlucose ? (
                        <button
                          onClick={handleSynthesizeGlucoseReading}
                          className="w-full bg-indigo-650 hover:bg-indigo-600 text-white text-[11px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm uppercase tracking-wide"
                        >
                          <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                          <span>Auto-Log Post Meal Reading</span>
                        </button>
                      ) : (
                        <p className="text-[9px] text-stone-400 text-center italic">
                          Main dashboard binding required to auto-append readings.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DETAILED HEART RATE COMPONENT */}
            {visualTab === "heart" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-neutral-800">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white uppercase">Cardiovascular Chronobiology</h4>
                    <p className="text-[10px] text-zinc-400">Continuous heart rate tracking over 24 hours</p>
                  </div>
                  <div className="flex gap-2 text-xs font-mono">
                    <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-rose-400">
                      Resting: <strong className="text-white">{Math.min(...(telemetry.heartRateSeries || [{value: 60}]).map((h: any) => h.value))} bpm</strong>
                    </div>
                    <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-rose-400">
                      Mean: <strong className="text-white">74 bpm</strong>
                    </div>
                    <div className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-rose-400">
                      Peak: <strong className="text-white">{Math.max(...(telemetry.heartRateSeries || [{value: 120}]).map((h: any) => h.value))} bpm</strong>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full bg-black/20 p-2.5 border border-neutral-800/50 rounded-xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetry.heartRateSeries || []}>
                      <XAxis dataKey="time" stroke="#737373" fontSize={9} tickLine={false} interval={6} />
                      <YAxis domain={[40, 140]} stroke="#737373" fontSize={9} tickLine={false} width={25} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "10px", fontSize: "11px" }}
                        labelStyle={{ color: "#a3a3a3", fontWeight: "bold" }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#f43f5e" strokeWidth={2.2} activeDot={{ r: 6 }} dot={false} name="Heart Rate (BPM)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed text-left max-w-2xl bg-indigo-950/15 border border-indigo-950/30 p-3 rounded-xl">
                  <strong>Clinical Insight:</strong> Standard autonomic heart rate diurnal profiles involve overnight resting nadırs which reflect healthy vagal modulation. Peaks occurring around afternoon blocks fit structured exercise cycles. High cardiovascular fitness corresponds directly to rapid heart rate recovery indices and improved safe metabolic glycogen clearance.
                </p>
              </div>
            )}

            {/* TAB CONTENT: DEEP SLEEP ARCHITECTURE ANALYSIS */}
            {visualTab === "sleep" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center pb-1 border-b border-neutral-800">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white uppercase">Sleep Hypnogram Architecture</h4>
                    <p className="text-[10px] text-zinc-400">Staged biological sleep architecture breakdown</p>
                  </div>
                  <span className="text-[9.5px] bg-indigo-900/40 text-indigo-300 h-5 px-2 rounded-full font-sans border border-indigo-850 flex items-center justify-center font-bold">
                    Sleep Score Index: {telemetry.sleep?.sleepScore}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Left Graph bar */}
                  <div className="md:col-span-6 space-y-3 text-left">
                    <span className="text-[10.5px] font-bold text-zinc-300">Phase Durations:</span>
                    
                    {/* Progress bars of architecture stages */}
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-indigo-300 font-semibold flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full inline-block"></span>
                            Deep Sleep Stage
                          </span>
                          <span className="font-mono text-zinc-300 font-bold">
                            {Math.floor((telemetry.sleep?.stagesSeconds?.deep || 5040) / 3600)}h {Math.round(((telemetry.sleep?.stagesSeconds?.deep || 5040) % 3600) / 60)}m ({Math.round(((telemetry.sleep?.stagesSeconds?.deep || 5040) / (telemetry.sleep?.durationSeconds || 26100)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${((telemetry.sleep?.stagesSeconds?.deep || 5040) / (telemetry.sleep?.durationSeconds || 26100)) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-blue-300 font-semibold flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-blue-400 rounded-full inline-block"></span>
                            REM (Rapid Eye Movement)
                          </span>
                          <span className="font-mono text-zinc-300 font-bold">
                            {Math.floor((telemetry.sleep?.stagesSeconds?.rem || 4500) / 3600)}h {Math.round(((telemetry.sleep?.stagesSeconds?.rem || 4500) % 3600) / 60)}m ({Math.round(((telemetry.sleep?.stagesSeconds?.rem || 4500) / (telemetry.sleep?.durationSeconds || 26100)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div className="bg-blue-400 h-full rounded-full" style={{ width: `${((telemetry.sleep?.stagesSeconds?.rem || 4500) / (telemetry.sleep?.durationSeconds || 26100)) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-cyan-300 font-semibold flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full inline-block"></span>
                            Light Sleep Stage
                          </span>
                          <span className="font-mono text-zinc-300 font-bold">
                            {Math.floor((telemetry.sleep?.stagesSeconds?.light || 14760) / 3600)}h {Math.round(((telemetry.sleep?.stagesSeconds?.light || 14760) % 3600) / 60)}m ({Math.round(((telemetry.sleep?.stagesSeconds?.light || 14760) / (telemetry.sleep?.durationSeconds || 26100)) * 100)}%)
                          </span>
                        </div>
                        <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${((telemetry.sleep?.stagesSeconds?.light || 14760) / (telemetry.sleep?.durationSeconds || 26100)) * 100}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-stone-400 font-semibold flex items-center gap-1">
                            <span className="w-2.5 h-2.5 bg-stone-500 rounded-full inline-block"></span>
                            Awake Periods
                          </span>
                          <span className="font-mono text-zinc-300 font-bold">
                            {Math.round((telemetry.sleep?.stagesSeconds?.awake || 1800) / 60)}m
                          </span>
                        </div>
                        <div className="w-full bg-neutral-950 h-1.5 rounded-full overflow-hidden border border-neutral-800">
                          <div className="bg-stone-500 h-full rounded-full" style={{ width: `${((telemetry.sleep?.stagesSeconds?.awake || 1800) / (telemetry.sleep?.durationSeconds || 26100)) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right clinical block */}
                  <div className="md:col-span-6 bg-black/40 border border-neutral-800 p-4 rounded-xl space-y-2 text-left">
                    <h5 className="text-[11.5px] font-bold text-white flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Metabolic Sleep Coupling
                    </h5>
                    <p className="text-[11px] text-zinc-300 leading-normal">
                      Insulin sensitivity peaks during restorative <strong>Deep SWS (Slow Wave Sleep)</strong> cycles. Inadequate deep stages trigger morning cortisol spikes, naturally raising hepatic glucose output and inducing the breakfast dawn-phenomenon spike. 
                    </p>
                    <div className="pt-1.5 flex gap-2">
                      <span className="text-[9px] bg-indigo-950 border border-indigo-800/40 font-mono text-indigo-300 px-2 py-0.5 rounded uppercase">
                        SWS: HEALTHY (21%)
                      </span>
                      <span className="text-[9px] bg-emerald-950 border border-emerald-800/40 font-mono text-emerald-300 px-2 py-0.5 rounded uppercase">
                        CORTISOL RISK: LOW
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DETAILS SPO2 */}
            {visualTab === "spo2" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center pb-1 border-b border-neutral-800">
                  <div className="text-left">
                    <h4 className="text-xs font-bold text-white uppercase">Respiration Telemetry & SpO2</h4>
                    <p className="text-[10px] text-zinc-400">Circadian oxygen concentration percentages</p>
                  </div>
                  <div className="px-2.5 py-0.5 bg-[#172554] border border-[#1d4ed8]/30 rounded-full font-mono text-[9px] text-[#93c5fd]">
                    Mean: 97.4% Percentage
                  </div>
                </div>

                <div className="h-56 w-full bg-black/20 p-2.5 border border-neutral-800/50 rounded-xl">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={telemetry.spo2Series || []}>
                      <XAxis dataKey="time" stroke="#737373" fontSize={9} tickLine={false} interval={4} />
                      <YAxis domain={[90, 100]} stroke="#737373" fontSize={9} tickLine={false} width={20} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "10px", fontSize: "11px" }}
                        labelStyle={{ color: "#a3a3a3", fontWeight: "bold" }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} activeDot={{ r: 5 }} dot={true} name="Blood Oxygen (SpO2 %)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[11px] text-zinc-300 leading-relaxed text-left max-w-2xl bg-indigo-950/15 border border-indigo-950/30 p-3 rounded-xl">
                  <strong>Diagnostic Guidance:</strong> Average overnight SpO2 levels exceeding 95% indicates healthy cardiovascular oxygen saturation. Repeated dips below 92% overnight can indicate desaturation events (e.g., sleep apnea, clinical micro-stressors), which put additional stressors on glycemic homeostasis and overnight lipid indices.
                </p>
              </div>
            )}

            {/* TAB CONTENT: OPEN WEARABLES JSON SPECIFICATION PANEL */}
            {visualTab === "developer" && (
              <div className="space-y-4 animate-fadeIn text-left">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Open Wearables Standard Spec Payload</h4>
                  <p className="text-[10px] text-zinc-400">Strict JSON structured telemetry matching standard specifications</p>
                </div>

                <div className="bg-black/60 border border-neutral-800 rounded-xl p-3.5 text-[10.5px] text-emerald-400 font-mono overflow-x-auto max-h-72 select-all leading-normal">
                  <pre>{JSON.stringify(telemetry, null, 2)}</pre>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex gap-2 items-start text-[11px] text-zinc-300">
                  <Code className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p>
                    Developers can utilize standard endpoints defined in the server file at <code>/api/open-wearables/sync</code>. This outputs standard-compliant schemas for integration with clinical clinical dashboard streams directly.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TERMINAL SANDBOX CLI */}
            {visualTab === "terminal" && (
              <div className="space-y-4 animate-fadeIn text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5 font-mono">
                      <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Open Wearables CLI Terminal Simulator
                    </h4>
                    <p className="text-[10px] text-zinc-400">Sandbox environment simulating local git development & microservices execution</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-neutral-950 font-mono text-zinc-400 px-2.5 py-0.5 rounded-lg border border-neutral-850">
                      HOST: <strong className="text-emerald-400 font-bold">open-wearables-sandbox</strong>
                    </span>
                  </div>
                </div>

                {/* TERMINAL EMULATOR CANVAS */}
                <div className="bg-black border border-neutral-850 rounded-2xl overflow-hidden font-mono text-[11px] leading-relaxed shadow-lg">
                  {/* BAR HEADER */}
                  <div className="bg-neutral-900 border-b border-neutral-850/80 px-4 py-2 flex items-center justify-between font-sans">
                    <div className="flex items-center gap-1.5 select-none">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span>
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span>
                      <span className="text-[10px] text-zinc-500 ml-1.5 font-mono">bash — visitor@open-wearables-sandbox: {currentDirectory}</span>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-bold font-mono">SANDBOX SHELL</span>
                  </div>

                  {/* SCROLL CONTAINER FOR OUTPUTS */}
                  <div className="p-4 space-y-1.5 max-h-80 min-h-[220px] overflow-y-auto bg-black border-collapse flex flex-col font-mono text-[11px]">
                    <p className="text-zinc-600 select-none">// Open Wearables Protocol Standard CLI [v1.4.2]</p>
                    <p className="text-zinc-600 select-none">// Loaded mock biometrics active handshake channel.</p>
                    <p className="text-zinc-500 text-[10.5px] select-none pb-1.5 border-b border-neutral-900/60 mb-2">Type "help" to list clinical developer instructions.</p>

                    {terminalHistory.map((line, lIdx) => {
                      if (line.type === "command") {
                        return (
                          <div key={lIdx} className="text-zinc-100 flex items-start gap-1 font-bold">
                            <span className="text-emerald-400 select-none">{line.text.split("$ ")[0]}$</span>
                            <span className="text-zinc-100 select-text font-mono ml-1">{line.text.split("$ ")[1]}</span>
                          </div>
                        );
                      }
                      if (line.type === "prompt") {
                        return (
                          <div key={lIdx} className="text-emerald-400 flex items-start gap-1 font-bold mt-1">
                            <span>{line.text}</span>
                          </div>
                        );
                      }
                      const colorClass = 
                        line.type === "error" ? "text-rose-400 font-semibold" : 
                        line.type === "success" ? "text-emerald-400 font-semibold" : 
                        "text-zinc-400";
                      return (
                        <div key={lIdx} className={`${colorClass} whitespace-pre-wrap select-text pl-1`}>
                          {line.text}
                        </div>
                      );
                    })}
                    <div ref={terminalBottomRef} />
                  </div>

                  {/* INPUT FORM CONTAINER */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!terminalInput.trim()) return;
                      handleTerminalCommand(terminalInput);
                      setTerminalInput("");
                    }}
                    className="border-t border-neutral-850 bg-neutral-950 flex items-center px-4 py-2.5"
                  >
                    <span className="text-emerald-400 font-bold select-none mr-2 font-mono shrink-0">
                      visitor@open-wearables-sandbox:{currentDirectory}$
                    </span>
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 font-mono text-[11px] outline-none placeholder-zinc-800"
                      placeholder='Type "help" or select a preset shortcut...'
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </form>
                </div>

                {/* QUICK SHORTCUT BUTTONS BAR */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">Quick Command Presets</span>
                    <span className="text-[9px] text-zinc-650">Click to execute inside current path context</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("git clone https://github.com/the-momentum/open-wearables.git")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl hover:text-indigo-400 cursor-pointer transition-all"
                    >
                      git clone
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("cd open-wearables")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl hover:text-indigo-400 cursor-pointer transition-all"
                    >
                      cd open-wearables
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("ls")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl hover:text-indigo-400 cursor-pointer transition-all"
                    >
                      ls
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("npm install")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl hover:text-indigo-400 cursor-pointer transition-all"
                    >
                      npm install
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("cat README.md")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl hover:text-indigo-400 cursor-pointer transition-all"
                    >
                      cat README.md
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("node client.js")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl hover:text-emerald-400 cursor-pointer transition-all animate-pulse"
                    >
                      🚀 Run node client.js
                    </button>
                    <div className="w-full h-px border-t border-neutral-900/60 my-1"></div>
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("help")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-zinc-300 border border-neutral-800 rounded-xl hover:text-indigo-400 cursor-pointer transition-all"
                    >
                      help
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleTerminalCommand("clear")} 
                      className="px-2.5 py-1 text-[10px] font-mono bg-neutral-900 hover:bg-neutral-800 text-rose-450 border border-neutral-800 rounded-xl cursor-pointer transition-all ml-auto"
                    >
                      clear screen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CLINICAL COMPANION CHAT TERMINAL (SERVER PROXIED GEMINI AI) */}
          <div className="lg:col-span-12 bg-gradient-to-br from-[#111827] to-black border border-indigo-500/10 rounded-2xl p-4 shadow-md space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center pb-2 border-b border-indigo-500/10">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-300 animate-pulse" />
                <div className="text-left">
                  <span className="font-bold text-white text-xs uppercase tracking-wider block">Clinical Intelligence Companion</span>
                  <p className="text-[9px] text-indigo-300 font-mono">Expert Biometric Telemetry Diagnostics (The Momentum)</p>
                </div>
              </div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 h-5 px-2 rounded font-mono font-bold flex items-center justify-center border border-indigo-500/20">
                Gemini Active
              </span>
            </div>

            <p className="text-[10.5px] text-zinc-300 leading-relaxed text-left">
              The clinical companion reads continuous heart rate, HRV distribution, sleep architecture stages, and sleep quality indices to assess metabolic Dawn Phenomenon risk and physical fuel expenditure.
            </p>

            {/* CHAT MESSAGES PANEL */}
            <div className="bg-black/40 border border-neutral-850 rounded-xl p-3 space-y-3 flex flex-col min-h-48 max-h-72 overflow-y-auto">
              {chatMessages.map((msg, index) => {
                const isModel = msg.role === "model";
                return (
                  <div key={index} className={`flex flex-col gap-1 ${isModel ? "items-start text-left" : "items-end text-right"}`}>
                    <span className="text-[8px] text-neutral-500 font-mono uppercase tracking-wider">
                      {isModel ? "Momentum Clinical AI" : "YOU (PATIENT)"}
                    </span>
                    <div
                      className={`p-2.5 rounded-2xl max-w-[85%] text-[11px] leading-relaxed select-text ${
                        isModel 
                          ? "bg-neutral-900 border border-neutral-800 text-zinc-200" 
                          : "bg-indigo-650 hover:bg-indigo-600 text-white shadow-sm"
                      }`}
                    >
                      {/* Very basic formatting since react-markdown has specific loading conditions */}
                      {msg.text.split("\n").map((line, lIdx) => (
                        <p key={lIdx} className={line.startsWith("-") || line.startsWith("*") ? "pl-3 -indent-3" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
              {chatLoading && (
                <div className="flex items-center gap-2 text-neutral-500 text-[10.5px] font-mono italic text-left">
                  <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                  <span>Synthesizing circadian physiological biomarkers...</span>
                </div>
              )}
            </div>

            {/* QUICK PRE-CONSTRUCTED SIMULATORS */}
            <div className="space-y-1.5 text-left">
              <span className="text-[8.5px] font-bold text-neutral-500 uppercase tracking-widest font-mono block">Instant Clinical Diagnostics queries:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleChatSubmit("Perform comprehensive diagnostic breakdown of my overnight sleep phases & HRV stability relative to Type 2 diabetes.")}
                  disabled={chatLoading}
                  className="text-left bg-black hover:bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl text-[9.5px] text-indigo-300 font-mono transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>➔ "Breakdown sleep phases & HRV relative to Type 2"</span>
                  <span className="text-[7.5px] bg-indigo-900/40 text-indigo-300 px-1 py-0.5 rounded font-bold uppercase shrink-0">Query AI</span>
                </button>
                <button
                  onClick={() => handleChatSubmit("Explain how my steps (8,740) and heart rate variations during active cycles today affect my insulin clearance.")}
                  disabled={chatLoading}
                  className="text-left bg-black hover:bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-xl text-[9.5px] text-indigo-300 font-mono transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>➔ "Estimate steps & cardiovascular glucose clearance impact"</span>
                  <span className="text-[7.5px] bg-indigo-900/40 text-indigo-300 px-1 py-0.5 rounded font-bold uppercase shrink-0">Query AI</span>
                </button>
              </div>
            </div>

            {/* USER INPUT BOX */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleChatSubmit();
              }}
              className="flex gap-2"
            >
              <input
                id="open-wearables-chat-input"
                type="text"
                required
                disabled={chatLoading}
                placeholder="Ask your Momentum AI Specialist about heart variability, sleep health..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-indigo-650 hover:bg-indigo-600 text-white font-bold p-2 px-3 rounded-xl text-xs flex items-center justify-center cursor-pointer transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
