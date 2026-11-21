import { NextRequest, NextResponse } from "next/server";
import { findUserByPhone, hashPassword } from "@/lib/user-store";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_login", 20, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: "Phone number and password are required." },
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

    const user = await findUserByPhone(formattedPhone);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    // Verify password hash
    const computedHash = hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number or password." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      user: {
        uid: user.id,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("[API Login Error]:", error);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
