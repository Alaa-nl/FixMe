import { NextResponse } from "next/server";
import { prismaUnfiltered } from "@/lib/db";
import {
  deleteRepairRequestCascade,
  deleteStorageFiles,
} from "@/lib/adminCascade";

const DAYS_BEFORE_PERMANENT_DELETE = 30;

// GET /api/cron/cleanup-trash - Auto-cleanup soft-deleted records older than 30 days
export async function GET(req: Request) {
  // Verify cron secret (Vercel Cron sends this automatically)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - DAYS_BEFORE_PERMANENT_DELETE);

  // Find repair requests soft-deleted more than 30 days ago
  const trashedRequests = await prismaUnfiltered.repairRequest.findMany({
    where: {
      deletedAt: { not: null, lt: cutoffDate },
    },
    select: {
      id: true,
      photos: true,
      videoUrl: true,
    },
  });

  let deletedCount = 0;
  let storageFilesRemoved = 0;
  const errors: string[] = [];

  for (const request of trashedRequests) {
    try {
      // Hard-delete all related database records
      await prismaUnfiltered.$transaction(
        async (tx) => {
          return deleteRepairRequestCascade(tx, request.id);
        },
        { timeout: 15000 }
      );

      // Clean up storage files
      const storageResult = await deleteStorageFiles(
        request.photos,
        request.videoUrl
      );
      storageFilesRemoved += storageResult.removed;

      deletedCount++;
    } catch (error: any) {
      console.error(
        `Cron cleanup error for request ${request.id}:`,
        error.message
      );
      errors.push(`${request.id}: ${error.message}`);
    }
  }

  console.log(
    `Cron cleanup-trash: permanently deleted ${deletedCount} repair requests, removed ${storageFilesRemoved} storage files`
  );

  return NextResponse.json({
    success: true,
    permanentlyDeleted: deletedCount,
    storageFilesRemoved,
    errors: errors.length > 0 ? errors : undefined,
  });
}
