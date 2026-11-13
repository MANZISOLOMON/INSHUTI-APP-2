import { NextRequest, NextResponse } from "next/server";
import { getItemById, runLifecycleMaintenance } from "@/lib/items-store";
import { sendSmsAlert } from "@/lib/sms";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET || "rwanda-cron-secret-2026";
  const authHeader = req.headers.get("authorization");
  const xCronSecret = req.headers.get("x-cron-secret");
  const querySecret = req.nextUrl.searchParams.get("secret");

  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  if (authHeader && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  if (xCronSecret === cronSecret || querySecret === cronSecret) {
    return true;
  }

  // Also accept Admin Secret Key for manual triggers
  const adminSecret = process.env.ADMIN_SECRET_KEY || "rwanda-admin-2026";
  const xAdminKey = req.headers.get("x-admin-key");
  if (xAdminKey === adminSecret) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid CRON_SECRET or Admin authorization required." },
        { status: 401 }
      );
    }

    console.log("[Lifecycle Cron] Starting 6-hour automated maintenance sweep...");

    const maintenanceResult = await runLifecycleMaintenance();

    // Send cellular SMS alert for any items flagged as DISPUTED
    for (const itemId of maintenanceResult.disputedItems) {
      const item = await getItemById(itemId);
      const targetPhone = (item as unknown as { contactPhone?: string })?.contactPhone || "+250788123456";

      await sendSmsAlert({
        to: targetPhone,
        message: `Inshuti Alert: Item '${item?.title || itemId}' exceeded its 48-hour handover window. Handover flagged as DISPUTED for Admin resolution.`,
        type: "DISPUTE_ALERT",
        userId: itemId,
      });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        autoArchivedExpiredCount: maintenanceResult.expiredCount,
        overdueDisputedFlaggedCount: maintenanceResult.disputedCount,
        expiredItems: maintenanceResult.expiredItems,
        disputedItems: maintenanceResult.disputedItems,
      },
      message: `Lifecycle maintenance completed successfully: ${maintenanceResult.expiredCount} archived, ${maintenanceResult.disputedCount} disputed.`,
    });
  } catch (error) {
    console.error("[Lifecycle Cron Error]:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}

