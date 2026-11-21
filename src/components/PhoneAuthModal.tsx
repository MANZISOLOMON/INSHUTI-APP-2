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
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { AuthUser } from "@/context/AuthContext";

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

type AuthMode = "LOGIN" | "SIGNUP" | "VERIFY_SIGNUP" | "FORGOT" | "VERIFY_RESET";

export default function PhoneAuthModal({
  isOpen,
  onClose,
  onSuccess,
}: PhoneAuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("LOGIN");

  // Form Fields
  const [phoneInput, setPhoneInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

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

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setMode("LOGIN");
      setPhoneInput("");
      setPasswordInput("");
      setConfirmPasswordInput("");
      setOtpInput("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Handle Login (Phone + Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const rawPhone = phoneInput.trim();
    if (!rawPhone || rawPhone.length < 9) {
      setErrorMsg("Please enter a valid Rwandan phone number.");
      return;
    }
    if (!passwordInput) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const formatted = formatRwandaPhoneNumber(rawPhone);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted, password: passwordInput }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid phone number or password.");
      }

      const authUser: AuthUser = {
        uid: data.user.uid,
        phone: data.user.phone,
        role: data.user.role || "USER",
      };

      onSuccess(authUser);
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Signup Request (Sends real SMS OTP)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const rawPhone = phoneInput.trim();
    if (!rawPhone || rawPhone.length < 9) {
      setErrorMsg("Please enter a valid Rwandan phone number.");
      return;
    }
    if (passwordInput.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const formatted = formatRwandaPhoneNumber(rawPhone);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formatted,
          password: passwordInput,
          confirmPassword: confirmPasswordInput,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate registration.");
      }

      setMode("VERIFY_SIGNUP");
      setSuccessMsg("Verification code sent to your phone via SMS.");
      setCooldownSeconds(60);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify Signup OTP & Activate Account
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const code = otpInput.trim();
    if (!code || code.length !== 6) {
      setErrorMsg("Please enter the 6-digit SMS verification code.");
      return;
    }

    setLoading(true);
    try {
      const formatted = formatRwandaPhoneNumber(phoneInput);
      const res = await fetch("/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted, otp: code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid verification code.");
      }

      const authUser: AuthUser = {
        uid: data.user.uid,
        phone: data.user.phone,
        role: data.user.role || "USER",
      };

      onSuccess(authUser);
      onClose();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Request Password Reset SMS Code
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const rawPhone = phoneInput.trim();
    if (!rawPhone || rawPhone.length < 9) {
      setErrorMsg("Please enter a valid Rwandan phone number.");
      return;
    }

    setLoading(true);
    try {
      const formatted = formatRwandaPhoneNumber(rawPhone);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 429) {
          setCooldownSeconds(data.waitSeconds || 60);
        }
        throw new Error(data.error || "Failed to send reset code.");
      }

      setMode("VERIFY_RESET");
      setSuccessMsg("If an account exists, a 6-digit reset code was sent via SMS.");
      setCooldownSeconds(60);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Verify Reset OTP & Set New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const code = otpInput.trim();
    if (!code || code.length !== 6) {
      setErrorMsg("Please enter the 6-digit SMS verification code.");
      return;
    }
    if (passwordInput.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }
    if (passwordInput !== confirmPasswordInput) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const formatted = formatRwandaPhoneNumber(phoneInput);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formatted,
          otp: code,
          newPassword: passwordInput,
          confirmNewPassword: confirmPasswordInput,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccessMsg("Password reset successfully! Please sign in with your new password.");
      setMode("LOGIN");
      setPasswordInput("");
      setConfirmPasswordInput("");
      setOtpInput("");
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5E9E4] shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#4A5568] hover:text-[#1A201C] hover:bg-[#F8FAF7] border border-transparent hover:border-[#E5E9E4] transition-all cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] border border-[#DEEBE5] flex items-center justify-center text-[#1B4D3E] shadow-2xs">
            {mode === "LOGIN" && <Lock className="w-6 h-6 stroke-[1.75]" />}
            {mode === "SIGNUP" && <Smartphone className="w-6 h-6 stroke-[1.75]" />}
            {mode === "VERIFY_SIGNUP" && <ShieldCheck className="w-6 h-6 stroke-[1.75]" />}
            {(mode === "FORGOT" || mode === "VERIFY_RESET") && <KeyRound className="w-6 h-6 stroke-[1.75]" />}
          </div>
          <div>
            <h2 id="auth-modal-title" className="text-lg font-bold text-[#1A201C] tracking-tight">
              {mode === "LOGIN" && "Sign In to Found IN"}
              {mode === "SIGNUP" && "Create an Account"}
              {mode === "VERIFY_SIGNUP" && "Verify Phone Number"}
              {mode === "FORGOT" && "Reset Password"}
              {mode === "VERIFY_RESET" && "Set New Password"}
            </h2>
            <p className="text-xs text-[#4A5568]">
              {mode === "LOGIN" && "Enter your registered phone and password."}
              {mode === "SIGNUP" && "Protect your listings and recover items safely."}
              {mode === "VERIFY_SIGNUP" && "Enter the 6-digit code delivered via SMS."}
              {mode === "FORGOT" && "We will send an SMS code to your phone."}
              {mode === "VERIFY_RESET" && "Enter the SMS code and choose a new password."}
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === "LOGIN" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1.5">
                Rwandan Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="0788 123 456"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1A201C]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setMode("FORGOT");
                  }}
                  className="text-xs text-[#1B4D3E] hover:underline cursor-pointer font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A201C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-xs text-[#4A5568]">Don&apos;t have an account yet? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode("SIGNUP");
                }}
                className="text-xs text-[#1B4D3E] font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP FORM */}
        {mode === "SIGNUP" && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                Rwandan Phone Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0788 123 456"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                Create Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A201C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending Real SMS Code...</span>
                </>
              ) : (
                <>
                  <span>Continue &amp; Verify Phone</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <span className="text-xs text-[#4A5568]">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode("LOGIN");
                }}
                className="text-xs text-[#1B4D3E] font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. VERIFY SIGNUP OTP */}
        {mode === "VERIFY_SIGNUP" && (
          <form onSubmit={handleVerifySignupOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1.5">
                6-Digit SMS Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-center text-xl tracking-[0.3em] font-mono text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                required
                autoFocus
              />
              <p className="text-[11px] text-[#4A5568] mt-1.5 text-center">
                Code sent to your phone. Check your SMS inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <span>Verify &amp; Activate Account</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode("SIGNUP")}
                className="text-[#4A5568] hover:text-[#1A201C] cursor-pointer"
              >
                ← Back to Phone
              </button>
              <button
                type="button"
                disabled={cooldownSeconds > 0 || loading}
                onClick={handleSignupSubmit}
                className="text-[#1B4D3E] font-semibold hover:underline cursor-pointer disabled:opacity-40"
              >
                {cooldownSeconds > 0 ? `Resend SMS in ${cooldownSeconds}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD FORM */}
        {mode === "FORGOT" && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1.5">
                Registered Phone Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0788 123 456"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                required
              />
              <p className="text-[11px] text-[#4A5568] mt-1.5">
                Rate-limited to 1 request per 60s (max 3/hour) to protect your account.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || cooldownSeconds > 0}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending SMS Code...</span>
                </>
              ) : cooldownSeconds > 0 ? (
                <span>Wait {cooldownSeconds}s before retrying</span>
              ) : (
                <>
                  <span>Send Reset Code via SMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode("LOGIN");
                }}
                className="text-xs text-[#1B4D3E] font-semibold hover:underline cursor-pointer"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* 5. VERIFY RESET OTP & ENTER NEW PASSWORD */}
        {mode === "VERIFY_RESET" && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                6-Digit SMS Reset Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-center text-lg tracking-[0.25em] font-mono text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                New Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#1A201C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A201C] mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAF7] border border-[#DEEBE5] text-sm text-[#1A201C] focus:outline-none focus:border-[#1B4D3E] focus:bg-white transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4D3E] hover:bg-[#153e32] text-white text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset &amp; Save New Password</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode("FORGOT")}
                className="text-[#4A5568] hover:text-[#1A201C] cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="button"
                disabled={cooldownSeconds > 0 || loading}
                onClick={handleForgotPasswordSubmit}
                className="text-[#1B4D3E] font-semibold hover:underline cursor-pointer disabled:opacity-40"
              >
                {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : "Resend Code"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
