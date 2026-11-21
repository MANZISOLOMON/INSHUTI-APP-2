import { NextRequest, NextResponse } from "next/server";
import { 
  findUserByPhone, 
  getPasswordResetRecord, 
  clearPasswordReset, 
  saveUser, 
  generateSalt, 
  hashPassword 
} from "@/lib/user-store";
import { formatRwandaPhoneNumber } from "@/lib/firebase/auth";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_reset_pwd", 10, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { phone, otp, newPassword, confirmNewPassword } = body;

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Phone number, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
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

    const record = getPasswordResetRecord(formattedPhone);
    if (!record || !record.otp) {
      return NextResponse.json(
        { success: false, error: "Reset code expired or not found. Please request a new code." },
        { status: 400 }
      );
    }

    if (record.otp.trim() !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code. Please check your SMS and try again." },
        { status: 401 }
      );
    }

    const user = await findUserByPhone(formattedPhone);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found." },
        { status: 404 }
      );
    }

    // Update password hash & salt
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    user.passwordHash = newHash;
    user.salt = newSalt;
    user.updatedAt = new Date().toISOString();

    await saveUser(user);
    clearPasswordReset(formattedPhone);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("[API Reset Password Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
