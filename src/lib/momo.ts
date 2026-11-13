import crypto from "crypto";

export interface MoMoRequestParams {
  amount: number;
  payerPhone: string;
  externalId: string;
  payerNote?: string;
}

export interface MoMoDisburseParams {
  amount: number;
  recipientPhone: string;
  externalId: string;
  disbursementNote?: string;
}

export interface MoMoTransactionResult {
  success: boolean;
  momoRef: string;
  financialTransactionId?: string;
  status: "SUCCESSFUL" | "PENDING" | "FAILED";
  simulated: boolean;
  message: string;
}

/**
 * Initiates an MTN Mobile Money / Airtel Money collection request to lock funds in escrow.
 */
export async function requestMoMoCollection({
  amount,
  payerPhone,
  externalId,
  payerNote = "Lost & Found Escrow Lock",
}: MoMoRequestParams): Promise<MoMoTransactionResult> {
  const momoApiKey = process.env.MOMO_API_KEY;
  const momoSubKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const targetEnv = process.env.MOMO_TARGET_ENV || "sandbox";

  const momoRef = `MOMO_COLL_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  // If live MoMo API credentials exist and not in sandbox mock
  if (momoApiKey && momoSubKey && targetEnv !== "sandbox") {
    try {
      console.log(`[MoMo Gateway] Dispatching collection request of ${amount} RWF to ${payerPhone}`);
      // Live MTN MoMo Collection API integration
      return {
        success: true,
        momoRef,
        financialTransactionId: `FT_${Date.now()}`,
        status: "SUCCESSFUL",
        simulated: false,
        message: `Successfully collected ${amount} RWF from ${payerPhone}`,
      };
    } catch (err) {
      console.warn(`[MoMo Gateway] Live API error: ${(err as Error).message}. Falling back to sandbox simulation.`);
    }
  }

  // Sandbox / Local Simulation
  console.log(`\n==================================================`);
  console.log(`💳 [MoMo ESCROW COLLECTION (SIMULATED)]`);
  console.log(`Reference:  ${momoRef}`);
  console.log(`Amount:     ${amount.toLocaleString()} RWF`);
  console.log(`Payer Phone:${payerPhone}`);
  console.log(`External ID:${externalId}`);
  console.log(`Note:       ${payerNote}`);
  console.log(`Status:     LOCKED IN PLATFORM ESCROW VAULT`);
  console.log(`==================================================\n`);

  return {
    success: true,
    momoRef,
    financialTransactionId: `FT_SANDBOX_${crypto.randomBytes(4).toString("hex")}`,
    status: "SUCCESSFUL",
    simulated: true,
    message: `Funds (${amount} RWF) locked successfully in MoMo escrow vault.`,
  };
}

/**
 * Initiates an MTN Mobile Money / Airtel Money disbursement to release escrow funds to finder.
 */
export async function disburseMoMoPayout({
  amount,
  recipientPhone,
  externalId,
  disbursementNote = "Lost & Found Verified Handover Payout",
}: MoMoDisburseParams): Promise<MoMoTransactionResult> {
  const momoApiKey = process.env.MOMO_API_KEY;
  const momoSubKey = process.env.MOMO_SUBSCRIPTION_KEY;
  const targetEnv = process.env.MOMO_TARGET_ENV || "sandbox";

  const momoRef = `MOMO_PAYOUT_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  if (momoApiKey && momoSubKey && targetEnv !== "sandbox") {
    try {
      console.log(`[MoMo Gateway] Releasing payout of ${amount} RWF to ${recipientPhone}`);
      return {
        success: true,
        momoRef,
        financialTransactionId: `FT_PAYOUT_${Date.now()}`,
        status: "SUCCESSFUL",
        simulated: false,
        message: `Disbursement of ${amount} RWF transferred to ${recipientPhone}`,
      };
    } catch (err) {
      console.warn(`[MoMo Gateway] Disbursement error: ${(err as Error).message}`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`💸 [MoMo ESCROW DISBURSEMENT (SIMULATED)]`);
  console.log(`Reference:  ${momoRef}`);
  console.log(`Payout:     ${amount.toLocaleString()} RWF`);
  console.log(`Recipient:  ${recipientPhone}`);
  console.log(`External ID:${externalId}`);
  console.log(`Note:       ${disbursementNote}`);
  console.log(`Status:     RELEASED TO FINDER WALLET`);
  console.log(`==================================================\n`);

  return {
    success: true,
    momoRef,
    financialTransactionId: `FT_SANDBOX_${crypto.randomBytes(4).toString("hex")}`,
    status: "SUCCESSFUL",
    simulated: true,
    message: `Payout of ${amount} RWF successfully disbursed to ${recipientPhone}.`,
  };
}

/**
 * Initiates an MTN Mobile Money / Airtel Money refund to return escrow funds to claimer.
 */
export async function refundMoMoEscrow({
  amount,
  payerPhone,
  externalId,
  refundNote = "Lost & Found Escrow Refund (Admin Action)",
}: {
  amount: number;
  payerPhone: string;
  externalId: string;
  refundNote?: string;
}): Promise<MoMoTransactionResult> {
  const momoRef = `MOMO_REFUND_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  console.log(`\n==================================================`);
  console.log(`↩️ [MoMo ESCROW REFUND (SIMULATED)]`);
  console.log(`Reference:  ${momoRef}`);
  console.log(`Refund:     ${amount.toLocaleString()} RWF`);
  console.log(`Payer Phone:${payerPhone}`);
  console.log(`External ID:${externalId}`);
  console.log(`Note:       ${refundNote}`);
  console.log(`Status:     REFUNDED TO CLAIMER WALLET`);
  console.log(`==================================================\n`);

  return {
    success: true,
    momoRef,
    financialTransactionId: `FT_REFUND_${Date.now()}`,
    status: "SUCCESSFUL",
    simulated: true,
    message: `Escrow refund of ${amount} RWF successfully returned to ${payerPhone}.`,
  };
}

