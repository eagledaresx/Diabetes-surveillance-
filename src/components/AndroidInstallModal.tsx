import React, { useState } from "react";
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  WifiOff, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2,
  Package,
  Layers,
  Info,
  ArrowRight,
  Globe,
  FileCode,
  QrCode
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
  onToggleFullscreenView
}) => {
  const { isInstallable, isInstalled, isAndroid, install } = usePWAInstall();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"direct" | "apk" | "pwabuilder">("direct");

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== "undefined" ? window.location.href : "https://your-app-domain.com";
  const manifestUrl = typeof window !== "undefined" ? `${window.location.origin}/manifest.webmanifest` : "/manifest.webmanifest";

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

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Convert &amp; Launch Android APK
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  Native Android Package
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                WebAPK automatic generation &amp; Standalone APK compilation
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
            onClick={() => setActiveTab("pwabuilder")}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "pwabuilder"
                ? "border-cyan-500 text-cyan-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Generate APK Online (Instant)</span>
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === "direct"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install on Phone (WebAPK)</span>
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
            <span>Android Studio &amp; CLI</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
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
                      <li>Select <strong className="text-emerald-300">"Install app"</strong> or <strong className="text-emerald-300">"Add to Home screen"</strong>.</li>
                      <li>Android's Play Services will synthesize and install the WebAPK directly on your device.</li>
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
                    Zero-Install Cloud APK Generator
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Download Signed APK / AAB via PWABuilder
                  </h4>
                  <p className="text-[11.5px] text-neutral-300 mt-1 leading-relaxed">
                    You can convert this app into a signed <strong>.apk</strong> or <strong>.aab</strong> package ready for Android sideloading or the Google Play Store using Microsoft &amp; Google's official cloud packager.
                  </p>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-300 font-bold text-[11px]">App URL:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentAppUrl, "url")}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[10px]"
                    >
                      {copiedKey === "url" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "url" ? "Copied!" : "Copy App URL"}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-neutral-900 rounded font-mono text-[10px] text-neutral-300 truncate select-all">
                    {currentAppUrl}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-neutral-200 block">3 Simple Steps to Download APK:</span>
                  <ol className="text-[11px] text-neutral-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                    <li>Copy the App URL above.</li>
                    <li>Open <strong>PWABuilder.com</strong> (trusted open-source packager).</li>
                    <li>Paste the URL, click <strong className="text-cyan-300">"Start"</strong>, and choose <strong className="text-cyan-300">"Package for Android"</strong> to download your <code className="text-white">.apk</code> file!</li>
                  </ol>
                </div>

                <a
                  href={`https://www.pwabuilder.com/?url=${encodeURIComponent(currentAppUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open PWABuilder &amp; Generate APK</span>
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
                  <span className="font-bold text-neutral-200 block">How to build app-debug.apk from the zip:</span>
                  <ol className="text-neutral-400 space-y-1 list-decimal list-inside pl-1">
                    <li>Unzip the downloaded file and open the <code className="text-white">android</code> folder in <strong>Android Studio</strong>.</li>
                    <li>Or run terminal command: <code className="text-indigo-300 font-mono">./gradlew assembleDebug</code></li>
                    <li>Your generated APK will be at: <code className="text-emerald-300 font-mono">android/app/build/outputs/apk/debug/app-debug.apk</code></li>
                  </ol>
                </div>
              </div>

              {/* Bubblewrap CLI Option */}
              <div className="p-4 bg-gradient-to-br from-purple-950/50 via-neutral-900 to-neutral-950 border border-purple-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    Google Bubblewrap CLI (TWA / APK)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`npm i -g @bubblewrap/cli\nbubblewrap init --manifest="${manifestUrl}"\nbubblewrap build`, "cli")}
                    className="flex items-center gap-1 text-[10px] font-mono text-purple-300 hover:text-white cursor-pointer"
                  >
                    {copiedKey === "cli" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "cli" ? "Copied!" : "Copy Commands"}</span>
                  </button>
                </div>

                <p className="text-[11.5px] text-neutral-300 leading-relaxed font-sans">
                  <strong>Bubblewrap</strong> is Google's official CLI tool that wraps this web app into a Trusted Web Activity (TWA), producing standard signed <strong>.apk</strong> and <strong>.aab</strong> binaries for direct installation or Google Play Store distribution.
                </p>

                <div className="space-y-2">
                  <span className="text-[10.5px] text-neutral-400 font-mono">1. Install Bubblewrap CLI:</span>
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[10.5px] text-purple-300 select-all">
                    npm i -g @bubblewrap/cli
                  </div>

                  <span className="text-[10.5px] text-neutral-400 font-mono">2. Initialize Android Project:</span>
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[10.5px] text-purple-300 select-all overflow-x-auto">
                    bubblewrap init --manifest="{manifestUrl}"
                  </div>

                  <span className="text-[10.5px] text-neutral-400 font-mono">3. Build APK / AAB:</span>
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[10.5px] text-purple-300 select-all">
                    bubblewrap build
                  </div>
                </div>

                <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl text-[11px] text-neutral-400 leading-relaxed">
                  The generated <code className="text-white">app-release-signed.apk</code> can be transferred via USB, cloud drive, or email and installed onto any Android device running Android 5.0 through Android 15+.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 font-mono">
            Android Manifest: {manifestUrl}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
