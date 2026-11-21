"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  MapPin, 
  Phone, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
  FileCheck,
  UserCheck
} from "lucide-react";
import { Item } from "@/types/database";

interface VerificationModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess?: (unlockedDetails: UnlockedDetails) => void;
  onProceedToEscrow?: (item: Item) => void;
}

export interface UnlockedDetails {
  privateRawUrl?: string;
  meetingPoint?: string;
  contactPhone?: string;
  claimedAt?: string;
}

export default function VerificationModal({
  item,
  isOpen,
  onClose,
  onVerificationSuccess,
  onProceedToEscrow,
}: VerificationModalProps) {
  const [secretPrompt, setSecretPrompt] = useState<string>("What is a distinguishing secret detail on this item?");
  const [hasChallengePrompt, setHasChallengePrompt] = useState(false);

  // Mandatory Proof Inputs
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [serialEnding, setSerialEnding] = useState("");
  const [markings, setMarkings] = useState("");
  const [challengeAnswer, setChallengeAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [unlockedDetails, setUnlockedDetails] = useState<UnlockedDetails | null>(null);
  const [reviewPending, setReviewPending] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setErrorMsg(null);
      setIsVerified(false);
      setReviewPending(false);
      setReviewMessage(null);
      setFullName("");
      setDateOfBirth("");
      setSerialEnding("");
      setMarkings("");
      setChallengeAnswer("");
      setUnlockedDetails(null);

      // Fetch verification status
      fetch(`/api/verify?itemId=${item.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSecretPrompt(data.secretPrompt || "What is a distinguishing secret detail on this item?");
            setHasChallengePrompt(Boolean(data.hasChallengePrompt));
            if (data.isVerified && data.unlockedDetails) {
              setIsVerified(true);
              setUnlockedDetails(data.unlockedDetails);
            } else if (data.reviewPending) {
              setReviewPending(true);
              setReviewMessage("Your proof details have already been submitted and are awaiting manual review by the finder.");
            }
          }
        })
        .catch(() => {
          setSecretPrompt("What is a distinguishing secret detail on this item?");
        });
    }
  }, [isOpen, item]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() && !serialEnding.trim() && !markings.trim() && !challengeAnswer.trim()) {
      setErrorMsg("Please provide at least one specific identifier (full name, serial ending, physical marks, or challenge answer).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          option: "MANUAL_PROOF",
          fullName: fullName.trim(),
          dateOfBirth: dateOfBirth.trim(),
          serialEnding: serialEnding.trim(),
          markings: markings.trim(),
          challengeAnswer: challengeAnswer.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit ownership proof.");
      }

      setReviewPending(true);
      setReviewMessage(data.message || "Your proof details have been submitted. The finder has been notified via SMS and will inspect your proof on their dashboard.");
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E5E9E4] shadow-elevated overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E9E4] bg-[#F8FAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <h3 id="verification-modal-title" className="text-sm font-bold text-[#1A201C]">
                Mandatory Manual Verification
              </h3>
              <p className="text-[11px] text-[#4A5568]">
                Zero auto-approvals. The finder manually inspects and approves your claim.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#4A5568] hover:text-[#1A201C] hover:bg-white border border-transparent hover:border-[#E5E9E4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Item Context Card */}
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#DEEBE5] flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-bold text-[#1B4D3E] uppercase tracking-wider block mb-0.5">
                Target Listing
              </span>
              <h4 className="text-sm font-bold text-[#1A201C]">{item.title}</h4>
              <p className="text-xs text-[#4A5568]">
                Found in {item.district} › {item.sector}
              </p>
            </div>
            {item.maskedDocNumber && (
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#DEEBE5] font-mono text-xs font-semibold text-[#1B4D3E] shadow-2xs">
                {item.maskedDocNumber}
              </div>
            )}
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* State 1: Already Approved by Finder */}
          {isVerified && unlockedDetails ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold">Ownership Verified &amp; Approved!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  The finder has manually verified your ownership. Safe handover meetup details are unlocked.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#10B981] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#4A5568] block uppercase font-bold">Safe Meetup Point</span>
                    <span className="text-xs font-semibold text-[#1A201C]">
                      {unlockedDetails.meetingPoint || "Official Sector Police Post"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#10B981] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#4A5568] block uppercase font-bold">Finder Contact Phone</span>
                    <span className="text-xs font-semibold text-[#1A201C]">
                      {unlockedDetails.contactPhone || "+250 788 000 000"}
                    </span>
                  </div>
                </div>
              </div>

              {onProceedToEscrow && (
                <button
                  onClick={() => {
                    onClose();
                    onProceedToEscrow(item);
                  }}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <Coins className="w-4 h-4 text-[#10B981]" />
                  <span>Proceed to MoMo Escrow &amp; Handover</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : reviewPending ? (
            /* State 2: Review Pending */
            <div className="p-6 rounded-2xl bg-[#EBF3EF] border border-[#DEEBE5] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#DEEBE5] flex items-center justify-center mx-auto text-[#1B4D3E] shadow-2xs">
                <FileCheck className="w-6 h-6 text-[#10B981]" />
              </div>
              <h4 className="text-sm font-bold text-[#1A201C]">Proof Submitted to Finder</h4>
              <p className="text-xs text-[#4A5568] max-w-md mx-auto leading-relaxed">
                {reviewMessage || "Your proof details have been sent to the finder for inspection. Once the finder reviews and approves your submission, you will receive an SMS alert and handover meetup details will unlock."}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 rounded-full bg-white border border-[#DEEBE5] text-xs font-bold text-[#1A201C] hover:bg-[#F8FAF7] transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            /* State 3: Proof Submission Form */
            <form onSubmit={handleSubmitProof} className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#4A5568] flex items-start gap-2.5">
                <UserCheck className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
                <span>
                  To prevent fraudulent claims, zero claims are auto-approved. Please submit verifying details that only the genuine owner would know.
                </span>
              </div>

              {/* Challenge Question (if exists) */}
              {hasChallengePrompt && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Finder&apos;s Secret Challenge Question:
                  </label>
                  <p className="text-xs text-amber-800 mb-2 italic">
                    &ldquo;{secretPrompt}&rdquo;
                  </p>
                  <input
                    type="text"
                    value={challengeAnswer}
                    onChange={(e) => setChallengeAnswer(e.target.value)}
                    placeholder="Your answer to this question..."
                    className="w-full px-3.5 py-2 rounded-lg bg-white border border-amber-300 text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E]"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                    Full Name on Document
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jean Pierre Mugabo"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                    Date of Birth or Issuance
                  </label>
                  <input
                    type="text"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    placeholder="e.g. 15/08/1995 or 2022"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                  Serial Number or Masked Ending Digits
                </label>
                <input
                  type="text"
                  value={serialEnding}
                  onChange={(e) => setSerialEnding(e.target.value)}
                  placeholder="e.g. Ending with 521 or full ID number"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                  Unique Physical Markings / Distinct Characteristics
                </label>
                <textarea
                  rows={2}
                  value={markings}
                  onChange={(e) => setMarkings(e.target.value)}
                  placeholder="e.g., Brown leather wallet with Bank of Kigali card, keychain with blue fob, minor scratch on back corner..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-xs text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting Proof to Finder...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Proof for Finder Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
