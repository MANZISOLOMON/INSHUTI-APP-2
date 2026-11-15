import Link from "next/link";
import { Shield, Lock, EyeOff, FileText, CheckCircle2, UserX } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Zero-Trust Data Protection | Lost & Found Rwanda",
  description: "Our privacy commitments under Rwanda Law No. 058/2021 relating to the protection of personal data and cyber privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E5E9E4] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold">
          <Shield className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Rwanda Law No. 058/2021 Compliant</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A201C] tracking-tight">
          Privacy Policy & Zero-Trust Data Architecture
        </h1>
        <p className="text-sm text-[#65736B]">
          Effective Date: November 2026 • Operated by Digital Elevation Solutions, Kanombe, Kigali, Rwanda.
        </p>
      </div>

      {/* Core Privacy Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <Lock className="w-4 h-4 text-[#10B981]" />
            <span>Zero-Trust Auto-Blur</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            All uploaded document photos are processed through an automated server-side Gaussian blur (sigma 28) before storage. Raw unblurred photos are stored in locked buckets accessible only post-verification.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <EyeOff className="w-4 h-4 text-[#10B981]" />
            <span>National ID Masking</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Document numbers are never displayed in plaintext. Numbers are systematically masked (<code className="text-[#1B4D3E] font-mono">119988****521</code>) to shield citizen identities while enabling algorithmic cross-matching.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-soft space-y-2">
          <div className="flex items-center gap-2 text-[#1B4D3E] font-bold text-xs">
            <UserX className="w-4 h-4 text-[#10B981]" />
            <span>Right to Erasure</span>
          </div>
          <p className="text-xs text-[#65736B] leading-relaxed">
            In accordance with Rwandan data protection law, citizens maintain full authority to delete their account records and unlink all registered items at any time through our self-service portal.
          </p>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-soft space-y-6 text-sm text-[#1A201C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1A201C] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1B4D3E]" />
            <span>1. Information We Collect</span>
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            We operate on a principle of data minimization. We only collect information strictly required to facilitate the safe return of lost property:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65736B]">
            <li><strong>Listing Details:</strong> Item category, title, rough description, sector/district of discovery, and safe public meeting point (such as a local Police Post or Sector Administration Office).</li>
            <li><strong>Masked Identifiers:</strong> Partially redacted document numbers (<code className="font-mono text-[#1B4D3E]">119988****521</code>). Full document numbers are never published or distributed.</li>
            <li><strong>Secret Challenge Hashes:</strong> One-way cryptographic SHA-256 hashes of challenge answers provided by finders. We never store plaintext answers to challenge questions.</li>
            <li><strong>Cellular Phone Numbers:</strong> Mobile numbers collected for dispatching cellular SMS match alerts and MoMo escrow transaction confirmations. Phone numbers are shielded until dual verification is passed.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            2. How We Protect and Process Your Data
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Our infrastructure adheres to zero-trust architecture standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65736B]">
            <li><strong>EXIF & Metadata Stripping:</strong> All uploaded photos have camera serial numbers, GPS coordinates, and device timestamps stripped before saving.</li>
            <li><strong>Access Control:</strong> Unredacted images (<code className="font-mono text-[#1B4D3E]">/items-private-raw/</code>) and finder phone numbers are locked behind server-side authentication and granted only upon successful Dual Verification (Option C).</li>
            <li><strong>Mobile Money Escrow Isolation:</strong> Financial payouts and bounty locks are handled via direct cellular carrier APIs (MTN MoMo and Airtel Money). We do not collect or store debit/credit card numbers or banking passwords.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            3. Automated Item Lifecycle & Retention
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Listings do not persist indefinitely. Our automated lifecycle engine executes the following scheduled actions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65736B]">
            <li><strong>30-Day Auto-Archival:</strong> Active listings that remain unclaimed after 30 days are automatically archived to protect ongoing privacy.</li>
            <li><strong>48-Hour Handover Window:</strong> Claimed items trigger a 48-hour handover timer. Once physical handover is confirmed via QR check-in, listings transition to <code className="font-mono text-[#10B981]">RESOLVED</code>.</li>
          </ul>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            4. Your Data Protection Rights & Purge Requests
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            Under Law No. 058/2021, you have the right to inspect, modify, or permanently purge any personal data held by Digital Elevation Solutions. You may execute an instantaneous self-service purge through our{" "}
            <Link href="/settings" className="font-semibold text-[#1B4D3E] underline">
              Account Data Deletion & Privacy Settings
            </Link>{" "}
            or email our compliance officer directly at <a href="mailto:privacy@digitalelevation.rw" className="text-[#1B4D3E] underline font-medium">privacy@digitalelevation.rw</a>.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            5. Contact Information & Data Controller
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            For data protection inquiries, administrative notices, or dispute escalations:
          </p>
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs space-y-1 text-[#1A201C]">
            <p className="font-bold">Digital Elevation Solutions</p>
            <p className="text-[#65736B]">Kanombe Sector, Kicukiro District, City of Kigali, Rwanda</p>
            <p className="text-[#65736B]">Official Contact: support@digitalelevation.rw • +250 788 000 000</p>
          </div>
        </section>
      </div>
    </div>
  );
}
