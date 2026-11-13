"use client";

import { MapPin, Calendar, ShieldCheck, ArrowRight, EyeOff, CheckCircle } from "lucide-react";

export interface ItemCardProps {
  id: string;
  type: "found" | "lost";
  category: "National ID" | "Driver's License" | "Passport" | "Keys" | "Wallet" | "Other";
  title: string;
  maskedIdentifier: string; // e.g. "119988****521"
  location: {
    district: string;
    sector: string;
    meetingPoint?: string;
  };
  date: string;
  escrowAmount?: string; // e.g. "5,000 RWF"
  status: "Active" | "Pending Handover" | "Claimed";
}

export default function FoundationalCard({ item }: { item: ItemCardProps }) {
  const isFound = item.type === "found";

  return (
    <div className="bg-white rounded-2xl border border-[#E5E9E4] p-5 shadow-[0_2px_10px_rgba(27,77,62,0.04)] hover:shadow-[0_8px_20px_rgba(27,77,62,0.08)] transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isFound
                ? "bg-[#EBF3EF] text-[#1B4D3E] border border-[#DEEBE5]"
                : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isFound ? "bg-[#1B4D3E]" : "bg-[#D97706]"
              }`}
            ></span>
            {isFound ? "Found Item" : "Lost Bounty"}
          </span>

          {item.escrowAmount && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              {item.escrowAmount} Escrow
            </span>
          )}
        </div>

        {/* Card Title & Category */}
        <div className="mb-3">
          <div className="text-[11px] font-semibold text-[#65736B] uppercase tracking-wider mb-0.5">
            {item.category}
          </div>
          <h3 className="text-base font-bold text-[#1A201C] group-hover:text-[#1B4D3E] transition-colors">
            {item.title}
          </h3>
        </div>

        {/* Masked Sensitive Identifier (Zero-Trust Guardrail) */}
        <div className="mb-4 p-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-[#65736B]" />
            <span className="text-xs text-[#65736B] font-medium">Masked Ref:</span>
          </div>
          <span className="font-mono text-xs font-bold text-[#1B4D3E] tracking-wider bg-white px-2 py-0.5 rounded border border-[#E5E9E4]">
            {item.maskedIdentifier}
          </span>
        </div>

        {/* Zero-Trust Simulated Photo Area */}
        <div className="relative w-full h-32 rounded-xl bg-[#F0F4F1] border border-dashed border-[#DEEBE5] mb-4 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-[6px] bg-white/40 flex flex-col items-center justify-center p-4">
            <div className="w-8 h-8 rounded-full bg-[#EBF3EF] flex items-center justify-center text-[#1B4D3E] mb-1.5">
              <EyeOff className="w-4 h-4" />
            </div>
            <p className="text-[11px] font-medium text-[#1A201C] leading-snug">
              Protected Zero-Trust Preview
            </p>
            <p className="text-[10px] text-[#65736B] leading-tight">
              Unlocks after passing Dual Verification (Option C)
            </p>
          </div>
        </div>

        {/* Meta Details: Location & Date */}
        <div className="space-y-1.5 text-xs text-[#65736B] mb-5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
            <span>
              {item.location.sector}, {item.location.district}
              {item.location.meetingPoint ? ` (${item.location.meetingPoint})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#65736B]" />
            <span>Reported {item.date}</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31] active:scale-[0.98] transition-all shadow-sm">
        <span>{isFound ? "Claim & Verify Ownership" : "Provide Match Lead"}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

