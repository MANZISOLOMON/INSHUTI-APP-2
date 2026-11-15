"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, Check } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("rwanda_cookie_consent");
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Storage access disabled
      setIsVisible(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem("rwanda_cookie_consent", "accepted");
    } catch {
      // Ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E5E9E4] shadow-elevated p-3 sm:p-4 animate-fade-in"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="text-[#1A201C] leading-tight">
            We use essential local storage for zero-trust verification, session security, and PWA offline access. We strictly do not use advertising or tracking cookies. Learn more in our{" "}
            <Link href="/privacy" className="text-[#1B4D3E] font-semibold underline hover:text-[#153D31]">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/cookies" className="text-[#1B4D3E] font-semibold underline hover:text-[#153D31]">
              Cookie Policy
            </Link>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept Essential</span>
          </button>
        </div>
      </div>
    </div>
  );
}
