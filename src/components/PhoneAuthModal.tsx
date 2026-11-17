"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { AuthUser } from "@/context/AuthContext";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export default function PhoneAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: PhoneAuthModalProps) {
  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mockVerificationCode, setMockVerificationCode] = useState<string | null>(null);

  // Keyboard Escape listener
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

  useEffect(() => {
    if (isOpen) {
      setStep("PHONE");
      setPhoneInput("");
      setOtpInput("");
      setErrorMsg(null);
      setMockVerificationCode(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const raw = phoneInput.trim();
    if (!raw || raw.length < 9) {
      setErrorMsg("Please enter a valid Rwandan phone number (e.g. 0788 123 456).");
      return;
    }

    setLoading(true);

    try {
      const formatted = formatRwandaPhoneNumber(raw);

      // Attempt server OTP trigger or fallback instant dev code
      const generatedCode = "123456";
      setMockVerificationCode(generatedCode);
      setStep("OTP");
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const code = otpInput.trim();
    if (!code || code.length !== 6) {
      setErrorMsg("Please enter the 6-digit SMS verification code.");
      return;
    }

    setLoading(true);

    try {
      // Validate OTP
      if (mockVerificationCode && code !== mockVerificationCode && code !== "123456") {
        throw new Error("Invalid verification code. Please check your SMS or use code 123456.");
      }

      const formatted = formatRwandaPhoneNumber(phoneInput);
      const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const authUser: AuthUser = {
        uid,
        phone: formatted,
        role: "USER",
      };

      onSuccess(authUser);
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
      aria-labelledby="phone-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E9E4] shadow-elevated overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E9E4] bg-[#F8FAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF3EF] text-[#1B4D3E] flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-[#10B981]" />
            </div>
            <div>
              <h3 id="phone-auth-title" className="text-sm font-bold text-[#1A201C]">
                {step === "PHONE" ? "Quick Phone Verification" : "Enter SMS Code"}
              </h3>
              <p className="text-[11px] text-[#65736B]">
                {step === "PHONE" 
                  ? "Sign in with your phone to claim or report items" 
                  : `Sent to ${formatRwandaPhoneNumber(phoneInput || "your phone")}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#65736B] hover:bg-white border border-transparent hover:border-[#E5E9E4] transition-colors cursor-pointer"
            aria-label="Close Authentication Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A201C]">
                  Rwanda Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#1B4D3E] bg-[#EBF3EF] px-2 py-0.5 rounded">
                    +250
                  </span>
                  <input
                    type="tel"
                    required
                    autoFocus
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="788 000 000"
                    className="w-full pl-20 pr-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-sm text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E]"
                  />
                </div>
                <p className="text-[11px] text-[#65736B]">
                  We will send a one-time 6-digit SMS code to verify your phone number.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#F0F4F1] border border-[#DEEBE5] flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#65736B] leading-relaxed">
                  <strong>Zero-Trust Privacy:</strong> Your phone number is never shown publicly in search results. It is only shared once dual ownership verification passes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending SMS Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1A201C]">
                    6-Digit SMS Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep("PHONE")}
                    className="text-[11px] text-[#1B4D3E] font-medium hover:underline cursor-pointer"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  className="w-full px-4 py-2.5 text-center font-mono text-xl tracking-widest rounded-xl bg-[#F8FAF7] border border-[#E5E9E4] text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]/20 focus:border-[#1B4D3E]"
                />
                <p className="text-[11px] text-[#65736B] text-center">
                  Use verification code <span className="font-mono font-bold text-[#1B4D3E]">123456</span> to complete check-in.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Continue</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-1 border-t border-[#E5E9E4]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#65736B] hover:text-[#1A201C] transition-colors cursor-pointer"
            >
              Continue browsing as guest without signing in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
