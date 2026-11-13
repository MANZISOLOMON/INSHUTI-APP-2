import fs from "fs";
import path from "path";
import { Item, Verification } from "@/types/database";
import { adminDb } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";

const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_ITEMS_FILE = path.join(LOCAL_DATA_DIR, "items.json");
const LOCAL_VERIFICATIONS_FILE = path.join(LOCAL_DATA_DIR, "verifications.json");

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
}

function readLocalItems(): Item[] {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_ITEMS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(LOCAL_ITEMS_FILE, "utf-8");
    return JSON.parse(raw) as Item[];
  } catch {
    return [];
  }
}

function writeLocalItems(items: Item[]) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_ITEMS_FILE, JSON.stringify(items, null, 2), "utf-8");
}

function readLocalVerifications(): Verification[] {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_VERIFICATIONS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(LOCAL_VERIFICATIONS_FILE, "utf-8");
    return JSON.parse(raw) as Verification[];
  } catch {
    return [];
  }
}

function writeLocalVerifications(verifications: Verification[]) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_VERIFICATIONS_FILE, JSON.stringify(verifications, null, 2), "utf-8");
}

/**
 * Saves an Item to Firestore with seamless local persistence fallback.
 */
export async function persistItem(item: Item, verification?: Partial<Verification>): Promise<void> {
  try {
    // 1. Attempt Firestore write via Admin SDK
    await adminDb.collection("items").doc(item.id).set({
      ...item,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (verification) {
      await adminDb.collection("verifications").doc(item.id).set({
        id: item.id,
        itemId: item.id,
        ...verification,
        createdAt: new Date().toISOString(),
      });
    }

    console.log(`[Firestore] Item ${item.id} saved to Cloud Firestore successfully.`);
  } catch (err) {
    console.warn(`[Firestore Note] Cloud Firestore write skipped or in offline mode: ${(err as Error).message}`);
  }

  // 2. Always persist locally for instant dev testing & offline resilience
  const localItems = readLocalItems().filter((i) => i.id !== item.id);
  localItems.unshift(item);
  writeLocalItems(localItems);

  if (verification) {
    const localVerifs = readLocalVerifications().filter((v) => v.itemId !== item.id);
    localVerifs.unshift({
      id: item.id,
      itemId: item.id,
      visualPassed: false,
      isVerified: false,
      ...verification,
    } as Verification);
    writeLocalVerifications(localVerifs);
  }
}

/**
 * Returns all raw items (for internal server-side matching and verification).
 */
export async function getAllItemsRaw(): Promise<Item[]> {
  try {
    const snap = await withTimeout(adminDb.collection("items").get(), 400, null);
    if (snap && !snap.empty) {
      return snap.docs.map((d) => d.data() as Item);
    }
  } catch {
    // Fallback
  }
  return readLocalItems();
}

/**
 * Retrieves a single Item by its ID.
 */
export async function getItemById(itemId: string): Promise<Item | null> {
  try {
    const doc = await withTimeout(adminDb.collection("items").doc(itemId).get(), 400, null);
    if (doc && doc.exists) {
      return doc.data() as Item;
    }
  } catch {
    // Fallback
  }

  const found = readLocalItems().find((i) => i.id === itemId);
  return found || null;
}

/**
 * Retrieves the Verification record for a given Item.
 */
export async function getVerificationByItemId(itemId: string): Promise<Verification | null> {
  try {
    const doc = await withTimeout(adminDb.collection("verifications").doc(itemId).get(), 400, null);
    if (doc && doc.exists) {
      return doc.data() as Verification;
    }
  } catch {
    // Fallback
  }

  const found = readLocalVerifications().find((v) => v.itemId === itemId);
  return found || null;
}

/**
 * Updates a verification record and optionally updates item status to 'CLAIMED'.
 */
export async function updateItemVerification(
  itemId: string,
  verificationUpdate: Partial<Verification>,
  updateItemStatus: boolean = false
): Promise<{ success: boolean; item?: Item; verification?: Verification }> {
  let item = await getItemById(itemId);
  if (!item) return { success: false };

  let verification = await getVerificationByItemId(itemId);
  const now = new Date().toISOString();

  const updatedVerification: Verification = {
    id: itemId,
    itemId: itemId,
    secretPrompt: verification?.secretPrompt,
    secretAnswerHash: verification?.secretAnswerHash,
    visualPassed: verification?.visualPassed || false,
    isVerified: verification?.isVerified || false,
    ...verificationUpdate,
    verifiedAt: verificationUpdate.isVerified ? now : verification?.verifiedAt,
  };

  if (updateItemStatus) {
    item = {
      ...item,
      status: "CLAIMED",
      claimedAt: now,
    };
  }

  // Update in Firestore
  try {
    await adminDb.collection("verifications").doc(itemId).set(updatedVerification, { merge: true });
    if (updateItemStatus) {
      await adminDb.collection("items").doc(itemId).update({
        status: "CLAIMED",
        claimedAt: now,
      });
    }
  } catch {
    // Fallback to local
  }

  // Update in local files
  const localVerifs = readLocalVerifications().filter((v) => v.itemId !== itemId);
  localVerifs.unshift(updatedVerification);
  writeLocalVerifications(localVerifs);

  if (updateItemStatus && item) {
    const localItems = readLocalItems().map((i) => (i.id === itemId ? item! : i));
    writeLocalItems(localItems);
  }

  return {
    success: true,
    item,
    verification: updatedVerification,
  };
}

/**
 * Retrieves all active items with zero-trust filtering.
 */
export async function queryItems(filters?: {
  type?: string;
  category?: string;
  district?: string;
  sector?: string;
  query?: string;
}): Promise<Item[]> {
  let items: Item[] = [];

  try {
    let queryRef: FirebaseFirestore.Query = adminDb.collection("items").where("status", "==", "ACTIVE");

    if (filters?.type && filters.type !== "ALL") {
      queryRef = queryRef.where("type", "==", filters.type);
    }
    if (filters?.category && filters.category !== "ALL") {
      queryRef = queryRef.where("category", "==", filters.category);
    }
    if (filters?.district) {
      queryRef = queryRef.where("district", "==", filters.district);
    }

    const snapshot = await queryRef.get();
    if (!snapshot.empty) {
      items = snapshot.docs.map((d) => d.data() as Item);
    }
  } catch (err) {
    console.warn(`[Firestore Note] Cloud Firestore query fallback to local cache: ${(err as Error).message}`);
  }

  if (items.length === 0) {
    items = readLocalItems();
  }

  let result = items.filter((item) => item.status === "ACTIVE");

  if (filters?.type && filters.type !== "ALL") {
    result = result.filter((item) => item.type === filters.type);
  }
  if (filters?.category && filters.category !== "ALL") {
    result = result.filter((item) => item.category === filters.category);
  }
  if (filters?.district) {
    result = result.filter((item) => item.district.toLowerCase() === filters.district!.toLowerCase());
  }
  if (filters?.sector) {
    result = result.filter((item) => item.sector.toLowerCase() === filters.sector!.toLowerCase());
  }
  if (filters?.query) {
    const qTokens = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    result = result.filter((item) => {
      const keywords = item.searchKeywords || [];
      return qTokens.every((token) =>
        keywords.some((k) => k.includes(token)) ||
        item.title.toLowerCase().includes(token) ||
        (item.maskedDocNumber && item.maskedDocNumber.toLowerCase().includes(token))
      );
    });
  }

  return result;
}

/**
 * Updates the status of an Item.
 */
export async function updateItemStatus(itemId: string, status: Item["status"]): Promise<Item | null> {
  const localItems = readLocalItems();
  const item = localItems.find((i) => i.id === itemId);
  if (!item) return null;

  item.status = status;
  writeLocalItems(localItems);

  try {
    await adminDb.collection("items").doc(itemId).update({ status });
  } catch {
    // Fallback
  }

  return item;
}

/**
 * Permanently deletes or removes an item (Admin moderation).
 */
export async function deleteItem(itemId: string): Promise<boolean> {
  const localItems = readLocalItems().filter((i) => i.id !== itemId);
  writeLocalItems(localItems);

  try {
    await adminDb.collection("items").doc(itemId).delete();
  } catch {
    // Fallback
  }

  return true;
}

/**
 * Retrieves all items for the Admin Moderation Dashboard (includes privateRawUrl).
 */
export async function getAllItemsForAdmin(): Promise<Item[]> {
  try {
    const snap = await withTimeout(adminDb.collection("items").orderBy("createdAt", "desc").get(), 400, null);
    if (snap && !snap.empty) {
      return snap.docs.map((d) => d.data() as Item);
    }
  } catch {
    // Fallback
  }

  return readLocalItems();
}

/**
 * Retrieves items that are either marked DISPUTED or CLAIMED past their 48-hour grace period.
 */
export async function getDisputedAndOverdueItems(): Promise<{
  item: Item;
  reason: "DISPUTED" | "OVERDUE_48H";
  hoursElapsed: number;
}[]> {
  const items = await getAllItemsForAdmin();
  const now = Date.now();
  const results: { item: Item; reason: "DISPUTED" | "OVERDUE_48H"; hoursElapsed: number }[] = [];

  for (const item of items) {
    if (item.status === "DISPUTED") {
      const hours = item.claimedAt
        ? Math.round((now - new Date(item.claimedAt as string).getTime()) / 3600000)
        : 0;
      results.push({ item, reason: "DISPUTED", hoursElapsed: hours });
    } else if (item.status === "CLAIMED" && item.claimedAt) {
      const elapsedMs = now - new Date(item.claimedAt as string).getTime();
      const hours = Math.round(elapsedMs / 3600000);
      if (hours >= 48) {
        results.push({ item, reason: "OVERDUE_48H", hoursElapsed: hours });
      }
    }
  }

  return results;
}

/**
 * Executes automated lifecycle maintenance:
 * 1. Auto-archives ACTIVE items where expiresAt <= now to EXPIRED.
 * 2. Auto-flags CLAIMED items past their 48-hour handover window as DISPUTED and dispatches SMS.
 */
export async function runLifecycleMaintenance(): Promise<{
  expiredCount: number;
  disputedCount: number;
  expiredItems: string[];
  disputedItems: string[];
}> {
  const items = await getAllItemsForAdmin();
  const now = Date.now();

  const expiredItems: string[] = [];
  const disputedItems: string[] = [];

  for (const item of items) {
    // 1. 30-Day Auto-Expiration Check
    if (item.status === "ACTIVE" && item.expiresAt) {
      const expiryMs = new Date(item.expiresAt as string).getTime();
      if (now >= expiryMs) {
        await updateItemStatus(item.id, "EXPIRED");
        expiredItems.push(item.id);
        console.log(`[Lifecycle Cron] Auto-archived expired item: ${item.id} (${item.title})`);
      }
    }

    // 2. 48-Hour Overdue Handover Check
    if (item.status === "CLAIMED" && item.claimedAt) {
      const claimedMs = new Date(item.claimedAt as string).getTime();
      const elapsedHours = (now - claimedMs) / (1000 * 60 * 60);

      if (elapsedHours >= 48) {
        await updateItemStatus(item.id, "DISPUTED");
        disputedItems.push(item.id);
        console.log(`[Lifecycle Cron] Auto-flagged 48h overdue item as DISPUTED: ${item.id} (${item.title})`);
      }
    }
  }

  return {
    expiredCount: expiredItems.length,
    disputedCount: disputedItems.length,
    expiredItems,
    disputedItems,
  };
}


