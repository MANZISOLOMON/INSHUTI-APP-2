import { NextRequest, NextResponse } from "next/server";
import { getItemById, getVerificationByItemId } from "@/lib/items-store";
import { generateSignedRawUrl } from "@/lib/redact";
import { applyRateLimit } from "@/lib/rate-limiter";
import { authenticateRequest } from "@/lib/auth-middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitError = applyRateLimit(request, "item_reveal", 20, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const { id: itemId } = await params;
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      );
    }

    const item = await getItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    const verification = await getVerificationByItemId(itemId);

    // Optional admin bypass
    const authResult = await authenticateRequest(request);
    const isAdmin = authResult.authenticated && authResult.user?.role === "ADMIN";

    // Strict Backend Guardrail: Only unlock if verified === true or admin
    if (!isAdmin && (!verification || !verification.isVerified)) {
      return NextResponse.json(
        {
          success: false,
          isVerified: false,
          error: "Access denied. Dual ownership verification (Option A or Option B) required before private contact details and unblurred images can be revealed.",
        },
        { status: 403 }
      );
    }

    // Generate short-lived (15-minute) signed URL for private raw photo
    const signedRawUrl = await generateSignedRawUrl(itemId, 15);
    const rawContactPhone = (item as unknown as { contactPhone?: string }).contactPhone || "+250 788 000 000";

    return NextResponse.json({
      success: true,
      isVerified: true,
      revealedDetails: {
        itemId: item.id,
        title: item.title,
        contactPhone: rawContactPhone,
        meetingPoint: item.meetingPoint || "Approved Sector Police Post",
        privateRawUrl: signedRawUrl,
        verifiedAt: verification?.verifiedAt || new Date().toISOString(),
        verifiedBy: verification?.verifiedBy || "verified_user",
        expiresInMinutes: 15,
      },
    });
  } catch (error) {
    console.error("[API Items Reveal Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reveal verified item details" },
      { status: 500 }
    );
  }
}
