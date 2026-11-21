import { NextRequest, NextResponse } from "next/server";
import { 
  findUserById, 
  findUserByPhone, 
  saveUser, 
  hashPassword, 
  generateSalt 
} from "@/lib/user-store";
import { applyRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "auth_change_pwd", 10, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
    const { userId, phone, currentPassword, newPassword, confirmNewPassword } = body;

    if ((!userId && !phone) || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { success: false, error: "New passwords do not match." },
        { status: 400 }
      );
    }

    let user = null;
    if (userId) {
      user = await findUserById(userId);
    }
    if (!user && phone) {
      user = await findUserByPhone(phone);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 404 }
      );
    }

    // Verify current password
    const currentHash = hashPassword(currentPassword, user.salt);
    if (currentHash !== user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    // Set new password
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    user.passwordHash = newHash;
    user.salt = newSalt;
    user.updatedAt = new Date().toISOString();

    await saveUser(user);

    return NextResponse.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("[API Change Password Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update password." },
      { status: 500 }
    );
  }
}
