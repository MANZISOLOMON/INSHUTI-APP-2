import { NextRequest, NextResponse } from "next/server";
import { getAllEscrowTransactions } from "@/lib/escrow-store";
import { 
  getAllItemsForAdmin, 
  getDisputedAndOverdueItems 
} from "@/lib/items-store";

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "rwanda-admin-2026";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("x-admin-key");
  const urlKey = req.nextUrl.searchParams.get("adminKey");
  return authHeader === ADMIN_SECRET || urlKey === ADMIN_SECRET;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin passkey required." },
        { status: 401 }
      );
    }

    // 1. Fetch Escrow Transactions
    const escrows = await getAllEscrowTransactions();

    // Calculate Financial stats
    let totalLockedRwf = 0;
    let totalReleasedRwf = 0;
    let totalPlatformFeesRwf = 0;

    for (const tx of escrows) {
      if (tx.status === "LOCKED") {
        totalLockedRwf += tx.amount || 0;
      } else if (tx.status === "RELEASED") {
        totalReleasedRwf += tx.amount || 0;
      }
      if (tx.status !== "REFUNDED") {
        totalPlatformFeesRwf += tx.platformFee || 100;
      }
    }

    // 2. Fetch Disputed & 48h Overdue Items
    const disputedAndOverdue = await getDisputedAndOverdueItems();

    // Map each disputed/overdue item with its corresponding escrow transaction if available
    const enrichedDisputes = disputedAndOverdue.map((entry) => {
      const relatedEscrow = escrows.find((e) => e.itemId === entry.item.id);
      return {
        ...entry,
        escrow: relatedEscrow || null,
      };
    });

    // 3. Fetch All Listings for Moderation Queue
    const allItems = await getAllItemsForAdmin();

    return NextResponse.json({
      success: true,
      stats: {
        totalLockedRwf,
        totalReleasedRwf,
        totalPlatformFeesRwf,
        activeDisputesCount: enrichedDisputes.length,
        totalItemsCount: allItems.length,
        escrowsCount: escrows.length,
      },
      disputedAndOverdue: enrichedDisputes,
      moderationQueue: allItems,
      escrowLedger: escrows,
    });
  } catch (error) {
    console.error("[Admin API] Failed to fetch overview:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

