"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    triggerPwaInstall?: () => void;
  }
}

export default function ServiceWorkerRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if previously dismissed
    try {
      const dismissed = localStorage.getItem("rwanda_pwa_banner_dismissed") === "true";
      setIsDismissed(dismissed);
    } catch {
      setIsDismissed(false);
    }

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
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Expose globally for Footer install trigger
      window.triggerPwaInstall = async () => {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
        }
      };
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
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("rwanda_pwa_banner_dismissed", "true");
    } catch {
      // Ignore storage errors
    }
  };

  // If installed, dismissed, or no prompt yet, do not render banner
  if (isInstalled || isDismissed || !deferredPrompt) return null;

  return (
    <aside
      aria-label="Install App"
      className="bg-[#EBF3EF] border-b border-[#DEEBE5] text-[#1A201C] py-2 px-4 animate-fade-in"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-6 h-6 rounded-lg bg-[#1B4D3E] text-white flex items-center justify-center shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <p className="truncate text-[#1A201C]">
            <span className="font-semibold text-[#1B4D3E]">Install Web App:</span> Fast offline access, instant notifications & camera QR check-in on your phone.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] active:scale-95 transition-all shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="p-1 rounded-full text-[#65736B] hover:text-[#1A201C] hover:bg-[#DEEBE5] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
