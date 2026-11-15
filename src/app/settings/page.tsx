"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Smartphone, 
  Clock, 
  ArrowLeft 
} from "lucide-react";

export default function SettingsPage() {
  const [phoneNumber, setPhoneNumber] = useState("+250 788 123 456");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePurgeRequest = async () => {
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          userId: "current_user",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to purge account data.");
      }

      setPurgeSuccess(data.message);
      setConfirmModalOpen(false);

      // Clear local browser storage
      try {
        localStorage.removeItem("rwanda_cookie_consent");
        localStorage.removeItem("rwanda_pwa_banner_dismissed");
      } catch {
        // Ignore
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-2 border-b border-[#E5E9E4] pb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4D3E] hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Registry</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A201C] tracking-tight">
          Account & Privacy Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#65736B]">
          Manage your personal records, contact preferences, and data privacy rights under Rwanda Law No. 058/2021.
        </p>
      </div>

      {purgeSuccess ? (
        <div className="p-6 rounded-3xl bg-white border border-[#E5E9E4] shadow-soft space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] text-[#10B981] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#1A201C]">Data Purge Complete</h2>
          <p className="text-xs text-[#65736B] max-w-md mx-auto leading-relaxed">
            {purgeSuccess}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1B4D3E] text-white text-xs font-semibold hover:bg-[#153D31]"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* User Profile Overview */}
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#F8FAF7] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A201C]">Citizen User Profile</h3>
                  <p className="text-[11px] text-[#65736B]">Authenticated via Firebase Phone OTP</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF3EF] text-[#1B4D3E]">
                Verified Phone
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                  Registered Mobile Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs font-mono text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                  />
                </div>
                <p className="text-[11px] text-[#65736B] mt-1">
                  Used for SMS auto-match notifications and Mobile Money micro-escrow releases.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Legal Rights Info */}
          <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-soft space-y-3 text-xs text-[#65736B] leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-[#1A201C]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>Your Statutory Rights under Rwanda Law No. 058/2021</span>
            </div>
            <p>
              Under Rwandan personal data protection regulations, you possess the absolute right to demand the erasure of personal identifiers, unredacted photos, or active listings from our registry at any time without penalty.
            </p>
          </div>

          {/* Danger Zone: Delete Account & Purge Data */}
          <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900">
                  Delete Account & Purge Data
                </h3>
                <p className="text-[11px] text-red-600">
                  Irreversible permanent removal of your contact details, active listings, and verification records.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 border-t border-red-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-[#65736B]">
                This will unlink any registered items, revoke verification credentials, and purge SMS logs.
              </p>
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Delete Account & Purge Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="confirm-purge-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-elevated space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 id="confirm-purge-title" className="text-base font-bold text-[#1A201C]">
                Confirm Permanent Account Deletion?
              </h3>
              <p className="text-xs text-[#65736B] leading-relaxed">
                This action is irreversible. All item listings associated with <span className="font-mono font-bold text-[#1A201C]">{phoneNumber}</span> will be permanently unlinked and deleted from the registry.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-full border border-[#E5E9E4] text-xs font-semibold text-[#1A201C] hover:bg-[#F8FAF7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeRequest}
                disabled={isDeleting}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {isDeleting ? "Purging Records..." : "Yes, Purge My Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
