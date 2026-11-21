import { NextRequest, NextResponse } from "next/server";
import { 
  getHandoverSessionByItemId,
  getHandoverSessionByTokenOrCode, 
  updateHandoverStatus, 
  getEscrowByItemId, 
  updateEscrowStatus,
  recordFailedFallbackAttempt,
  resetFallbackAttempts
} from "@/lib/escrow-store";
import { getItemById, persistItem } from "@/lib/items-store";
import { disburseMoMoPayout } from "@/lib/momo";
import { sendSmsAlert } from "@/lib/sms";
import { adminDb } from "@/lib/firebase/admin";
import { EscrowReleaseSchema } from "@/lib/validations";
import { applyRateLimit } from "@/lib/rate-limiter";
import { sanitizeClientPayload } from "@/lib/auth-middleware";

/**
 * POST /api/escrow/release
 * Validates in-person QR scan / 6-digit fallback code with brute-force lockout,
 * updates HandoverSession & EscrowTransaction, disburses MoMo payout,
 * marks item RESOLVED, and returns digital handover receipt.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "escrow_release", 15, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const rawBody = await request.json().catch(() => ({}));
    const body = sanitizeClientPayload(rawBody);
    const validation = EscrowReleaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { itemId, tokenOrCode } = validation.data;
    const cleanInput = tokenOrCode.trim();

    // 1. Fetch Session by Item ID or Token/Code
    let session = itemId ? await getHandoverSessionByItemId(itemId) : null;
    if (!session) {
      session = await getHandoverSessionByTokenOrCode(cleanInput);
    }

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid QR code or 6-digit fallback code." },
        { status: 404 }
      );
    }

    // 2. Check Brute-Force Lockout on 6-Digit Code (max 5 attempts, 15 min lock)
    const nowMs = Date.now();
    if (session.lockedUntil && nowMs < session.lockedUntil) {
      const waitMinutes = Math.max(1, Math.ceil((session.lockedUntil - nowMs) / (60 * 1000)));
      return NextResponse.json(
        {
          success: false,
          error: `Manual fallback code is locked due to 5 failed attempts. Please wait ${waitMinutes} minute(s) before trying again or scan the QR code.`,
          isLocked: true,
          waitMinutes,
        },
        { status: 429 }
      );
    }

    // 3. Verify Code / Token match
    const isTokenMatch = cleanInput === session.qrToken;
    const isFallbackMatch = cleanInput === session.fallbackCode;

    if (!isTokenMatch && !isFallbackMatch) {
      // Record failed attempt for 6-digit fallback codes
      if (/^\d{6}$/.test(cleanInput)) {
        const failResult = await recordFailedFallbackAttempt(session.itemId);
        if (failResult.isLocked) {
          return NextResponse.json(
            {
              success: false,
              error: "Maximum 5 failed attempts reached. Fallback code locked for 15 minutes to prevent guessing.",
              isLocked: true,
              attemptsRemaining: 0,
            },
            { status: 429 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: `Incorrect 6-digit code. ${failResult.attemptsRemaining} attempt(s) remaining.`,
            attemptsRemaining: failResult.attemptsRemaining,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Invalid QR code token." },
        { status: 400 }
      );
    }

    // Code matched! Reset failed attempts
    await resetFallbackAttempts(session.itemId);

    if (session.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Handover has already been completed for this session." },
        { status: 400 }
      );
    }

    // Check expiration
    const expiryTime = session.expiresAt instanceof Date
      ? session.expiresAt.getTime()
      : typeof session.expiresAt === "string"
      ? new Date(session.expiresAt).getTime()
      : (session.expiresAt as unknown as { toDate?: () => Date })?.toDate?.()?.getTime() || 0;

    if (nowMs > expiryTime && expiryTime > 0) {
      return NextResponse.json(
        { success: false, error: "Handover session expired (48-hour grace window exceeded). Please contact Admin." },
        { status: 410 }
      );
    }

    const resolvedItemId = session.itemId;
    const item = await getItemById(resolvedItemId);
    const rawItem = item as unknown as { contactPhone?: string };

    // 4. Fetch Escrow Transaction
    const escrow = await getEscrowByItemId(resolvedItemId);
    if (!escrow) {
      return NextResponse.json(
        { success: false, error: "No escrow transaction found for this item." },
        { status: 404 }
      );
    }

    if (escrow.status !== "LOCKED") {
      return NextResponse.json(
        { success: false, error: `Escrow cannot be released because current status is '${escrow.status}'.` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 5. Trigger MoMo Payout to Finder with Idempotency Key
    const finderPhone = session.finderPhone || rawItem?.contactPhone || "+250788123456";
    const idempotencyKey = `payout_${resolvedItemId}_${session.qrToken.slice(-8)}_${escrow.id}`;

    const payoutResult = await disburseMoMoPayout({
      amount: escrow.amount,
      recipientPhone: finderPhone,
      externalId: resolvedItemId,
      disbursementNote: `Handover verified for: ${item?.title || "Item"}`,
      idempotencyKey,
    });

    // 6. Complete Handover & Release Escrow
    await updateHandoverStatus(resolvedItemId, "COMPLETED");
    await updateEscrowStatus(escrow.id, "RELEASED");

    // 7. Transition Item Status to RESOLVED & attach digital receipt data
    const sectorPost = `${item?.district || "Kigali"} › ${item?.sector || "Sector"} (${item?.meetingPoint || "Official Sector Police Post"})`;
    const digitalReceipt = {
      receiptId: `RCPT_${Date.now()}_${payoutResult.momoRef.slice(-6)}`,
      itemId: resolvedItemId,
      itemTitle: item?.title || "Recovered Item",
      maskedItemId: item?.maskedDocNumber || resolvedItemId,
      sectorPostLocation: sectorPost,
      escrowRef: payoutResult.momoRef,
      payoutAmount: escrow.amount,
      platformFee: escrow.platformFee,
      totalPaid: escrow.totalLocked,
      verifiedMethod: isTokenMatch ? "PWA_CAMERA_QR" : "MANUAL_6DIGIT_FALLBACK",
      completedAt: now,
    };

    if (item) {
      item.status = "RESOLVED";
      (item as unknown as { digitalReceipt?: typeof digitalReceipt }).digitalReceipt = digitalReceipt;
      await persistItem(item);
      try {
        await adminDb.collection("items").doc(resolvedItemId).update({
          status: "RESOLVED",
          resolvedAt: now,
          digitalReceipt,
        });
      } catch {
        // Fallback
      }
    }

    // 8. Send SMS Receipts to Both Parties
    if (finderPhone) {
      await sendSmsAlert({
        to: finderPhone,
        message: `Found IN Payout: ${escrow.amount.toLocaleString()} RWF has been released to your mobile money account following verified handover at ${sectorPost}. Ref: ${payoutResult.momoRef}.`,
        type: "ESCROW_LOCKED",
        userId: resolvedItemId,
      });
    }

    if (session.claimerPhone) {
      await sendSmsAlert({
        to: session.claimerPhone,
        message: `Found IN Receipt: Handover completed at ${sectorPost}! ${escrow.amount.toLocaleString()} RWF escrow released to finder. Ref: ${payoutResult.momoRef}.`,
        type: "HANDOVER_REMINDER",
        userId: resolvedItemId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Handover check-in verified! Escrow payout released to finder.",
      itemStatus: "RESOLVED",
      escrowStatus: "RELEASED",
      digitalReceipt,
    });
  } catch (error) {
    console.error("[API Escrow Release Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to release escrow funds." },
      { status: 500 }
    );
  }
}
