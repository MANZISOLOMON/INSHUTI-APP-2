import { NextRequest, NextResponse } from "next/server";
import { adminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";

export interface AuthenticatedUser {
  uid: string;
  phone?: string;
  role: "USER" | "ADMIN";
  isAdmin: boolean;
}

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "rwanda-admin-2026";

/**
 * Reusable server helper to extract and verify Firebase Auth Bearer tokens or Admin passkeys.
 */
export async function authenticateRequest(
  req: NextRequest
): Promise<{ authenticated: boolean; user?: AuthenticatedUser; error?: string }> {
  const authHeader = req.headers.get("authorization");
  const xAdminKey = req.headers.get("x-admin-key");
  const urlAdminKey = req.nextUrl.searchParams.get("adminKey");

  // 1. Check for Admin Secret Passkey
  if (xAdminKey === ADMIN_SECRET || urlAdminKey === ADMIN_SECRET) {
    return {
      authenticated: true,
      user: {
        uid: "admin_system",
        role: "ADMIN",
        isAdmin: true,
      },
    };
  }

  // 2. Extract Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Missing or malformed Authorization header. Bearer token required.",
    };
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return { authenticated: false, error: "Empty Bearer token provided." };
  }

  // 3. Verify via Firebase Admin SDK
  if (isFirebaseAdminConfigured()) {
    try {
      const decoded = await withTimeout(adminAuth.verifyIdToken(token), 2000);
      const isAdmin = decoded.role === "ADMIN" || decoded.admin === true;

      return {
        authenticated: true,
        user: {
          uid: decoded.uid,
          phone: decoded.phone_number,
          role: isAdmin ? "ADMIN" : "USER",
          isAdmin,
        },
      };
    } catch (err) {
      return {
        authenticated: false,
        error: `Token verification failed: ${(err as Error).message}`,
      };
    }
  }

  // Fallback for local sandbox testing without live GCP credentials
  return {
    authenticated: true,
    user: {
      uid: "sandbox_authenticated_user",
      role: "USER",
      isAdmin: false,
    },
  };
}

/**
 * List of sensitive fields that clients must NEVER be allowed to inject or tamper with.
 */
export const PROTECTED_SYSTEM_FIELDS = [
  "role",
  "isVerified",
  "status",
  "platformFee",
  "totalLocked",
  "qrToken",
  "claimedAt",
  "expiresAt",
  "secretAnswerHash",
  "verifiedAt",
  "verifiedBy",
  "scannedAt",
  "releasedAt",
  "momoRef",
] as const;

/**
 * Strips protected system fields from any user-submitted object to prevent privilege escalation.
 */
export function sanitizeClientPayload<T extends Record<string, unknown>>(payload: T): T {
  const clean: Record<string, unknown> = { ...payload };
  for (const field of PROTECTED_SYSTEM_FIELDS) {
    delete clean[field];
  }
  return clean as T;
}
