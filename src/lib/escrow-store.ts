import fs from "fs";
import path from "path";
import { EscrowTransaction, EscrowStatus, HandoverSession, HandoverStatus } from "@/types/database";
import { adminDb } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";

const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_ESCROW_FILE = path.join(LOCAL_DATA_DIR, "escrow_transactions.json");
const LOCAL_HANDOVER_FILE = path.join(LOCAL_DATA_DIR, "handover_sessions.json");

export interface ExtendedHandoverSession extends HandoverSession {
  fallbackCode: string; // 6-digit numeric backup
  finderPhone?: string;
  claimerPhone?: string;
}

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
}

function readLocalEscrows(): EscrowTransaction[] {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_ESCROW_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_ESCROW_FILE, "utf-8")) as EscrowTransaction[];
  } catch {
    return [];
  }
}

function writeLocalEscrows(transactions: EscrowTransaction[]) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_ESCROW_FILE, JSON.stringify(transactions, null, 2), "utf-8");
}

function readLocalHandovers(): ExtendedHandoverSession[] {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_HANDOVER_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_HANDOVER_FILE, "utf-8")) as ExtendedHandoverSession[];
  } catch {
    return [];
  }
}

function writeLocalHandovers(sessions: ExtendedHandoverSession[]) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_HANDOVER_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

/**
 * Saves or updates an EscrowTransaction in Firestore & local cache
 */
export async function persistEscrowTransaction(tx: EscrowTransaction): Promise<void> {
  try {
    await withTimeout(adminDb.collection("escrowTransactions").doc(tx.id).set(tx), 500, null);
  } catch {
    // Firestore fallback
  }

  const list = readLocalEscrows().filter((item) => item.id !== tx.id);
  list.unshift(tx);
  writeLocalEscrows(list);
}

/**
 * Retrieves an EscrowTransaction by escrow ID
 */
export async function getEscrowById(escrowId: string): Promise<EscrowTransaction | null> {
  try {
    const doc = await withTimeout(adminDb.collection("escrowTransactions").doc(escrowId).get(), 500, null);
    if (doc && doc.exists) {
      return doc.data() as EscrowTransaction;
    }
  } catch {
    // Fallback
  }

  const found = readLocalEscrows().find((e) => e.id === escrowId);
  return found || null;
}

/**
 * Retrieves an EscrowTransaction by item ID
 */
export async function getEscrowByItemId(itemId: string): Promise<EscrowTransaction | null> {
  try {
    const snap = await withTimeout(
      adminDb.collection("escrowTransactions").where("itemId", "==", itemId).limit(1).get(),
      500,
      null
    );
    if (snap && !snap.empty) {
      return snap.docs[0].data() as EscrowTransaction;
    }
  } catch {
    // Fallback
  }

  const found = readLocalEscrows().find((e) => e.itemId === itemId);
  return found || null;
}

/**
 * Retrieves all escrow transactions for reporting & admin dashboard
 */
export async function getAllEscrowTransactions(): Promise<EscrowTransaction[]> {
  try {
    const snap = await withTimeout(
      adminDb.collection("escrowTransactions").orderBy("createdAt", "desc").get(),
      500,
      null
    );
    if (snap && !snap.empty) {
      return snap.docs.map((d) => d.data() as EscrowTransaction);
    }
  } catch {
    // Fallback
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

  try {
    await withTimeout(adminDb.collection("escrowTransactions").doc(escrowId).set(tx, { merge: true }), 500, null);
  } catch {
    // Fallback
  }

  writeLocalEscrows(all);
  return tx;
}

/**
 * Saves a HandoverSession in Firestore & local cache
 */
export async function persistHandoverSession(session: ExtendedHandoverSession): Promise<void> {
  try {
    await withTimeout(adminDb.collection("handoverSessions").doc(session.itemId).set(session), 500, null);
  } catch {
    // Fallback
  }

  const list = readLocalHandovers().filter((s) => s.itemId !== session.itemId);
  list.unshift(session);
  writeLocalHandovers(list);
}

/**
 * Retrieves a HandoverSession by itemId
 */
export async function getHandoverSessionByItemId(itemId: string): Promise<ExtendedHandoverSession | null> {
  try {
    const doc = await withTimeout(adminDb.collection("handoverSessions").doc(itemId).get(), 500, null);
    if (doc && doc.exists) {
      return doc.data() as ExtendedHandoverSession;
    }
  } catch {
    // Fallback
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

  try {
    let snap = await withTimeout(
      adminDb.collection("handoverSessions").where("qrToken", "==", cleanInput).limit(1).get(),
      400,
      null
    );
    if (snap && !snap.empty) {
      return snap.docs[0].data() as ExtendedHandoverSession;
    }

    snap = await withTimeout(
      adminDb.collection("handoverSessions").where("fallbackCode", "==", cleanInput).limit(1).get(),
      400,
      null
    );
    if (snap && !snap.empty) {
      return snap.docs[0].data() as ExtendedHandoverSession;
    }
  } catch {
    // Fallback
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

  try {
    await withTimeout(
      adminDb.collection("handoverSessions").doc(itemId).set({
        status,
        scannedAt: status === "COMPLETED" ? new Date().toISOString() : null,
      }, { merge: true }),
      500,
      null
    );
  } catch {
    // Fallback
  }

  writeLocalHandovers(all);
}
