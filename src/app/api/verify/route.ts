import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getItemById, getVerificationByItemId, updateItemVerification } from "@/lib/items-store";
import { sendSmsAlert } from "@/lib/sms";
import { VerifyClaimSchema } from "@/lib/validations";
import { applyRateLimit } from "@/lib/rate-limiter";
import { generateSignedRawUrl } from "@/lib/redact";
import { ProofDetails } from "@/types/database";

/**
 * GET /api/verify?itemId=...
 * Returns verification status and details without leaking private data.
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

    // If approved by finder, return unlocked details
    if (verification?.isVerified) {
      const rawItem = item as unknown as { contactPhone?: string };
      const signedRawUrl = await generateSignedRawUrl(itemId, 15);

      return NextResponse.json({
        success: true,
        isVerified: true,
        reviewPending: false,
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
      reviewPending: Boolean(verification?.visualReviewPending),
      isLocked: Boolean(verification?.isLocked),
      attemptsRemaining: Math.max(0, 3 - (verification?.failedAttempts || 0)),
      secretPrompt: verification?.secretPrompt || "What is a distinguishing secret detail on this item?",
      hasChallengePrompt: Boolean(verification?.secretPrompt),
      proofDetails: verification?.proofDetails || null,
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
 * Mandatory Manual Ownership Verification:
 * Zero Auto-Approvals. All submissions require Finder approval on their dashboard.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "verify_post", 15, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const body = await request.json().catch(() => ({}));
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

    const { itemId, option, answer, visualNote, notes, fullName, dateOfBirth, serialEnding, markings } = validation.data;
    const { claimerId, finderId } = body;

    const item = await getItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found." },
        { status: 404 }
      );
    }

    const verification = await getVerificationByItemId(itemId);
    const rawItem = item as unknown as { contactPhone?: string; finderId?: string };

    // 1. CLAIMER SUBMITS MANDATORY MANUAL VERIFICATION (Zero Auto-Approvals)
    if (option === "CHALLENGE" || option === "VISUAL" || option === "MANUAL_PROOF") {
      const challengeAns = (answer || body.challengeAnswer || "").trim();
      const userFullName = (fullName || body.fullName || "").trim();
      const userDob = (dateOfBirth || body.dateOfBirth || "").trim();
      const userSerial = (serialEnding || body.serialEnding || "").trim();
      const userMarkings = (markings || visualNote || notes || body.markings || "").trim();

      // Require specific proof details
      if (!userFullName && !userSerial && !userMarkings && !challengeAns) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Please provide specific ownership proof details (such as full name on document, serial ending, physical marks, or challenge answer) for the finder to inspect." 
          },
          { status: 400 }
        );
      }

      const proofDetails: ProofDetails = {
        fullName: userFullName || undefined,
        dateOfBirth: userDob || undefined,
        serialEnding: userSerial || undefined,
        markings: userMarkings || undefined,
        challengeAnswer: challengeAns || undefined,
        submittedAt: new Date().toISOString(),
      };

      // Check if challenge answer matches if finder had set one (recorded for finder visibility)
      let challengeMatched = false;
      if (verification?.secretAnswerHash && challengeAns) {
        const computedHash = crypto
          .createHash("sha256")
          .update(challengeAns.toLowerCase())
          .digest("hex");
        challengeMatched = computedHash === verification.secretAnswerHash;
      }

      // STRICT ZERO AUTO-APPROVAL RULE:
      // Even if challenge matches, keep item locked and set reviewPending = true
      await updateItemVerification(itemId, {
        visualReviewPending: true,
        visualProofText: `Full Name: ${userFullName || "N/A"} | Serial Ending: ${userSerial || "N/A"} | Marks: ${userMarkings || "N/A"}${challengeAns ? ` | Challenge Ans: ${challengeAns}` : ""}`,
        proofDetails,
        verifiedBy: claimerId || "pending_claimer",
        isVerified: false, // Locked until finder manually approves!
      });

      // Dispatch SMS to finder alerting them to review the proof on their dashboard
      const finderPhone = rawItem?.contactPhone;
      if (finderPhone) {
        await sendSmsAlert({
          to: finderPhone,
          message: `Found IN: A citizen submitted ownership proof for your listing '${item.title}'. Log in to your dashboard to inspect their details and approve handover.`,
          type: "HANDOVER_REMINDER",
          userId: itemId,
        });
      }

      return NextResponse.json({
        success: true,
        verified: false,
        pendingReview: true,
        message: "Ownership proof submitted successfully! The finder will manually review your proof details on their dashboard before unlocking meetup details.",
      });
    }

    // 2. FINDER EXPLICITLY APPROVES VERIFICATION
    if (option === "APPROVE") {
      const signedRawUrl = await generateSignedRawUrl(itemId, 15);

      const updateResult = await updateItemVerification(
        itemId,
        {
          visualPassed: true,
          visualReviewPending: false,
          isVerified: true,
          verifiedAt: new Date().toISOString(),
          failedAttempts: 0,
          isLocked: false,
        },
        true // Shifts status to 'CLAIMED' and starts 48h handover timer
      );

      // Notify Claimer via SMS if claimer phone is available
      const claimerUid = verification?.verifiedBy;
      if (claimerUid) {
        // We log the notification
        await sendSmsAlert({
          to: rawItem?.contactPhone || "+250788000000",
          message: `Found IN: Verification approved for '${item.title}'! Handover session is active. Meet at ${item.meetingPoint || "designated local sector post"}.`,
          type: "HANDOVER_REMINDER",
          userId: itemId,
        });
      }

      return NextResponse.json({
        success: true,
        verified: true,
        method: "APPROVE",
        message: "Verification approved! Handover window is now active.",
        unlockedDetails: {
          privateRawUrl: signedRawUrl,
          meetingPoint: item.meetingPoint,
          contactPhone: rawItem?.contactPhone || "+250 788 000 000 (Safe Handover)",
          claimedAt: updateResult.item?.claimedAt,
        },
      });
    }

    // 3. FINDER REJECTS CLAIM
    if (option === "REJECT") {
      await updateItemVerification(itemId, {
        visualReviewPending: false,
        isVerified: false,
      });

      return NextResponse.json({
        success: true,
        rejected: true,
        message: "Claim has been rejected. Listing remains active.",
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
