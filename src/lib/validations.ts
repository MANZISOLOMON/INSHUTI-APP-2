import { z } from "zod";

/**
 * Zod validation schema for creating Found or Lost items
 */
export const ItemCreateSchema = z.object({
  type: z.enum(["FOUND", "LOST"] as const),
  category: z.enum([
    "NATIONAL_ID",
    "DRIVING_LICENSE",
    "PASSPORT",
    "WALLET",
    "KEYS",
    "OTHER",
  ] as const),
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title cannot exceed 120 characters"),
  description: z.string().trim().max(1000).optional().default(""),
  district: z.string().trim().min(2, "District is required"),
  sector: z.string().trim().min(2, "Sector is required"),
  meetingPoint: z.string().trim().max(200).optional().default(""),
  feeOrReward: z.coerce
    .number()
    .min(0, "Fee or reward cannot be negative")
    .max(500000, "Maximum fee or reward limit is 500,000 RWF")
    .default(0),
  docNumber: z.string().trim().max(50).optional().default(""),
  contactPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, "Phone number must be a valid international format (e.g. +250788123456)")
    .optional()
    .or(z.literal("")),
  secretPrompt: z.string().trim().max(200).optional().default(""),
  secretAnswer: z.string().trim().max(200).optional().default(""),
});

/**
 * Zod validation schema for Mandatory Manual Verification
 */
export const VerifyClaimSchema = z.object({
  itemId: z.string().trim().min(1, "Item ID is required"),
  option: z.enum(["CHALLENGE", "VISUAL", "MANUAL_PROOF", "APPROVE", "REJECT"] as const),
  answer: z.string().trim().max(500).optional(),
  visualNote: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(1000).optional(),
  fullName: z.string().trim().max(100).optional(),
  dateOfBirth: z.string().trim().max(50).optional(),
  serialEnding: z.string().trim().max(50).optional(),
  markings: z.string().trim().max(500).optional(),
  challengeAnswer: z.string().trim().max(500).optional(),
});

/**
 * Zod validation schema for MoMo Escrow Lock API
 */
export const EscrowLockSchema = z.object({
  itemId: z.string().trim().min(1, "Item ID is required"),
  payerPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{9,15}$/, "Payer phone must be a valid E.164 phone number (e.g. +250788123456)"),
  amount: z
    .number()
    .min(500, "Minimum escrow amount is 500 RWF")
    .max(500000, "Maximum escrow amount is 500,000 RWF")
    .optional(),
});

/**
 * Zod validation schema for In-Person QR Check-In Release API
 */
export const EscrowReleaseSchema = z.object({
  itemId: z.string().trim().min(1, "Item ID is required"),
  tokenOrCode: z
    .string()
    .trim()
    .min(6, "Token or 6-digit code is required")
    .max(128, "Invalid token length"),
});

/**
 * Zod validation schema for Admin Escrow Override API
 */
export const AdminEscrowOverrideSchema = z.object({
  action: z.enum(["RELEASE_TO_FINDER", "REFUND_TO_PAYER"] as const),
  itemId: z.string().trim().optional(),
  escrowId: z.string().trim().optional(),
  adminNote: z.string().trim().max(500).optional(),
}).refine((data) => data.itemId || data.escrowId, {
  message: "Either itemId or escrowId must be provided",
});

/**
 * Zod validation schema for Admin Item Status Patch
 */
export const AdminItemPatchSchema = z.object({
  itemId: z.string().trim().min(1, "Item ID is required"),
  status: z.enum(["ACTIVE", "CLAIMED", "EXPIRED", "RESOLVED", "DISPUTED"] as const),
});
