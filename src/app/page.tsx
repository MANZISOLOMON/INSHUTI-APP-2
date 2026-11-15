"use client";

import Link from "next/link";
import { 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  Search,
  Sparkles,
  Coins,
  QrCode,
  KeyRound,
  ArrowRight,
  MapPin
} from "lucide-react";
import ItemCatalog from "@/components/ItemCatalog";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-5 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold border border-[#DEEBE5]">
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Official Community Registry • Privacy-First & MoMo Escrow Protected</span>
        </div>

        <h1 className="text-[32px] sm:text-[40px] font-bold text-[#1A201C] leading-[40px] sm:leading-[48px] tracking-tight">
          Recover Lost Property in Rwanda With Privacy & Verified Escrow
        </h1>

        <p className="text-base text-[#65736B] leading-relaxed max-w-2xl mx-auto">
          Rwanda&apos;s trusted community lost and found. Finders earn safe delivery rewards, owners verify ownership with confidential challenges, and payouts release automatically via QR check-in.
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

      {/* 2. How It Works in 3 Steps (Consumer-Facing) */}
      <section id="how-it-works" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Simple & Secure Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A201C] tracking-tight">
            How It Works in 3 Easy Steps
          </h2>
          <p className="text-xs sm:text-sm text-[#65736B]">
            From reporting to safe in-person reunion, privacy and funds are protected at every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Upload Securely */}
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-bold tracking-wider">
                  STEP 01
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] flex items-center justify-center text-[#1B4D3E]">
                  <Lock className="w-5 h-5 text-[#1B4D3E]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1A201C]">
                Upload Securely
              </h3>
              <p className="text-xs text-[#65736B] leading-relaxed">
                Found or lost an item? Snap a photo and select a safe sector meeting post (e.g. Police Post or Sector Office). Document numbers are automatically masked (<span className="font-mono text-[#1B4D3E]">119988****521</span>) and photos are blurred for zero-trust privacy.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F8FAF7] flex items-center gap-2 text-xs font-medium text-[#1B4D3E]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Zero-Trust Auto-Masking</span>
            </div>
          </div>

          {/* Step 2: Verify Ownership */}
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-bold tracking-wider">
                  STEP 02
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] flex items-center justify-center text-[#1B4D3E]">
                  <KeyRound className="w-5 h-5 text-[#1B4D3E]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1A201C]">
                Verify Ownership
              </h3>
              <p className="text-xs text-[#65736B] leading-relaxed">
                Claimers verify ownership by answering a confidential challenge question set by the finder (e.g. birth sector or serial ending) or visual comparison. Once verified, the delivery fee or reward locks safely into Mobile Money escrow.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F8FAF7] flex items-center gap-2 text-xs font-medium text-[#1B4D3E]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>MoMo Escrow Protection</span>
            </div>
          </div>

          {/* Step 3: Meet & Release via QR */}
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-bold tracking-wider">
                  STEP 03
                </span>
                <div className="w-10 h-10 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] flex items-center justify-center text-[#1B4D3E]">
                  <QrCode className="w-5 h-5 text-[#1B4D3E]" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1A201C]">
                Meet & Release via QR
              </h3>
              <p className="text-xs text-[#65736B] leading-relaxed">
                Meet safely in person at the designated sector station. The owner inspects their property and scans the finder&apos;s dynamic QR code (or enters the 6-digit backup code). Escrow funds are disbursed instantly to the finder&apos;s phone.
              </p>
            </div>
            <div className="pt-3 border-t border-[#F8FAF7] flex items-center gap-2 text-xs font-medium text-[#1B4D3E]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Instant Contactless Payout</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Interactive Search Catalog */}
      <section id="registry" className="space-y-4">
        <ItemCatalog />
      </section>
    </div>
  );
}
