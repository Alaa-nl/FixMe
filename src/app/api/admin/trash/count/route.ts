import { NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prismaUnfiltered } from "@/lib/db";

// GET /api/admin/trash/count - Count of trashed repair requests
export async function GET() {
  const authResult = await requireAdminAPI();
  if (authResult) return authResult;

  const count = await prismaUnfiltered.repairRequest.count({
    where: { deletedAt: { not: null } },
  });

  return NextResponse.json({ count });
}
