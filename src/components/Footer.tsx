import Link from "next/link";
import { Shield, Lock, Smartphone, CheckCircle, HeartHandshake } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E9E4] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1B4D3E] flex items-center justify-center text-white">
                <Shield className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="font-bold text-base text-[#1A201C]">
                Lost & Found
              </span>
            </div>
            <p className="text-xs text-[#65736B] leading-relaxed">
              Decentralized registry connecting finders and owners through privacy-first indexing, zero-trust photo protection, and Mobile Money micro-escrow.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4D3E]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Phase 5 Architecture Active
            </div>
          </div>

          {/* Quick Links: Finders */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A201C]">For Finders</h4>
            <ul className="space-y-2 text-xs text-[#65736B]">
              <li>
                <a href="#report-found" className="hover:text-[#1B4D3E] transition-colors">
                  Report Found Property
                </a>
              </li>
              <li>
                <a href="#handover" className="hover:text-[#1B4D3E] transition-colors">
                  QR Code Handover System
                </a>
              </li>
              <li>
                <a href="#payouts" className="hover:text-[#1B4D3E] transition-colors">
                  MoMo Finder Delivery Fee Payouts
                </a>
              </li>
              <li>
                <a href="#safe-points" className="hover:text-[#1B4D3E] transition-colors">
                  Approved Sector Handover Points
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links: Owners & Claimers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A201C]">For Claimers</h4>
            <ul className="space-y-2 text-xs text-[#65736B]">
              <li>
                <a href="#registry" className="hover:text-[#1B4D3E] transition-colors">
                  Search Registered Documents
                </a>
              </li>
              <li>
                <a href="#post-bounty" className="hover:text-[#1B4D3E] transition-colors">
                  Post Lost Item Bounty
                </a>
              </li>
              <li>
                <a href="#dual-verification" className="hover:text-[#1B4D3E] transition-colors">
                  Dual Verification (Option C)
                </a>
              </li>
              <li>
                <a href="#sms-alerts" className="hover:text-[#1B4D3E] transition-colors">
                  SMS Fallback Notification Setup
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Trust Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A201C]">Trust & Guardrails</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4]">
                <Lock className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-[#1A201C] block">Zero-Trust Blur & Masking</span>
                  <span className="text-[#65736B]">All ID numbers and photos are masked by default.</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4]">
                <HeartHandshake className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <span className="font-semibold text-[#1A201C] block">MoMo Micro-Escrow</span>
                  <span className="text-[#65736B]">Funds released only upon verified QR physical check-in.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E5E9E4] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#65736B]">
          <p>© {new Date().getFullYear()} Lost & Found Registry. Strict Light-Mode Architecture.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#1B4D3E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              PWA Ready (Add to Home Screen)
            </span>
            <span>•</span>
            <span className="text-[#65736B]">Version 1.0 (Phase 1)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

