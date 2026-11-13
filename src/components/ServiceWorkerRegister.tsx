"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function ServiceWorkerRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA capabilities
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration skipped or failed:", err);
          });
      });
    }

    // 2. Listen for BeforeInstallPrompt event for "Add to Home Screen"
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 3. Detect if already installed in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-white border border-[#E5E9E4] rounded-2xl p-4 shadow-elevated flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] flex items-center justify-center text-[#1B4D3E] shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-[#1A201C]">Install PWA App</h4>
          <p className="text-xs text-[#65736B]">Add to Home Screen for fast offline access & camera scanning.</p>
        </div>
      </div>
      <button
        onClick={handleInstallClick}
        className="px-3 py-1.5 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] shrink-0"
      >
        Install
      </button>
    </div>
  );
}

