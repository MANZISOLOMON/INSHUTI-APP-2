import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getItemById, getVerificationByItemId, updateItemVerification } from "@/lib/items-store";
import { sendSmsAlert } from "@/lib/sms";
import { VerifyClaimSchema } from "@/lib/validations";

/**
 * GET /api/verify?itemId=...
 * Returns verification details (secret challenge prompt) for an item without leaking secrets.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter 'itemId'" },
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

    // If already verified, return unlocked details
    if (verification?.isVerified) {
      const rawItem = item as unknown as { contactPhone?: string };
      return NextResponse.json({
        success: true,
        isVerified: true,
        secretPrompt: verification.secretPrompt,
        unlockedDetails: {
          privateRawUrl: item.privateRawUrl || item.publicBlurredUrl,
          meetingPoint: item.meetingPoint,
          contactPhone: rawItem.contactPhone || "+250 788 000 000 (Safe Handover)",
          claimedAt: item.claimedAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isVerified: false,
      secretPrompt: verification?.secretPrompt || "What is a distinguishing secret detail on this item?",
      hasChallengePrompt: Boolean(verification?.secretPrompt),
    });
  } catch (error) {
    console.error("[API Verify GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/verify
 * Dual Verification (Option C) handler:
 * Option A (Challenge Question) OR Option B (Visual Photo Check).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = VerifyClaimSchema.safeParse(body);

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

    const { itemId, option, answer } = validation.data;
    const { claimerId } = body;

    const item = await getItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found." },
        { status: 404 }
      );
    }

    const verification = await getVerificationByItemId(itemId);

    // 1. OPTION A: Secret Challenge Q&A
    if (option === "CHALLENGE") {
      if (!answer || typeof answer !== "string") {
        return NextResponse.json(
          { success: false, error: "Please enter your answer to the secret challenge." },
          { status: 400 }
        );
      }

      if (!verification?.secretAnswerHash) {
        // If finder didn't set a secret answer, automatically allow challenge pass with reasonable string
        console.log(`[Verification] No secretAnswerHash configured for item ${itemId}. Auto-approving.`);
      } else {
        const computedHash = crypto
          .createHash("sha256")
          .update(answer.trim().toLowerCase())
          .digest("hex");

        if (computedHash !== verification.secretAnswerHash) {
          return NextResponse.json(
            { 
              success: false, 
              verified: false, 
              error: "The answer provided does not match the secret challenge. Try again or use Option B (Visual Photo Check)." 
            },
            { status: 401 }
          );
        }
      }

      // Verification Passed via Option A!
      const updateResult = await updateItemVerification(
        itemId,
        {
          isVerified: true,
          verifiedBy: claimerId || "verified_claimer",
        },
        true // Shifts status to 'CLAIMED' and starts 48h handover timer
      );

      const rawItem = updateResult.item as unknown as { contactPhone?: string };

      // Dispatch SMS alert to finder
      if (rawItem?.contactPhone) {
        await sendSmsAlert({
          to: rawItem.contactPhone,
          message: `Inshuti Found Alert: A claimer has successfully passed the Secret Challenge for your found item '${item.title}'. 48-hour handover timer is active.`,
          type: "HANDOVER_REMINDER",
          userId: itemId,
        });
      }

      return NextResponse.json({
        success: true,
        verified: true,
        method: "CHALLENGE",
        message: "Dual Verification passed! Private image and finder contact details unlocked.",
        unlockedDetails: {
          privateRawUrl: updateResult.item?.privateRawUrl || item.publicBlurredUrl,
          meetingPoint: item.meetingPoint,
          contactPhone: rawItem?.contactPhone || "+250 788 000 000 (Safe Handover)",
          claimedAt: updateResult.item?.claimedAt,
        },
      });
    }

    // 2. OPTION B: Visual Photo Compare
    if (option === "VISUAL") {
      const updateResult = await updateItemVerification(
        itemId,
        {
          visualPassed: true,
          isVerified: true,
          verifiedBy: claimerId || "verified_claimer",
        },
        true
      );

      const rawItem = updateResult.item as unknown as { contactPhone?: string };

      if (rawItem?.contactPhone) {
        await sendSmsAlert({
          to: rawItem.contactPhone,
          message: `Inshuti Visual Verification: A claimer verified visual marks for '${item.title}'. Please prepare for safe in-person handover.`,
          type: "HANDOVER_REMINDER",
          userId: itemId,
        });
      }

      return NextResponse.json({
        success: true,
        verified: true,
        method: "VISUAL",
        message: "Visual comparison verified! Private details unlocked.",
        unlockedDetails: {
          privateRawUrl: updateResult.item?.privateRawUrl || item.publicBlurredUrl,
          meetingPoint: item.meetingPoint,
          contactPhone: rawItem?.contactPhone || "+250 788 000 000 (Safe Handover)",
          claimedAt: updateResult.item?.claimedAt,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid verification option selected. Use CHALLENGE or VISUAL." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API Verify POST Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process verification challenge." },
      { status: 500 }
    );
  }
}

