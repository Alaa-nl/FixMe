import { NextResponse } from "next/server";
import { requireAdminAPI } from "@/lib/adminAuth";
import { prismaUnfiltered } from "@/lib/db";

// GET /api/admin/trash - List all soft-deleted repair requests
export async function GET() {
  const authResult = await requireAdminAPI();
  if (authResult) return authResult;

  const items = await prismaUnfiltered.repairRequest.findMany({
    where: { deletedAt: { not: null } },
    orderBy: { deletedAt: "desc" },
    select: {
      id: true,
      title: true,
      customerId: true,
      deletedAt: true,
      customer: {
        select: { name: true, email: true },
      },
      _count: {
        select: { jobs: true },
      },
    },
  });

  return NextResponse.json({ items });
}
