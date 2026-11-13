import { NextRequest, NextResponse } from "next/server";
import { 
  getEscrowById, 
  getEscrowByItemId, 
  updateEscrowStatus, 
  updateHandoverStatus 
} from "@/lib/escrow-store";
import { getItemById, updateItemStatus } from "@/lib/items-store";
import { disburseMoMoPayout, refundMoMoEscrow } from "@/lib/momo";
import { sendSmsAlert } from "@/lib/sms";
import { AdminEscrowOverrideSchema } from "@/lib/validations";

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "rwanda-admin-2026";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("x-admin-key");
  const urlKey = req.nextUrl.searchParams.get("adminKey");
  return authHeader === ADMIN_SECRET || urlKey === ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin passkey required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = AdminEscrowOverrideSchema.safeParse(body);

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

    const { action, itemId, escrowId, adminNote } = validation.data;

    // 1. Locate Escrow Transaction
    let escrow = escrowId ? await getEscrowById(escrowId) : null;
    if (!escrow && itemId) {
      escrow = await getEscrowByItemId(itemId);
    }

    const targetItemId = itemId || escrow?.itemId;
    if (!targetItemId) {
      return NextResponse.json(
        { success: false, error: "Could not find item associated with this escrow." },
        { status: 404 }
      );
    }

    const item = await getItemById(targetItemId);
    const itemTitle = item ? item.title : "Reported Item";
    const finderPhone = (item && "contactPhone" in item ? (item as any).contactPhone : null) || "+250788123456";
    const claimerPhone = escrow?.payerId?.startsWith("+") ? escrow.payerId : "+250788987654";
    const escrowAmount = escrow ? escrow.amount : (item?.feeOrReward || 2000);

    // 2. Execute Admin Override
    if (action === "RELEASE_TO_FINDER") {
      // MoMo payout disbursement
      const payoutResult = await disburseMoMoPayout({
        amount: escrowAmount,
        recipientPhone: finderPhone,
        externalId: targetItemId,
        disbursementNote: `Inshuti Admin Force Release: ${itemTitle}. ${adminNote || ""}`,
      });

      // Update Escrow
      if (escrow) {
        await updateEscrowStatus(escrow.id, "RELEASED");
      }

      // Update Handover Session & Item Status
      await updateHandoverStatus(targetItemId, "COMPLETED");
      await updateItemStatus(targetItemId, "RESOLVED");

      // Dispatch SMS confirmation receipts
      await sendSmsAlert({
        to: finderPhone,
        message: `Inshuti Admin: Escrow payout of ${escrowAmount.toLocaleString()} RWF for item '${itemTitle}' was approved and released to your MoMo account.`,
        type: "ESCROW_LOCKED",
      });

      await sendSmsAlert({
        to: claimerPhone,
        message: `Inshuti Admin: Escrow for item '${itemTitle}' has been closed by admin resolution and released to the finder.`,
        type: "ESCROW_LOCKED",
      });

      return NextResponse.json({
        success: true,
        action: "RELEASE_TO_FINDER",
        payoutResult,
        message: `Escrow payout of ${escrowAmount.toLocaleString()} RWF successfully released to finder (${finderPhone}).`,
      });
    } else {
      // action === "REFUND_TO_PAYER"
      const refundResult = await refundMoMoEscrow({
        amount: escrowAmount,
        payerPhone: claimerPhone,
        externalId: targetItemId,
        refundNote: `Inshuti Admin Escrow Refund: ${itemTitle}. ${adminNote || ""}`,
      });

      // Update Escrow
      if (escrow) {
        await updateEscrowStatus(escrow.id, "REFUNDED");
      }

      // Reset item status back to ACTIVE so it returns to catalog or stays DISPUTED
      await updateItemStatus(targetItemId, "ACTIVE");

      // Dispatch SMS alerts
      await sendSmsAlert({
        to: claimerPhone,
        message: `Inshuti Admin: Escrow refund of ${escrowAmount.toLocaleString()} RWF for item '${itemTitle}' has been refunded to your MoMo account.`,
        type: "DISPUTE_ALERT",
      });

      await sendSmsAlert({
        to: finderPhone,
        message: `Inshuti Admin: Escrow for item '${itemTitle}' was cancelled and refunded to the claimer. Listing returned to active catalog.`,
        type: "DISPUTE_ALERT",
      });

      return NextResponse.json({
        success: true,
        action: "REFUND_TO_PAYER",
        refundResult,
        message: `Escrow refund of ${escrowAmount.toLocaleString()} RWF successfully returned to claimer (${claimerPhone}).`,
      });
    }
  } catch (error) {
    console.error("[Admin API] Escrow override failed:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

