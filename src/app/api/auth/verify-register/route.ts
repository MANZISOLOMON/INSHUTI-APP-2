import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { 
  getPendingRegistration, 
  deletePendingRegistration, 
  saveUser, 
  StoredUser 
} from "@/lib/user-store";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_verify_reg", 10, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { phone, otp, fullName } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and 6-digit OTP code are required." },
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

    const pending = getPendingRegistration(formattedPhone);
    if (!pending) {
      return NextResponse.json(
        { success: false, error: "Verification code expired or not found. Please request a new code." },
        { status: 400 }
      );
    }

    if (pending.otp.trim() !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Please check your SMS and try again." },
        { status: 401 }
      );
    }

    // Code is valid! Create active user record
    const uid = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = new Date().toISOString();

    const newUser: StoredUser = {
      id: uid,
      phone: formattedPhone,
      fullName: fullName?.trim() || "Citizen User",
      role: "USER",
      passwordHash: pending.passwordHash,
      salt: pending.salt,
      createdAt: now,
      updatedAt: now,
      smsAlertsEnabled: true,
    };

    await saveUser(newUser);
    deletePendingRegistration(formattedPhone);

    return NextResponse.json({
      success: true,
      message: "Account verified and activated successfully.",
      user: {
        uid: newUser.id,
        phone: newUser.phone,
        role: newUser.role,
        fullName: newUser.fullName,
      },
    });
  } catch (error) {
    console.error("[API Verify Register Error]:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
