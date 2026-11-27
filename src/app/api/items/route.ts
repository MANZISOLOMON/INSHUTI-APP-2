import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Item, Category, ItemType } from "@/types/database";
import { maskDocumentNumber, processZeroTrustUpload, validateImageBuffer } from "@/lib/redact";
import { persistItem, queryItems } from "@/lib/items-store";
import { generateSearchKeywords } from "@/types/database";
import { adminStorage } from "@/lib/firebase/admin";
import { runAutoMatch } from "@/lib/match-engine";
import { ItemCreateSchema } from "@/lib/validations";
import { applyRateLimit, verifyAppCheckHeader } from "@/lib/rate-limiter";
import { sanitizeClientPayload } from "@/lib/auth-middleware";

/**
 * Hash a secret answer for Option A Challenge Question
 * Never store plaintext secret answers
 */
function hashSecretAnswer(answer: string): string {
  return crypto
    .createHash("sha256")
    .update(answer.trim().toLowerCase())
    .digest("hex");
}

/**
 * Sanitizes item data for zero-trust public output:
 * Explicitly strips privateRawUrl, secretAnswer, qrToken, and sensitive contact numbers.
 */
function sanitizePublicItem(item: Item): Partial<Item> {
  const raw = item as unknown as Record<string, unknown>;
  const {
    privateRawUrl,
    contactPhone,
    secretAnswer,
    secretAnswerHash,
    qrToken,
    finderPhone,
    claimerPhone,
    ...publicFields
  } = raw;
  return publicFields as Partial<Item>;
}

/**
 * GET /api/items
 * Public search & catalog query endpoint with Zero-Trust stripping.
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "items_get", 60, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "ALL";
    const category = searchParams.get("category") || "ALL";
    const district = searchParams.get("district") || undefined;
    const sector = searchParams.get("sector") || undefined;
    const query = searchParams.get("query") || undefined;

    const items = await queryItems({
      type,
      category,
      district,
      sector,
      query,
    });

    const sanitizedItems = items.map(sanitizePublicItem);

    return NextResponse.json({
      success: true,
      count: sanitizedItems.length,
      items: sanitizedItems,
    });
  } catch (error) {
    console.error("[API Items GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/items
 * Server-side item upload handler with zero-trust redaction, auto-blur, and keyword generation.
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "items_post", 15, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const appCheck = verifyAppCheckHeader(request);
    if (!appCheck.valid) {
      return NextResponse.json(
        { success: false, error: appCheck.warning || "App Check verification failed." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const rawPayload = sanitizeClientPayload({
      type: formData.get("type"),
      category: formData.get("category"),
      title: formData.get("title"),
      description: formData.get("description") || "",
      district: formData.get("district"),
      sector: formData.get("sector"),
      meetingPoint: formData.get("meetingPoint") || "",
      feeOrReward: formData.get("feeOrReward") || "0",
      docNumber: formData.get("docNumber") || "",
      secretPrompt: formData.get("secretPrompt") || "",
      secretAnswer: formData.get("secretAnswer") || "",
      contactPhone: formData.get("contactPhone") || "",
    });

    const validation = ItemCreateSchema.safeParse(rawPayload);
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

    const {
      type,
      category,
      title,
      description,
      district,
      sector,
      meetingPoint,
      feeOrReward,
      docNumber,
      secretPrompt,
      secretAnswer,
      contactPhone,
    } = validation.data;

    // Collect all uploaded images (support both multiple 'images' and single 'image')
    const rawImageFiles = [
      ...formData.getAll("images"),
      ...formData.getAll("image"),
    ].filter((f): f is File => f instanceof File && f.size > 0).slice(0, 3);

    const itemId = `item_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    // 1. Zero-Trust Document Number Redaction (never save raw docNumber)
    const maskedDocNumber = docNumber ? maskDocumentNumber(docNumber) : undefined;

    // 2. Secret Answer Hash (never save plain-text answer)
    const secretAnswerHash = secretAnswer ? hashSecretAnswer(secretAnswer) : undefined;

    // 3. Multi-Image Processing: Zero-Trust Sharp Gaussian Blur & Private Raw Storage
    let publicBlurredUrl: string | undefined = undefined;
    let privateRawUrl: string | undefined = undefined;
    const imageUrls: string[] = [];

    for (let i = 0; i < rawImageFiles.length; i++) {
      const file = rawImageFiles[i];
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const imgCheck = validateImageBuffer(fileBuffer);
      if (!imgCheck.valid) {
        continue;
      }

      try {
        const { blurredBuffer, rawBuffer, publicStoragePath, privateStoragePath } =
          await processZeroTrustUpload(fileBuffer, `${itemId}_${i}`);

        let blurredItemUrl = "";
        let rawItemUrl = "";

        // Attempt upload to Firebase Cloud Storage
        try {
          const bucket = adminStorage.bucket();
          const publicFile = bucket.file(publicStoragePath);
          await publicFile.save(blurredBuffer, {
            contentType: "image/webp",
            metadata: { cacheControl: "public, max-age=31536000" },
          });
          blurredItemUrl = `https://storage.googleapis.com/${bucket.name}/${publicStoragePath}`;

          const privateFile = bucket.file(privateStoragePath);
          await privateFile.save(rawBuffer, {
            contentType: "image/webp",
            metadata: { cacheControl: "private, max-age=0" },
          });
          rawItemUrl = `https://storage.googleapis.com/${bucket.name}/${privateStoragePath}`;
        } catch (storageErr) {
          console.warn("[Firebase Storage Note] Local fallback preview applied:", (storageErr as Error).message);
          blurredItemUrl = `data:image/webp;base64,${blurredBuffer.toString("base64")}`;
          rawItemUrl = `data:image/webp;base64,${rawBuffer.toString("base64")}`;
        }

        if (i === 0) {
          publicBlurredUrl = blurredItemUrl;
          privateRawUrl = rawItemUrl;
        }
        imageUrls.push(blurredItemUrl);
      } catch (sharpErr) {
        console.error("[Sharp Processing Error]:", sharpErr);
      }
    }

    // 4. Generate Tokenized Search Keywords for Firestore array queries
    const searchKeywords = generateSearchKeywords(
      title,
      category,
      district,
      sector,
      maskedDocNumber,
      description
    );

    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30-day lifecycle

    // Enforce strict role separation: Finders cannot set fees or rewards
    const finalFeeOrReward = type === "FOUND" ? 0 : Math.max(0, Number(feeOrReward) || 0);
    const finalRewardAmount = type === "FOUND" ? 0 : finalFeeOrReward;
    const finalEscrowStatus = finalRewardAmount > 0 ? "LOCKED" : "NONE";

    const newItem: Item = {
      id: itemId,
      type,
      category,
      title,
      description,
      publicBlurredUrl,
      privateRawUrl,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      district,
      sector,
      meetingPoint,
      feeOrReward: finalFeeOrReward,
      rewardAmount: finalRewardAmount,
      escrowStatus: finalEscrowStatus,
      maskedDocNumber,
      searchKeywords,
      status: "ACTIVE",
      createdAt: now,
      expiresAt,
      // @ts-expect-error Internal phone for private SMS notifications
      contactPhone: contactPhone || undefined,
    };

    // 5. Persist to Firestore & Local Resilience Cache
    await persistItem(newItem, {
      secretPrompt: secretPrompt || undefined,
      secretAnswerHash: secretAnswerHash || undefined,
      visualPassed: false,
      isVerified: false,
    });

    // 6. Trigger Background Auto-Matching Engine
    try {
      await runAutoMatch(newItem);
    } catch (matchErr) {
      console.warn("[Auto-Match Error]:", (matchErr as Error).message);
    }

    return NextResponse.json({
      success: true,
      message: `${type === "FOUND" ? "Found item reported" : "Lost bounty posted"} successfully.`,
      item: sanitizePublicItem(newItem),
    });
  } catch (error) {
    console.error("[API Items POST Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process item submission" },
      { status: 500 }
    );
  }
}

