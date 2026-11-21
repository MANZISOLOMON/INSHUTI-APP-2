import { NextRequest, NextResponse } from "next/server";
import { 
  findUserByPhone, 
  generateNumericOtp, 
  checkAndCreatePasswordReset 
} from "@/lib/user-store";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { sendSmsAlert } from "@/lib/sms";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_forgot_pwd", 10, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { phone } = body;

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

    // Generate real 6-digit OTP
    const otp = generateNumericOtp();

    // Check rate limit: 1 per 60s, max 3 per hour per phone
    const rateCheck = checkAndCreatePasswordReset(formattedPhone, otp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: rateCheck.error || "Too many password reset requests.",
          waitSeconds: rateCheck.waitSeconds 
        },
        { status: 429 }
      );
    }

    // Verify if user exists
    const user = await findUserByPhone(formattedPhone);
    if (user) {
      // Send real SMS OTP to user's registered phone
      await sendSmsAlert({
        to: formattedPhone,
        message: `Found IN: Your password reset code is ${otp}. Valid for 10 minutes. If you did not request this, please ignore.`,
        type: "MATCH_ALERT",
        userId: user.id,
      });
    }

    // Generic response (Zero-Trust) to prevent account enumeration and wallet drain
    return NextResponse.json({
      success: true,
      message: "If an account is associated with this phone number, a 6-digit reset code has been sent via SMS.",
      phone: formattedPhone,
    });
  } catch (error) {
    console.error("[API Forgot Password Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reset code. Please try again." },
      { status: 500 }
    );
  }
}
