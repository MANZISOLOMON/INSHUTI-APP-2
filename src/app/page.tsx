"use client";

import Link from "next/link";
import { 
  Shield, 
  PlusCircle, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  Search,
  Sparkles,
  Coins
} from "lucide-react";
import ItemCatalog from "@/components/ItemCatalog";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-5 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold border border-[#DEEBE5]">
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Phase 3 Active • Live Search Catalog & Zero-Trust Uploads</span>
        </div>

        <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1A201C] leading-[40px] sm:leading-[48px] tracking-tight">
          Recover Lost Property With Zero-Trust Safety & Escrow
        </h1>

        <p className="text-base text-[#65736B] leading-relaxed max-w-2xl mx-auto">
          Rwanda&apos;s privacy-first community registry. Finders earn safe delivery fees, owners verify with confidential challenges, and rewards are protected via Mobile Money micro-escrow.
        </p>

        {/* Action Buttons (Strict Pill Buttons per Design Brief) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/report-found"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1B4D3E] text-white font-medium text-sm hover:bg-[#153D31] active:scale-[0.98] transition-all shadow-soft"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found Item</span>
          </Link>

          <Link
            href="/post-lost"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EBF3EF] text-[#1B4D3E] font-medium text-sm hover:bg-[#DEEBE5] active:scale-[0.98] transition-all"
          >
            <Coins className="w-4 h-4" />
            <span>Post Lost Bounty</span>
          </Link>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#1A201C] border border-[#E5E9E4] font-medium text-sm hover:bg-[#F8FAF7] active:scale-[0.98] transition-all"
          >
            <Search className="w-4 h-4 text-[#65736B]" />
            <span>Browse Registry</span>
          </Link>
        </div>
      </section>

      {/* 2. Live Interactive Search Catalog */}
      <section id="registry" className="space-y-4">
        <ItemCatalog />
      </section>

      {/* 3. Architecture Guardrails & Verification Box */}
      <section id="how-it-works" className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1A201C]">
              Zero-Trust Architecture & Guardrails
            </h3>
            <p className="text-xs text-[#65736B]">
              Rigorous compliance with RULES.md, DESIGN_BRIEF.md, and TECHNICAL_REQUIREMENTS.md
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Strict Light Mode</span>
            </div>
            <p className="text-xs text-[#65736B] leading-relaxed">
              No dark mode components allowed. Soft cream canvas (<code className="text-[#1B4D3E]">#F8FAF7</code>), pure white cards (<code className="text-[#1B4D3E]">#FFFFFF</code>), and deep forest green (<code className="text-[#1B4D3E]">#1B4D3E</code>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E]">
              <Lock className="w-4 h-4 text-[#10B981]" />
              <span>Zero-Trust Privacy</span>
            </div>
            <p className="text-xs text-[#65736B] leading-relaxed">
              Masked document numbers (<code className="text-[#1B4D3E]">119988****521</code>) and Sharp Gaussian-blurred public previews. Secret challenge answers are hashed before storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E]">
              <Coins className="w-4 h-4 text-[#10B981]" />
              <span>MoMo Escrow Locker</span>
            </div>
            <p className="text-xs text-[#65736B] leading-relaxed">
              Delivery fees and bounties are locked in Mobile Money escrow with transparent flat platform fee splits. Released instantly via QR scan check-in.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E]">
              <Smartphone className="w-4 h-4 text-[#10B981]" />
              <span>PWA Ready</span>
            </div>
            <p className="text-xs text-[#65736B] leading-relaxed">
              Web App Manifest and service worker installed for offline capability and native camera access during physical check-in.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
