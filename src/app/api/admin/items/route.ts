import { NextRequest, NextResponse } from "next/server";
import { deleteItem, getItemById, updateItemStatus } from "@/lib/items-store";
import { AdminItemPatchSchema } from "@/lib/validations";

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "rwanda-admin-2026";

function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("x-admin-key");
  const urlKey = req.nextUrl.searchParams.get("adminKey");
  return authHeader === ADMIN_SECRET || urlKey === ADMIN_SECRET;
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin passkey required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Missing itemId query parameter." },
        { status: 400 }
      );
    }

    const existing = await getItemById(itemId);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Item not found." },
        { status: 404 }
      );
    }

    await deleteItem(itemId);

    return NextResponse.json({
      success: true,
      message: `Item '${existing.title}' (${itemId}) has been permanently deleted from the registry.`,
    });
  } catch (error) {
    console.error("[Admin Items API] Deletion failed:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin passkey required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = AdminItemPatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { itemId, status } = validation.data;

    const updated = await updateItemStatus(itemId, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: updated,
      message: `Item status updated to ${status}.`,
    });
  } catch (error) {
    console.error("[Admin Items API] Update failed:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

