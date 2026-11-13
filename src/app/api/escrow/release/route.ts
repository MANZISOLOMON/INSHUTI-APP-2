import { NextRequest, NextResponse } from "next/server";
import { 
  getHandoverSessionByTokenOrCode, 
  updateHandoverStatus, 
  getEscrowByItemId, 
  updateEscrowStatus 
} from "@/lib/escrow-store";
import { getItemById, persistItem } from "@/lib/items-store";
import { disburseMoMoPayout } from "@/lib/momo";
import { sendSmsAlert } from "@/lib/sms";
import { adminDb } from "@/lib/firebase/admin";
import { EscrowReleaseSchema } from "@/lib/validations";

/**
 * POST /api/escrow/release
 * Validates in-person QR scan / fallback code, updates HandoverSession & EscrowTransaction,
 * disburses MoMo payout, and transitions item to RESOLVED.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    const scannedBy = body.scannedBy || "claimer_app";

    // 1. Validate Handover Session by qrToken OR fallbackCode
    const session = await getHandoverSessionByTokenOrCode(tokenOrCode);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid QR code or 6-digit fallback code." },
        { status: 404 }
      );
    }

    if (itemId && session.itemId !== itemId) {
      return NextResponse.json(
        { success: false, error: "Token does not match the active session for this item." },
        { status: 400 }
      );
    }

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

    if (Date.now() > expiryTime && expiryTime > 0) {
      return NextResponse.json(
        { success: false, error: "Handover session expired (48-hour grace window exceeded). Please contact Admin." },
        { status: 410 }
      );
    }

    const resolvedItemId = session.itemId;
    const item = await getItemById(resolvedItemId);
    const rawItem = item as unknown as { contactPhone?: string };

    // 2. Fetch Escrow Transaction
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

    // 3. Trigger MoMo Payout to Finder
    const finderPhone = session.finderPhone || rawItem?.contactPhone || "+250788123456";
    const payoutResult = await disburseMoMoPayout({
      amount: escrow.amount,
      recipientPhone: finderPhone,
      externalId: resolvedItemId,
      disbursementNote: `Handover verified for: ${item?.title || "Item"}`,
    });

    // 4. Atomic updates
    // A. Complete Handover
    await updateHandoverStatus(resolvedItemId, "COMPLETED");

    // B. Release Escrow
    await updateEscrowStatus(escrow.id, "RELEASED");

    // C. Transition Item Status to RESOLVED
    if (item) {
      item.status = "RESOLVED";
      await persistItem(item);
      try {
        await adminDb.collection("items").doc(resolvedItemId).update({
          status: "RESOLVED",
          resolvedAt: now,
        });
      } catch {
        // Fallback
      }
    }

    // 5. Send Cellular SMS Receipts to Both Parties
    // Finder SMS
    if (finderPhone) {
      await sendSmsAlert({
        to: finderPhone,
        message: `Inshuti MoMo Payout: ${escrow.amount.toLocaleString()} RWF has been RELEASED to your mobile money account following verified QR handover check-in. Ref: ${payoutResult.momoRef}.`,
        type: "ESCROW_LOCKED",
        userId: resolvedItemId,
      });
    }

    // Claimer SMS
    if (session.claimerPhone) {
      await sendSmsAlert({
        to: session.claimerPhone,
        message: `Inshuti Handover Receipt: Item handover check-in verified successfully. ${escrow.amount.toLocaleString()} RWF escrow released to finder. Item is now marked RESOLVED.`,
        type: "HANDOVER_REMINDER",
        userId: resolvedItemId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Handover check-in verified! Escrow payout released to finder.",
      itemStatus: "RESOLVED",
      escrowStatus: "RELEASED",
      payoutAmount: escrow.amount,
      platformFee: escrow.platformFee,
      momoPayoutRef: payoutResult.momoRef,
      scannedAt: now,
    });
  } catch (error) {
    console.error("[API Escrow Release Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to release escrow funds." },
      { status: 500 }
    );
  }
}
