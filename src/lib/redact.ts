import sharp from "sharp";
export { maskDocumentNumber } from "./masking";

/**
 * Applies a zero-trust Gaussian blur filter to an image buffer using Sharp.
 * Strips EXIF/metadata and compresses to optimized WebP to ensure privacy and low bandwidth.
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
    .webp({ quality: 75 })
    .toBuffer();
}

/**
 * Prepares raw image for protected storage (strips metadata, normalizes format to WebP).
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
 * Processes an uploaded document photo into dual-tier zero-trust assets:
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
