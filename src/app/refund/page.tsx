import Link from "next/link";
import { Coins, RefreshCw, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Refund & Escrow Payout Policy | Found IN",
  description: "Found IN - Your Secure Recovery Solution. Rules governing Mobile Money escrow locking, refund eligibility, and fee disbursements.",
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E5E9E4] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold">
          <Coins className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Transparent Escrow Protection</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A201C] tracking-tight">
          Refund & Escrow Payout Policy
        </h1>
        <p className="text-sm text-[#65736B]">
          Effective Date: November 2026 • Published by Digital Elevation Solutions, Kigali, Rwanda.
        </p>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <Clock className="w-4 h-4 text-[#10B981]" />
            <span>48-Hour Grace Expiry</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            If the finder does not meet or respond within the 48-hour handover timer, the locked escrow amount is fully eligible for an immediate refund back to the payer.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <RefreshCw className="w-4 h-4 text-[#10B981]" />
            <span>Inspection Mismatch</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            If you meet in person and find that the property does not belong to you or has been materially misrepresented, do not scan the QR code. You can cancel and claim a refund.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>Instant MoMo Reversal</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Approved refunds disburse directly to your MTN Mobile Money or Airtel Money phone number without lengthy banking settlement delays.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-soft space-y-6 text-sm text-[#1A201C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1A201C]">
            1. How the Escrow Locker Works
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            When a claimer passes Dual Verification (Option C), they initiate an escrow lock for the finder&apos;s delivery fee or bounty. The funds are held in an automated, neutral locker. Neither the finder nor the platform can access the funds until the physical handover QR code check-in occurs.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            2. When Are You Eligible for a Full Escrow Refund?
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            You are entitled to a 100% refund of your locked principal bounty amount under the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65736B]">
            <li><strong>Finder Unavailability (48-Hour Rule):</strong> If the finder fails to coordinate a meetup at the agreed public post within 48 hours of escrow locking.</li>
            <li><strong>Failed In-Person Inspection:</strong> If the item presented at the meetup is incorrect, damaged beyond recognition, or not the item claimed.</li>
            <li><strong>Cancellation Before Check-In:</strong> If either party mutually agrees to cancel the handover prior to scanning the QR check-in code.</li>
            <li><strong>Administrative Dispute Resolution:</strong> If an administrative review determines fraudulent activity or bad faith conduct by the finder.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            3. Platform Micro-Fee (100 RWF) Policy
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Each escrow transaction incurs a flat <strong>100 RWF</strong> micro-fee. This non-refundable micro-fee covers actual gateway costs incurred from cellular carriers (MTN/Airtel) for dispatching cellular SMS notifications and initiating collection requests.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            4. Once QR Code Is Scanned, Payout Is Final
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Scanning the finder&apos;s dynamic QR code (or entering the 6-digit backup code) triggers an atomic Firestore transaction that immediately disburses payout funds to the finder&apos;s Mobile Money phone number. <strong>Once scanned, this disbursement is final and cannot be reversed by the platform.</strong> Always physically inspect your item before scanning the QR code.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            5. Dispute Mediation & Support Escalation
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            If an in-person disagreement occurs at the sector meeting point, our moderation team is available to assist:
          </p>
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs space-y-1 text-[#1A201C]">
            <p className="font-bold">Digital Elevation Solutions Escrow Support</p>
            <p className="text-[#65736B]">Support Desk: support@digitalelevation.rw • Emergency Phone: +250 788 000 000</p>
            <p className="text-[#65736B]">Location: Kanombe, Kigali, Rwanda</p>
          </div>
        </section>
      </div>
    </div>
  );
}
