"use client";

import Link from "next/link";
import Image from "next/image";
import { Lock, Smartphone, Download, Scale, RefreshCw, Cookie, UserCheck, Shield } from "lucide-react";

export default function Footer() {
  const handlePwaClick = () => {
    if (typeof window !== "undefined" && window.triggerPwaInstall) {
      window.triggerPwaInstall();
    } else {
      alert("To install Found IN Rwanda:\n• On iPhone: Tap the Share button in Safari, then tap 'Add to Home Screen'.\n• On Android: Tap Chrome menu (3 dots), then tap 'Install app' or 'Add to Home Screen'.");
    }
  };

  return (
    <footer className="bg-white border-t border-[#E5E9E4] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 1. Brand & Business Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F6F8F3] border border-[#DEEBE5] flex items-center justify-center p-1 shadow-2xs">
                <Image 
                  src="/shield-icon.png" 
                  alt="Found IN Logo" 
                  width={30} 
                  height={30} 
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center tracking-tight leading-none">
                  <span className="font-extrabold text-base text-[#1B4D3E]">Found</span>
                  <span className="font-extrabold text-base text-[#10B981] ml-1">IN</span>
                </div>
                <span className="text-[10px] text-[#65736B] font-semibold tracking-wide uppercase mt-0.5">
                  Your Secure Recovery Solution
                </span>
              </div>
            </div>
            <p className="text-xs text-[#4A5568] leading-relaxed">
              Rwanda&apos;s privacy-first recovery platform connecting finders and rightful owners through zero-trust photo protection, confidential verification, and Mobile Money micro-escrow.
            </p>
            
            {/* Operator Contact & Business Address */}
            <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-1 text-xs">
              <p className="font-bold text-[#1A201C]">Digital Elevation Solutions</p>
              <p className="text-[#4A5568]">Kanombe, Kigali, Rwanda</p>
              <p className="text-[#4A5568]">
                <a href="mailto:support@digitalelevation.rw" className="hover:text-[#1B4D3E] underline">
                  support@digitalelevation.rw
                </a>
              </p>
              <p className="text-[#4A5568] font-mono text-[11px]">+250 788 000 000</p>
            </div>
          </div>

          {/* 2. Quick Links: Finders */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A201C]">For Finders</h4>
            <ul className="space-y-2.5 text-xs text-[#4A5568]">
              <li>
                <Link href="/report-found" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Report Found Property
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=handovers" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  QR Code Handover Check-In
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=wallet" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  MoMo Finder Delivery Fee Payouts
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Approved Sector Police Posts
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Quick Links: Owners & Claimers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A201C]">For Claimers</h4>
            <ul className="space-y-2.5 text-xs text-[#4A5568]">
              <li>
                <Link href="/search" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Search Registered Documents
                </Link>
              </li>
              <li>
                <Link href="/post-lost" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Post Lost Item Bounty
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Confidential Challenge Verification
                </Link>
              </li>
              <li>
                <button
                  onClick={handlePwaClick}
                  className="hover:text-[#1B4D3E] transition-colors text-left py-1 inline-block cursor-pointer"
                >
                  Install Mobile Web App (PWA)
                </button>
              </li>
            </ul>
          </div>

          {/* 4. Legal Policies & Consumer Trust (Decluttered: no decorative Lucide icons) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A201C]">Legal & Compliance</h4>
            <ul className="space-y-2.5 text-xs text-[#4A5568]">
              <li>
                <Link href="/privacy" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Privacy Policy (Law 058/2021)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Terms of Service & Rules
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Refund & Escrow Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block">
                  Cookie & Local Storage Policy
                </Link>
              </li>
              <li>
                <Link href="/dashboard?tab=settings" className="hover:text-[#1B4D3E] transition-colors py-1 inline-block font-semibold text-[#1B4D3E]">
                  Account Data Controls & Purge
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="border-t border-[#E5E9E4] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4A5568]">
          <p>© {new Date().getFullYear()} Found IN Rwanda. Operated by Digital Elevation Solutions, Kanombe, Kigali.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-[#1B4D3E] transition-colors py-1">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#1B4D3E] transition-colors py-1">
              Terms
            </Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-[#1B4D3E] transition-colors py-1">
              Refunds
            </Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-[#1B4D3E] transition-colors py-1">
              Cookies
            </Link>
            <span>•</span>
            <Link href="/dashboard?tab=settings" className="hover:text-[#1B4D3E] transition-colors py-1">
              Data Rights
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}