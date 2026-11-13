import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getItemById, getVerificationByItemId } from "@/lib/items-store";
import { requestMoMoCollection } from "@/lib/momo";
import { 
  persistEscrowTransaction, 
  persistHandoverSession, 
  ExtendedHandoverSession 
} from "@/lib/escrow-store";
import { sendSmsAlert } from "@/lib/sms";
import { EscrowTransaction } from "@/types/database";
import { EscrowLockSchema } from "@/lib/validations";

const MIN_ESCROW_AMOUNT = 500;      // 500 RWF
const MAX_ESCROW_AMOUNT = 500000;   // 500,000 RWF
const PLATFORM_MICRO_FEE = 100;     // Flat 100 RWF platform fee to cover SMS gateway

/**
 * POST /api/escrow/lock
 * Initiates MoMo collection and locks funds in escrow for a verified item.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = EscrowLockSchema.safeParse(body);

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

    const { itemId, payerPhone, amount: inputAmount } = validation.data;
    const payerId = body.payerId || "verified_claimer";

    // 1. Verify item exists
    const item = await getItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found." },
        { status: 404 }
      );
    }

    // 2. Guardrail Check: Dual Verification MUST be passed
    const verification = await getVerificationByItemId(itemId);
    if (!verification?.isVerified) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Forbidden: Escrow funds cannot be locked until the claimer passes Dual Verification (Option C)." 
        },
        { status: 403 }
      );
    }

    // 3. Amount & Fee Validation
    const amount = Number(inputAmount || item.feeOrReward || 1000);
    if (amount < MIN_ESCROW_AMOUNT || amount > MAX_ESCROW_AMOUNT) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Escrow amount must be between ${MIN_ESCROW_AMOUNT.toLocaleString()} RWF and ${MAX_ESCROW_AMOUNT.toLocaleString()} RWF.` 
        },
        { status: 400 }
      );
    }

    const totalLocked = amount + PLATFORM_MICRO_FEE;

    // 4. Request MoMo Collection
    const momoResult = await requestMoMoCollection({
      amount: totalLocked,
      payerPhone,
      externalId: itemId,
      payerNote: `Escrow lock for item: ${item.title}`,
    });

    if (!momoResult.success) {
      return NextResponse.json(
        { success: false, error: "Mobile Money collection failed or was declined by user." },
        { status: 502 }
      );
    }

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48-hour handover grace timer

    // 5. Generate Dynamic QR Token & 6-Digit Numeric Fallback Code
    const qrToken = `qr_token_${itemId}_${crypto.randomBytes(8).toString("hex")}`;
    const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 6. Persist Escrow Transaction
    const escrowTx: EscrowTransaction = {
      id: `escrow_${itemId}_${Date.now()}`,
      itemId,
      payerId,
      recipientId: item.finderId || null,
      amount,
      platformFee: PLATFORM_MICRO_FEE,
      totalLocked,
      momoRef: momoResult.momoRef,
      status: "LOCKED",
      createdAt: now,
    };
    await persistEscrowTransaction(escrowTx);

    // 7. Persist Handover Session
    const rawItem = item as unknown as { contactPhone?: string };
    const handoverSession: ExtendedHandoverSession = {
      id: `handover_${itemId}`,
      itemId,
      qrToken,
      fallbackCode,
      status: "PENDING",
      expiresAt,
      finderPhone: rawItem.contactPhone,
      claimerPhone: payerPhone,
    };
    await persistHandoverSession(handoverSession);

    // 8. Dispatch SMS Notification to Finder
    if (rawItem?.contactPhone) {
      const smsMsg = `Inshuti Escrow Alert: ${amount.toLocaleString()} RWF delivery fee (+100 RWF platform fee) has been safely LOCKED in MoMo escrow by the verified claimer. Safe meeting spot: ${item.meetingPoint || "Agreed Public Location"}.`;
      await sendSmsAlert({
        to: rawItem.contactPhone,
        message: smsMsg,
        type: "ESCROW_LOCKED",
        userId: itemId,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${totalLocked.toLocaleString()} RWF locked in MoMo escrow. QR Handover session initiated.`,
      escrow: escrowTx,
      handoverSession: {
        itemId,
        qrToken,
        fallbackCode,
        expiresAt,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("[API Escrow Lock Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate escrow lock." },
      { status: 500 }
    );
  }
}

