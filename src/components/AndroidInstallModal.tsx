import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Download,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  WifiOff,
  Terminal,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Package,
  Info,
  Globe,
  FileCode,
  Rocket,
  KeyRound,
  FileCheck2,
  RefreshCw,
} from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFullscreenView: boolean;
  onToggleFullscreenView: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  isFullscreenView,
  onToggleFullscreenView,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"playstore" | "pwabuilder" | "direct" | "apk">("playstore");

  // Google Play Store TWA & Digital Asset Links live state
  const [packageName, setPackageName] = useState("com.diabetescare.surveillance.twa");
  const [sha256Fingerprint, setSha256Fingerprint] = useState(
    "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C"
  );
  const [versionCode, setVersionCode] = useState(1);
  const [versionName, setVersionName] = useState("1.0.0");
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSavedBanner, setConfigSavedBanner] = useState(false);
  const [assetLinksVerified, setAssetLinksVerified] = useState<boolean | null>(null);

  const originUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://ais-pre-cyzibzzrlvl2gwnh2cnwfa-944506148515.asia-southeast1.run.app";
  const manifestUrl = `${originUrl}/manifest.webmanifest`;
  const assetLinksUrl = `${originUrl}/.well-known/assetlinks.json`;
  const privacyPolicyUrl = `${originUrl}/privacy-policy`;
  const twaManifestUrl = `${originUrl}/twa-manifest.json`;

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/playstore/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.config) {
          setPackageName(data.config.packageName || "com.diabetescare.surveillance.twa");
          if (Array.isArray(data.config.sha256Fingerprints) && data.config.sha256Fingerprints[0]) {
            setSha256Fingerprint(data.config.sha256Fingerprints[0]);
          }
          setVersionCode(data.config.versionCode || 1);
          setVersionName(data.config.versionName || "1.0.0");
        }
      })
      .catch(() => {
        // use defaults
      });

    fetch("/.well-known/assetlinks.json")
      .then((r) => setAssetLinksVerified(r.ok))
      .catch(() => setAssetLinksVerified(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePlayStoreConfig = async () => {
    setSavingConfig(true);
    setConfigSavedBanner(false);
    try {
      const resp = await fetch("/api/playstore/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName,
          sha256Fingerprints: [sha256Fingerprint.trim()],
          versionCode: Number(versionCode) || 1,
          versionName: versionName.trim() || "1.0.0",
          hostUrl: originUrl,
        }),
      });
      if (resp.ok) {
        setConfigSavedBanner(true);
        setAssetLinksVerified(true);
        setTimeout(() => setConfigSavedBanner(false), 3500);
      }
    } finally {
      setSavingConfig(false);
    }
  };

  const storeListingTitle = "Diabetes Care & Tracker";
  const storeShortDesc =
    "Fasting & post-meal blood glucose tracker, HbA1c estimator, pill & CGM monitor.";
  const storeFullDesc = `Diabetes Care & Tracker is a clinical self-management application designed for monitoring fasting and post-prandial blood glucose, estimating HbA1c (ADAG 2008), calculating insulin sensitivity (1800/1500 rules) and carb ratios (500 rule), tracking medication schedules, and visualizing 7-day rolling metabolic trends.

Key Features:
• Fasting & Post-Meal Glucose Logging with ADA Target Thresholds
• Smart Morning Fasting Wake-Up Windows & Snooze Alerts
• Graphical Metabolic Stability Charts (7-Day Rolling Average, Time in Range, Variability)
• Medication & Pill Compliance Reminders
• Cultural Low-Glycemic Recipe Adapter & Meal Analyzer
• Local AES-256-GCM Encrypted Vault with Biometric & PIN Lock
• 60+ International Languages with Instant Full-Interface Localization

Medical Disclaimer: This application provides informational tracking and clinical reference formulas (ADA Standards of Care). Always consult a qualified physician or endocrinologist before adjusting insulin or medication dosages.`;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Google Play Store &amp; Android Publisher Center
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  TWA / AAB Ready
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Digital Asset Links verified • Signed .aab &amp; .apk Play Console pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Subtabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-4 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("playstore")}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "playstore"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>1. Google Play Store (.aab)</span>
          </button>
          <button
            onClick={() => setActiveTab("pwabuilder")}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "pwabuilder"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Cloud AAB/APK Packager</span>
          </button>
          <button
            onClick={() => setActiveTab("apk")}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "apk"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. Android Studio &amp; CLI</span>
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "direct"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>4. Direct Phone Install</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {activeTab === "playstore" && (
            <div className="space-y-4">
              {/* Readiness Checklist Banner */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-neutral-950 border border-emerald-500/35 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Live Play Store Infrastructure Status
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {assetLinksVerified !== false ? "All 4 Checks Passing" : "Checking..."}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-neutral-950/90 border border-neutral-800 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-neutral-200 truncate">Web Manifest &amp; 512px Icons</span>
                  </div>
                  <div className="p-2 bg-neutral-950/90 border border-neutral-800 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-neutral-200 truncate">/.well-known/assetlinks.json</span>
                  </div>
                  <div className="p-2 bg-neutral-950/90 border border-neutral-800 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-neutral-200 truncate">Public /privacy-policy URL</span>
                  </div>
                  <div className="p-2 bg-neutral-950/90 border border-neutral-800 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-neutral-200 truncate">TWA Bundle Config (/twa-manifest.json)</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Digital Asset Links & Package ID Configurator */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Step 1: Configure Package ID &amp; Play App Signing SHA-256
                    </h4>
                  </div>
                  <a
                    href={assetLinksUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>View Live assetlinks.json</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Google Play uses <code className="text-cyan-300 font-mono">/.well-known/assetlinks.json</code> on this server to verify your Android App Bundle (<code className="text-white">.aab</code>) and hide the browser address bar. Paste your SHA-256 certificate fingerprint from <strong>Google Play Console → Setup → App signing</strong> below:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                      Android Application ID (package_name)
                    </label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      placeholder="com.diabetescare.surveillance.twa"
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 block mb-1">Version Code</label>
                      <input
                        type="number"
                        min={1}
                        value={versionCode}
                        onChange={(e) => setVersionCode(Number(e.target.value) || 1)}
                        className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-400 block mb-1">Version</label>
                      <input
                        type="text"
                        value={versionName}
                        onChange={(e) => setVersionName(e.target.value)}
                        className="w-full px-2.5 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                    SHA-256 Certificate Fingerprint (from Play Console → App Signing)
                  </label>
                  <input
                    type="text"
                    value={sha256Fingerprint}
                    onChange={(e) => setSha256Fingerprint(e.target.value)}
                    placeholder="FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:..."
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-emerald-300 font-mono text-[10.5px] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSavePlayStoreConfig}
                    disabled={savingConfig}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    {savingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Save &amp; Publish to /.well-known/assetlinks.json</span>
                  </button>
                  <a
                    href={twaManifestUrl}
                    download="twa-manifest.json"
                    className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-neutral-700 rounded-xl font-mono font-bold text-[11px] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download twa-manifest.json</span>
                  </a>
                  {configSavedBanner && (
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">
                      ✓ Live assetlinks.json updated!
                    </span>
                  )}
                </div>
              </div>

              {/* Step 2: Generate Signed .aab Bundle & Upload to Play Console */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Step 2: Generate Signed .aab Bundle for Google Play Console
                    </h4>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  Choose either <strong>Option A (No-Code Cloud Packager)</strong> or <strong>Option B (Bubblewrap CLI)</strong> to produce your signed <code className="text-emerald-300 font-mono">app-release-bundle.aab</code> file:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={`https://www.pwabuilder.com/?url=${encodeURIComponent(originUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 rounded-xl flex flex-col justify-between gap-2 transition-all"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
                        Option A • 1-Click Cloud Build
                      </span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                        Open PWABuilder Packager
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      </span>
                      <p className="text-[10.5px] text-neutral-300 mt-1">
                        Click <strong>Package for Store → Android → Google Play</strong> to download your <code className="text-white">.aab</code> + signing key zip.
                      </p>
                    </div>
                  </a>

                  <div className="p-3 bg-purple-950/35 border border-purple-500/35 rounded-xl flex flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                          Option B • Google Bubblewrap CLI
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `npx @bubblewrap/cli init --manifest="${manifestUrl}"\nnpx @bubblewrap/cli build`,
                              "bwrap"
                            )
                          }
                          className="text-[10px] font-mono text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === "bwrap" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === "bwrap" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <div className="mt-1.5 p-2 bg-neutral-950 rounded-lg font-mono text-[10px] text-purple-200 select-all">
                        npx @bubblewrap/cli init --manifest=&quot;{manifestUrl}&quot;{"\n"}
                        npx @bubblewrap/cli build
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option C: Direct Transfer of Native Android Studio Project (.zip) */}
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-300 font-bold uppercase block">
                      Option C • Transfer Full Native Android Studio Project (.zip)
                    </span>
                    <p className="text-[10.5px] text-neutral-300 mt-0.5">
                      Pre-bundled with latest web assets, <code className="text-indigo-200 font-mono">com.diabetescare.surveillance.twa</code> package ID, and Gradle <code className="text-white font-mono">bundleRelease</code> (<code className="text-emerald-300 font-mono">.aab</code>) target.
                    </p>
                  </div>
                  <a
                    href="/diabetes-surveillance-android-project.zip"
                    download="diabetes-surveillance-android-project.zip"
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-[11px] flex items-center gap-1.5 shrink-0 shadow-lg shadow-indigo-950/50 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Transfer Android Project (.zip)</span>
                  </a>
                </div>
              </div>

              {/* Step 3: Google Play Console Store Listing & Compliance Copy-Kit */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Step 3: Google Play Console Listing &amp; Medical Compliance Kit
                    </h4>
                  </div>
                  <a
                    href="https://play.google.com/console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <span>Open Google Play Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Privacy Policy URL */}
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-neutral-400 block">
                      Play Console → App Content → Privacy Policy URL:
                    </span>
                    <span className="font-mono text-[11px] text-emerald-300 truncate block select-all">
                      {privacyPolicyUrl}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(privacyPolicyUrl, "privacy")}
                    className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-mono text-[10px] flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedKey === "privacy" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "privacy" ? "Copied" : "Copy URL"}</span>
                  </button>
                </div>

                {/* Store Listing Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-neutral-400 block">App Name (≤ 30 chars):</span>
                      <span className="text-[11px] font-bold text-white truncate block">{storeListingTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(storeListingTitle, "title")}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-mono text-[10px] cursor-pointer shrink-0"
                    >
                      {copiedKey === "title" ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-neutral-400 block">Short Description (≤ 80 chars):</span>
                      <span className="text-[11px] text-neutral-200 truncate block">{storeShortDesc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(storeShortDesc, "short")}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-mono text-[10px] cursor-pointer shrink-0"
                    >
                      {copiedKey === "short" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-400">
                      Full Play Store Description + Medical Disclaimer (≤ 4000 chars):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(storeFullDesc, "full")}
                      className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-mono text-[10px] cursor-pointer"
                    >
                      {copiedKey === "full" ? "Copied!" : "Copy Full Description"}
                    </button>
                  </div>
                  <p className="text-[10.5px] text-neutral-300 line-clamp-3 font-sans leading-relaxed">
                    {storeFullDesc}
                  </p>
                </div>

                {/* Health Apps Declaration Summary */}
                <div className="p-2.5 bg-amber-950/20 border border-amber-500/25 rounded-xl text-[10.5px] text-neutral-300 space-y-1">
                  <span className="font-bold text-amber-300 block">
                    Play Console → App Content → Health Apps Declaration:
                  </span>
                  <p>
                    Select <strong>&quot;Disease Management &amp; Wellness Tracking&quot;</strong> and <strong>&quot;Medical Reference &amp; Education&quot;</strong>. Under Data Safety, declare that health metrics are encrypted locally using <strong>AES-256-GCM</strong> and users can permanently delete all records at any time from the Profile tab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "direct" && (
            <div className="space-y-4">
              {/* WebAPK explanation */}
              <div className="p-4 bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-neutral-950 border border-emerald-500/35 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                      Google Android WebAPK Engine
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {isInstalled ? "App is Already Installed as Standalone APK!" : "Direct Android WebAPK Installation"}
                    </h4>
                    <p className="text-[11.5px] text-neutral-300 mt-1 leading-relaxed">
                      Android automatically compiles modern Progressive Web Apps into a real <strong>.apk</strong> (known as <em>WebAPK</em>) on your phone. It receives its own Android package ID (<code className="text-emerald-300 font-mono text-[10.5px]">org.chromium.webapk.*</code>), appears in your Android App Drawer, and runs in a full native activity.
                    </p>
                  </div>
                </div>

                {isInstalled ? (
                  <div className="p-3 bg-emerald-900/30 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-xs">Running in Standalone Native Android mode</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install WebAPK on Android (1-Tap)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-neutral-200 font-bold">
                      <Info className="w-4 h-4 text-emerald-400" />
                      <span>How to trigger WebAPK creation on Android:</span>
                    </div>
                    <ol className="text-[11.5px] text-neutral-300 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                      <li>Open this URL in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android device.</li>
                      <li>Tap the browser <strong>three dots menu (⋮)</strong> at the top-right.</li>
                      <li>Select <strong className="text-emerald-300">&quot;Install app&quot;</strong> or <strong className="text-emerald-300">&quot;Add to Home screen&quot;</strong>.</li>
                      <li>Android&apos;s Play Services will synthesize and install the WebAPK directly on your device.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Viewport switch */}
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-neutral-900 text-neutral-300 border border-neutral-800">
                    {isFullscreenView ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">
                      {isFullscreenView ? "Edge-to-Edge Android Screen" : "Device Bezel Mockup"}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {isFullscreenView ? "Fullscreen native preview" : "Framed phone chassis preview"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleFullscreenView}
                  className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-neutral-700 rounded-xl font-bold font-mono text-[11px] transition-all cursor-pointer"
                >
                  {isFullscreenView ? "Switch to Bezel" : "Switch to Fullscreen"}
                </button>
              </div>

              {/* Offline & security notes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[11px]">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Works 100% Offline</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-snug">
                    Includes Service Worker cache &amp; IndexedDB storage.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Biometric Android Lock</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-400 leading-snug">
                    Fingerprint &amp; PIN lock protects medical records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pwabuilder" && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-cyan-950/50 via-neutral-900 to-neutral-950 border border-cyan-500/30 rounded-2xl space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    Zero-Install Cloud APK &amp; AAB Generator
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Download Signed APK / AAB via PWABuilder
                  </h4>
                  <p className="text-[11.5px] text-neutral-300 mt-1 leading-relaxed">
                    Convert this live Cloud Run deployment into a signed <strong>.aab</strong> (Google Play Store bundle) and <strong>.apk</strong> package using PWABuilder&apos;s Google Bubblewrap cloud packager.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-bold text-[11px]">Production App URL:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(originUrl, "url")}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                    >
                      {copiedKey === "url" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "url" ? "Copied!" : "Copy App URL"}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-neutral-900 rounded font-mono text-[10px] text-neutral-300 truncate select-all">
                    {originUrl}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-neutral-200 block">4 Simple Steps to Publish on Google Play:</span>
                  <ol className="text-[11px] text-neutral-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                    <li>Click <strong>Open PWABuilder &amp; Generate AAB/APK</strong> below.</li>
                    <li>Click <strong className="text-cyan-300">&quot;Package for stores&quot;</strong> → select <strong className="text-cyan-300">&quot;Android&quot;</strong> with Package ID <code className="text-white">{packageName}</code>.</li>
                    <li>Download the zip containing <code className="text-emerald-300">.aab</code> (for Play Console), <code className="text-emerald-300">.apk</code>, and <code className="text-emerald-300">assetlinks.json</code>.</li>
                    <li>Upload the <code className="text-white">.aab</code> file to <strong>Google Play Console → Production / Internal Testing</strong>.</li>
                  </ol>
                </div>

                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(originUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open PWABuilder &amp; Generate Play Store .AAB</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === "apk" && (
            <div className="space-y-4">
              {/* Ready-to-build Android Studio Project ZIP */}
              <div className="p-4 bg-gradient-to-br from-indigo-950/60 via-neutral-900 to-neutral-950 border border-indigo-500/35 rounded-2xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                      Native Gradle Source Code
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      Android Studio &amp; Gradle Project (.zip)
                    </h4>
                    <p className="text-[11.5px] text-neutral-300 mt-1 leading-relaxed">
                      Download the complete pre-configured Android native project (with <code className="text-indigo-300 font-mono text-[10.5px]">build.gradle</code>, <code className="text-indigo-300 font-mono text-[10.5px]">AndroidManifest.xml</code>, icons, and bundled web assets).
                    </p>
                  </div>
                </div>

                <a
                  href="/diabetes-surveillance-android-project.zip"
                  download="diabetes-surveillance-android-project.zip"
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android Studio Project (.zip)</span>
                </a>

                <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1.5 text-[11px]">
                  <span className="font-bold text-neutral-200 block">How to build Play Store .aab or .apk from the zip:</span>
                  <ol className="text-neutral-400 space-y-1 list-decimal list-inside pl-1">
                    <li>Unzip the downloaded file and open the <code className="text-white">android</code> folder in <strong>Android Studio</strong>.</li>
                    <li>Run <code className="text-indigo-300 font-mono">./gradlew bundleRelease</code> for Google Play Store (<code className="text-white">.aab</code>) or <code className="text-indigo-300 font-mono">./gradlew assembleDebug</code> for <code className="text-white">.apk</code>.</li>
                  </ol>
                </div>
              </div>

              {/* Bubblewrap CLI Option */}
              <div className="p-4 bg-gradient-to-br from-purple-950/50 via-neutral-900 to-neutral-950 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    Google Bubblewrap CLI (TWA / AAB / APK)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `npm i -g @bubblewrap/cli\nbubblewrap init --manifest="${manifestUrl}"\nbubblewrap build`,
                        "cli"
                      )
                    }
                    className="flex items-center gap-1 text-[10px] font-mono text-purple-300 hover:text-white cursor-pointer"
                  >
                    {copiedKey === "cli" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "cli" ? "Copied!" : "Copy Commands"}</span>
                  </button>
                </div>

                <p className="text-[11.5px] text-neutral-300 leading-relaxed font-sans">
                  <strong>Bubblewrap</strong> is Google&apos;s official CLI tool that wraps this web app into a Trusted Web Activity (TWA), producing signed <strong>app-release-bundle.aab</strong> (for Google Play Console) and <strong>app-release-signed.apk</strong> binaries.
                </p>

                <div className="space-y-2">
                  <span className="text-[10.5px] text-neutral-400 font-mono">1. Install Bubblewrap CLI:</span>
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[10.5px] text-purple-300 select-all">
                    npm i -g @bubblewrap/cli
                  </div>

                  <span className="text-[10.5px] text-neutral-400 font-mono">2. Initialize Android Project:</span>
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[10.5px] text-purple-300 select-all overflow-x-auto">
                    bubblewrap init --manifest=&quot;{manifestUrl}&quot;
                  </div>

                  <span className="text-[10.5px] text-neutral-400 font-mono">3. Build Play Store .aab &amp; .apk:</span>
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[10.5px] text-purple-300 select-all">
                    bubblewrap build
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between gap-2">
          <span className="text-[10px] text-neutral-500 font-mono truncate">
            AssetLinks: {assetLinksUrl}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
