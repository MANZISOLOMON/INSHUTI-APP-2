import fs from "fs";
import path from "path";
import os from "os";
import { EscrowTransaction, EscrowStatus, HandoverSession, HandoverStatus } from "@/types/database";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "lost-it-found-it-data")
  : path.join(process.cwd(), ".data");
const LOCAL_ESCROW_FILE = path.join(LOCAL_DATA_DIR, "escrow_transactions.json");
const LOCAL_HANDOVER_FILE = path.join(LOCAL_DATA_DIR, "handover_sessions.json");

export interface ExtendedHandoverSession extends HandoverSession {
  fallbackCode: string; // 6-digit numeric backup
  finderPhone?: string;
  claimerPhone?: string;
}

const DEFAULT_SEED_ESCROWS: EscrowTransaction[] = [
  {
    id: "escrow_item_1794556370102_39756495_1794657039043",
    itemId: "item_1794556370102_39756495",
    payerId: "verified_claimer",
    recipientId: null,
    amount: 2500,
    platformFee: 100,
    totalLocked: 2600,
    momoRef: "MOMO_COLL_1794657039035_FFA239",
    status: "LOCKED",
    createdAt: "2026-11-14T11:50:39.042Z"
  }
];

const DEFAULT_SEED_HANDOVERS: ExtendedHandoverSession[] = [
  {
    id: "handover_item_1794556370102_39756495",
    itemId: "item_1794556370102_39756495",
    qrToken: "qr_token_item_1794556370102_39756495_36f0e4bd828f0c96",
    fallbackCode: "353083",
    status: "PENDING",
    expiresAt: "2026-11-16T11:50:39.042Z",
    claimerPhone: "+250788123456"
  }
];

function ensureLocalDir() {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[Local Escrow Store] Directory creation skipped:", (err as Error).message);
  }
}

function readLocalEscrows(): EscrowTransaction[] {
  try {
    if (fs.existsSync(LOCAL_ESCROW_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOCAL_ESCROW_FILE, "utf-8"));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as EscrowTransaction[];
      }
    }
  } catch {
    // Fallback
  }
  return [...DEFAULT_SEED_ESCROWS];
}

function writeLocalEscrows(transactions: EscrowTransaction[]) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_ESCROW_FILE, JSON.stringify(transactions, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local Escrow Store] Write escrows skipped:", (err as Error).message);
  }
}

function readLocalHandovers(): ExtendedHandoverSession[] {
  try {
    if (fs.existsSync(LOCAL_HANDOVER_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOCAL_HANDOVER_FILE, "utf-8"));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as ExtendedHandoverSession[];
      }
    }
  } catch {
    // Fallback
  }
  return [...DEFAULT_SEED_HANDOVERS];
}

function writeLocalHandovers(sessions: ExtendedHandoverSession[]) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_HANDOVER_FILE, JSON.stringify(sessions, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local Escrow Store] Write handovers skipped:", (err as Error).message);
  }
}

/**
 * Saves or updates an EscrowTransaction in Firestore & local cache
 */
export async function persistEscrowTransaction(tx: EscrowTransaction): Promise<void> {
  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("escrowTransactions").doc(tx.id).set(tx), 1500, null);
    } catch {
      // Firestore fallback
    }
  }

  const list = readLocalEscrows().filter((item) => item.id !== tx.id);
  list.unshift(tx);
  writeLocalEscrows(list);
}

/**
 * Retrieves an EscrowTransaction by escrow ID
 */
export async function getEscrowById(escrowId: string): Promise<EscrowTransaction | null> {
  if (isFirebaseAdminConfigured()) {
    try {
      const doc = await withTimeout(adminDb.collection("escrowTransactions").doc(escrowId).get(), 1000, null);
      if (doc && doc.exists) {
        return doc.data() as EscrowTransaction;
      }
    } catch {
      // Fallback
    }
  }

  const found = readLocalEscrows().find((e) => e.id === escrowId);
  return found || null;
}

/**
 * Retrieves an EscrowTransaction by item ID
 */
export async function getEscrowByItemId(itemId: string): Promise<EscrowTransaction | null> {
  if (isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(
        adminDb.collection("escrowTransactions").where("itemId", "==", itemId).limit(1).get(),
        1000,
        null
      );
      if (snap && !snap.empty) {
        return snap.docs[0].data() as EscrowTransaction;
      }
    } catch {
      // Fallback
    }
  }

  const found = readLocalEscrows().find((e) => e.itemId === itemId);
  return found || null;
}

/**
 * Retrieves all escrow transactions for reporting & admin dashboard
 */
export async function getAllEscrowTransactions(): Promise<EscrowTransaction[]> {
  if (isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(
        adminDb.collection("escrowTransactions").orderBy("createdAt", "desc").get(),
        1000,
        null
      );
      if (snap && !snap.empty) {
        return snap.docs.map((d) => d.data() as EscrowTransaction);
      }
    } catch {
      // Fallback
    }
  }

  return readLocalEscrows();
}

/**
 * Updates status of an EscrowTransaction
 */
export async function updateEscrowStatus(
  escrowId: string,
  status: EscrowStatus
): Promise<EscrowTransaction | null> {
  const all = readLocalEscrows();
  const tx = all.find((e) => e.id === escrowId);
  if (!tx) return null;

  tx.status = status;
  if (status === "RELEASED") {
    tx.releasedAt = new Date().toISOString();
  }

  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("escrowTransactions").doc(escrowId).set(tx, { merge: true }), 1000, null);
    } catch {
      // Fallback
    }
  }

  writeLocalEscrows(all);
  return tx;
}

/**
 * Saves a HandoverSession in Firestore & local cache
 */
export async function persistHandoverSession(session: ExtendedHandoverSession): Promise<void> {
  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("handoverSessions").doc(session.itemId).set(session), 1000, null);
    } catch {
      // Fallback
    }
  }

  const list = readLocalHandovers().filter((s) => s.itemId !== session.itemId);
  list.unshift(session);
  writeLocalHandovers(list);
}

/**
 * Retrieves a HandoverSession by itemId
 */
export async function getHandoverSessionByItemId(itemId: string): Promise<ExtendedHandoverSession | null> {
  if (isFirebaseAdminConfigured()) {
    try {
      const doc = await withTimeout(adminDb.collection("handoverSessions").doc(itemId).get(), 1000, null);
      if (doc && doc.exists) {
        return doc.data() as ExtendedHandoverSession;
      }
    } catch {
      // Fallback
    }
  }

  const found = readLocalHandovers().find((s) => s.itemId === itemId);
  return found || null;
}

/**
 * Retrieves a HandoverSession by either qrToken or 6-digit fallbackCode
 */
export async function getHandoverSessionByTokenOrCode(
  tokenOrCode: string
): Promise<ExtendedHandoverSession | null> {
  const cleanInput = tokenOrCode.trim();

  if (isFirebaseAdminConfigured()) {
    try {
      let snap = await withTimeout(
        adminDb.collection("handoverSessions").where("qrToken", "==", cleanInput).limit(1).get(),
        1000,
        null
      );
      if (snap && !snap.empty) {
        return snap.docs[0].data() as ExtendedHandoverSession;
      }

      snap = await withTimeout(
        adminDb.collection("handoverSessions").where("fallbackCode", "==", cleanInput).limit(1).get(),
        1000,
        null
      );
      if (snap && !snap.empty) {
        return snap.docs[0].data() as ExtendedHandoverSession;
      }
    } catch {
      // Fallback
    }
  }

  const found = readLocalHandovers().find(
    (s) => s.qrToken === cleanInput || s.fallbackCode === cleanInput
  );
  return found || null;
}

/**
 * Updates HandoverSession status
 */
export async function updateHandoverStatus(
  itemId: string,
  status: HandoverStatus
): Promise<void> {
  const all = readLocalHandovers();
  const session = all.find((s) => s.itemId === itemId);
  if (session) {
    session.status = status;
    if (status === "COMPLETED") {
      session.scannedAt = new Date().toISOString();
    }
  }

  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(
        adminDb.collection("handoverSessions").doc(itemId).set({
          status,
          scannedAt: status === "COMPLETED" ? new Date().toISOString() : null,
        }, { merge: true }),
        1000,
        null
      );
    } catch {
      // Fallback
    }
  }

  writeLocalHandovers(all);
}

/**
 * Extends HandoverSession expiration by additional hours (e.g. +24 hours)
 */
export async function extendHandoverSession(
  itemId: string,
  additionalHours: number = 24
): Promise<{ success: boolean; newExpiresAt?: string; error?: string }> {
  const session = await getHandoverSessionByItemId(itemId);
  if (!session) {
    return { success: false, error: "Active handover session not found." };
  }

  const rawExpiresAt = session.expiresAt;
  const currentExpiry =
    typeof rawExpiresAt === "string"
      ? new Date(rawExpiresAt).getTime()
      : rawExpiresAt instanceof Date
      ? rawExpiresAt.getTime()
      : typeof (rawExpiresAt as { toDate?: () => Date })?.toDate === "function"
      ? (rawExpiresAt as { toDate: () => Date }).toDate().getTime()
      : Date.now();
  const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const newExpiresAt = new Date(baseTime + additionalHours * 60 * 60 * 1000).toISOString();

  session.expiresAt = newExpiresAt;
  session.timerExtended = true;
  session.extendedAt = new Date().toISOString();

  await persistHandoverSession(session);
  return { success: true, newExpiresAt };
}
