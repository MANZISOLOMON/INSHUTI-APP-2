import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";
import { applyRateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/verify-otp
 * Verifies submitted 6-digit SMS OTP against SHA-256 hash in Firestore.
 * Enforces 5-minute expiry and max 5 attempts.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_verify_otp", 15, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { phone, otp, purpose } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and 6-digit SMS verification code are required." },
        { status: 400 }
      );
    }

    const result = await verifyOtp({
      phone,
      otp: String(otp).trim(),
      purpose,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Invalid verification code." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully.",
      fullName: result.fullName,
    });
  } catch (error) {
    console.error("[API Auth Verify-OTP Error]:", error);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
