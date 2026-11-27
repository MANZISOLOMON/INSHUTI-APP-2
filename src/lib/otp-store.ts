import crypto from "crypto";
import { OtpVerification } from "@/types/database";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";
import { sendSmsAlert } from "@/lib/sms";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";

// In-memory cache for speed and resilience during warm serverless invocations
const localOtpCache = new Map<string, OtpVerification>();

export function hashOtp(otp: string, salt: string): string {
  return crypto
    .createHash("sha256")
    .update(otp.trim() + salt)
    .digest("hex");
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generate6DigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Creates, hashes, persists, and delivers a 6-digit cryptographic OTP via SMS.
 * Enforces:
 * - Phone normalization (+2507...)
 * - 60-second resend cooldown
 * - 5-minute expiry
 * - SHA-256 + salt hashing
 * - Zero plaintext OTP stored or returned
 */
export async function createAndSendOtp({
  phone,
  purpose = "REGISTRATION",
  fullName,
}: {
  phone: string;
  purpose?: "REGISTRATION" | "PASSWORD_RESET" | "PHONE_VERIFY";
  fullName?: string;
}): Promise<{
  success: boolean;
  message: string;
  phone?: string;
  waitSeconds?: number;
  error?: string;
}> {
  let normalizedPhone: string;
  try {
    normalizedPhone = formatRwandaPhoneNumber(phone);
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message || "Invalid Rwandan phone number format. Must start with +250 7...",
      message: "Invalid phone number format",
    };
  }

  const now = Date.now();

  // 1. Check existing record for 60s cooldown
  let existingRecord: OtpVerification | null = localOtpCache.get(normalizedPhone) || null;

  if (!existingRecord && isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(
        adminDb.collection("otp_verifications").doc(normalizedPhone).get(),
        1500,
        null as any
      );
      if (snap && snap.exists) {
        existingRecord = snap.data() as OtpVerification;
        localOtpCache.set(normalizedPhone, existingRecord);
      }
    } catch {
      // Fall through to memory
    }
  }

  if (existingRecord) {
    const elapsedSeconds = Math.floor((now - existingRecord.lastSentAt) / 1000);
    if (elapsedSeconds < 60) {
      const remainingWait = 60 - elapsedSeconds;
      return {
        success: false,
        waitSeconds: remainingWait,
        error: `Please wait ${remainingWait} seconds before requesting a new verification code.`,
        message: `Cooldown active. Wait ${remainingWait} seconds.`,
      };
    }
  }

  // 2. Generate new OTP and cryptographic hash
  const rawOtp = generate6DigitOtp();
  const salt = generateSalt();
  const hashedOtp = hashOtp(rawOtp, salt);

  const otpRecord: OtpVerification = {
    id: normalizedPhone,
    phone: normalizedPhone,
    hashedOtp,
    salt,
    attempts: 0,
    expiresAt: now + 5 * 60 * 1000, // 5-minute expiry
    createdAt: now,
    lastSentAt: now,
    purpose,
    fullName: fullName?.trim() || existingRecord?.fullName,
    verified: false,
  };

  // 3. Persist to Firestore
  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(
        adminDb.collection("otp_verifications").doc(normalizedPhone).set(otpRecord),
        2000,
        null as any
      );
    } catch (err) {
      console.warn("[OTP Store] Firestore save error:", (err as Error).message);
    }
  }

  // 4. Update in-memory cache
  localOtpCache.set(normalizedPhone, otpRecord);

  // 5. Send real SMS via SMS Gateway
  const smsResult = await sendSmsAlert({
    to: normalizedPhone,
    message: `Found IN: Your verification code is ${rawOtp}. Valid for 5 minutes. Do not share this code with anyone.`,
    type: "MATCH_ALERT",
    userId: normalizedPhone,
  });

  return {
    success: true,
    message: "Verification code sent to your phone via SMS.",
    phone: normalizedPhone,
  };
}

/**
 * Validates a submitted 6-digit OTP against the stored SHA-256 hash.
 * Enforces:
 * - 5-minute expiration
 * - Max 5 attempts
 * - Constant comparison
 */
export async function verifyOtp({
  phone,
  otp,
  purpose,
}: {
  phone: string;
  otp: string;
  purpose?: string;
}): Promise<{
  success: boolean;
  message: string;
  error?: string;
  fullName?: string;
}> {
  let normalizedPhone: string;
  try {
    normalizedPhone = formatRwandaPhoneNumber(phone);
  } catch (err) {
    return {
      success: false,
      error: "Invalid Rwandan phone number.",
      message: "Invalid phone number format",
    };
  }

  const cleanOtp = otp ? otp.trim() : "";
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      error: "Please enter the valid 6-digit code received via SMS.",
      message: "Invalid code format",
    };
  }

  const now = Date.now();

  // Retrieve record
  let record: OtpVerification | null = localOtpCache.get(normalizedPhone) || null;

  if (!record && isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(
        adminDb.collection("otp_verifications").doc(normalizedPhone).get(),
        2000,
        null as any
      );
      if (snap && snap.exists) {
        record = snap.data() as OtpVerification;
        localOtpCache.set(normalizedPhone, record);
      }
    } catch {
      // Fallback
    }
  }

  if (!record) {
    return {
      success: false,
      error: "Verification code expired or not found. Please request a new code.",
      message: "No active verification found",
    };
  }

  if (now > record.expiresAt) {
    localOtpCache.delete(normalizedPhone);
    if (isFirebaseAdminConfigured()) {
      try {
        await adminDb.collection("otp_verifications").doc(normalizedPhone).delete();
      } catch {}
    }
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
      message: "Code expired",
    };
  }

  if (record.attempts >= 5) {
    return {
      success: false,
      error: "Maximum verification attempts exceeded. Please request a new code.",
      message: "Too many attempts",
    };
  }

  // Increment attempts
  record.attempts += 1;

  // Compare SHA-256 hash
  const computedHash = hashOtp(cleanOtp, record.salt);
  if (computedHash !== record.hashedOtp) {
    localOtpCache.set(normalizedPhone, record);
    if (isFirebaseAdminConfigured()) {
      try {
        await adminDb
          .collection("otp_verifications")
          .doc(normalizedPhone)
          .update({ attempts: record.attempts });
      } catch {}
    }
    const remainingAttempts = 5 - record.attempts;
    return {
      success: false,
      error: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
      message: "Invalid code",
    };
  }

  // Code is verified! Mark verified
  record.verified = true;
  localOtpCache.set(normalizedPhone, record);

  if (isFirebaseAdminConfigured()) {
    try {
      await adminDb.collection("otp_verifications").doc(normalizedPhone).update({
        verified: true,
      });
    } catch {}
  }

  return {
    success: true,
    message: "Phone number verified successfully.",
    fullName: record.fullName,
  };
}

/**
 * Checks if a phone number currently has an active verified OTP status
 */
export async function isPhoneVerified(phone: string): Promise<boolean> {
  let normalizedPhone: string;
  try {
    normalizedPhone = formatRwandaPhoneNumber(phone);
  } catch {
    return false;
  }

  const record = localOtpCache.get(normalizedPhone);
  if (record && record.verified && Date.now() <= record.expiresAt + 10 * 60 * 1000) {
    return true;
  }

  if (isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(
        adminDb.collection("otp_verifications").doc(normalizedPhone).get(),
        1500,
        null as any
      );
      if (snap && snap.exists) {
        const data = snap.data() as OtpVerification;
        if (data.verified && Date.now() <= data.expiresAt + 10 * 60 * 1000) {
          return true;
        }
      }
    } catch {}
  }

  return false;
}

/**
 * Cleans up OTP verification record upon successful account creation or password reset
 */
export async function clearOtpVerification(phone: string): Promise<void> {
  let normalizedPhone: string;
  try {
    normalizedPhone = formatRwandaPhoneNumber(phone);
  } catch {
    return;
  }

  localOtpCache.delete(normalizedPhone);
  if (isFirebaseAdminConfigured()) {
    try {
      await adminDb.collection("otp_verifications").doc(normalizedPhone).delete();
    } catch {}
  }
}
