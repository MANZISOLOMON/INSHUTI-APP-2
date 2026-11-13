"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  X, 
  QrCode, 
  Camera, 
  KeyRound, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Phone, 
  MapPin, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface HandoverQRModalProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  initialRole?: "FINDER" | "CLAIMER";
}

export default function HandoverQRModal({
  itemId,
  isOpen,
  onClose,
  onComplete,
  initialRole = "FINDER",
}: HandoverQRModalProps) {
  const [activeRole, setActiveRole] = useState<"FINDER" | "CLAIMER">(initialRole);
  
  // Session details
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string>("");
  const [fallbackCode, setFallbackCode] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [escrowAmount, setEscrowAmount] = useState<number>(0);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Claimer verification inputs
  const [manualCodeInput, setManualCodeInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [releaseSuccess, setReleaseSuccess] = useState<Record<string, unknown> | null>(null);

  const scannerRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch escrow & handover session
  useEffect(() => {
    if (isOpen && itemId) {
      setLoading(true);
      setErrorMsg(null);
      setReleaseSuccess(null);

      // Check existing session or trigger escrow lock if not started
      fetch(`/api/escrow/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          payerPhone: "+250788123456",
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.success && data.handoverSession) {
            setQrToken(data.handoverSession.qrToken);
            setFallbackCode(data.handoverSession.fallbackCode);
            setExpiresAt(data.handoverSession.expiresAt);
            setEscrowAmount(data.escrow?.amount || 2000);

            // Generate QR Code Data URL
            const url = await QRCode.toDataURL(data.handoverSession.qrToken, {
              width: 280,
              margin: 2,
              color: {
                dark: "#1B4D3E",
                light: "#FFFFFF",
              },
            });
            setQrDataUrl(url);
          } else {
            setErrorMsg(data.error || "Failed to load active escrow session.");
          }
        })
        .catch((err) => {
          setErrorMsg((err as Error).message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, itemId]);

  // Handle HTML5-QRCode Scanner in Claimer view
  useEffect(() => {
    let html5QrCode: unknown = null;

    if (isOpen && activeRole === "CLAIMER" && scannerActive && typeof window !== "undefined") {
      import("html5-qrcode").then(({ Html5Qrcode }) => {
        try {
          const qrScanner = new Html5Qrcode("reader");
          html5QrCode = qrScanner;

          qrScanner
            .start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 220, height: 220 },
              },
              (decodedText) => {
                console.log("[QR Scanner] Decoded:", decodedText);
                qrScanner.stop().catch(() => {});
                setScannerActive(false);
                handleCheckInSubmit(decodedText);
              },
              () => {
                // Ignore frame decode misses
              }
            )
            .catch((err) => {
              console.warn("[QR Scanner] Camera start error:", err);
            });
        } catch (e) {
          console.warn("[QR Scanner Init Error]:", e);
        }
      });
    }

    return () => {
      if (html5QrCode && typeof (html5QrCode as { stop: () => Promise<void> }).stop === "function") {
        (html5QrCode as { stop: () => Promise<void> }).stop().catch(() => {});
      }
    };
  }, [isOpen, activeRole, scannerActive]);

  const handleCheckInSubmit = async (codeToSubmit: string) => {
    const code = codeToSubmit.trim();
    if (!code) {
      setErrorMsg("Please enter the 6-digit code or scan the QR code.");
      return;
    }

    setIsSubmittingCheckIn(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          tokenOrCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to verify check-in.");
      }

      setReleaseSuccess(data);
      if (onComplete) onComplete();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmittingCheckIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5E9E4] shadow-elevated overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E9E4] bg-[#F8FAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1A201C]">
                MoMo Escrow & In-Person Handover
              </h3>
              <p className="text-[11px] text-[#65736B]">
                Phase 5 QR Check-In Verification
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

        {/* Role Toggle Tab (Finder Show vs Claimer Scan) */}
        <div className="p-4 border-b border-[#E5E9E4] bg-[#F8FAF7]/50">
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#E5E9E4]/60">
            <button
              onClick={() => {
                setActiveRole("FINDER");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                activeRole === "FINDER"
                  ? "bg-white text-[#1B4D3E] shadow-sm"
                  : "text-[#65736B] hover:text-[#1A201C]"
              }`}
            >
              Finder View (Show QR)
            </button>
            <button
              onClick={() => {
                setActiveRole("CLAIMER");
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                activeRole === "CLAIMER"
                  ? "bg-white text-[#1B4D3E] shadow-sm"
                  : "text-[#65736B] hover:text-[#1A201C]"
              }`}
            >
              Claimer View (Scan / Code)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {releaseSuccess ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#10B981] flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#1A201C]">
                  Handover Check-In Complete!
                </h4>
                <p className="text-xs text-[#65736B]">
                  Physical check-in confirmed. MoMo payout released to the finder.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] text-xs space-y-2 max-w-sm mx-auto text-left">
                <div className="flex justify-between">
                  <span className="text-[#65736B]">Payout Released:</span>
                  <span className="font-bold text-[#059669]">
                    {(releaseSuccess.payoutAmount as number)?.toLocaleString()} RWF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65736B]">MoMo Payout Ref:</span>
                  <span className="font-mono font-medium">
                    {releaseSuccess.momoPayoutRef as string}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#65736B]">Item Status:</span>
                  <span className="badge-escrow font-bold">
                    RESOLVED
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn-primary w-full max-w-xs mx-auto py-2.5"
              >
                Done
              </button>
            </div>
          ) : activeRole === "FINDER" ? (
            /* FINDER VIEW */
            <div className="space-y-5 text-center">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 text-[#1B4D3E] animate-spin" />
                  <span className="text-xs text-[#65736B]">Generating dynamic QR session...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#1B4D3E] bg-[#EBF3EF] px-3 py-1 rounded-full">
                      {escrowAmount.toLocaleString()} RWF Locked in Escrow
                    </span>
                    <p className="text-xs text-[#65736B] pt-2">
                      Present this QR code to the claimer at your designated handover meeting spot.
                    </p>
                  </div>

                  {/* QR Canvas Display */}
                  <div className="p-4 rounded-3xl bg-white border border-[#E5E9E4] shadow-sm inline-block mx-auto">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Handover QR Code"
                        className="w-56 h-56 mx-auto rounded-xl"
                      />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center bg-gray-50 text-xs text-gray-400">
                        QR Code Unavailable
                      </div>
                    )}
                  </div>

                  {/* 6-Digit Numeric Fallback Code */}
                  <div className="p-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] max-w-xs mx-auto space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#65736B]">
                      Manual 6-Digit Fallback Code
                    </span>
                    <div className="text-2xl font-mono font-bold tracking-widest text-[#1B4D3E]">
                      {fallbackCode || "------"}
                    </div>
                    <span className="text-[10px] text-[#65736B] block">
                      Use if claimer camera is unavailable or damaged
                    </span>
                  </div>

                  {/* Grace Timer */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#65736B]">
                    <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>48-hour handover timer active</span>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* CLAIMER VIEW */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[#EBF3EF] border border-[#DEEBE5] text-xs text-[#1B4D3E] space-y-1">
                <span className="font-bold block">In-Person Handover Check-In</span>
                <p className="text-[#1A201C] text-[11px] leading-relaxed">
                  Scan the finder&apos;s dynamic QR code or type their 6-digit fallback code to confirm physical receipt and release escrow funds.
                </p>
              </div>

              {/* Camera Scanner View */}
              {scannerActive ? (
                <div className="space-y-3">
                  <div
                    id="reader"
                    ref={scannerRef}
                    className="w-full h-64 rounded-2xl overflow-hidden border border-[#1B4D3E] bg-black"
                  />
                  <button
                    onClick={() => setScannerActive(false)}
                    className="btn-outline w-full text-xs"
                  >
                    Cancel Camera
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setScannerActive(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#F8FAF7] border border-[#E5E9E4] hover:bg-[#EBF3EF] text-[#1B4D3E] font-bold text-xs transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch PWA Camera QR Scanner</span>
                </button>
              )}

              {/* Manual Fallback Code Input */}
              <div className="space-y-3 pt-2 border-t border-[#E5E9E4]">
                <label className="block text-xs font-semibold text-[#1A201C]">
                  Or Enter Finder&apos;s 6-Digit Fallback Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="e.g. 834912"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-center font-mono text-base font-bold tracking-widest text-[#1B4D3E] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20"
                  />
                  <button
                    onClick={() => handleCheckInSubmit(manualCodeInput)}
                    disabled={isSubmittingCheckIn || manualCodeInput.length !== 6}
                    className="btn-primary px-5 disabled:opacity-50"
                  >
                    {isSubmittingCheckIn ? "Verifying..." : "Confirm Receipt"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

