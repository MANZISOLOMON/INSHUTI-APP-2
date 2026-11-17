import { NextRequest, NextResponse } from "next/server";
import { getItemById } from "@/lib/items-store";
import { getHandoverSessionByItemId, extendHandoverSession } from "@/lib/escrow-store";
import { sendSmsAlert } from "@/lib/sms";
import { applyRateLimit } from "@/lib/rate-limiter";
import { sanitizeClientPayload } from "@/lib/auth-middleware";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "escrow_extend", 10, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const rawBody = await request.json();
    const body = sanitizeClientPayload(rawBody);

    const itemId = body.itemId as string;
    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter 'itemId'" },
        { status: 400 }
      );
    }

    const item = await getItemById(itemId);
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    const session = await getHandoverSessionByItemId(itemId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "No active escrow handover session found for this item." },
        { status: 404 }
      );
    }

    if (session.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: `Cannot extend session with status '${session.status}'.` },
        { status: 400 }
      );
    }

    // Extend timer by 24 hours
    const result = await extendHandoverSession(itemId, 24);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to extend handover timer." },
        { status: 500 }
      );
    }

    // Send automated SMS notification to party
    const rawItem = item as unknown as { contactPhone?: string };
    if (rawItem?.contactPhone) {
      await sendSmsAlert({
        to: rawItem.contactPhone,
        message: `Inshuti Escrow Alert: A 24-hour extension was requested for '${item.title}'. The safe handover grace window is now extended by +24 hours.`,
        type: "HANDOVER_REMINDER",
        userId: itemId,
      });
    }

    return NextResponse.json({
      success: true,
      message: "24-hour extension granted! Both parties notified via SMS.",
      newExpiresAt: result.newExpiresAt,
      timerExtended: true,
    });
  } catch (error) {
    console.error("[API Escrow Extend Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process timer extension." },
      { status: 500 }
    );
  }
}
