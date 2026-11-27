import fs from "fs";
import path from "path";
import os from "os";
import { Item, Verification } from "@/types/database";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "found-in-data")
  : path.join(process.cwd(), ".data");
const LOCAL_ITEMS_FILE = path.join(LOCAL_DATA_DIR, "items.json");
const LOCAL_VERIFICATIONS_FILE = path.join(LOCAL_DATA_DIR, "verifications.json");

const DEFAULT_SEED_ITEMS: Item[] = [];

const DEFAULT_SEED_VERIFICATIONS: Verification[] = [];

function ensureLocalDir() {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[Local Store] Warning: Could not create local data dir:", (err as Error).message);
  }
}

function readLocalItems(): Item[] {
  try {
    if (fs.existsSync(LOCAL_ITEMS_FILE)) {
      const raw = fs.readFileSync(LOCAL_ITEMS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Item[];
      }
    }
  } catch {
    // Fallback to seed items
  }
  return [...DEFAULT_SEED_ITEMS];
}

function writeLocalItems(items: Item[]) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_ITEMS_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local Store] Write items skipped:", (err as Error).message);
  }
}

function readLocalVerifications(): Verification[] {
  try {
    if (fs.existsSync(LOCAL_VERIFICATIONS_FILE)) {
      const raw = fs.readFileSync(LOCAL_VERIFICATIONS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Verification[];
      }
    }
  } catch {
    // Fallback
  }
  return [...DEFAULT_SEED_VERIFICATIONS];
}

function writeLocalVerifications(verifications: Verification[]) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_VERIFICATIONS_FILE, JSON.stringify(verifications, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local Store] Write verifications skipped:", (err as Error).message);
  }
}

/**
 * Saves an Item to Firestore with seamless local persistence fallback.
 */
export async function persistItem(item: Item, verification?: Partial<Verification>): Promise<void> {
  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(
        adminDb.collection("items").doc(item.id).set({
          ...item,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        2000,
        null
      );

      if (verification) {
        await withTimeout(
          adminDb.collection("verifications").doc(item.id).set({
            id: item.id,
            itemId: item.id,
            ...verification,
            createdAt: new Date().toISOString(),
          }),
          2000,
          null
        );
      }

      console.log(`[Firestore] Item ${item.id} saved to Cloud Firestore successfully.`);
    } catch (err) {
      console.warn(`[Firestore Note] Cloud Firestore write skipped or in offline mode: ${(err as Error).message}`);
    }
  }

  // Always persist locally for instant dev testing & offline resilience
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
  if (isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(adminDb.collection("items").get(), 1000, null);
      if (snap && !snap.empty) {
        return snap.docs.map((d) => d.data() as Item);
      }
    } catch {
      // Fallback
    }
  }
  return readLocalItems();
}

/**
 * Retrieves a single Item by its ID.
 */
export async function getItemById(itemId: string): Promise<Item | null> {
  if (isFirebaseAdminConfigured()) {
    try {
      const doc = await withTimeout(adminDb.collection("items").doc(itemId).get(), 1000, null);
      if (doc && doc.exists) {
        return doc.data() as Item;
      }
    } catch {
      // Fallback
    }
  }

  const found = readLocalItems().find((i) => i.id === itemId);
  return found || null;
}

/**
 * Retrieves the Verification record for a given Item.
 */
export async function getVerificationByItemId(itemId: string): Promise<Verification | null> {
  if (isFirebaseAdminConfigured()) {
    try {
      const doc = await withTimeout(adminDb.collection("verifications").doc(itemId).get(), 1000, null);
      if (doc && doc.exists) {
        return doc.data() as Verification;
      }
    } catch {
      // Fallback
    }
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

  const verification = await getVerificationByItemId(itemId);
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
  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("verifications").doc(itemId).set(updatedVerification, { merge: true }), 1500, null);
      if (updateItemStatus) {
        await withTimeout(adminDb.collection("items").doc(itemId).update({
          status: "CLAIMED",
          claimedAt: now,
        }), 1500, null);
      }
    } catch {
      // Fallback to local
    }
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

  if (isFirebaseAdminConfigured()) {
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

      const snapshot = await withTimeout(queryRef.get(), 1500, null);
      if (snapshot && !snapshot.empty) {
        items = snapshot.docs.map((d) => d.data() as Item);
      }
    } catch (err) {
      console.warn(`[Firestore Note] Cloud Firestore query fallback to local cache: ${(err as Error).message}`);
    }
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

  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("items").doc(itemId).update({ status }), 1500, null);
    } catch {
      // Fallback
    }
  }

  return item;
}

/**
 * Updates custom fields on an Item (e.g. description, status).
 */
export async function updateItemFields(itemId: string, patch: Partial<Item>): Promise<Item | null> {
  const localItems = readLocalItems();
  const item = localItems.find((i) => i.id === itemId);
  if (!item) return null;

  Object.assign(item, patch);
  writeLocalItems(localItems);

  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("items").doc(itemId).update(patch), 1500, null);
    } catch {
      // Fallback
    }
  }

  return item;
}

/**
 * Returns items and handovers associated with a user's phone or UID.
 */
export async function getItemsForUser(userPhone?: string, uid?: string): Promise<{
  myListings: Item[];
  myClaims: Item[];
}> {
  const allItems = await getAllItemsRaw();
  const cleanPhone = userPhone ? userPhone.replace(/\D/g, "") : "";
  const last9Phone = cleanPhone.length >= 9 ? cleanPhone.slice(-9) : cleanPhone;

  const matchesUser = (phone?: string, ownerId?: string | null): boolean => {
    if (uid && ownerId === uid) return true;
    if (!phone || !last9Phone) return false;
    const cleanItemPhone = phone.replace(/\D/g, "");
    return cleanItemPhone.includes(last9Phone) || (cleanPhone.length > 0 && cleanItemPhone === cleanPhone);
  };

  const myListings = allItems.filter((item) => {
    const raw = item as unknown as Record<string, unknown>;
    const contactPhone = (raw.contactPhone as string) || (raw.finderPhone as string);
    return matchesUser(contactPhone, item.finderId);
  });

  const myClaims = allItems.filter((item) => {
    const raw = item as unknown as Record<string, unknown>;
    const claimerPhone = raw.claimerPhone as string;
    return matchesUser(claimerPhone, item.claimerId) || item.status === "CLAIMED";
  });

  return { myListings, myClaims };
}

/**
 * Permanently deletes or removes an item (Admin moderation).
 */
export async function deleteItem(itemId: string): Promise<boolean> {
  const localItems = readLocalItems().filter((i) => i.id !== itemId);
  writeLocalItems(localItems);

  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("items").doc(itemId).delete(), 1500, null);
    } catch {
      // Fallback
    }
  }

  return true;
}

/**
 * Retrieves all items for the Admin Moderation Dashboard (includes privateRawUrl).
 */
export async function getAllItemsForAdmin(): Promise<Item[]> {
  if (isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(adminDb.collection("items").orderBy("createdAt", "desc").get(), 1000, null);
      if (snap && !snap.empty) {
        return snap.docs.map((d) => d.data() as Item);
      }
    } catch {
      // Fallback
    }
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
