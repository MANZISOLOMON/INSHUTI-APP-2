import Link from "next/link";
import { Shield, FileCheck, Coins, QrCode, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms of Service & Community Guardrails | Lost & Found Rwanda",
  description: "Terms governing property reporting, dual ownership verification, and MoMo micro-escrow handovers.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E5E9E4] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold">
          <FileCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Community Agreement</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A201C] tracking-tight">
          Terms of Service & Platform Guardrails
        </h1>
        <p className="text-sm text-[#65736B]">
          Effective Date: November 2026 • Published by Digital Elevation Solutions, Kigali, Rwanda.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <Shield className="w-4 h-4 text-[#10B981]" />
            <span>Authorized Reporting</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Users must verify lawful authority when posting. Posting fabricated claims, extortion attempts, or dangerous/illegal contraband is strictly prohibited.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <Coins className="w-4 h-4 text-[#10B981]" />
            <span>Escrow & Flat 100 RWF Fee</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Escrow rewards are capped between 500 RWF and 500,000 RWF. A flat 100 RWF micro-fee is appended to cover cellular SMS carrier gateway dispatch costs.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <QrCode className="w-4 h-4 text-[#10B981]" />
            <span>48h QR Handover Rule</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Funds release only upon physical QR code check-in at an approved public sector post. If unclaimed past 48 hours, claims are flagged for admin dispute mediation.
          </p>
        </div>
      </div>

      {/* Legal Text */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-soft space-y-6 text-sm text-[#1A201C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1A201C]">
            1. Acceptance of Terms & Eligibility
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            By accessing or using the Lost & Found Registry platform, you agree to be bound by these Terms of Service. You affirm that you are either the lawful owner of the property or a Good Samaritan finder acting in good faith to return lost items to their rightful owners.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            2. Finder Conduct & Safe Public Handover Points
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Finders must adhere to the following safety protocols:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65736B]">
            <li><strong>Public Handover Locations:</strong> All physical exchanges must occur at designated public locations, such as Rwanda National Police Posts, Sector Administration Offices, or recognized commercial transport hubs. Never arrange handovers in secluded or private residences.</li>
            <li><strong>No Extortion or Ransom Demands:</strong> Finders may request a fair delivery/custody compensation fee (within the 500 to 500,000 RWF range). Demanding exorbitant or coercive ransom payments is illegal under Rwandan penal law and will be reported to authorities.</li>
            <li><strong>Property Preservation:</strong> Finders agree to maintain found items in the same condition as discovered and not alter, deface, or access digital contents.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            3. Claimer Verification (Option C) & Ownership
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            To prevent fraud and identity theft, claimers must satisfy our Dual Verification requirement:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65736B]">
            <li><strong>Option A (Challenge Question):</strong> Correctly answer the confidential secret challenge set by the finder (e.g. distinguishing marks, serial suffixes, or birth sector).</li>
            <li><strong>Option B (Visual Inspection Request):</strong> Request finder approval through verified photographic visual comparison.</li>
            <li>Falsely claiming property belonging to another citizen constitutes criminal fraud under the Laws of Rwanda and results in immediate account termination.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            4. MoMo Escrow Locker, Platform Fees, and Release
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            All monetary delivery fees and bounties are safeguarded by our automated escrow smart ledger:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65736B]">
            <li><strong>Micro-Fee Transparency:</strong> A flat micro-fee of <strong>100 RWF</strong> is appended to each escrow lock to subsidize cellular carrier SMS delivery fees and serverless infrastructure costs.</li>
            <li><strong>Atomic Release:</strong> Escrow funds are released to the finder&apos;s phone only when the owner performs the physical check-in by scanning the finder&apos;s dynamic QR code or entering the 6-digit backup token.</li>
            <li><strong>48-Hour Handover Grace Period:</strong> Once escrow is locked, both parties have 48 hours to complete check-in. If the handover does not occur, parties can request an automated or admin-assisted refund as detailed in our{" "}
              <Link href="/refund" className="text-[#1B4D3E] underline font-medium">
                Refund Policy
              </Link>.
            </li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            5. Limitation of Liability
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Digital Elevation Solutions provides the digital registry on an &quot;as-is&quot; basis as a community utility. While we enforce strict zero-trust identity shielding, cryptographic hashing, and escrow safeguards, we are not liable for physical interactions between independent citizens, item condition disputes occurring prior to registration, or cellular network outages outside our control.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            6. Governing Law & Jurisdiction
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of the Republic of Rwanda. Any unresolved disputes arising under these Terms shall be subject to the jurisdiction of the competent courts in Kigali, Rwanda.
          </p>
        </section>
      </div>
    </div>
  );
}
