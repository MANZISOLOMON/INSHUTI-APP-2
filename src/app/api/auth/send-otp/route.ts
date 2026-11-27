import { NextRequest, NextResponse } from "next/server";
import { createAndSendOtp } from "@/lib/otp-store";
import { findUserByPhone } from "@/lib/user-store";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { applyRateLimit } from "@/lib/rate-limiter";

/**
 * POST /api/auth/send-otp
 * Dedicated server-side SMS delivery gate for Rwandan phone numbers (+250).
 * Generates cryptographic 6-digit OTP, stores SHA-256 hash in Firestore, and sends SMS.
 * NEVER returns the OTP in the JSON response payload.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_send_otp", 10, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { phone, purpose = "REGISTRATION", fullName } = body;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Rwandan phone number is required." },
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

    // If registration purpose, check if user already exists
    if (purpose === "REGISTRATION") {
      const existing = await findUserByPhone(formattedPhone);
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this phone number already exists. Please sign in with your password.",
          },
          { status: 409 }
        );
      }
    }

    // Call real SMS delivery gate
    const result = await createAndSendOtp({
      phone: formattedPhone,
      purpose,
      fullName,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send verification code.",
          waitSeconds: result.waitSeconds,
        },
        { status: result.waitSeconds ? 429 : 400 }
      );
    }

    // Zero-Trust: only return success message, never the OTP!
    return NextResponse.json({
      success: true,
      message: "Verification code sent to your phone via SMS.",
      phone: formattedPhone,
    });
  } catch (error) {
    console.error("[API Auth Send-OTP Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to dispatch verification code. Please try again." },
      { status: 500 }
    );
  }
}
