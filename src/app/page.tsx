"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import ItemCatalog from "@/components/ItemCatalog";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const { requireAuth } = useAuth();

  return (
    <div className="space-y-16">
      {/* 1. Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 pt-6 pb-2">
        {/* Floating pill badges above heading removed per UI/UX directive */}
        <h1 className="text-[32px] sm:text-[46px] font-extrabold text-[#1A201C] leading-[40px] sm:leading-[54px] tracking-tight">
          Lost Your ID, Wallet, or Keys in Rwanda? Recover Them Safely.
        </h1>

        <p className="text-base sm:text-lg text-[#4A5568] leading-relaxed max-w-2xl mx-auto font-normal">
          Search items found across Kigali and beyond. Verify ownership privately, meet at a local sector post, and pay finder rewards safely via MTN MoMo or Airtel Money.
        </p>

        {/* Action Buttons with 44px min height touch targets and decluttered icons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => requireAuth(() => router.push("/report-found"))}
            className="inline-flex items-center justify-center min-h-[44px] px-7 py-3 rounded-full bg-[#1B4D3E] text-white font-semibold text-sm hover:bg-[#153D31] active:scale-[0.98] transition-all shadow-soft cursor-pointer"
          >
            <span>{t.reportFoundBtn}</span>
          </button>

          <button
            onClick={() => requireAuth(() => router.push("/post-lost"))}
            className="inline-flex items-center justify-center min-h-[44px] px-7 py-3 rounded-full bg-[#EBF3EF] text-[#1B4D3E] font-semibold text-sm hover:bg-[#DEEBE5] active:scale-[0.98] transition-all cursor-pointer border border-[#DEEBE5]"
          >
            <span>{t.postLostBtn}</span>
          </button>

          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-7 py-3 rounded-full bg-white text-[#1A201C] border border-[#E5E9E4] font-semibold text-sm hover:bg-[#F8FAF7] active:scale-[0.98] transition-all shadow-2xs"
          >
            <Search className="w-4 h-4 text-[#4A5568] stroke-[1.75]" />
            <span>{t.searchBtn}</span>
          </Link>
        </div>
      </section>

      {/* 2. How It Works: Asymmetrical Staggered Timeline (No Floating Pill Badges) */}
      <section id="how-it-works" className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A201C] tracking-tight">
            How It Works in 3 Easy Steps
          </h2>
          <p className="text-sm text-[#4A5568] leading-relaxed">
            From reporting to safe in-person reunion, privacy and funds are protected at every stage.
          </p>
        </div>

        {/* Staggered Vertical Step-by-Step Timeline with Numbered Index Badges */}
        <div className="relative space-y-6 sm:space-y-8 before:absolute before:inset-0 before:left-7 sm:before:left-1/2 before:w-0.5 before:-ml-px before:bg-[#E5E9E4] before:hidden sm:before:block">
          
          {/* STEP 01 */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="sm:w-1/2 sm:text-right space-y-2 sm:pr-4">
              <div className="inline-flex sm:hidden items-center justify-center w-10 h-10 rounded-2xl bg-[#1B4D3E] text-white font-mono font-bold text-sm shadow-xs mb-1">
                01
              </div>
              <h3 className="text-lg font-bold text-[#1A201C]">
                Upload & Protect Details
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Snap a photo and select a safe sector meeting point (like a Police Post or Sector Office). National ID numbers are masked (<span className="font-mono text-[#1B4D3E] font-semibold">119988****521</span>) and photos are blurred for zero-trust privacy.
              </p>
            </div>

            {/* Center Timeline Node for Desktop */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1B4D3E] text-white font-mono font-extrabold text-sm shadow-sm ring-4 ring-[#F8FAF7] z-10 shrink-0">
              01
            </div>

            <div className="w-full sm:w-1/2 bg-white rounded-3xl border border-[#E5E9E4] p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1B4D3E] border-b border-[#F8FAF7] pb-2">
                <span>Automatic Zero-Trust Safeguard</span>
                <span className="font-mono text-[#10B981] font-bold">ACTIVE</span>
              </div>
              <p className="text-xs text-[#4A5568] mt-2.5 leading-relaxed">
                Raw photos and sensitive numbers never touch public endpoints until verified.
              </p>
            </div>
          </div>

          {/* STEP 02 (Staggered on Desktop) */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="w-full sm:w-1/2 order-2 sm:order-1 bg-white rounded-3xl border border-[#E5E9E4] p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1B4D3E] border-b border-[#F8FAF7] pb-2">
                <span>MoMo Escrow Protection</span>
                <span className="font-mono text-[#10B981] font-bold">MTN / Airtel</span>
              </div>
              <p className="text-xs text-[#4A5568] mt-2.5 leading-relaxed">
                Delivery fee or reward is held safely in escrow. No cash risk for either party.
              </p>
            </div>

            {/* Center Timeline Node for Desktop */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1B4D3E] text-white font-mono font-extrabold text-sm shadow-sm ring-4 ring-[#F8FAF7] z-10 shrink-0 order-1 sm:order-2">
              02
            </div>

            <div className="sm:w-1/2 order-1 sm:order-3 space-y-2 sm:pl-4">
              <div className="inline-flex sm:hidden items-center justify-center w-10 h-10 rounded-2xl bg-[#1B4D3E] text-white font-mono font-bold text-sm shadow-xs mb-1">
                02
              </div>
              <h3 className="text-lg font-bold text-[#1A201C]">
                Privately Verify Ownership
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                The owner answers a confidential challenge question set by the finder (like birth sector or year of issue) or submits visual detail proof. Once confirmed, the agreed reward locks securely into Mobile Money escrow.
              </p>
            </div>
          </div>

          {/* STEP 03 */}
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <div className="sm:w-1/2 sm:text-right space-y-2 sm:pr-4">
              <div className="inline-flex sm:hidden items-center justify-center w-10 h-10 rounded-2xl bg-[#1B4D3E] text-white font-mono font-bold text-sm shadow-xs mb-1">
                03
              </div>
              <h3 className="text-lg font-bold text-[#1A201C]">
                Meet & Release via QR Check-In
              </h3>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                Meet safely in person at the local sector station. After inspecting the item, the owner scans the finder&apos;s dynamic QR code. The escrow deposit releases immediately to the finder&apos;s phone.
              </p>
            </div>

            {/* Center Timeline Node for Desktop */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1B4D3E] text-white font-mono font-extrabold text-sm shadow-sm ring-4 ring-[#F8FAF7] z-10 shrink-0">
              03
            </div>

            <div className="w-full sm:w-1/2 bg-white rounded-3xl border border-[#E5E9E4] p-5 shadow-soft">
              <div className="flex items-center justify-between text-xs font-semibold text-[#1B4D3E] border-b border-[#F8FAF7] pb-2">
                <span>Instant Contactless Payout</span>
                <span className="font-mono text-[#10B981] font-bold">QR Verified</span>
              </div>
              <p className="text-xs text-[#4A5568] mt-2.5 leading-relaxed">
                Both parties receive immediate SMS confirmation and an official recovery voucher.
              </p>
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
