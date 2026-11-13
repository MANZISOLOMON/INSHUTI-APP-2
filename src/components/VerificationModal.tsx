"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Clock, 
  MapPin, 
  Phone, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  HelpCircle
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
  const [activeTab, setActiveTab] = useState<"CHALLENGE" | "VISUAL">("CHALLENGE");
  const [secretPrompt, setSecretPrompt] = useState<string>("Loading secret challenge...");
  const [answerInput, setAnswerInput] = useState("");
  const [visualNotes, setVisualNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [unlockedDetails, setUnlockedDetails] = useState<UnlockedDetails | null>(null);

  useEffect(() => {
    if (isOpen && item) {
      setErrorMsg(null);
      setIsVerified(false);
      setAnswerInput("");
      setVisualNotes("");
      setUnlockedDetails(null);

      // Fetch challenge question
      fetch(`/api/verify?itemId=${item.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setSecretPrompt(data.secretPrompt || "What is a distinguishing secret detail on this item?");
            if (data.isVerified && data.unlockedDetails) {
              setIsVerified(true);
              setUnlockedDetails(data.unlockedDetails);
            }
          }
        })
        .catch(() => {
          setSecretPrompt("What is a distinguishing secret detail on this item?");
        });
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          option: "CHALLENGE",
          answer: answerInput,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification failed. Answer did not match.");
      }

      setIsVerified(true);
      setUnlockedDetails(data.unlockedDetails);
      if (onVerificationSuccess) onVerificationSuccess(data.unlockedDetails);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          option: "VISUAL",
          visualNote: visualNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Visual verification failed.");
      }

      setIsVerified(true);
      setUnlockedDetails(data.unlockedDetails);
      if (onVerificationSuccess) onVerificationSuccess(data.unlockedDetails);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl border border-[#E5E9E4] shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E9E4] bg-[#F8FAF7]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A201C]">
                Dual Verification (Option C)
              </h3>
              <p className="text-[11px] text-[#65736B]">
                Pass either Option A or Option B to unlock ownership
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#65736B] hover:bg-white border border-transparent hover:border-[#E5E9E4] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Item Context Card */}
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#65736B] uppercase tracking-wider text-[10px]">
                {item.category.replace("_", " ")}
              </span>
              {item.maskedDocNumber && (
                <span className="font-mono font-bold text-[#1B4D3E] bg-white px-2 py-0.5 rounded border border-[#E5E9E4]">
                  {item.maskedDocNumber}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-[#1A201C]">{item.title}</h4>
            <div className="flex items-center gap-2 text-xs text-[#65736B]">
              <MapPin className="w-3.5 h-3.5 text-[#1B4D3E]" />
              <span>{item.sector}, {item.district}</span>
              {item.feeOrReward > 0 && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-[#059669]">
                    {item.feeOrReward.toLocaleString()} RWF Escrow
                  </span>
                </>
              )}
            </div>
          </div>

          {/* SUCCESS UNLOCKED VIEW */}
          {isVerified ? (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#059669]">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <span>Dual Verification Successfully Passed!</span>
                </div>
                <p className="text-xs text-emerald-800">
                  You have verified ownership. Finder contact details and unblurred photos are now unlocked.
                </p>
              </div>

              {/* Unlocked Private Image */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1A201C] flex items-center gap-1.5">
                    <Unlock className="w-4 h-4 text-[#10B981]" />
                    Unlocked Original Photo:
                  </span>
                  <span className="text-[11px] text-[#65736B]">Zero-Trust Filter Removed</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#E5E9E4] bg-gray-50 flex items-center justify-center max-h-56">
                  <img
                    src={unlockedDetails?.privateRawUrl || item.publicBlurredUrl}
                    alt="Unlocked Item"
                    className="max-h-56 object-contain"
                  />
                </div>
              </div>

              {/* Handover & Contact Information */}
              <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1B4D3E]">
                  <Phone className="w-4 h-4" />
                  <span>Finder Handover Contact</span>
                </div>
                <div className="space-y-1.5 text-xs text-[#1A201C]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#65736B]">Direct Phone:</span>
                    <span className="font-mono font-bold text-sm text-[#1B4D3E]">
                      {unlockedDetails?.contactPhone || "+250 788 123 456"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#65736B]">Safe Meeting Spot:</span>
                    <span className="font-medium text-right">
                      {unlockedDetails?.meetingPoint || item.meetingPoint || "Kimironko Police Post"}
                    </span>
                  </div>
                </div>

                {/* 48-Hour Handover Grace Timer */}
                <div className="pt-2 border-t border-[#E5E9E4] flex items-center gap-2 text-xs text-[#92400E]">
                  <Clock className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>
                    <strong>48-Hour Handover Timer Active:</strong> Please meet the finder within 48 hours to complete physical check-in.
                  </span>
                </div>
              </div>

              {/* Action: Proceed to Escrow Locker */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onProceedToEscrow) {
                      onProceedToEscrow(item);
                    } else {
                      onClose();
                    }
                  }}
                  className="w-full btn-primary py-3 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Proceed to MoMo Escrow Locker & QR Check-In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* VERIFICATION CHALLENGE VIEW */
            <div className="space-y-4">
              {/* Tab Navigation: Option A vs Option B */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("CHALLENGE");
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "CHALLENGE"
                      ? "bg-white text-[#1B4D3E] shadow-sm"
                      : "text-[#65736B] hover:text-[#1A201C]"
                  }`}
                >
                  Option A: Secret Challenge
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("VISUAL");
                    setErrorMsg(null);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "VISUAL"
                      ? "bg-white text-[#1B4D3E] shadow-sm"
                      : "text-[#65736B] hover:text-[#1A201C]"
                  }`}
                >
                  Option B: Visual Check
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* OPTION A: CHALLENGE QUESTION */}
              {activeTab === "CHALLENGE" && (
                <form onSubmit={handleChallengeSubmit} className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B4D3E]">
                      Finder&apos;s Secret Challenge:
                    </span>
                    <p className="text-sm font-semibold text-[#1A201C]">
                      &quot;{secretPrompt}&quot;
                    </p>
                    <p className="text-[11px] text-[#65736B]">
                      Answer the question correctly to instantly confirm ownership and unlock photos.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A201C]">
                      Your Secret Answer
                    </label>
                    <input
                      type="text"
                      required
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-2.5"
                  >
                    {loading ? "Checking Secret Answer..." : "Verify Secret Answer (Option A)"}
                  </button>
                </form>
              )}

              {/* OPTION B: VISUAL COMPARE */}
              {activeTab === "VISUAL" && (
                <form onSubmit={handleVisualSubmit} className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1A201C] flex items-center gap-1.5">
                        <EyeOff className="w-4 h-4 text-[#1B4D3E]" />
                        Zero-Trust Blurred Preview:
                      </span>
                      <span className="badge-escrow">Visual Compare</span>
                    </div>

                    <div className="relative h-32 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                      {item.publicBlurredUrl ? (
                        <img
                          src={item.publicBlurredUrl}
                          alt="Blurred Preview"
                          className="w-full h-full object-cover filter blur-[4px]"
                        />
                      ) : (
                        <span className="text-xs text-[#65736B]">No image available</span>
                      )}
                      <div className="absolute inset-0 bg-[#1B4D3E]/10 flex items-center justify-center text-xs font-semibold text-white drop-shadow">
                        Inspect Outline & Silhouette
                      </div>
                    </div>

                    <p className="text-[11px] text-[#65736B]">
                      If you cannot answer the secret question, describe unique visual details (e.g. scratch, sticker, or photo date) to confirm visual match.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A201C]">
                      Visual Evidence & Matching Notes
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={visualNotes}
                      onChange={(e) => setVisualNotes(e.target.value)}
                      placeholder="e.g. I recognize the brown leather edge and my photo taken in 2023..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-2.5"
                  >
                    {loading ? "Confirming Visual Match..." : "Confirm Visual Match (Option B)"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

