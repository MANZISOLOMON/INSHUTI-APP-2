import { NextRequest, NextResponse } from "next/server";
import { 
  findUserByPhone, 
  setPendingRegistration, 
  generateNumericOtp 
} from "@/lib/user-store";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { sendSmsAlert } from "@/lib/sms";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_register", 10, 60 * 1000);
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

    // Generate real 6-digit OTP
    const otp = generateNumericOtp();

    // Store in pending registration (hash is computed and salt generated in store)
    setPendingRegistration(formattedPhone, password, otp);

    // Send real SMS to user's phone via Africa's Talking / SMS Gateway
    await sendSmsAlert({
      to: formattedPhone,
      message: `Found IN: Your verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      type: "MATCH_ALERT",
      userId: formattedPhone,
    });

    // NOTE: NEVER return OTP in JSON payload!
    return NextResponse.json({
      success: true,
      message: "Verification code sent via SMS.",
      phone: formattedPhone,
    });
  } catch (error) {
    console.error("[API Auth Register Error]:", error);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
