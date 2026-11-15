import { NextRequest, NextResponse } from "next/server";
import { getItemById } from "@/lib/items-store";
import { runAutoMatch } from "@/lib/match-engine";
import { applyRateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

/**
 * GET /api/match?itemId=...
 * Returns auto-match candidates for a given item.
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimitError = applyRateLimit(request, "match", 15, 60 * 1000);
    if (rateLimitError) return rateLimitError;

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter 'itemId'" },
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

    const candidates = await runAutoMatch(item);

    return NextResponse.json({
      success: true,
      targetItem: {
        id: item.id,
        type: item.type,
        category: item.category,
        title: item.title,
        maskedDocNumber: item.maskedDocNumber,
        district: item.district,
        sector: item.sector,
      },
      matches: candidates,
      matchCount: candidates.length,
    });
  } catch (error) {
    console.error("[Match API Error]:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
