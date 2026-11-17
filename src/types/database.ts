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

export type EscrowStatus = "LOCKED" | "RELEASED" | "REFUNDED" | "DISPUTED";

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
  district: string;          // e.g. "Gasabo", "Kicukiro", "Nyarugenge"
  sector: string;            // e.g. "Kimironko", "Remera"
  meetingPoint?: string;     // e.g. "Kimironko Police Post"
  scheduledDate?: FirestoreDate | null;
  feeOrReward: number;       // Reward offered or Finder delivery fee in RWF
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
  isVerified: boolean;       // True if EITHER Option A OR Option B passed
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

