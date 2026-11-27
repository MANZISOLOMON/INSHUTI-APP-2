import { Timestamp } from "firebase/firestore";

export type Role = "USER" | "ADMIN";

export type ItemType = "FOUND" | "LOST";

export type Category = 
  | "NATIONAL_ID" 
  | "DRIVING_LICENSE" 
  | "PASSPORT" 
  | "WALLET" 
  | "KEYS" 
  | "OTHER";

export type ItemStatus = "ACTIVE" | "CLAIMED" | "EXPIRED" | "RESOLVED" | "DISPUTED";

export type HandoverStatus = "PENDING" | "COMPLETED" | "DISPUTED";

export type EscrowStatus = "LOCKED" | "RELEASED" | "REFUNDED" | "DISPUTED" | "NONE";

export type SmsType = 
  | "MATCH_ALERT" 
  | "ESCROW_LOCKED" 
  | "HANDOVER_REMINDER" 
  | "DISPUTE_ALERT";

export type SmsStatus = "QUEUED" | "SENT" | "FAILED";

export type FirestoreDate = Timestamp | Date | string;

/**
 * User document in the 'users' collection
 */
export interface User {
  id: string; // Firebase Auth UID
  phone: string; // E.164 phone number, e.g. +250788123456
  fullName: string;
  role: Role;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

/**
 * Item document in the 'items' collection
 */
export interface Item {
  id: string;
  type: ItemType;
  category: Category;
  title: string;
  description?: string;
  publicBlurredUrl?: string; // Zero-Trust public photo stored in /items-public-blurred/{itemId}
  privateRawUrl?: string;     // Raw protected photo stored in /items-private-raw/{itemId}
  imageUrls?: string[];       // Multi-photo uploads support (up to 3 photos)
  district: string;          // e.g. "Gasabo", "Kicukiro", "Nyarugenge"
  sector: string;            // e.g. "Kimironko", "Remera"
  meetingPoint?: string;     // e.g. "Kimironko Police Post"
  scheduledDate?: FirestoreDate | null;
  feeOrReward: number;       // Backwards-compatible fee or reward in RWF
  rewardAmount?: number;     // Normalized finder appreciation reward in RWF
  escrowStatus?: EscrowStatus; // Escrow lifecycle status or "NONE"
  maskedDocNumber?: string;  // e.g. "119988****521"
  searchKeywords: string[];  // Lowercased keywords for Firestore array-contains querying
  status: ItemStatus;
  createdAt: FirestoreDate;
  expiresAt: FirestoreDate;  // 30-day lifecycle expiration
  claimedAt?: FirestoreDate | null; // 48-hour handover timer start
  finderId?: string | null;  // UID of finder
  claimerId?: string | null; // UID of claimer / owner
}

/**
 * OTP Verification record stored in Firestore 'otp_verifications'
 */
export interface OtpVerification {
  id: string; // Document ID (normalized phone e.g. +250788123456)
  phone: string;
  hashedOtp: string; // SHA-256(otp + salt)
  salt: string;
  attempts: number; // Max 5 verification attempts
  expiresAt: number; // Unix timestamp ms (5-minute expiry)
  createdAt: number;
  lastSentAt: number;
  purpose: "REGISTRATION" | "PASSWORD_RESET" | "PHONE_VERIFY";
  fullName?: string;
  verified?: boolean;
}

export interface ProofDetails {
  fullName?: string;
  dateOfBirth?: string;
  serialEnding?: string;
  markings?: string;
  challengeAnswer?: string;
  submittedAt?: string;
}

/**
 * Verification document in the 'verifications' collection (1:1 with item)
 */
export interface Verification {
  id: string;
  itemId: string;
  secretPrompt?: string;     // Dual Verification Option A: Challenge question
  secretAnswerHash?: string; // Hashed answer
  failedAttempts?: number;   // Brute-force counter for Option A (locked after 3)
  isLocked?: boolean;        // Locked if failedAttempts >= 3
  visualPassed: boolean;     // Dual Verification Option B: Photo comparison pass
  visualProofText?: string;  // Written proof submitted by claimer (Option B)
  visualReviewPending?: boolean; // True while waiting for finder review
  proofDetails?: ProofDetails; // Mandatory submitted proof details
  isVerified: boolean;       // True ONLY when finder explicitly approves
  verifiedAt?: FirestoreDate | null;
  verifiedBy?: string | null; // Claimer UID
}

/**
 * HandoverSession document in the 'handoverSessions' collection
 */
export interface HandoverSession {
  id: string;
  itemId: string;
  qrToken: string;           // Cryptographically dynamic one-time token for physical check-in
  status: HandoverStatus;
  timerExtended?: boolean;   // True if 24-hour extension was granted
  extendedAt?: FirestoreDate | null; // Timestamp of extension
  scannedAt?: FirestoreDate | null;
  expiresAt: FirestoreDate;
}

/**
 * EscrowTransaction document in the 'escrowTransactions' collection
 */
export interface EscrowTransaction {
  id: string;
  itemId: string;
  payerId: string;           // Claimer UID locking funds
  recipientId?: string | null; // Finder UID who receives payout
  amount: number;            // Principal amount (reward or delivery fee)
  platformFee: number;       // Flat platform micro-fee (e.g. 100 RWF)
  totalLocked: number;       // amount + platformFee
  momoRef: string;           // MTN MoMo / Airtel Money transaction reference
  status: EscrowStatus;
  createdAt: FirestoreDate;
  releasedAt?: FirestoreDate | null;
}

/**
 * SmsNotification document in the 'smsNotifications' collection
 */
export interface SmsNotification {
  id: string;
  userId: string;
  phoneNumber: string;
  message: string;
  type: SmsType;
  status: SmsStatus;
  sentAt: FirestoreDate;
}

/**
 * Helper to generate normalized search keywords for Firestore array-contains queries
 */
export function generateSearchKeywords(
  title: string,
  category: string,
  district: string,
  sector: string,
  maskedDocNumber?: string,
  description?: string
): string[] {
  const rawText = `${title} ${category} ${district} ${sector} ${maskedDocNumber || ""} ${description || ""}`;
  const tokens = rawText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);

  return Array.from(new Set(tokens));
}

