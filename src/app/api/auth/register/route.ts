import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { 
  findUserByPhone, 
  saveUser, 
  generateSalt, 
  hashPassword,
  StoredUser 
} from "@/lib/user-store";
import { isPhoneVerified, clearOtpVerification } from "@/lib/otp-store";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { applyRateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/register
 * Step 3 of Registration: Sets password and activates account once phone OTP is verified.
 * Enforces:
 * - Phone number verified via real SMS OTP (isPhoneVerified === true)
 * - Minimum 8-character password
 * - Secure PBKDF2 hash + random salt
 * - Firestore 'users' collection persistence
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_register", 15, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { phone, password, confirmPassword, fullName } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }

    let formattedPhone: string;
    try {
      formattedPhone = formatRwandaPhoneNumber(phone);
    } catch (err) {
      return NextResponse.json(
        { success: false, error: (err as Error).message },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await findUserByPhone(formattedPhone);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this phone number already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Enforce OTP verification before allowing password creation
    const verified = await isPhoneVerified(formattedPhone);
    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number has not been verified via SMS code yet. Please complete phone verification first.",
        },
        { status: 403 }
      );
    }

    // Hash password with secure salt & PBKDF2
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const uid = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: uid,
      phone: formattedPhone,
      fullName: fullName?.trim() || "Citizen User",
      role: "USER",
      passwordHash,
      salt,
      createdAt: now,
      updatedAt: now,
      smsAlertsEnabled: true,
    };

    // Save to Firestore and local resilience store
    await saveUser(newUser);

    // Clean up OTP verification record
    await clearOtpVerification(formattedPhone);

    return NextResponse.json({
      success: true,
      message: "Account created and activated successfully.",
      user: {
        uid: newUser.id,
        phone: newUser.phone,
        role: newUser.role,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error("[API Auth Register Error]:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
