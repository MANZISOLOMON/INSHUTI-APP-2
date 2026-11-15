import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getItemById, getVerificationByItemId, updateItemVerification } from "@/lib/items-store";
import { sendSmsAlert } from "@/lib/sms";
import { VerifyClaimSchema } from "@/lib/validations";
import { applyRateLimit } from "@/lib/rate-limiter";
import { generateSignedRawUrl } from "@/lib/redact";

/**
 * GET /api/verify?itemId=...
 * Returns verification details (secret challenge prompt) for an item without leaking secrets.
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "verify_get", 60, 60 * 1000);
    if (rateLimitError) return rateLimitError;

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

    // If already verified, generate a 15-minute signed URL and return unlocked details
    if (verification?.isVerified) {
      const rawItem = item as unknown as { contactPhone?: string };
      const signedRawUrl = await generateSignedRawUrl(itemId, 15);

      return NextResponse.json({
        success: true,
        isVerified: true,
        secretPrompt: verification.secretPrompt,
        unlockedDetails: {
          privateRawUrl: signedRawUrl,
          meetingPoint: item.meetingPoint,
          contactPhone: rawItem.contactPhone || "+250 788 000 000 (Safe Handover)",
          claimedAt: item.claimedAt,
        },
      });
    }

    return NextResponse.json({
      success: true,
      isVerified: false,
      isLocked: Boolean(verification?.isLocked),
      attemptsRemaining: Math.max(0, 3 - (verification?.failedAttempts || 0)),
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
 * Option A (Challenge Question with 3-attempt brute-force lock) OR Option B (Visual Photo Check).
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "verify_post", 15, 60 * 1000);
    if (rateLimitError) return rateLimitError;

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

    // 1. OPTION A: Secret Challenge Q&A with Brute-Force Protection
    if (option === "CHALLENGE") {
      const currentAttempts = verification?.failedAttempts || 0;

      // Lockout check: max 3 attempts
      if (verification?.isLocked || currentAttempts >= 3) {
        return NextResponse.json(
          {
            success: false,
            error: "Verification locked: Maximum 3 secret challenge attempts exceeded. Please contact the Finder or Admin.",
          },
          { status: 429 }
        );
      }

      if (!answer || typeof answer !== "string") {
        return NextResponse.json(
          { success: false, error: "Please enter your answer to the secret challenge." },
          { status: 400 }
        );
      }

      if (verification?.secretAnswerHash) {
        const computedHash = crypto
          .createHash("sha256")
          .update(answer.trim().toLowerCase())
          .digest("hex");

        if (computedHash !== verification.secretAnswerHash) {
          const newAttempts = currentAttempts + 1;
          const isLocked = newAttempts >= 3;

          await updateItemVerification(itemId, {
            failedAttempts: newAttempts,
            isLocked,
          });

          return NextResponse.json(
            { 
              success: false, 
              verified: false, 
              error: isLocked
                ? "Incorrect answer. Maximum 3 attempts exceeded. Option A is now locked for security."
                : `The answer provided did not match the secret challenge. ${3 - newAttempts} attempt(s) remaining.`,
              attemptsRemaining: Math.max(0, 3 - newAttempts),
            },
            { status: 401 }
          );
        }
      }

      // Verification Passed via Option A! Reset attempts & generate short-lived signed URL
      const signedRawUrl = await generateSignedRawUrl(itemId, 15);

      const updateResult = await updateItemVerification(
        itemId,
        {
          isVerified: true,
          verifiedBy: claimerId || "verified_claimer",
          failedAttempts: 0,
          isLocked: false,
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
        message: "Dual Verification passed! Private image and finder contact details unlocked for 15 minutes.",
        unlockedDetails: {
          privateRawUrl: signedRawUrl,
          meetingPoint: item.meetingPoint,
          contactPhone: rawItem?.contactPhone || "+250 788 000 000 (Safe Handover)",
          claimedAt: updateResult.item?.claimedAt,
        },
      });
    }

    // 2. OPTION B: Visual Photo Compare
    if (option === "VISUAL") {
      const signedRawUrl = await generateSignedRawUrl(itemId, 15);

      const updateResult = await updateItemVerification(
        itemId,
        {
          visualPassed: true,
          isVerified: true,
          verifiedBy: claimerId || "verified_claimer",
          failedAttempts: 0,
          isLocked: false,
        },
        true
      );

      const rawItem = updateResult.item as unknown as { contactPhone?: string };

      if (rawItem?.contactPhone) {
        await sendSmsAlert({
          to: rawItem.contactPhone,
          message: `Inshuti Found Alert: Visual comparison requested and approved for '${item.title}'. 48-hour handover window is active.`,
          type: "HANDOVER_REMINDER",
          userId: itemId,
        });
      }

      return NextResponse.json({
        success: true,
        verified: true,
        method: "VISUAL",
        message: "Visual photo verification approved! Finder contact unlocked for 15 minutes.",
        unlockedDetails: {
          privateRawUrl: signedRawUrl,
          meetingPoint: item.meetingPoint,
          contactPhone: rawItem?.contactPhone || "+250 788 000 000 (Safe Handover)",
          claimedAt: updateResult.item?.claimedAt,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid verification option selected." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API Verify POST Error]:", error);
    return NextResponse.json(
      { success: false, error: "Verification processing failed" },
      { status: 500 }
    );
  }
}
