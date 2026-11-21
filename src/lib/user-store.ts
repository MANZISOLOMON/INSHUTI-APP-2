import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { User, Role } from "@/types/database";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "lost-it-found-it-data")
  : path.join(process.cwd(), ".data");
const LOCAL_USERS_FILE = path.join(LOCAL_DATA_DIR, "users.json");

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
  payoutMomoNumber?: string;
  payoutTelecom?: "MTN" | "AIRTEL";
  smsAlertsEnabled?: boolean;
}

export interface PendingRegistration {
  phone: string;
  passwordHash: string;
  salt: string;
  otp: string;
  expiresAt: number; // Unix timestamp ms
  createdAt: number;
}

export interface PasswordResetRequest {
  phone: string;
  otp: string;
  expiresAt: number;
  lastRequestedAt: number;
  hourlyRequests: number[];
}

// In-memory caches for OTPs and rate limits (persists across warm serverless invocations)
const pendingRegistrationsMap = new Map<string, PendingRegistration>();
const passwordResetMap = new Map<string, PasswordResetRequest>();

function ensureLocalDir() {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[Local User Store] Directory creation skipped:", (err as Error).message);
  }
}

function readLocalUsers(): StoredUser[] {
  try {
    if (fs.existsSync(LOCAL_USERS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOCAL_USERS_FILE, "utf-8"));
      if (Array.isArray(parsed)) {
        return parsed as StoredUser[];
      }
    }
  } catch {
    // Fallback
  }
  return [];
}

function writeLocalUsers(users: StoredUser[]) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local User Store] Write users skipped:", (err as Error).message);
  }
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function generateNumericOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Finds user by normalized Rwandan phone number
 */
export async function findUserByPhone(phone: string): Promise<StoredUser | null> {
  const normalized = phone.trim().replace(/\s+/g, "");

  // 1. Try Firestore if configured
  if (isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(
        adminDb.collection("users").where("phone", "==", normalized).limit(1).get(),
        2500,
        null as any
      );
      if (snap && !snap.empty) {
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() } as StoredUser;
      }
    } catch {
      // Fall through to local cache
    }
  }

  // 2. Fall back to local store
  const localUsers = readLocalUsers();
  return localUsers.find((u) => u.phone.replace(/\s+/g, "") === normalized) || null;
}

/**
 * Finds user by ID
 */
export async function findUserById(id: string): Promise<StoredUser | null> {
  if (isFirebaseAdminConfigured()) {
    try {
      const doc = await withTimeout(
        adminDb.collection("users").doc(id).get(),
        2500,
        null as any
      );
      if (doc && doc.exists) {
        return { id: doc.id, ...doc.data() } as StoredUser;
      }
    } catch {
      // Fall through
    }
  }

  const localUsers = readLocalUsers();
  return localUsers.find((u) => u.id === id) || null;
}

/**
 * Creates or updates user record
 */
export async function saveUser(user: StoredUser): Promise<StoredUser> {
  // Save to Firestore
  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(
        adminDb.collection("users").doc(user.id).set(user, { merge: true }),
        2500,
        null as any
      );
    } catch {
      // Fallback
    }
  }

  // Save to local cache
  const localUsers = readLocalUsers();
  const index = localUsers.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    localUsers[index] = user;
  } else {
    localUsers.push(user);
  }
  writeLocalUsers(localUsers);

  return user;
}

/**
 * Pending Registration Management
 */
export function setPendingRegistration(phone: string, password: string, otp: string) {
  const normalized = phone.trim().replace(/\s+/g, "");
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const now = Date.now();

  pendingRegistrationsMap.set(normalized, {
    phone: normalized,
    passwordHash,
    salt,
    otp,
    expiresAt: now + 10 * 60 * 1000, // 10 minutes
    createdAt: now,
  });
}

export function getPendingRegistration(phone: string): PendingRegistration | null {
  const normalized = phone.trim().replace(/\s+/g, "");
  const pending = pendingRegistrationsMap.get(normalized);
  if (!pending) return null;
  if (Date.now() > pending.expiresAt) {
    pendingRegistrationsMap.delete(normalized);
    return null;
  }
  return pending;
}

export function deletePendingRegistration(phone: string) {
  const normalized = phone.trim().replace(/\s+/g, "");
  pendingRegistrationsMap.delete(normalized);
}

/**
 * Password Reset Rate Limiting & OTP Management:
 * Enforces:
 * - 1 code per 60 seconds
 * - Max 3 codes per hour per phone
 */
export function checkAndCreatePasswordReset(
  phone: string,
  otp: string
): { allowed: boolean; waitSeconds?: number; error?: string } {
  const normalized = phone.trim().replace(/\s+/g, "");
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  const existing = passwordResetMap.get(normalized);

  if (existing) {
    // Check 60-second cooldown
    const secondsSinceLast = Math.floor((now - existing.lastRequestedAt) / 1000);
    if (secondsSinceLast < 60) {
      return {
        allowed: false,
        waitSeconds: 60 - secondsSinceLast,
        error: `Please wait ${60 - secondsSinceLast} seconds before requesting a new code.`,
      };
    }

    // Filter requests in the past hour
    const recentRequests = existing.hourlyRequests.filter((ts) => ts > oneHourAgo);
    if (recentRequests.length >= 3) {
      return {
        allowed: false,
        error: "Too many password reset requests. Maximum 3 attempts per hour. Please try again later.",
      };
    }

    recentRequests.push(now);
    passwordResetMap.set(normalized, {
      phone: normalized,
      otp,
      expiresAt: now + 10 * 60 * 1000,
      lastRequestedAt: now,
      hourlyRequests: recentRequests,
    });
    return { allowed: true };
  }

  // First request
  passwordResetMap.set(normalized, {
    phone: normalized,
    otp,
    expiresAt: now + 10 * 60 * 1000,
    lastRequestedAt: now,
    hourlyRequests: [now],
  });
  return { allowed: true };
}

export function getPasswordResetRecord(phone: string): PasswordResetRequest | null {
  const normalized = phone.trim().replace(/\s+/g, "");
  const record = passwordResetMap.get(normalized);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    return null;
  }
  return record;
}

export function clearPasswordReset(phone: string) {
  const normalized = phone.trim().replace(/\s+/g, "");
  const record = passwordResetMap.get(normalized);
  if (record) {
    record.otp = "";
  }
}
