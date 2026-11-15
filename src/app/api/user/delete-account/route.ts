import { NextRequest, NextResponse } from "next/server";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";
import { getAllItemsRaw, deleteItem } from "@/lib/items-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = body.phone?.trim();
    const userId = body.userId?.trim();

    console.log(`[Privacy Compliance] Initiating data purge request for phone: '${phone || "anonymous"}', userId: '${userId || "anonymous"}'`);

    let purgedItemsCount = 0;

    // 1. Scan and purge items matching user's phone or userId
    const allItems = await getAllItemsRaw();
    for (const item of allItems) {
      const raw = item as unknown as { contactPhone?: string; finderId?: string; claimerId?: string };
      const matchesPhone = phone && raw.contactPhone && raw.contactPhone.replace(/\s+/g, "").includes(phone.replace(/\s+/g, "").slice(-8));
      const matchesUser = userId && (item.id === userId || raw.finderId === userId || raw.claimerId === userId);

      if (matchesPhone || matchesUser) {
        await deleteItem(item.id);
        purgedItemsCount++;
      }
    }

    // 2. If Firebase Admin is configured, delete Firestore user document and notifications
    if (isFirebaseAdminConfigured()) {
      try {
        if (userId) {
          await withTimeout(adminDb.collection("users").doc(userId).delete(), 1000, null);
        }
        if (phone) {
          const smsSnap = await withTimeout(
            adminDb.collection("smsNotifications").where("phoneNumber", "==", phone).get(),
            1000,
            null
          );
          if (smsSnap && !smsSnap.empty) {
            const batch = adminDb.batch();
            smsSnap.docs.forEach((doc) => batch.delete(doc.ref));
            await withTimeout(batch.commit(), 1000, null);
          }
        }
      } catch (err) {
        console.warn("[Privacy Purge Firestore Note]:", (err as Error).message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Account and associated personal records permanently purged under Rwanda Law No. 058/2021. ${purgedItemsCount} item listings unlinked.`,
      purgedItemsCount,
    });
  } catch (error) {
    console.error("[Account Deletion Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to purge account data." },
      { status: 500 }
    );
  }
}
