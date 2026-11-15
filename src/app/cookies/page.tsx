import Link from "next/link";
import { Cookie, Shield, CheckCircle2, Lock } from "lucide-react";

export const metadata = {
  title: "Cookie & Local Storage Policy | Lost & Found Rwanda",
  description: "Explanation of essential cookies and client storage used for zero-trust security and PWA caching.",
};

export default function CookiesPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-3 border-b border-[#E5E9E4] pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EF] text-[#1B4D3E] text-xs font-semibold">
          <Cookie className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Privacy-First Storage</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1A201C] tracking-tight">
          Cookie & Local Storage Policy
        </h1>
        <p className="text-sm text-[#65736B]">
          Effective Date: November 2026 • Published by Digital Elevation Solutions, Kigali, Rwanda.
        </p>
      </div>

      {/* Summary Box */}
      <div className="p-5 rounded-3xl bg-[#EBF3EF] border border-[#DEEBE5] text-xs space-y-2 text-[#1A201C]">
        <div className="flex items-center gap-2 font-bold text-[#1B4D3E]">
          <Shield className="w-4 h-4 text-[#10B981]" />
          <span>Zero Advertising Cookies Guarantee</span>
        </div>
        <p className="text-[#1A201C] leading-relaxed">
          We strictly do <strong>NOT</strong> use cross-site advertising cookies, behavioral marketing trackers, or third-party profiling scripts. We utilize only essential browser local storage to provide security, session integrity, and offline PWA functionality.
        </p>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-soft space-y-6 text-sm text-[#1A201C] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1A201C]">
            1. What Storage Technologies Do We Use?
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            The Lost & Found application utilizes standard HTML5 Web Storage (<code className="font-mono text-[#1B4D3E]">localStorage</code>) and Service Worker Caches (<code className="font-mono text-[#1B4D3E]">CacheStorage</code>) for the following essential purposes:
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-xs text-left border border-[#E5E9E4] rounded-xl overflow-hidden">
              <thead className="bg-[#F8FAF7] border-b border-[#E5E9E4] text-[#1A201C] font-bold">
                <tr>
                  <th className="p-3">Storage Key</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Lifespan</th>
                  <th className="p-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E4] text-[#65736B]">
                <tr>
                  <td className="p-3 font-mono text-[#1B4D3E]">rwanda_cookie_consent</td>
                  <td className="p-3">localStorage</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3">Stores your consent acknowledgment so the banner remains hidden.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-[#1B4D3E]">rwanda_pwa_banner_dismissed</td>
                  <td className="p-3">localStorage</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3">Remembers when you dismiss the PWA installation top banner.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-[#1B4D3E]">firebase:authUser:...</td>
                  <td className="p-3">IndexedDB / Token</td>
                  <td className="p-3">Session / Auth</td>
                  <td className="p-3">Maintains secure authenticated state for Firebase Phone OTP login.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-[#1B4D3E]">lost-found-cache-v1</td>
                  <td className="p-3">CacheStorage (PWA)</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3">Caches the offline fallback page and icons for PWA camera & offline usage.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            2. Managing and Clearing Your Local Storage
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            You can clear your browser cookies and local storage at any time through your browser settings. You can also purge all your saved data and account listings directly via our{" "}
            <Link href="/settings" className="font-semibold text-[#1B4D3E] underline">
              Account Data Deletion Page
            </Link>.
          </p>
        </section>

        <section className="space-y-3 pt-4 border-t border-[#E5E9E4]">
          <h2 className="text-lg font-bold text-[#1A201C]">
            3. Inquiries
          </h2>
          <p className="text-xs text-[#65736B] leading-relaxed">
            For questions regarding our storage practices, contact Digital Elevation Solutions at <a href="mailto:support@digitalelevation.rw" className="text-[#1B4D3E] underline font-medium">support@digitalelevation.rw</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
