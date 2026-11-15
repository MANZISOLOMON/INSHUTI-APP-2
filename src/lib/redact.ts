import sharp from "sharp";
import { adminStorage, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";

export { maskDocumentNumber } from "./masking";

/**
 * Validates file magic bytes, MIME format, and enforces a strict 5MB upload size limit.
 */
export function validateImageBuffer(buffer: Buffer): {
  valid: boolean;
  format?: "jpeg" | "png" | "webp";
  error?: string;
} {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "Image file buffer is empty." };
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
  if (buffer.length > MAX_SIZE) {
    return { valid: false, error: "File exceeds the 5MB upload size limit." };
  }

  // JPEG / JPG magic bytes: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, format: "jpeg" };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { valid: true, format: "png" };
  }

  // WebP magic bytes: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.slice(0, 4).toString() === "RIFF" &&
    buffer.slice(8, 12).toString() === "WEBP"
  ) {
    return { valid: true, format: "webp" };
  }

  return {
    valid: false,
    error: "Disallowed file type. Only JPEG, PNG, and WebP images are permitted.",
  };
}

/**
 * Applies a zero-trust Gaussian blur filter to an image buffer using Sharp.
 * Strips EXIF, GPS, camera metadata and compresses to optimized WebP.
 *
 * @param imageBuffer Raw image buffer from user upload
 * @param blurSigma Gaussian blur intensity (Default: 28 for irreversible zero-trust redaction)
 * @returns Blurred WebP image buffer
 */
export async function applyGaussianBlur(
  imageBuffer: Buffer,
  blurSigma: number = 28
): Promise<Buffer> {
  return await sharp(imageBuffer)
    .rotate() // Automatically orient based on EXIF before stripping
    .resize(1000, 1000, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .blur(blurSigma)
    // Sharp strips all EXIF, GPS, IPTC, and camera metadata by default when withMetadata() is omitted
    .webp({ quality: 75 })
    .toBuffer();
}

/**
 * Prepares raw image for protected storage (strips all metadata, normalizes format to WebP).
 *
 * @param imageBuffer Raw uploaded image buffer
 * @returns Clean normalized WebP buffer
 */
export async function sanitizeRawImage(imageBuffer: Buffer): Promise<Buffer> {
  return await sharp(imageBuffer)
    .rotate()
    .resize(1800, 1800, {
      fit: "inside",
      withoutEnlargement: true,
    })
    // Sharp strips all EXIF, GPS, IPTC, and camera metadata by default when withMetadata() is omitted
    .webp({ quality: 85 })
    .toBuffer();
}

export interface ZeroTrustUploadResult {
  blurredBuffer: Buffer;
  rawBuffer: Buffer;
  publicStoragePath: string;
  privateStoragePath: string;
}

/**
 * Validates, strips metadata, and processes an uploaded document photo into dual-tier zero-trust assets:
 * 1. Public Blurred Image for preview in catalog
 * 2. Private Raw Sanitized Image for verified claimer / admin unlock
 *
 * @param imageBuffer Original file buffer from upload
 * @param itemId Firestore document ID of the item
 */
export async function processZeroTrustUpload(
  imageBuffer: Buffer,
  itemId: string
): Promise<ZeroTrustUploadResult> {
  // Enforce magic bytes & size validation
  const validation = validateImageBuffer(imageBuffer);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image upload.");
  }

  const [blurredBuffer, rawBuffer] = await Promise.all([
    applyGaussianBlur(imageBuffer, 28),
    sanitizeRawImage(imageBuffer),
  ]);

  return {
    blurredBuffer,
    rawBuffer,
    publicStoragePath: `items-public-blurred/${itemId}/preview.webp`,
    privateStoragePath: `items-private-raw/${itemId}/raw.webp`,
  };
}

/**
 * Generates a short-lived (15-minute) signed URL to inspect private raw original photos.
 * Strictly gated behind Dual Verification or Admin access.
 */
export async function generateSignedRawUrl(
  itemId: string,
  expirationMinutes: number = 15
): Promise<string> {
  const filePath = `items-private-raw/${itemId}/raw.webp`;

  if (isFirebaseAdminConfigured()) {
    try {
      const bucket = adminStorage.bucket();
      const file = bucket.file(filePath);
      const [signedUrl] = await withTimeout(
        file.getSignedUrl({
          action: "read",
          expires: Date.now() + expirationMinutes * 60 * 1000,
        }),
        2000,
        [""]
      );
      if (signedUrl) {
        return signedUrl;
      }
    } catch (err) {
      console.warn("[Signed URL] Could not generate Google Cloud Storage signed URL:", (err as Error).message);
    }
  }

  // Safe fallback placeholder
  return `/api/items-raw/${encodeURIComponent(itemId)}?expires=${Date.now() + expirationMinutes * 60 * 1000}`;
}
