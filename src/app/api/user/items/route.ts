import { NextRequest, NextResponse } from "next/server";
import { 
  getAllItemsRaw, 
  getItemsForUser, 
  updateItemFields, 
  deleteItem, 
  getVerificationByItemId 
} from "@/lib/items-store";
import { getAllEscrowTransactions, getHandoverSessionByItemId } from "@/lib/escrow-store";
import { applyRateLimit } from "@/lib/rate-limiter";
import { sanitizeClientPayload } from "@/lib/auth-middleware";

/**
 * GET /api/user/items
 * Fetches user's active listings, incoming claims, handover sessions, and escrow wallet details.
 */
export async function GET(req: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(req, "user_items_get", 60, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || undefined;
    const uid = searchParams.get("uid") || undefined;

    const allItems = await getAllItemsRaw();
    const allEscrows = await getAllEscrowTransactions();

    // Query user listings & claims
    const { myListings, myClaims } = await getItemsForUser(phone, uid);

    // If user is new and has no listings, return existing active items as preview or empty array
    const userListings = myListings.length > 0 ? myListings : allItems.slice(0, 3);

    // Enrich claims and handovers with verification details and active sessions
    const enrichedHandovers = await Promise.all(
      allItems
        .filter((item) => item.status === "CLAIMED" || myClaims.some((c) => c.id === item.id))
        .map(async (item) => {
          const verification = await getVerificationByItemId(item.id);
          const handoverSession = await getHandoverSessionByItemId(item.id);
          const escrow = allEscrows.find((e) => e.itemId === item.id);

          return {
            item,
            verification,
            handoverSession,
            escrow,
          };
        })
    );

    // Calculate escrow wallet stats
    const lockedBalance = allEscrows
      .filter((e) => e.status === "LOCKED")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const releasedBalance = allEscrows
      .filter((e) => e.status === "RELEASED")
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    return NextResponse.json({
      success: true,
      listings: userListings,
      handovers: enrichedHandovers,
      escrows: allEscrows,
      wallet: {
        lockedBalance,
        releasedBalance,
        totalTransactions: allEscrows.length,
      },
    });
  } catch (error) {
    console.error("[User Items API] Failed to fetch user dashboard data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/items
 * Quick actions: Mark as Resolved or Edit Description
 */
export async function PATCH(req: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(req, "user_items_patch", 20, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const rawBody = await req.json();
    const body = sanitizeClientPayload(rawBody);

    const itemId = body.itemId as string;
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing itemId" },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {};
    if (body.description !== undefined && typeof body.description === "string") {
      patch.description = body.description.trim();
    }
    if (body.status !== undefined && ["ACTIVE", "RESOLVED", "CLAIMED", "EXPIRED"].includes(body.status as string)) {
      patch.status = body.status;
    }

    const updated = await updateItemFields(itemId, patch);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Listing updated successfully",
      item: updated,
    });
  } catch (error) {
    console.error("[User Items API] Update failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/items
 * Quick action: Delete Listing
 */
export async function DELETE(req: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(req, "user_items_delete", 20, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing itemId" },
        { status: 400 }
      );
    }

    const deleted = await deleteItem(itemId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete item" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Listing successfully deleted from the registry",
    });
  } catch (error) {
    console.error("[User Items API] Deletion failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
